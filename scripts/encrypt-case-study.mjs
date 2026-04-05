import { readFile, writeFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';

const subtle = webcrypto.subtle;

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

function bytesToB64(bytes) {
	return Buffer.from(bytes).toString('base64');
}

async function deriveKey(password, salt, iterations) {
	const encoder = new TextEncoder();
	const material = await subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
		'deriveKey'
	]);
	return subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt,
			iterations,
			hash: 'SHA-256'
		},
		material,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt']
	);
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
		process.exit(1);
	}

	const plaintextRaw = await readFile(inputPath, 'utf8');
	const parsed = JSON.parse(plaintextRaw);
	const normalized = JSON.stringify(parsed);

	const salt = webcrypto.getRandomValues(new Uint8Array(16));
	const iv = webcrypto.getRandomValues(new Uint8Array(12));
	const key = await deriveKey(password, salt, iterations);
	const encrypted = await subtle.encrypt(
		{ name: 'AES-GCM', iv },
		key,
		new TextEncoder().encode(normalized)
	);

	const payload = {
		version: 1,
		salt: bytesToB64(salt),
		iv: bytesToB64(iv),
		iterations,
		ciphertext: bytesToB64(new Uint8Array(encrypted))
	};

	await writeFile(outputPath, `${JSON.stringify(payload, null, '\t')}\n`, 'utf8');
	console.log(`Wrote encrypted payload to ${outputPath}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
