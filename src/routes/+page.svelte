<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import HomeLandingHero from '$lib/components/HomeLandingHero.svelte';
	import PortfolioExpandedView from '$lib/components/portfolio/PortfolioExpandedView.svelte';
	import MobileTopStack from '$lib/components/mobile/MobileTopStack.svelte';
	import MobileDetailMedia from '$lib/components/mobile/MobileDetailMedia.svelte';
	import FloatingContactDock from '$lib/components/ui/FloatingContactDock.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import { portfolioItems } from '$lib/data/portfolio-items.js';
	import type { PortfolioItem } from '$lib/data/portfolio-items.js';
	import type { SecurePortfolioPayloadData } from '$lib/utils/secureCaseStudy';

	const getLatestYear = (year: string) => {
		const years = year.split('-').map((value) => parseInt(value.trim(), 10));
		return Math.max(...years);
	};

	const toPieceSlug = (piece: Pick<PortfolioItem, 'title' | 'slug'>) =>
		piece.slug ??
		piece.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');

	function isDirectVideoFile(url: string): boolean {
		const path = url.split('?')[0] ?? url;
		return /\.(mp4|webm|ogg|mov|m4v)$/i.test(path);
	}

	function normalizeTranscriptText(text: string): string {
		return text
			.replace(/\s+([,.;!?])/g, '$1')
			.replace(/\(\s+/g, '(')
			.replace(/\s+\)/g, ')')
			.replace(/\s+/g, ' ')
			.trim();
	}

	function isTranscriptNoiseToken(text: string): boolean {
		const trimmed = text.trim();
		if (!trimmed) return true;
		if (/blank\s*_?\s*audio/i.test(trimmed)) return true;
		const normalized = trimmed.replace(/\s+/g, '').toUpperCase();
		return (
			normalized === '[' ||
			normalized === ']' ||
			normalized === '_' ||
			['BL', 'ANK', 'AUD', 'IO'].includes(normalized)
		);
	}

	function buildTranscriptLines(
		cues: Array<{ text: string; startMs: number; endMs: number }>,
		maxCharsPerLine = 110
	): Array<{
		text: string;
		startMs: number;
		endMs: number;
		words: Array<{ text: string; startMs: number; endMs: number }>;
	}> {
		if (!cues.length) return [];

		const lines: Array<{
			text: string;
			startMs: number;
			endMs: number;
			words: Array<{ text: string; startMs: number; endMs: number }>;
		}> = [];
		let currentText = '';
		let currentStartMs = 0;
		let currentEndMs = 0;
		let currentWords: Array<{ text: string; startMs: number; endMs: number }> = [];

		const flushCurrentLine = () => {
			const normalized = normalizeTranscriptText(currentText);
			if (!normalized) return;
			lines.push({
				text: normalized,
				startMs: currentStartMs,
				endMs: currentEndMs,
				words: currentWords
			});
			currentText = '';
			currentStartMs = 0;
			currentEndMs = 0;
			currentWords = [];
		};

		for (let i = 0; i < cues.length; i++) {
			const cue = cues[i];
			const token = cue.text;
			if (!token?.trim()) continue;

			if (!currentText) {
				currentStartMs = cue.startMs;
			}

			currentText += token;
			currentEndMs = cue.endMs;
			currentWords.push({
				text: token,
				startMs: cue.startMs,
				endMs: cue.endMs
			});

			const normalized = normalizeTranscriptText(currentText);
			const hitsSentenceBoundary = /[.!?]["')\]]*$/.test(normalized);
			const isLongChunk = maxCharsPerLine > 0 && normalized.length >= maxCharsPerLine;

			if (hitsSentenceBoundary || isLongChunk) {
				flushCurrentLine();
			}
		}

		flushCurrentLine();
		return lines;
	}

	$: sortedPortfolioItems = [...$portfolioItems].sort(
		(a: PortfolioItem, b: PortfolioItem) => getLatestYear(b.year) - getLatestYear(a.year)
	);

	let landingHeroElement: HTMLElement | null = null;
	let frameBottomLineEl: HTMLDivElement | null = null;
	let frameRightLineEl: HTMLDivElement | null = null;
	let showToast = false;
	let toastMessage = '';
	let activeDetailItem: PortfolioItem | null = null;
	let detailVideoEl: HTMLVideoElement | null = null;
	let detailTranscriptEl: HTMLDivElement | null = null;
	let mobileAudioEl: HTMLAudioElement | null = null;
	let mobileVideoEl: HTMLVideoElement | null = null;
	let detailVideoCurrentMs = 0;
	let detailTranscriptCues: Array<{ text: string; startMs: number; endMs: number }> = [];
	let detailTranscriptLines: Array<{
		text: string;
		startMs: number;
		endMs: number;
		words: Array<{ text: string; startMs: number; endMs: number }>;
	}> = [];
	let detailActiveTranscriptLineIndex = -1;
	let detailMediaIsPlaying = false;
	let lastAutoScrolledTranscriptLineIndex = -1;
	let detailTranscriptCanScrollUp = false;
	let mobileVideoCompactProgress = 0;
	let mobileAudioIsPlaying = false;
	let mobileVideoVisible = true;
	let mobileAudioDurationMs = 0;
	let mobileAudioScrubMs = 0;
	let mobileAudioScrubbing = false;
	let mobileTranscriptTicker = '';
	let lastActiveDetailSlug = '';
	let activeDetailRevealDelayMs = 1360;
	let unlockedPieceSlugs = new Set<string>();
	let unlockedPieceDataBySlug = new Map<string, SecurePortfolioPayloadData>();
	let detailPieceEl: HTMLDivElement | null = null;
	let introTypewriterActive = true;
	let introLinesVisible = false;
	let introControlsVisible = false;
	let introTerminalVisible = false;
	let mobileTerminalDrawerOpen = false;

	function syncTranscriptScrollIndicators() {
		if (!detailTranscriptEl) {
			detailTranscriptCanScrollUp = false;
			return;
		}
		detailTranscriptCanScrollUp = detailTranscriptEl.scrollTop > 6;
	}

	function handleDetailVideoTimeUpdate() {
		detailVideoCurrentMs = detailVideoEl ? detailVideoEl.currentTime * 1000 : 0;
		syncTranscriptScrollIndicators();
	}

	function handleTranscriptScroll() {
		if (!detailTranscriptEl) return;
		syncTranscriptScrollIndicators();
	}

	function handleDetailPieceScroll() {
		if (!detailPieceEl) return;
		const compactStartPx = 90;
		const compactRangePx = 240;
		const nextProgress = (detailPieceEl.scrollTop - compactStartPx) / compactRangePx;
		mobileVideoCompactProgress = Math.max(0, Math.min(1, nextProgress));
	}

	function handleDetailMediaPlay() {
		detailMediaIsPlaying = true;
		lastAutoScrolledTranscriptLineIndex = -1;
	}

	function handleDetailMediaPause() {
		detailMediaIsPlaying = false;
	}

	function autoScrollActiveTranscriptLine() {
		if (!detailTranscriptEl || detailActiveTranscriptLineIndex < 0) return;
		const activeLineEl = detailTranscriptEl.querySelector<HTMLButtonElement>(
			`[data-transcript-index="${detailActiveTranscriptLineIndex}"]`
		);
		if (!activeLineEl) return;
		activeLineEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
		syncTranscriptScrollIndicators();
	}

	function handleMobileMediaTimeUpdate(event: Event) {
		const media = event.currentTarget as HTMLMediaElement;
		detailVideoCurrentMs = media.currentTime * 1000;
		if (!mobileAudioScrubbing) {
			mobileAudioScrubMs = detailVideoCurrentMs;
		}
		if (Number.isFinite(media.duration)) {
			mobileAudioDurationMs = media.duration * 1000;
		}
	}

	function jumpToTranscriptLine(startMs: number) {
		const nextSeconds = Math.max(0, startMs / 1000);
		const mediaTargets: Array<HTMLMediaElement | null> = [
			detailVideoEl,
			mobileAudioEl,
			mobileVideoEl
		];

		for (const media of mediaTargets) {
			if (!media) continue;
			try {
				media.currentTime = nextSeconds;
			} catch {
				// Some browsers reject immediate seeks before metadata is ready.
			}
		}

		detailVideoCurrentMs = startMs;
		mobileAudioScrubMs = startMs;
	}

	function getActiveMobileMediaElement(): HTMLMediaElement | null {
		if (mobileVideoVisible && mobileVideoEl) return mobileVideoEl;
		return mobileAudioEl;
	}

	function getMobileTickerText(
		cues: Array<{ text: string; startMs: number; endMs: number }>,
		currentMs: number
	): string {
		if (!cues.length) return '';

		// Keep a wider context window so captions feel readable instead of flashing word-by-word.
		const lookbackMs = 1600;
		const lookaheadMs = 2600;
		const snippet = cues
			.filter(
				(cue) => cue.endMs >= currentMs - lookbackMs && cue.startMs <= currentMs + lookaheadMs
			)
			.map((cue) => cue.text)
			.join('');
		const normalized = normalizeTranscriptText(snippet);
		if (normalized) return normalized;

		const activeIndex = cues.findIndex((cue) => currentMs >= cue.startMs && currentMs <= cue.endMs);
		if (activeIndex >= 0) {
			const start = Math.max(0, activeIndex - 5);
			const end = Math.min(cues.length, activeIndex + 7);
			const fallback = normalizeTranscriptText(
				cues
					.slice(start, end)
					.map((cue) => cue.text)
					.join('')
			);
			if (fallback) return fallback;
		}

		for (let i = cues.length - 1; i >= 0; i--) {
			if (cues[i].startMs <= currentMs)
				return normalizeTranscriptText(
					cues
						.slice(Math.max(0, i - 3), i + 1)
						.map((cue) => cue.text)
						.join('')
				);
		}

		return normalizeTranscriptText(cues[0].text);
	}

	function toggleMobileAudioPlayback() {
		const media = getActiveMobileMediaElement();
		if (!media) return;
		if (media.paused || media.ended) {
			media.play().catch(() => {
				// Autoplay policies may block without user gesture.
			});
		} else {
			media.pause();
		}
	}

	function handleMobileAudioPlay() {
		mobileAudioIsPlaying = true;
		handleDetailMediaPlay();
	}

	function handleMobileAudioPause() {
		mobileAudioIsPlaying = false;
		handleDetailMediaPause();
	}

	function handleMobileAudioSeekInput(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		const next = Number(target.value);
		mobileAudioScrubbing = true;
		mobileAudioScrubMs = next;
		detailVideoCurrentMs = next;
	}

	function commitMobileAudioSeek() {
		if (!mobileAudioEl) return;
		const nextSeconds = mobileAudioScrubMs / 1000;
		try {
			mobileAudioEl.currentTime = nextSeconds;
		} catch {
			// noop
		}
		if (mobileVideoEl) {
			try {
				mobileVideoEl.currentTime = nextSeconds;
			} catch {
				// noop
			}
		}
		detailVideoCurrentMs = mobileAudioScrubMs;
		mobileAudioScrubbing = false;
	}

	function toggleMobileVideoVisible() {
		const from = getActiveMobileMediaElement();
		const fromTime = from?.currentTime ?? 0;
		const wasPlaying = !!from && !from.paused && !from.ended;
		mobileVideoVisible = !mobileVideoVisible;

		requestAnimationFrame(() => {
			if (!mobileAudioEl) return;
			const target = getActiveMobileMediaElement();
			if (!target) return;
			try {
				target.currentTime = fromTime;
			} catch {
				// Some browsers can reject immediate seeks before metadata.
			}
			detailVideoCurrentMs = target.currentTime * 1000;
			mobileAudioScrubMs = detailVideoCurrentMs;
			if (wasPlaying) {
				target.play().catch(() => {
					// Autoplay policies may block without user gesture.
				});
			}
		});

		if (from) from.pause();
	}

	function formatMediaTime(ms: number): string {
		const totalSeconds = Math.max(0, Math.floor(ms / 1000));
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	$: {
		const sourceCues = activeDetailItem?.transcriptCues ?? [];
		const videoDurationMs =
			detailVideoEl && Number.isFinite(detailVideoEl.duration)
				? detailVideoEl.duration * 1000
				: Number.POSITIVE_INFINITY;
		detailTranscriptCues = sourceCues
			.filter((cue) => !isTranscriptNoiseToken(cue.text))
			.filter((cue) => cue.startMs <= videoDurationMs + 200)
			.map((cue) => ({
				text: cue.text,
				startMs: cue.startMs,
				endMs: cue.endMs
			}));
		detailTranscriptLines = buildTranscriptLines(detailTranscriptCues);
		detailActiveTranscriptLineIndex = detailTranscriptLines.findIndex(
			(line) => detailVideoCurrentMs >= line.startMs && detailVideoCurrentMs < line.endMs
		);
		if (
			detailActiveTranscriptLineIndex < 0 &&
			detailTranscriptLines.length &&
			detailVideoCurrentMs > 0
		) {
			detailActiveTranscriptLineIndex = detailTranscriptLines.reduce(
				(activeIndex, line, index) => (line.startMs <= detailVideoCurrentMs ? index : activeIndex),
				-1
			);
		}
	}

	$: mobileTranscriptTicker = detailTranscriptCues.length
		? getMobileTickerText(detailTranscriptCues, detailVideoCurrentMs)
		: '';

	$: if (
		detailMediaIsPlaying &&
		detailActiveTranscriptLineIndex >= 0 &&
		detailActiveTranscriptLineIndex !== lastAutoScrolledTranscriptLineIndex
	) {
		lastAutoScrolledTranscriptLineIndex = detailActiveTranscriptLineIndex;
		requestAnimationFrame(() => {
			autoScrollActiveTranscriptLine();
		});
	}

	$: {
		const currentSlug = activeDetailItem ? toPieceSlug(activeDetailItem) : '';
		if (currentSlug !== lastActiveDetailSlug) {
			lastActiveDetailSlug = currentSlug;
			mobileAudioIsPlaying = false;
			mobileVideoVisible = true;
			mobileAudioDurationMs = 0;
			mobileAudioScrubMs = 0;
			mobileAudioScrubbing = false;
			mobileVideoCompactProgress = 0;
			detailVideoCurrentMs = 0;
			detailMediaIsPlaying = false;
			lastAutoScrolledTranscriptLineIndex = -1;
		}
	}

	function toggleMobileTerminal() {
		mobileTerminalDrawerOpen = !mobileTerminalDrawerOpen;
	}

	async function copyEmailToClipboard() {
		const email = 'andreamoralescoto@gmail.com';
		try {
			const tempInput = document.createElement('input');
			tempInput.value = email;
			document.body.appendChild(tempInput);
			tempInput.select();
			tempInput.setSelectionRange(0, 99999);
			try {
				await navigator.clipboard.writeText(email);
				toastMessage = 'Email copied!';
			} catch {
				document.execCommand('copy');
				toastMessage = 'Email copied!';
			}
			showToast = true;
			document.body.removeChild(tempInput);
		} catch {
			toastMessage = 'Email: andreamoralescoto@gmail.com';
			showToast = true;
		}
	}

	const FRAME_BOTTOM_REST = '0% 50%';
	const FRAME_RIGHT_REST = '50% 0%';
	const DETAIL_CONTENT_REVEAL_DELAY_MS = 1360;
	const DETAIL_CONTENT_REVEAL_SWITCH_DELAY_MS = 220;

	function clearFrameLineInline(el: HTMLDivElement | null) {
		if (!el) return;
		el.style.removeProperty('animation');
		el.style.removeProperty('animation-name');
		el.style.removeProperty('background-position');
		el.style.removeProperty('transition');
	}

	function settleFrameGradient(el: HTMLDivElement | null, restPosition: string) {
		if (!el) return;
		const current = getComputedStyle(el).backgroundPosition;
		el.style.animation = 'none';
		el.style.backgroundPosition = current;
		void el.offsetWidth;
		el.style.transition = 'background-position 1.05s cubic-bezier(0.22, 1, 0.36, 1)';
		requestAnimationFrame(() => {
			el.style.backgroundPosition = restPosition;
		});
	}

	function onFrameBottomLeave() {
		settleFrameGradient(frameBottomLineEl, FRAME_BOTTOM_REST);
	}

	function onFrameRightLeave() {
		settleFrameGradient(frameRightLineEl, FRAME_RIGHT_REST);
	}

	function onFrameLineTransitionEnd(event: TransitionEvent) {
		if (event.propertyName !== 'background-position') return;
		const el = event.currentTarget as HTMLDivElement;
		el.style.removeProperty('transition');
		el.style.removeProperty('background-position');
		el.style.removeProperty('animation');
	}

	let mounted = false;

	$: if (typeof document !== 'undefined') {
		document.body.classList.toggle('detail-panel-open', !!activeDetailItem);
	}

	$: if (mounted && !activeDetailItem && typeof window !== 'undefined') {
		const hasPieceParam = new URLSearchParams(window.location.search).has('piece');
		if (hasPieceParam) {
			openPieceFromUrl();
		}
	}

	function updatePieceQuery(piece: PortfolioItem | null) {
		if (typeof window === 'undefined') return;
		const url = new URL(window.location.href);
		if (piece) {
			url.searchParams.set('piece', toPieceSlug(piece));
		} else {
			url.searchParams.delete('piece');
		}
		window.history.replaceState(
			window.history.state,
			'',
			`${url.pathname}${url.search}${url.hash}`
		);
	}

	function mergeUnlockedPieceData(piece: PortfolioItem | null): PortfolioItem | null {
		if (!piece) return null;
		const payload = unlockedPieceDataBySlug.get(toPieceSlug(piece));
		if (!payload) return piece;
		return {
			...piece,
			title: payload.projectTitle ?? piece.title,
			tags: payload.tags?.length ? payload.tags : piece.tags,
			description: payload.description,
			images: payload.images,
			content: payload.content,
			year: payload.year,
			role: payload.role,
			link: payload.link,
			metrics: payload.metrics,
			team: payload.team
		};
	}

	function openPieceFromUrl() {
		if (typeof window === 'undefined') return;
		const slug = new URLSearchParams(window.location.search).get('piece');
		if (!slug) {
			activeDetailItem = null;
			return;
		}
		const foundBySlug = sortedPortfolioItems.find((item) => toPieceSlug(item) === slug) ?? null;
		activeDetailItem = mergeUnlockedPieceData(foundBySlug);
	}

	function isPieceUnlocked(piece: Pick<PortfolioItem, 'title' | 'slug'> | null): boolean {
		if (!piece) return false;
		return unlockedPieceSlugs.has(toPieceSlug(piece));
	}

	function openPortfolioPiece(
		index: number,
		markUnlocked = false,
		unlockedData?: SecurePortfolioPayloadData
	) {
		const picked = sortedPortfolioItems[index] ?? null;
		if (picked && markUnlocked) {
			const slug = toPieceSlug(picked);
			unlockedPieceSlugs = new Set([...unlockedPieceSlugs, slug]);
			if (unlockedData) {
				unlockedPieceDataBySlug = new Map(unlockedPieceDataBySlug);
				unlockedPieceDataBySlug.set(slug, unlockedData);
			}
		}
		const nextSlug = picked ? toPieceSlug(picked) : null;
		const currentSlug = activeDetailItem ? toPieceSlug(activeDetailItem) : null;
		const switchingBetweenOpenPieces =
			!!activeDetailItem && !!picked && !!currentSlug && currentSlug !== nextSlug;
		activeDetailRevealDelayMs = switchingBetweenOpenPieces
			? DETAIL_CONTENT_REVEAL_SWITCH_DELAY_MS
			: DETAIL_CONTENT_REVEAL_DELAY_MS;
		activeDetailItem = mergeUnlockedPieceData(picked);
		updatePieceQuery(activeDetailItem);
	}

	async function scrollPortfolioDetailToTop() {
		await tick();
		await tick();
		if (typeof window !== 'undefined') {
			window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
		}
		if (detailPieceEl) {
			detailPieceEl.scrollTop = 0;
		}
	}

	async function openAdjacentPortfolioPiece(delta: -1 | 1) {
		if (!activeDetailItem) return;
		const idx = sortedPortfolioItems.findIndex(
			(item) => toPieceSlug(item) === toPieceSlug(activeDetailItem!)
		);
		if (idx < 0) return;
		const nextIdx = idx + delta;
		if (nextIdx < 0 || nextIdx >= sortedPortfolioItems.length) return;
		openPortfolioPiece(nextIdx);
		await scrollPortfolioDetailToTop();
	}

	$: detailPieceIndex = activeDetailItem
		? sortedPortfolioItems.findIndex((i) => toPieceSlug(i) === toPieceSlug(activeDetailItem!))
		: -1;
	$: detailHasPrevPiece = detailPieceIndex > 0;
	$: detailHasNextPiece =
		detailPieceIndex >= 0 && detailPieceIndex < sortedPortfolioItems.length - 1;

	onMount(() => {
		mounted = true;
		openPieceFromUrl();
		const introTimers: ReturnType<typeof setTimeout>[] = [];
		introTypewriterActive = true;
		introLinesVisible = false;
		introControlsVisible = false;
		introTerminalVisible = false;
		introTimers.push(
			setTimeout(() => {
				introTerminalVisible = true;
				introTypewriterActive = false;
			}, 1050),
			setTimeout(() => {
				introLinesVisible = true;
			}, 1650),
			setTimeout(() => {
				introControlsVisible = true;
			}, 2300)
		);

		const handleWheel = (e: WheelEvent) => {
			if (!activeDetailItem) return;
			const target = e.target instanceof Element ? e.target : null;
			if (target?.closest('.cli-terminal-window')) return;
			// Let desktop/tablet transcript panel handle its own wheel scrolling.
			if (target?.closest('.detail-panel-transcript')) return;
			if (!detailPieceEl) return;
			const maxScroll = Math.max(0, detailPieceEl.scrollHeight - detailPieceEl.clientHeight);
			if (maxScroll <= 0) return;
			e.preventDefault();
			const next = Math.max(0, Math.min(maxScroll, detailPieceEl.scrollTop + e.deltaY));
			detailPieceEl.scrollTop = next;
		};

		document.addEventListener('wheel', handleWheel, { passive: false, capture: true });
		window.addEventListener('popstate', openPieceFromUrl);

		const mql = window.matchMedia('(max-width: 768px)');
		let wasMobile = mql.matches;

		function handleBreakpointChange(e: MediaQueryListEvent) {
			const nowMobile = e.matches;
			if (wasMobile === nowMobile) return;
			const currentSeconds = detailVideoCurrentMs / 1000;

			if (wasMobile && !nowMobile) {
				if (mobileAudioEl && !mobileAudioEl.paused) mobileAudioEl.pause();
				if (mobileVideoEl && !mobileVideoEl.paused) mobileVideoEl.pause();
				if (detailVideoEl) {
					try {
						detailVideoEl.currentTime = currentSeconds;
					} catch {
						/* browser may reject seeks before metadata */
					}
				}
			} else {
				if (detailVideoEl && !detailVideoEl.paused) detailVideoEl.pause();
				const target = getActiveMobileMediaElement();
				if (target) {
					try {
						target.currentTime = currentSeconds;
					} catch {
						/* browser may reject seeks before metadata */
					}
				}
			}

			mobileAudioIsPlaying = false;
			detailMediaIsPlaying = false;
			wasMobile = nowMobile;
		}

		mql.addEventListener('change', handleBreakpointChange);

		document.querySelector(':root')?.classList.add('mounted');
		document.body.classList.add('js-enabled');

		return () => {
			for (const timer of introTimers) clearTimeout(timer);
			document.removeEventListener('wheel', handleWheel, { capture: true });
			window.removeEventListener('popstate', openPieceFromUrl);
			mql.removeEventListener('change', handleBreakpointChange);
		};
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') {
			document.body.classList.remove('detail-panel-open');
		}
	});
</script>

<svelte:head>
	<title>Andy Morales | Product Designer</title>
	<meta name="description" content="Andy Morales - Product designer for creative tools." />
</svelte:head>

<Toast message={toastMessage} bind:visible={showToast} />
<div
	class="corner-controls"
	class:corner-controls--cluster={!!activeDetailItem}
	class:corner-controls--visible={introControlsVisible}
>
	<ThemeToggle />
	<div class="corner-controls-spacer" aria-hidden="true"></div>
	<FloatingContactDock visible={true} onCopyEmail={copyEmailToClipboard} />
</div>

<!-- Mobile top stack: rainbow nav + audio controls -->
<div
	class="mobile-top-stack"
	class:mobile-top-stack--with-audio={!!activeDetailItem?.videoUrl &&
		isDirectVideoFile(activeDetailItem.videoUrl)}
>
	<MobileTopStack
		showNav={!!activeDetailItem}
		showAudio={!!activeDetailItem?.videoUrl && isDirectVideoFile(activeDetailItem.videoUrl)}
		videoUrl={activeDetailItem?.videoUrl ?? ''}
		{mobileAudioIsPlaying}
		{mobileAudioDurationMs}
		{mobileAudioScrubMs}
		{mobileVideoVisible}
		mobileTickerCues={detailTranscriptCues}
		currentMs={detailVideoCurrentMs}
		bind:mobileAudioEl
		onGoHome={() => {
			activeDetailItem = null;
			updatePieceQuery(null);
		}}
		onCopyEmail={copyEmailToClipboard}
		{toggleMobileAudioPlayback}
		{handleMobileAudioSeekInput}
		{commitMobileAudioSeek}
		{toggleMobileVideoVisible}
		{handleMobileAudioPlay}
		{handleMobileAudioPause}
		{handleMobileMediaTimeUpdate}
		{formatMediaTime}
	/>
</div>

<div class="landing-page" class:landing-page--mobile-terminal-open={mobileTerminalDrawerOpen}>
	<div class="viewport-frame-lines" aria-hidden="true">
		<div
			class="viewport-frame-hit viewport-frame-hit--bottom"
			role="presentation"
			on:mouseenter={() => clearFrameLineInline(frameBottomLineEl)}
			on:mouseleave={onFrameBottomLeave}
		>
			<div
				class="viewport-frame-line viewport-frame-line--bottom"
				class:viewport-frame-line--intro-visible={introLinesVisible}
				bind:this={frameBottomLineEl}
				on:transitionend={onFrameLineTransitionEnd}
			></div>
		</div>
		<div
			class="viewport-frame-hit viewport-frame-hit--right"
			role="presentation"
			on:mouseenter={() => clearFrameLineInline(frameRightLineEl)}
			on:mouseleave={onFrameRightLeave}
		>
			<div
				class="viewport-frame-line viewport-frame-line--right"
				class:viewport-frame-line--intro-visible={introLinesVisible}
				bind:this={frameRightLineEl}
				on:transitionend={onFrameLineTransitionEnd}
			></div>
		</div>
	</div>
	<main class="container flex-column-left">
		{#if mounted}
			<div class="landing-landing-row">
				<div class="landing-hero-anchor" bind:this={landingHeroElement}>
					<HomeLandingHero
						portfolioItems={sortedPortfolioItems}
						onOpenPortfolio={(idx, unlocked, data) => {
							mobileTerminalDrawerOpen = false;
							openPortfolioPiece(idx, unlocked, data);
						}}
						onCopyEmail={copyEmailToClipboard}
						{introTypewriterActive}
						{introTerminalVisible}
						{mobileTerminalDrawerOpen}
						onToggleMobileTerminal={toggleMobileTerminal}
						onGoHome={() => {
							activeDetailItem = null;
							updatePieceQuery(null);
						}}
					/>
				</div>
				{#if activeDetailItem}
					<div class="landing-portfolio-shell">
						<div class="detail-panel">
							<div class="detail-panel-rainbow detail-panel-rainbow--top" aria-hidden="true"></div>
							<div class="detail-panel-rainbow detail-panel-rainbow--left" aria-hidden="true"></div>
							<div class="detail-panel-grid detail-panel-grid--enter">
								<div
									class="detail-panel-piece"
									bind:this={detailPieceEl}
									on:scroll={handleDetailPieceScroll}
								>
									{#if activeDetailItem.videoUrl}
										<MobileDetailMedia
											showPanel={true}
											isDirectVideo={isDirectVideoFile(activeDetailItem.videoUrl)}
											videoUrl={activeDetailItem.videoUrl}
											{mobileVideoVisible}
											{mobileVideoCompactProgress}
											bind:mobileVideoEl
											{handleMobileAudioPlay}
											{handleMobileAudioPause}
											{handleMobileMediaTimeUpdate}
										/>
									{/if}
									<!-- Only remount body content when switching pieces (shell/dividers stay put). -->
									{#key toPieceSlug(activeDetailItem)}
										<PortfolioExpandedView
											projectTitle={activeDetailItem.title}
											tags={activeDetailItem.tags}
											description={activeDetailItem.description}
											images={activeDetailItem.images}
											content={activeDetailItem.content}
											year={activeDetailItem.year}
											role={activeDetailItem.role}
											link={activeDetailItem.link}
											metrics={activeDetailItem.metrics}
											team={activeDetailItem.team}
											locked={!!activeDetailItem.locked && !isPieceUnlocked(activeDetailItem)}
											encryptedPayload={activeDetailItem.encryptedPayload}
											immersive={false}
											onGoHome={() => {
												activeDetailItem = null;
												updatePieceQuery(null);
											}}
											hasPrevPiece={detailHasPrevPiece}
											hasNextPiece={detailHasNextPiece}
											onPrevPiece={() => openAdjacentPortfolioPiece(-1)}
											onNextPiece={() => openAdjacentPortfolioPiece(1)}
											staggerReveal={true}
											staggerBaseDelayMs={activeDetailRevealDelayMs}
										/>
									{/key}
								</div>
								<div class="detail-panel-sidebar">
									<div class="detail-panel-video">
										{#if activeDetailItem.videoUrl}
											{#if isDirectVideoFile(activeDetailItem.videoUrl)}
												<!-- svelte-ignore a11y-media-has-caption -->
												<video
													class="detail-panel-video-embed"
													bind:this={detailVideoEl}
													controls
													playsinline
													preload="metadata"
													src={activeDetailItem.videoUrl}
													title="Video for {activeDetailItem.title}"
													on:play={handleDetailMediaPlay}
													on:pause={handleDetailMediaPause}
													on:ended={handleDetailMediaPause}
													on:loadedmetadata={handleDetailVideoTimeUpdate}
													on:timeupdate={handleDetailVideoTimeUpdate}
													on:seeked={handleDetailVideoTimeUpdate}
												></video>
											{:else}
												<iframe
													class="detail-panel-video-embed"
													src={activeDetailItem.videoUrl}
													title="Video for {activeDetailItem.title}"
													frameborder="0"
													allow="autoplay; encrypted-media"
													allowfullscreen
												></iframe>
											{/if}
										{:else}
											<span class="detail-panel-placeholder">Video</span>
										{/if}
									</div>
									<div
										class="detail-panel-transcript"
										class:detail-panel-transcript--can-scroll-up={detailTranscriptCanScrollUp}
										bind:this={detailTranscriptEl}
										on:scroll={handleTranscriptScroll}
									>
										{#if detailTranscriptLines.length}
											<p class="detail-panel-transcript-flow">
												{#each detailTranscriptLines as line, index (`${line.startMs}-${index}`)}
													<button
														type="button"
														data-transcript-index={index}
														class="detail-panel-transcript-line"
														on:click={() => jumpToTranscriptLine(line.startMs)}
														title={`Jump to ${formatMediaTime(line.startMs)}`}
														aria-label={`Jump video to ${formatMediaTime(line.startMs)}: ${line.text.trim()}`}
													>
														{#each line.words as word, wordIndex (`${word.startMs}-${wordIndex}`)}
															<span
																class="detail-panel-transcript-word"
																class:detail-panel-transcript-word--active={detailMediaIsPlaying &&
																	detailVideoCurrentMs >= word.startMs &&
																	detailVideoCurrentMs < word.endMs}
															>
																{word.text}
															</span>
														{/each}
													</button>
												{/each}
											</p>
										{:else}
											<span class="detail-panel-placeholder">Transcript</span>
										{/if}
									</div>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</main>
</div>

<style>
	:global(body.detail-panel-open) {
		overflow: hidden;
	}

	:global(body.detail-panel-open) .landing-landing-row {
		height: calc(100vh - 2 * var(--landing-inset));
	}

	.corner-controls {
		position: fixed;
		left: max(2rem, env(safe-area-inset-left));
		right: max(calc(2rem + 1px + var(--spacing-sm)), env(safe-area-inset-right));
		bottom: max(calc(2rem + 1px + var(--spacing-sm)), env(safe-area-inset-bottom));
		display: flex;
		align-items: flex-end;
		justify-content: flex-start;
		z-index: 10050;
		pointer-events: none;
		opacity: 0;
		transition: opacity 420ms ease;
	}

	.corner-controls--visible {
		opacity: 1;
	}

	.corner-controls-spacer {
		flex: 1 1 auto;
		min-width: 0;
		max-width: 100vw;
		transition: max-width 1600ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.corner-controls--cluster {
		gap: 0;
	}

	.corner-controls--cluster .corner-controls-spacer {
		max-width: var(--spacing-xs);
	}

	.corner-controls :global(.theme-toggle),
	.corner-controls :global(.floating-contact-dock) {
		display: flex;
		align-items: flex-end;
		align-self: flex-end;
		line-height: 0;
		pointer-events: auto;
	}

	.landing-page {
		--landing-inset: 2rem;
		--frame-line-trim: 0rem;
		min-height: 100vh;
		background-color: var(--bg-color);
		color: var(--text-color);
		padding: var(--landing-inset);
		display: flex;
		flex-direction: column;
		align-items: stretch;
		position: relative;
	}

	.viewport-frame-lines {
		pointer-events: none;
		position: relative;
		z-index: 12;
	}

	.viewport-frame-hit {
		pointer-events: auto;
		z-index: 1;
	}

	.viewport-frame-hit--bottom {
		position: fixed;
		left: calc(max(var(--landing-inset), env(safe-area-inset-left)) + var(--frame-line-trim));
		right: max(var(--landing-inset), env(safe-area-inset-right));
		bottom: max(var(--landing-inset), env(safe-area-inset-bottom));
		display: flex;
		align-items: flex-end;
		height: 14px;
	}

	.viewport-frame-hit--right {
		position: fixed;
		top: calc(max(var(--landing-inset), env(safe-area-inset-top)) + var(--frame-line-trim));
		bottom: max(var(--landing-inset), env(safe-area-inset-bottom));
		right: max(var(--landing-inset), env(safe-area-inset-right));
		display: flex;
		justify-content: flex-end;
		width: 14px;
	}

	.viewport-frame-line {
		opacity: 0.92;
		will-change: background-position;
		transition: background-position 1.1s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.viewport-frame-line--bottom {
		width: 100%;
		height: 1px;
		flex-shrink: 0;
		background-image: var(--palette-rainbow-gradient-h);
		background-size: 240% 100%;
		background-position: 0% 50%;
		transform-origin: left center;
		transform: scaleX(0);
		transition:
			transform 900ms cubic-bezier(0.16, 1, 0.3, 1),
			background-position 1.1s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.viewport-frame-line--right {
		width: 1px;
		height: 100%;
		flex-shrink: 0;
		background-image: var(--palette-rainbow-gradient-v);
		background-size: 100% 240%;
		background-position: 50% 0%;
		transform-origin: center top;
		transform: scaleY(0);
		transition:
			transform 900ms cubic-bezier(0.16, 1, 0.3, 1),
			background-position 1.1s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.viewport-frame-line--bottom.viewport-frame-line--intro-visible {
		transform: scaleX(1);
	}

	.viewport-frame-line--right.viewport-frame-line--intro-visible {
		transform: scaleY(1);
	}

	.viewport-frame-hit--bottom:hover .viewport-frame-line--bottom {
		animation: rainbow-dance-bottom 22s linear infinite;
		transition: none;
	}

	.viewport-frame-hit--right:hover .viewport-frame-line--right {
		animation: rainbow-dance-right 22s linear infinite;
		transition: none;
	}

	@keyframes rainbow-dance-bottom {
		0% {
			background-position: 0% 50%;
		}
		100% {
			background-position: 100% 50%;
		}
	}

	@keyframes rainbow-dance-right {
		0% {
			background-position: 50% 0%;
		}
		100% {
			background-position: 50% 100%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.viewport-frame-hit--bottom:hover .viewport-frame-line--bottom,
		.viewport-frame-hit--right:hover .viewport-frame-line--right {
			animation: none;
		}
	}

	.container {
		max-width: 100%;
		margin: 0;
		padding: 0;
		position: relative;
		z-index: 2;
		gap: 0;
	}

	.landing-landing-row {
		display: flex;
		flex-direction: row;
		align-items: stretch;
		gap: var(--spacing-extra-large);
		width: 100%;
		max-width: 100%;
		height: calc(100vh - 2 * var(--landing-inset));
		max-height: calc(100vh - 2 * var(--landing-inset));
		min-height: 0;
		overflow: visible;
	}

	.landing-hero-anchor {
		flex: 0 0 auto;
		width: fit-content;
		max-width: 100%;
		min-width: 0;
		overflow: visible;
	}

	.landing-portfolio-shell {
		position: relative;
		z-index: 0;
		flex: 1 1 0%;
		min-width: 0;
		min-height: 0;
		display: flex;
		flex-direction: column;
		align-self: stretch;
		overflow: visible;
		isolation: isolate;
	}

	.landing-portfolio-shell::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		background-image:
			var(--palette-rainbow-gradient-h), var(--palette-rainbow-gradient-h),
			var(--palette-rainbow-gradient-h), var(--palette-rainbow-gradient-h);
		background-position:
			top center,
			bottom center,
			left center,
			right center;
		background-size:
			100% 6px,
			100% 6px,
			6px 100%,
			6px 100%;
		background-repeat: no-repeat;
		filter: blur(12px);
		opacity: 0;
		animation: detail-glow-in 560ms ease forwards;
		animation-delay: 1520ms;
	}

	@media (prefers-reduced-motion: reduce) {
		.landing-portfolio-shell::before {
			opacity: var(--glow-portfolio-opacity-rm, 0.12);
		}
	}

	.detail-panel {
		position: relative;
		flex: 1 1 0%;
		min-height: 0;
		height: 100%;
		width: 100%;
		z-index: 3;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.mobile-top-stack {
		display: none;
	}

	.detail-panel-rainbow {
		position: absolute;
		opacity: 0.95;
		z-index: 4;
		pointer-events: none;
	}

	.detail-panel-rainbow--top {
		top: 0;
		right: 0;
		left: 0;
		height: 1px;
		background-image: var(--palette-rainbow-gradient-h);
		background-size: 240% 100%;
		background-position: 100% 50%;
		transform-origin: right center;
		transform: scaleX(0);
		animation: detail-line-grow-top 1800ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	.detail-panel-rainbow--left {
		top: 0;
		bottom: 0;
		left: 0;
		width: 1px;
		background-image: var(--palette-rainbow-gradient-v);
		background-size: 100% 240%;
		background-position: 50% 100%;
		transform-origin: center bottom;
		transform: scaleY(0);
		animation: detail-line-grow-left 1800ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	.detail-panel-grid {
		display: grid;
		grid-template-columns: 1fr minmax(0, 0.38fr);
		grid-template-rows: 1fr;
		width: 100%;
		flex: 1 1 auto;
		min-height: 0;
		height: 100%;
		gap: 0;
	}

	.detail-panel-grid--enter {
		opacity: 0;
		transform: scaleY(0.8);
		transform-origin: top center;
		animation: detail-content-fill-in 520ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
		animation-delay: 1420ms;
	}

	.detail-panel-piece {
		border: 1px solid var(--text-color);
		border-right: none;
		border-bottom: none;
		border-top: none;
		border-left: none;
		border-radius: 0;
		overflow-y: scroll;
		overflow-x: hidden;
		background: var(--bg-color);
		min-height: 0;
		height: 100%;
		max-height: 100%;
		overscroll-behavior: contain;
		scrollbar-width: thin;
		scrollbar-color: var(--alpha-black-025) transparent;
	}

	.detail-panel-piece::-webkit-scrollbar {
		width: 9px;
	}

	.detail-panel-piece::-webkit-scrollbar-thumb {
		background: var(--alpha-black-030);
		border-radius: 999px;
	}

	.detail-panel-piece :global(.portfolio-expanded-view) {
		height: auto !important;
		min-height: max-content;
		overflow: visible !important;
		max-width: 100% !important;
		margin: 0 !important;
	}

	.detail-panel-piece :global(.portfolio-expanded-view .content-container),
	.detail-panel-piece :global(.portfolio-expanded-view .content-view),
	.detail-panel-piece :global(.portfolio-expanded-view .content-blocks) {
		overflow: visible !important;
		max-width: 100% !important;
	}

	.detail-panel-piece :global(.portfolio-expanded-view .hero-image-container),
	.detail-panel-piece :global(.portfolio-expanded-view .image-gallery),
	.detail-panel-piece :global(.portfolio-expanded-view .project-details-grid) {
		max-width: 100% !important;
	}

	.detail-panel-piece :global(.hero-image-container .image-frame) {
		max-width: 100%;
	}

	.detail-panel-piece :global(.image-block .image-frame img) {
		max-height: none;
	}

	.detail-panel-sidebar {
		display: grid;
		grid-template-rows: 1fr 1fr;
		gap: 0;
		min-height: 0;
		position: relative;
	}

	.detail-panel-sidebar::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 1px;
		background-image: var(--palette-rainbow-gradient-v);
		background-size: 100% 240%;
		background-position: 50% 0%;
		pointer-events: none;
		z-index: 2;
	}

	.detail-panel-sidebar::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		top: calc(50% - 0.5px);
		height: 1px;
		background-image: var(--palette-rainbow-gradient-h);
		background-size: 240% 100%;
		background-position: 0% 50%;
		pointer-events: none;
		z-index: 2;
	}

	.detail-panel-video {
		border: 1px solid var(--text-color);
		border-bottom: none;
		border-right: none;
		border-top: none;
		border-left-color: transparent;
		border-radius: 0;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-color);
	}

	.detail-panel-video iframe,
	.detail-panel-video video.detail-panel-video-embed {
		width: 100%;
		height: 100%;
		border: none;
		object-fit: cover;
		vertical-align: middle;
	}

	.detail-panel-transcript {
		border: 1px solid var(--text-color);
		border-right: none;
		border-bottom: none;
		border-left-color: transparent;
		border-top-color: transparent;
		border-radius: 0;
		overflow-y: auto;
		display: block;
		position: relative;
		height: 100%;
		max-height: 100%;
		min-height: 0;
		padding: 1rem;
		background: var(--bg-color);
	}

	.detail-panel-transcript::before {
		content: '';
		position: sticky;
		top: 0;
		display: block;
		height: 1.1rem;
		margin: 0 0 -1.1rem 0;
		background: linear-gradient(
			to bottom,
			var(--bg-color) 0%,
			color-mix(in srgb, var(--bg-color) 0%, transparent) 100%
		);
		pointer-events: none;
		opacity: 0;
		transition: opacity 140ms ease;
		z-index: 2;
	}

	.detail-panel-transcript--can-scroll-up::before {
		opacity: 1;
	}

	.detail-panel-transcript-flow {
		margin: 0;
		font-size: var(--font-size-sm);
		line-height: 1.58;
		font-variation-settings:
			'CASL' 0,
			'wght' 370;
	}

	.detail-panel-transcript-line {
		display: block;
		width: 100%;
		margin: 0 0 0.18rem;
		padding: 0.08rem 0.2rem;
		border: 0;
		border-radius: 0.22rem;
		background: transparent;
		color: var(--text-color);
		opacity: 0.72;
		font: inherit;
		line-height: inherit;
		text-transform: none;
		letter-spacing: normal;
		cursor: pointer;
		text-align: left;
		transition:
			opacity 130ms ease,
			background-color 130ms ease;
	}

	.detail-panel-transcript-line:hover {
		opacity: 0.95;
		background: color-mix(in srgb, var(--text-color) 10%, transparent);
	}

	.detail-panel-transcript-line:focus-visible {
		opacity: 1;
		background: color-mix(in srgb, var(--text-color) 14%, transparent);
		outline: 1px solid color-mix(in srgb, var(--text-color) 32%, transparent);
		outline-offset: 1px;
	}

	.detail-panel-transcript-word {
		font: inherit;
		font-weight: 370;
	}

	.detail-panel-transcript-word--active {
		font-weight: 700;
	}

	.detail-panel-placeholder {
		font-family: 'IBM Plex Mono', ui-monospace, monospace;
		font-size: 0.75rem;
		color: var(--text-color);
		opacity: 0.35;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	/* Tablet: move video/transcript below the main terminal content. */
	@media (max-width: 1180px) and (min-width: 769px) {
		.landing-landing-row {
			gap: clamp(0.65rem, 1.4vw, 1.15rem);
		}

		.detail-panel-grid {
			grid-template-columns: 1fr;
			grid-template-rows: minmax(0, 1fr) minmax(220px, 34vh);
		}

		.detail-panel-piece {
			min-height: 0;
		}

		.detail-panel-sidebar {
			grid-template-columns: 1fr 1fr;
			grid-template-rows: 1fr;
			min-height: 220px;
			height: 100%;
		}

		/* Replace the sidebar's vertical divider with a horizontal divider above this row. */
		.detail-panel-sidebar::before {
			left: 0;
			right: 0;
			top: 0;
			bottom: auto;
			width: auto;
			height: 1px;
			background-image: var(--palette-rainbow-gradient-h);
			background-size: 240% 100%;
			background-position: 0% 50%;
		}

		/* Inner divider between video and transcript in the bottom row. */
		.detail-panel-sidebar::after {
			left: calc(50% - 0.5px);
			right: auto;
			top: 0;
			bottom: 0;
			width: 1px;
			height: auto;
			background-image: var(--palette-rainbow-gradient-v);
			background-size: 100% 240%;
			background-position: 50% 0%;
		}

		.detail-panel-video,
		.detail-panel-transcript {
			border-top: 1px solid var(--text-color);
			border-left: none;
		}

		.detail-panel-video {
			border-right: none;
			border-bottom: none;
			min-height: 220px;
		}

		.detail-panel-transcript {
			border-right: none;
			border-bottom: none;
		}
	}

	@media (max-width: 768px) {
		.landing-page {
			--landing-inset: 1rem;
			padding: var(--landing-inset);
			padding-bottom: calc(var(--landing-inset) + 3rem);
		}

		.corner-controls :global(.floating-contact-dock),
		.corner-controls :global(.theme-toggle) {
			display: none !important;
		}

		.landing-landing-row {
			flex-direction: column;
			align-items: stretch;
			gap: 0;
			height: auto;
			max-height: none;
			overflow: visible;
		}

		:global(body.detail-panel-open) .landing-landing-row {
			height: auto;
			max-height: none;
			overflow: visible;
		}

		.landing-hero-anchor {
			width: 100%;
			flex: 0 0 auto;
		}

		:global(body.detail-panel-open) .landing-hero-anchor {
			height: 0;
			overflow: hidden;
			flex: 0 0 0px;
		}

		:global(body.detail-panel-open) .landing-portfolio-shell {
			margin-top: 0;
			padding-top: 0;
		}

		.landing-portfolio-shell {
			flex: 1 1 auto;
			min-height: 0;
			width: 100%;
			margin-top: var(--spacing-md);
		}

		.landing-portfolio-shell::before {
			display: none;
		}

		.detail-panel {
			max-height: none;
			overflow: visible;
		}

		.detail-panel-grid {
			grid-template-columns: 1fr;
			grid-template-rows: auto;
			height: auto;
		}

		.detail-panel-grid--enter {
			animation-delay: 220ms;
		}

		.detail-panel-piece {
			border: none;
			border-radius: 0;
			overflow-y: auto;
			overflow-x: hidden;
			-webkit-overflow-scrolling: touch;
			overscroll-behavior: contain;
			touch-action: pan-y;
			height: 100dvh;
			max-height: 100dvh;
			background: var(--bg-color);
		}

		.detail-panel-sidebar {
			display: none;
		}

		.detail-panel-rainbow--top,
		.detail-panel-rainbow--left {
			display: none;
		}

		.viewport-frame-lines {
			display: none;
		}

		.mobile-top-stack {
			display: flex;
			flex-direction: column;
			gap: 0;
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			width: 100%;
			z-index: 10050;
		}

		/* Entire landing subtree stacks below `.mobile-top-stack` unless we lift it: internal z-index cannot beat a sibling fixed bar. */
		.landing-page--mobile-terminal-open {
			z-index: 10060;
		}

		:global(.mobile-top-stack + .landing-page .detail-panel-piece) {
			padding-top: calc(3rem + env(safe-area-inset-top, 0px));
		}

		:global(.mobile-top-stack--with-audio + .landing-page .detail-panel-piece) {
			padding-top: calc(6.5rem + env(safe-area-inset-top, 0px));
		}
	}

	@keyframes detail-line-grow-top {
		from {
			transform: scaleX(0);
		}
		to {
			transform: scaleX(1);
		}
	}

	@keyframes detail-line-grow-left {
		from {
			transform: scaleY(0);
		}
		to {
			transform: scaleY(1);
		}
	}

	@keyframes detail-content-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes detail-content-fill-in {
		0% {
			opacity: 0;
			transform: scaleY(0.8);
		}
		100% {
			opacity: 1;
			transform: scaleY(1);
		}
	}

	@keyframes detail-glow-in {
		from {
			opacity: 0;
		}
		to {
			opacity: var(--glow-portfolio-opacity, 0.9);
		}
	}

	@media (max-width: 768px) {
		.container {
			gap: var(--spacing-md);
		}

		:global(body.detail-panel-open) {
			overflow-y: auto !important;
			overflow-x: hidden !important;
		}
	}
</style>
