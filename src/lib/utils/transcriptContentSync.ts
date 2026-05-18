/**
 * Aligns a video transcript (whisper-style word-level cues) to the case-study
 * text blocks in a `PortfolioExpandedView`. The result is a list of
 * `{ blockIndex, startMs }` anchors that callers use to scroll the case copy
 * in sync with the narration.
 *
 * The case copy and the transcript are paraphrases of one another, so we
 * cannot match verbatim. Instead, we score every transcript window against
 * each text block by content-word overlap, picking the window with the
 * highest overlap while enforcing monotonic time order (blocks later in the
 * narrative cannot anchor before earlier blocks).
 */

export interface TranscriptCueLike {
	text: string;
	startMs: number;
	endMs: number;
}

export interface ContentBlockLike {
	type: string;
	value: string;
}

export interface BlockAnchor {
	blockIndex: number;
	startMs: number;
}

/** Words common enough to be poor anchors for narrative alignment. */
const STOP_WORDS = new Set([
	'a',
	'about',
	'after',
	'again',
	'all',
	'also',
	'an',
	'and',
	'any',
	'are',
	'as',
	'at',
	'be',
	'because',
	'been',
	'being',
	'before',
	'but',
	'by',
	'came',
	'can',
	'come',
	'could',
	'did',
	'do',
	'does',
	'doing',
	'done',
	'during',
	'each',
	'every',
	'for',
	'from',
	'further',
	'get',
	'go',
	'goes',
	'going',
	'got',
	'had',
	'has',
	'have',
	'having',
	'he',
	'her',
	'here',
	'hers',
	'him',
	'his',
	'how',
	'i',
	'if',
	'in',
	'into',
	'is',
	'it',
	'its',
	'just',
	'kind',
	'like',
	'lot',
	'make',
	'making',
	'may',
	'me',
	'might',
	'much',
	'my',
	'no',
	'nor',
	'not',
	'now',
	'of',
	'off',
	'on',
	'one',
	'only',
	'or',
	'other',
	'our',
	'out',
	'over',
	'own',
	'really',
	'right',
	'said',
	'same',
	'say',
	'saying',
	'see',
	'shall',
	'she',
	'should',
	'so',
	'some',
	'such',
	'than',
	'that',
	'the',
	'their',
	'them',
	'then',
	'there',
	'these',
	'they',
	'thing',
	'things',
	'this',
	'those',
	'through',
	'to',
	'too',
	'under',
	'up',
	'us',
	'use',
	'used',
	'very',
	'was',
	'way',
	'we',
	'well',
	'went',
	'were',
	'what',
	'when',
	'where',
	'which',
	'while',
	'who',
	'whom',
	'why',
	'will',
	'with',
	'would',
	'you',
	'your',
	'yours'
]);

function normalizeWord(raw: string): string {
	return raw
		.toLowerCase()
		.replace(/'s$/, '')
		.replace(/[^a-z0-9]/g, '');
}

function tokenizeMeaningful(text: string): string[] {
	if (!text) return [];
	return text
		.split(/[\s\-/_]+/)
		.map(normalizeWord)
		.filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

interface CueWord {
	word: string;
	startMs: number;
}

function flattenCueWords(cues: readonly TranscriptCueLike[]): CueWord[] {
	const out: CueWord[] = [];
	for (const cue of cues) {
		if (!cue?.text) continue;
		const words = tokenizeMeaningful(cue.text);
		if (words.length === 0) continue;
		// Whisper cues are typically single tokens, but tolerate multi-word cues
		// by spreading them evenly across the cue's duration so we keep a usable
		// `startMs` per content word.
		for (let i = 0; i < words.length; i++) {
			out.push({ word: words[i], startMs: cue.startMs });
		}
	}
	return out;
}

/**
 * Computes per-block start times by scoring every transcript window against
 * the block's meaningful words. Higher overlap = better anchor.
 *
 * Returns anchors only for blocks whose match score crosses a small minimum;
 * blocks without a confident match are skipped (the caller falls back to the
 * previous anchor for those positions).
 */
export function computeBlockAnchors(
	content: readonly ContentBlockLike[],
	cues: readonly TranscriptCueLike[]
): BlockAnchor[] {
	if (!content?.length || !cues?.length) return [];

	const cueWords = flattenCueWords(cues);
	if (cueWords.length === 0) return [];

	const anchors: BlockAnchor[] = [];
	let minIdx = 0;

	for (let blockIndex = 0; blockIndex < content.length; blockIndex++) {
		const block = content[blockIndex];
		if (!block || (block.type !== 'text' && block.type !== 'heading')) continue;

		const blockWords = tokenizeMeaningful(block.value);
		if (blockWords.length === 0) continue;

		const blockSet = new Set(blockWords);
		// Window scales with block length but stays in a sane range so a single
		// very long paragraph doesn't swallow the entire transcript.
		const windowSize = Math.max(10, Math.min(blockWords.length * 3, 90));

		if (minIdx >= cueWords.length) break;

		const windowEndCap = cueWords.length;
		let runningScore = 0;
		const initialEnd = Math.min(minIdx + windowSize, windowEndCap);
		for (let j = minIdx; j < initialEnd; j++) {
			if (blockSet.has(cueWords[j].word)) runningScore++;
		}

		let bestScore = runningScore;
		let bestIdx = minIdx;

		const lastStart = windowEndCap - 1;
		for (let i = minIdx + 1; i <= lastStart; i++) {
			const leavingIdx = i - 1;
			const enteringIdx = i + windowSize - 1;
			if (blockSet.has(cueWords[leavingIdx].word)) runningScore--;
			if (enteringIdx < windowEndCap && blockSet.has(cueWords[enteringIdx].word)) {
				runningScore++;
			}
			if (runningScore > bestScore) {
				bestScore = runningScore;
				bestIdx = i;
			}
		}

		// Require at least a couple of strong matches so a weak block doesn't
		// drag the scroll to an unrelated stretch of narration.
		const minMatchesRequired = Math.min(2, blockWords.length);
		if (bestScore < minMatchesRequired) {
			continue;
		}

		const startMs = cueWords[bestIdx].startMs;
		// Enforce monotonic time: a later block can never anchor before an
		// earlier one. (Already guaranteed by `minIdx`, but be defensive.)
		const lastAnchor = anchors[anchors.length - 1];
		if (lastAnchor && startMs < lastAnchor.startMs) {
			continue;
		}

		anchors.push({ blockIndex, startMs });
		// Advance the search cursor past the matching tokens we just "consumed"
		// for this block so the next block has to find its anchor genuinely
		// later in the transcript. Using `bestScore` as the step gives well-
		// matched blocks more breathing room without skipping past short
		// transitional paragraphs.
		minIdx = bestIdx + Math.max(1, bestScore);
	}

	return anchors;
}

/**
 * Finds the latest anchor whose `startMs` is at or before `currentMs`.
 * Returns -1 when the playhead is before the very first anchor.
 */
export function findActiveAnchorIndex(anchors: readonly BlockAnchor[], currentMs: number): number {
	if (!anchors.length) return -1;
	let lo = 0;
	let hi = anchors.length - 1;
	let result = -1;
	while (lo <= hi) {
		const mid = (lo + hi) >> 1;
		if (anchors[mid].startMs <= currentMs) {
			result = mid;
			lo = mid + 1;
		} else {
			hi = mid - 1;
		}
	}
	return result;
}
