import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '..');
const repoRoot = path.resolve(projectRoot, '..');

const args = process.argv.slice(2);
const [password, slot] = args;

if (!password || !slot) {
	console.error('Usage: npm run encrypt -- <password> <slot>');
	console.error('Example: npm run encrypt -- mostrecent2026 3');
	process.exit(1);
}

if (!/^[0-9]+$/.test(slot)) {
	console.error(`Slot must be a number, got "${slot}".`);
	process.exit(1);
}

const inFile = path.join(repoRoot, `most-recent${slot}.plaintext.json`);
const outFile = path.join(projectRoot, 'src/lib/data/secure', `most-recent${slot}.encrypted.json`);

if (!existsSync(inFile)) {
	console.error(`Plaintext file not found: ${inFile}`);
	process.exit(1);
}

const result = spawnSync(
	process.execPath,
	[
		path.join(here, 'encrypt-case-study.mjs'),
		'--in',
		inFile,
		'--out',
		outFile,
		'--password',
		password
	],
	{ stdio: 'inherit' }
);

process.exit(result.status ?? 1);
