import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const cwd = process.cwd();

function run(command, args) {
	return spawnSync(command, args, {
		cwd,
		encoding: 'utf8',
		maxBuffer: 20 * 1024 * 1024
	});
}

function npmExec(binary, args) {
	return run('npm', ['exec', binary, '--', ...args]);
}

function relativeFile(filePath) {
	const normalized = path.isAbsolute(filePath) ? path.relative(cwd, filePath) : filePath;

	return normalized.split(path.sep).join('/');
}

function addProblem(map, problem) {
	const file = relativeFile(problem.file);
	if (!map.has(file)) {
		map.set(file, []);
	}

	map.get(file).push({
		...problem,
		file
	});
}

function parseEslint(stdout) {
	const results = stdout.trim() ? JSON.parse(stdout) : [];
	const problemsByFile = new Map();

	let problemCount = 0;
	let warningCount = 0;
	let errorCount = 0;

	for (const result of results) {
		const file = relativeFile(result.filePath);

		for (const message of result.messages) {
			const severity = message.severity === 2 ? 'error' : 'warning';
			problemCount += 1;
			if (severity === 'error') {
				errorCount += 1;
			} else {
				warningCount += 1;
			}

			addProblem(problemsByFile, {
				tool: 'eslint',
				severity,
				file,
				line: message.line ?? 0,
				column: message.column ?? 0,
				message: message.message,
				ruleId: message.ruleId ?? ''
			});
		}
	}

	return {
		totalFiles: results.length,
		failedFiles: [...problemsByFile.keys()].length,
		passedFiles: Math.max(0, results.length - [...problemsByFile.keys()].length),
		problemCount,
		errorCount,
		warningCount,
		problemsByFile
	};
}

function parseSvelteCheck(stdout) {
	const lines = stdout.split('\n').filter(Boolean);
	const problemsByFile = new Map();

	let totalFiles = 0;
	let errorCount = 0;
	let warningCount = 0;
	let failedFiles = 0;

	for (const line of lines) {
		const diagnosticMatch = line.match(
			/^\d+\s+(ERROR|WARNING)\s+"([^"]+)"\s+(\d+):(\d+)\s+"(.*)"$/
		);

		if (diagnosticMatch) {
			const [, severityRaw, file, lineNumber, columnNumber, message] = diagnosticMatch;
			const severity = severityRaw.toLowerCase();

			addProblem(problemsByFile, {
				tool: 'svelte-check',
				severity,
				file,
				line: Number(lineNumber),
				column: Number(columnNumber),
				message
			});
			continue;
		}

		const completedMatch = line.match(
			/^\d+\s+COMPLETED\s+(\d+)\s+FILES\s+(\d+)\s+ERRORS\s+(\d+)\s+WARNINGS\s+(\d+)\s+FILES_WITH_PROBLEMS$/
		);

		if (completedMatch) {
			totalFiles = Number(completedMatch[1]);
			errorCount = Number(completedMatch[2]);
			warningCount = Number(completedMatch[3]);
			failedFiles = Number(completedMatch[4]);
		}
	}

	return {
		totalFiles,
		failedFiles,
		passedFiles: Math.max(0, totalFiles - failedFiles),
		problemCount: errorCount + warningCount,
		errorCount,
		warningCount,
		problemsByFile
	};
}

function mergeProblems(...problemMaps) {
	const merged = new Map();

	for (const map of problemMaps) {
		for (const [file, problems] of map.entries()) {
			if (!merged.has(file)) {
				merged.set(file, []);
			}

			merged.get(file).push(...problems);
		}
	}

	for (const problems of merged.values()) {
		problems.sort((a, b) => {
			if (a.line !== b.line) return a.line - b.line;
			if (a.column !== b.column) return a.column - b.column;
			if (a.tool !== b.tool) return a.tool.localeCompare(b.tool);
			return a.message.localeCompare(b.message);
		});
	}

	return new Map([...merged.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

function printSection(title) {
	console.log(`\n${title}`);
}

function parsePrettierList(stdout) {
	return stdout
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
		.map(relativeFile);
}

const prettierBefore = npmExec('prettier', ['--list-different', '.']);
const prettierFix = npmExec('prettier', ['--write', '.']);
const eslintBeforeReport = npmExec('eslint', ['.', '--format', 'json']);
const eslintFix = npmExec('eslint', ['.', '--fix']);

const eslintReport = npmExec('eslint', ['.', '--format', 'json']);
const svelteReport = npmExec('svelte-check', [
	'--tsconfig',
	'./tsconfig.json',
	'--output',
	'machine',
	'--threshold',
	'warning'
]);

const prettierNeededFiles = parsePrettierList(prettierBefore.stdout);
const eslintBefore = parseEslint(eslintBeforeReport.stdout);
const eslint = parseEslint(eslintReport.stdout);
const svelte = parseSvelteCheck(svelteReport.stdout);
const combinedProblems = mergeProblems(eslint.problemsByFile, svelte.problemsByFile);

const eslintFixedCount = Math.max(0, eslintBefore.problemCount - eslint.problemCount);

printSection('Auto-fix');
console.log(
	`- Prettier: formatted ${prettierNeededFiles.length} file${prettierNeededFiles.length === 1 ? '' : 's'}`
);
console.log(
	`- ESLint: fixed ${eslintFixedCount} of ${eslintBefore.problemCount} problem${eslintBefore.problemCount === 1 ? '' : 's'} automatically`
);

if (prettierFix.status !== 0) {
	console.log(`- Prettier exited with ${prettierFix.status ?? 'unknown'}`);
}

if (eslintFix.status !== 0 && eslint.problemCount > 0) {
	console.log(
		`- ESLint autofix left ${eslint.problemCount} problem${eslint.problemCount === 1 ? '' : 's'} to handle manually`
	);
}

printSection('Summary');
console.log(
	`- ESLint: ${eslint.passedFiles} passed, ${eslint.failedFiles} failed, ${eslint.errorCount} errors, ${eslint.warningCount} warnings`
);
console.log(
	`- Svelte Check: ${svelte.passedFiles} passed, ${svelte.failedFiles} failed, ${svelte.errorCount} errors, ${svelte.warningCount} warnings`
);
console.log(`- Files with remaining problems: ${combinedProblems.size}`);

if (combinedProblems.size === 0) {
	printSection('Remaining Files');
	console.log('- none');
	process.exit(0);
}

printSection('Remaining Files');
for (const [file, problems] of combinedProblems.entries()) {
	const eslintCount = problems.filter((problem) => problem.tool === 'eslint').length;
	const svelteCount = problems.filter((problem) => problem.tool === 'svelte-check').length;
	const toolParts = [];
	if (eslintCount) toolParts.push(`eslint ${eslintCount}`);
	if (svelteCount) toolParts.push(`svelte-check ${svelteCount}`);
	console.log(
		`- ${file}: ${problems.length} problem${problems.length === 1 ? '' : 's'} (${toolParts.join(', ')})`
	);
}

printSection('Detailed Problems');
for (const [file, problems] of combinedProblems.entries()) {
	console.log(`\n${file}`);

	for (const problem of problems) {
		const where = `${problem.line}:${problem.column}`;
		const rule = problem.ruleId ? ` (${problem.ruleId})` : '';
		console.log(`- [${problem.tool}:${problem.severity}] ${where} ${problem.message}${rule}`);
	}
}

process.exit(1);
