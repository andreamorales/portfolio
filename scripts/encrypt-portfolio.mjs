#!/usr/bin/env node
/**
 * Quick encrypt for pass-protected portfolio payloads (plaintext lives repo root).
 *
 * Usage (note the `--` so npm forwards args to this script):
 *
 *   npm run encrypt -- <password>
 *   npm run encrypt -- <password> 2
 *   npm run encrypt -- <password> most-recent1
 *
 * Default case is most-recent2 (Layer Health: Evidence). Use `1` or `most-recent1`
 * for the other encrypted study.
 */

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { encryptPortfolioPlaintextFile } from './portfolio-encrypt-core.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const portfolioRoot = join(__dirname, '..');
const repoRoot = join(portfolioRoot, '..');

const CASE_SLUGS = {
	1: 'most-recent1',
	2: 'most-recent2',
	'most-recent1': 'most-recent1',
	'most-recent2': 'most-recent2'
};

function pathsForSlug(slug) {
	return {
		plaintext: join(repoRoot, `${slug}.plaintext.json`),
		encrypted: join(portfolioRoot, 'src', 'lib', 'data', 'secure', `${slug}.encrypted.json`)
	};
}

function resolveSlug(caseArg) {
	if (caseArg === undefined || caseArg === '') return 'most-recent2';
	const mapped = CASE_SLUGS[caseArg];
	if (mapped) return mapped;
	console.error(`Unknown case "${caseArg}". Use: 1 | 2 | most-recent1 | most-recent2`);
	process.exit(1);
}

async function main() {
	const argv = process.argv.slice(2);
	const password = argv[0];
	const caseArg = argv[1];

	if (!password) {
		console.error(`
Missing password.

  npm run encrypt -- <your-password>
  npm run encrypt -- <your-password> 1

The "--" is required: everything after it is passed to this script (not to npm).
`.trim());
		process.exit(1);
	}

	const slug = resolveSlug(caseArg);
	const { plaintext, encrypted } = pathsForSlug(slug);

	const out = await encryptPortfolioPlaintextFile({
		inputPath: plaintext,
		outputPath: encrypted,
		password
	});

	console.log(`Encrypted ${slug}`);
	console.log(`  from  ${plaintext}`);
	console.log(`  →     ${out}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
