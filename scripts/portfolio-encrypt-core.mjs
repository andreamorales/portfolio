import { readFile, writeFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';

const subtle = webcrypto.subtle;

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

/**
 * Reads JSON from disk, normalizes with JSON.stringify (stable key order from parse),
 * encrypts with AES-256-GCM + PBKDF2, writes the SecurePortfolioEncryptedPayload shape.
 */
export async function encryptPortfolioPlaintextFile({
	inputPath,
	outputPath,
	password,
	iterations = 250000
}) {
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
	return outputPath;
}
