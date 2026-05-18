import { encryptPortfolioPlaintextFile } from './portfolio-encrypt-core.mjs';

function parseArgs(argv) {
	const options = {};
	for (let i = 0; i < argv.length; i++) {
		const token = argv[i];
		if (!token.startsWith('--')) continue;
		const key = token.slice(2);
		const value = argv[i + 1];
		options[key] = value;
		i++;
	}
	return options;
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const inputPath = args.in;
	const outputPath = args.out;
	const password = args.password;
	const iterations = Number(args.iterations ?? 250000);

	if (!inputPath || !outputPath || !password) {
		console.error(
			'Usage: node scripts/encrypt-case-study.mjs --in <plaintext.json> --out <encrypted.json> --password <secret> [--iterations 250000]'
		);
		console.error('');
		console.error(
			'For the usual repo-root plaintext → secure/*.encrypted.json flow, prefer: npm run encrypt -- <password> [1|2]'
		);
		process.exit(1);
	}

	const out = await encryptPortfolioPlaintextFile({
		inputPath,
		outputPath,
		password,
		iterations
	});
	console.log(`Wrote encrypted payload to ${out}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
