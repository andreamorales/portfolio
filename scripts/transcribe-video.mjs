#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
	downloadWhisperModel,
	installWhisperCpp,
	toCaptions,
	transcribe
} from '@remotion/install-whisper-cpp';

const WHISPER_CPP_VERSION = '1.5.5';
const MODEL = process.env.WHISPER_MODEL ?? 'base.en';

function usage() {
	console.log('Usage: node scripts/transcribe-video.mjs <input-video-or-url> [output-json]');
	console.log('');
	console.log('Examples:');
	console.log('  node scripts/transcribe-video.mjs src/lib/videos/test.mov');
	console.log(
		'  node scripts/transcribe-video.mjs src/lib/videos/test.mov src/lib/data/transcripts/test.captions.json'
	);
	console.log(
		'  node scripts/transcribe-video.mjs https://example.com/talk.mp4 src/lib/data/transcripts/talk.captions.json'
	);
}

function isRemoteInput(input) {
	return /^https?:\/\//i.test(input);
}

function baseNameFromInput(inputPath, inputArg) {
	if (isRemoteInput(inputArg)) {
		try {
			const u = new URL(inputArg);
			const seg = u.pathname.split('/').filter(Boolean).pop() ?? 'remote';
			return seg.replace(/\.[^.]+$/, '') || 'remote';
		} catch {
			return 'remote';
		}
	}
	return path.basename(inputPath, path.extname(inputPath));
}

function toAbsolute(inputPath) {
	return path.isAbsolute(inputPath) ? inputPath : path.join(process.cwd(), inputPath);
}

function ensureExists(filePath, label) {
	if (!existsSync(filePath)) {
		throw new Error(`${label} not found: ${filePath}`);
	}
}

async function main() {
	const [inputArg, outputArg] = process.argv.slice(2);

	if (!inputArg) {
		usage();
		process.exit(1);
	}

	const remote = isRemoteInput(inputArg);
	const inputPath = remote ? inputArg : toAbsolute(inputArg);
	if (!remote) {
		ensureExists(inputPath, 'Input video');
	}

	const baseName = baseNameFromInput(inputPath, inputArg);
	const outputPath = toAbsolute(outputArg ?? `src/lib/data/transcripts/${baseName}.captions.json`);
	const outputDir = path.dirname(outputPath);

	await fs.mkdir(outputDir, { recursive: true });

	const workDir = path.join(process.cwd(), '.cache', 'transcripts');
	const whisperDir = path.join(process.cwd(), 'whisper.cpp');
	const wavPath = path.join(workDir, `${baseName}.16k.wav`);

	await fs.mkdir(workDir, { recursive: true });

	console.log(
		remote
			? `\n[1/5] Converting remote source to 16kHz wav with ffmpeg...\n    ${inputPath}`
			: `\n[1/5] Converting to 16kHz wav with ffmpeg...`
	);
	try {
		execFileSync('ffmpeg', ['-y', '-i', inputPath, '-ar', '16000', '-ac', '1', wavPath], {
			stdio: 'inherit'
		});
	} catch (error) {
		throw new Error(
			'ffmpeg failed. Make sure ffmpeg is installed and available in PATH before running this script.'
		);
	}

	console.log(`\n[2/5] Installing whisper.cpp ${WHISPER_CPP_VERSION} (cached after first run)...`);
	await installWhisperCpp({
		to: whisperDir,
		version: WHISPER_CPP_VERSION
	});

	console.log(`\n[3/5] Downloading Whisper model "${MODEL}" (cached after first run)...`);
	await downloadWhisperModel({
		model: MODEL,
		folder: whisperDir
	});

	console.log(`\n[4/5] Transcribing audio...`);
	const whisperCppOutput = await transcribe({
		model: MODEL,
		whisperPath: whisperDir,
		whisperCppVersion: WHISPER_CPP_VERSION,
		inputPath: wavPath,
		tokenLevelTimestamps: true
	});

	console.log(`\n[5/5] Converting output to captions and writing JSON...`);
	const { captions } = toCaptions({
		whisperCppOutput
	});

	const payload = {
		generatedAt: new Date().toISOString(),
		sourceVideo: remote ? inputPath : path.relative(process.cwd(), inputPath),
		whisperModel: MODEL,
		whisperCppVersion: WHISPER_CPP_VERSION,
		captions
	};

	await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

	console.log(`\nDone. Wrote captions JSON to:\n${outputPath}\n`);
}

main().catch((error) => {
	console.error('\nTranscription failed:\n', error);
	process.exit(1);
});
