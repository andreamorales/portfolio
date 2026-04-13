export interface SecurePortfolioImage {
	src: string;
	alt: string;
	caption?: string;
}

export interface SecurePortfolioContentItem {
	type: string;
	value: string;
	caption?: string;
	layout?: 'single' | 'side-by-side';
	sideImage?: {
		value: string;
		caption?: string;
	};
}

export interface SecurePortfolioTeamMember {
	role: string;
	name: string;
	relationship: string;
}

export interface SecurePortfolioTranscriptCue {
	text: string;
	startMs: number;
	endMs: number;
	timestampMs?: number;
	confidence?: number;
}

export interface SecurePortfolioPayloadData {
	projectTitle?: string;
	tags?: string[];
	description: string;
	images: SecurePortfolioImage[];
	content: SecurePortfolioContentItem[];
	year: string;
	role: string;
	link: string;
	metrics: string[];
	team: SecurePortfolioTeamMember[];
	videoUrl?: string;
	videoPosterUrl?: string;
	/** Word-level cues (Whisper); keep inside encrypted payload only for pass-protected studies. */
	transcriptCues?: SecurePortfolioTranscriptCue[];
	/** When true, do not render the large hero above the body (first gallery image is not used as hero). */
	hideHeroImage?: boolean;
}

export interface SecurePortfolioEncryptedPayload {
	version: 1;
	salt: string;
	iv: string;
	iterations: number;
	ciphertext: string;
}

function b64ToBytes(base64: string): Uint8Array {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

async function deriveAesKey(
	password: string,
	salt: Uint8Array,
	iterations: number
): Promise<CryptoKey> {
	const encoder = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		encoder.encode(password),
		'PBKDF2',
		false,
		['deriveKey']
	);
	return crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt,
			iterations,
			hash: 'SHA-256'
		},
		keyMaterial,
		{ name: 'AES-GCM', length: 256 },
		false,
		['decrypt']
	);
}

export async function decryptSecurePortfolioPayload(
	payload: SecurePortfolioEncryptedPayload,
	password: string
): Promise<SecurePortfolioPayloadData | null> {
	const cleanPassword = password.trim();
	if (!cleanPassword) return null;
	try {
		const salt = b64ToBytes(payload.salt);
		const iv = b64ToBytes(payload.iv);
		const ciphertext = b64ToBytes(payload.ciphertext);
		const key = await deriveAesKey(cleanPassword, salt, payload.iterations);
		const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
		const text = new TextDecoder().decode(decrypted);
		return JSON.parse(text) as SecurePortfolioPayloadData;
	} catch {
		return null;
	}
}
