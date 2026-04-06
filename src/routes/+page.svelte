<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import QuickNav from '$lib/components/portfolio/QuickNav.svelte';
	import HomeImmersiveTopbar from '$lib/components/HomeImmersiveTopbar.svelte';
	import HomeLandingHero from '$lib/components/HomeLandingHero.svelte';
	import HomeImmersivePortfolioList from '$lib/components/HomeImmersivePortfolioList.svelte';
	import HomeNextPieceBanner from '$lib/components/HomeNextPieceBanner.svelte';
	import PortfolioExpandedView from '$lib/components/portfolio/PortfolioExpandedView.svelte';
	import FloatingContactDock from '$lib/components/ui/FloatingContactDock.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import { portfolioItems } from '$lib/data/portfolio-items.js';
	import type { PortfolioItem } from '$lib/data/portfolio-items.js';
	import type { SecurePortfolioPayloadData } from '$lib/utils/secureCaseStudy';
	import { colibri } from '$lib/data/home-page-assets';

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
	): Array<{ text: string; startMs: number; endMs: number }> {
		if (!cues.length) return [];

		const lines: Array<{ text: string; startMs: number; endMs: number }> = [];

		for (let i = 0; i < cues.length; i++) {
			const cue = cues[i];
			const text = normalizeTranscriptText(cue.text);
			if (!text) continue;

			// Keep punctuation attached to the previous token instead of becoming its own row.
			if (/^[,.;!?]+$/.test(text) && lines.length) {
				lines[lines.length - 1] = {
					...lines[lines.length - 1],
					text: normalizeTranscriptText(`${lines[lines.length - 1].text}${text}`),
					endMs: cue.endMs
				};
				continue;
			}

			lines.push({
				text,
				startMs: cue.startMs,
				endMs: cue.endMs
			});
		}

		// Keep previous behavior contract while now using word-level rows.
		return maxCharsPerLine > 0 ? lines : [];
	}

	$: sortedPortfolioItems = [...$portfolioItems].sort(
		(a: PortfolioItem, b: PortfolioItem) => getLatestYear(b.year) - getLatestYear(a.year)
	);

	$: allNavigationItems = sortedPortfolioItems.map((item: PortfolioItem, index: number) => ({
		id: index,
		title: item.title,
		thumbnail: item.quickNavThumbnail
	}));

	let immersiveMode = false;
	let isActivatingImmersive = false;
	let allowScrollToOpen = true;
	let canCloseImmersiveAtTop = false;
	let navMenuOpen = false;
	let activePortfolioIndex = 0;
	let nextPortfolioIndex: number | null = null;
	let showNextPieceBanner = false;
	let landingHeroElement: HTMLElement | null = null;
	let frameBottomLineEl: HTMLDivElement | null = null;
	let frameRightLineEl: HTMLDivElement | null = null;
	let showToast = false;
	let toastMessage = '';
	let activeDetailItem: PortfolioItem | null = null;
	let detailVideoEl: HTMLVideoElement | null = null;
	let detailTranscriptEl: HTMLDivElement | null = null;
	let detailVideoCurrentMs = 0;
	let detailTranscriptCues: Array<{ text: string; startMs: number; endMs: number }> = [];
	let detailTranscriptLines: Array<{ text: string; startMs: number; endMs: number }> = [];
	let detailVisibleTranscriptLines: Array<{ text: string; startMs: number; endMs: number }> = [];
	let shouldStickTranscriptToBottom = true;
	let detailTranscriptCanScrollUp = false;
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
		if (detailTranscriptEl && shouldStickTranscriptToBottom) {
			requestAnimationFrame(() => {
				if (detailTranscriptEl && shouldStickTranscriptToBottom) {
					detailTranscriptEl.scrollTop = detailTranscriptEl.scrollHeight;
					syncTranscriptScrollIndicators();
				}
			});
		}
	}

	function handleTranscriptScroll() {
		if (!detailTranscriptEl) return;
		const distanceFromBottom =
			detailTranscriptEl.scrollHeight -
			detailTranscriptEl.scrollTop -
			detailTranscriptEl.clientHeight;
		shouldStickTranscriptToBottom = distanceFromBottom < 24;
		syncTranscriptScrollIndicators();
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
		detailVisibleTranscriptLines = detailTranscriptLines.filter(
			(line) => line.startMs <= detailVideoCurrentMs + 120
		);
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
		document.body.classList.toggle('detail-panel-open', !!activeDetailItem && !immersiveMode);
	}

	$: if (mounted && !immersiveMode && !activeDetailItem && typeof window !== 'undefined') {
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
		if (typeof window === 'undefined' || immersiveMode) return;
		const slug = new URLSearchParams(window.location.search).get('piece');
		if (!slug) {
			activeDetailItem = null;
			return;
		}
		const foundBySlug = sortedPortfolioItems.find((item) => toPieceSlug(item) === slug) ?? null;
		activeDetailItem = mergeUnlockedPieceData(foundBySlug);
	}

	async function enterImmersiveMode(targetIndex: number = 0) {
		if (immersiveMode || isActivatingImmersive) {
			if (immersiveMode) {
				scrollToImmersiveSection(targetIndex);
			}
			return;
		}

		isActivatingImmersive = true;
		allowScrollToOpen = false;
		canCloseImmersiveAtTop = false;
		immersiveMode = true;
		activeDetailItem = null;
		updatePieceQuery(null);
		navMenuOpen = false;
		activePortfolioIndex = targetIndex;

		await tick();
		scrollToImmersiveSection(targetIndex);
		isActivatingImmersive = false;
	}

	async function closeImmersiveMode(scrollTarget: 'top' | 'list' = 'list') {
		if (!immersiveMode || typeof window === 'undefined') return;

		immersiveMode = false;
		navMenuOpen = false;
		showNextPieceBanner = false;
		nextPortfolioIndex = null;
		canCloseImmersiveAtTop = false;
		allowScrollToOpen = scrollTarget === 'top';

		await tick();

		if (scrollTarget === 'top') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
			return;
		}

		landingHeroElement?.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	}

	function scrollToImmersiveSection(index: number) {
		const element = document.getElementById(`immersive-piece-${index}`);
		element?.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
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
		if (immersiveMode) {
			scrollToImmersiveSection(index);
			return;
		}
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
		if (!activeDetailItem || immersiveMode) return;
		const idx = sortedPortfolioItems.findIndex(
			(item) => toPieceSlug(item) === toPieceSlug(activeDetailItem!)
		);
		if (idx < 0) return;
		const nextIdx = idx + delta;
		if (nextIdx < 0 || nextIdx >= sortedPortfolioItems.length) return;
		openPortfolioPiece(nextIdx);
		await scrollPortfolioDetailToTop();
	}

	$: detailPieceIndex =
		activeDetailItem && !immersiveMode
			? sortedPortfolioItems.findIndex((i) => toPieceSlug(i) === toPieceSlug(activeDetailItem!))
			: -1;
	$: detailHasPrevPiece = detailPieceIndex > 0;
	$: detailHasNextPiece =
		detailPieceIndex >= 0 && detailPieceIndex < sortedPortfolioItems.length - 1;

	function updateImmersiveProgress() {
		if (!immersiveMode || typeof window === 'undefined') return;

		const viewportMidpoint = window.innerHeight * 0.45;
		let closestIndex = 0;
		let closestDistance = Number.POSITIVE_INFINITY;

		sortedPortfolioItems.forEach((_, index) => {
			const section = document.getElementById(`immersive-piece-${index}`);
			if (!section) return;

			const rect = section.getBoundingClientRect();
			const sectionMidpoint = rect.top + rect.height / 2;
			const distance = Math.abs(sectionMidpoint - viewportMidpoint);

			if (distance < closestDistance) {
				closestDistance = distance;
				closestIndex = index;
			}
		});

		activePortfolioIndex = closestIndex;
		nextPortfolioIndex = closestIndex < sortedPortfolioItems.length - 1 ? closestIndex + 1 : null;

		const activeSection = document.getElementById(`immersive-piece-${closestIndex}`);
		if (!activeSection || nextPortfolioIndex === null) {
			showNextPieceBanner = false;
			return;
		}

		const rect = activeSection.getBoundingClientRect();
		const progress = (window.innerHeight - rect.top) / rect.height;
		showNextPieceBanner = progress > 0.72 && rect.bottom > window.innerHeight * 0.4;
	}

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

		const handleScroll = () => {
			if (isActivatingImmersive) return;

			if (!immersiveMode && window.scrollY <= 16) {
				allowScrollToOpen = true;
			}

			if (immersiveMode && !canCloseImmersiveAtTop && window.scrollY > 48) {
				canCloseImmersiveAtTop = true;
			}

			if (immersiveMode && canCloseImmersiveAtTop && window.scrollY <= 16) {
				closeImmersiveMode('top');
				return;
			}

			if (!immersiveMode && allowScrollToOpen && window.scrollY > 72) {
				enterImmersiveMode(0);
				return;
			}

			updateImmersiveProgress();
		};

		const handleDocumentClick = (event: MouseEvent) => {
			if (!immersiveMode || isActivatingImmersive) return;

			const target = event.target;
			if (!(target instanceof Element)) return;
			const clickedInsidePortfolio = target.closest('.piece-shell');
			const clickedInsideControls = target.closest(
				'.immersive-topbar, .next-piece-banner, .mobile-immersive-nav, .cli-terminal-window'
			);

			if (!clickedInsidePortfolio && !clickedInsideControls) {
				closeImmersiveMode('list');
			}
		};

		const handleWheel = (e: WheelEvent) => {
			if (!activeDetailItem || immersiveMode) return;
			const target = e.target instanceof Element ? e.target : null;
			if (target?.closest('.cli-terminal-window')) return;
			if (!detailPieceEl) return;
			const maxScroll = Math.max(0, detailPieceEl.scrollHeight - detailPieceEl.clientHeight);
			if (maxScroll <= 0) return;
			e.preventDefault();
			const next = Math.max(0, Math.min(maxScroll, detailPieceEl.scrollTop + e.deltaY));
			detailPieceEl.scrollTop = next;
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		document.addEventListener('wheel', handleWheel, { passive: false, capture: true });
		document.addEventListener('click', handleDocumentClick);
		window.addEventListener('popstate', openPieceFromUrl);

		document.querySelector(':root')?.classList.add('mounted');
		document.body.classList.add('js-enabled');

		return () => {
			for (const timer of introTimers) clearTimeout(timer);
			window.removeEventListener('scroll', handleScroll);
			document.removeEventListener('wheel', handleWheel, { capture: true });
			document.removeEventListener('click', handleDocumentClick);
			window.removeEventListener('popstate', openPieceFromUrl);
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
	class:corner-controls--cluster={!!activeDetailItem && !immersiveMode}
	class:corner-controls--visible={introControlsVisible}
>
	<ThemeToggle />
	<div class="corner-controls-spacer" aria-hidden="true"></div>
	<FloatingContactDock visible={!immersiveMode} onCopyEmail={copyEmailToClipboard} />
</div>

<!-- Mobile top bar: thin rainbow on home, full nav bar on portfolio piece -->
<div
	class="mobile-rainbow-bar"
	class:mobile-rainbow-bar--home={!activeDetailItem}
	class:mobile-rainbow-bar--nav={!!activeDetailItem}
>
	{#if activeDetailItem}
		<button
			class="mobile-nav__home"
			on:click={() => {
				activeDetailItem = null;
				updatePieceQuery(null);
			}}
			aria-label="Back to home"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				width="24"
				height="24"
				fill="currentColor"
				aria-hidden="true"
				style="image-rendering: pixelated"
			>
				<!-- eyes -->
				<rect x="5" y="2" width="4" height="8" />
				<rect x="15" y="2" width="4" height="8" />
				<!-- smile -->
				<rect x="0" y="14" width="2" height="4" />
				<rect x="2" y="16" width="2" height="4" />
				<rect x="4" y="18" width="2" height="4" />
				<rect x="6" y="20" width="12" height="4" />
				<rect x="18" y="18" width="2" height="4" />
				<rect x="20" y="16" width="2" height="4" />
				<rect x="22" y="14" width="2" height="4" />
			</svg>
		</button>
		<div class="mobile-nav__icons">
			<ThemeToggle />
			<FloatingContactDock visible={true} onCopyEmail={copyEmailToClipboard} />
		</div>
	{/if}
</div>

<div class="landing-page">
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
	{#if immersiveMode}
		<HomeImmersiveTopbar
			isOpen={navMenuOpen}
			activeIndex={activePortfolioIndex}
			items={sortedPortfolioItems}
			{colibri}
			onToggle={() => (navMenuOpen = !navMenuOpen)}
			onSelect={(index) => {
				navMenuOpen = false;
				openPortfolioPiece(index);
			}}
		/>
	{/if}

	<main class="container flex-column-left" class:immersive-mode={immersiveMode}>
		{#if mounted}
			{#if !immersiveMode}
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
								<div
									class="detail-panel-rainbow detail-panel-rainbow--top"
									aria-hidden="true"
								></div>
								<div
									class="detail-panel-rainbow detail-panel-rainbow--left"
									aria-hidden="true"
								></div>
								<div class="detail-panel-grid detail-panel-grid--enter">
									<div class="detail-panel-piece" bind:this={detailPieceEl}>
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
											{#if detailVisibleTranscriptLines.length}
												<p class="detail-panel-transcript-flow">
													{#each detailVisibleTranscriptLines as line, index (`${line.startMs}-${index}`)}
														<span
															class="detail-panel-transcript-line"
															class:detail-panel-transcript-line--active={index ===
																detailVisibleTranscriptLines.length - 1}
														>
															{line.text}
														</span>
													{/each}
												</p>
											{:else if detailTranscriptLines.length}
												<span class="detail-panel-placeholder">
													Transcript will appear as the video plays
												</span>
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
			{:else}
				<HomeImmersivePortfolioList items={sortedPortfolioItems} />
			{/if}
		{/if}
	</main>
</div>

{#if immersiveMode && showNextPieceBanner && nextPortfolioIndex !== null}
	{@const upcomingIndex = nextPortfolioIndex}
	<HomeNextPieceBanner
		title={sortedPortfolioItems[upcomingIndex].title}
		onClick={() => scrollToImmersiveSection(upcomingIndex)}
	/>
{/if}

{#if immersiveMode}
	<div class="mobile-immersive-nav">
		<QuickNav items={allNavigationItems} hasExpandedItem={true} onExpandItem={openPortfolioPiece} />
	</div>
{/if}

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
		flex: 1 1 auto;
		min-height: 0;
		max-height: 100%;
		width: 100%;
		z-index: 3;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.mobile-rainbow-bar {
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
		margin: -1rem -1rem 0;
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
		line-height: 1.55;
	}

	.detail-panel-transcript-line {
		display: inline;
		margin-right: 0.36ch;
		color: var(--text-color);
		opacity: 0.72;
	}

	.detail-panel-transcript-line--active {
		opacity: 0.98;
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
			padding-top: 3rem;
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
			/* Use an explicit mobile scroll container for reliable touch scrolling. */
			overflow-y: auto;
			overflow-x: hidden;
			-webkit-overflow-scrolling: touch;
			overscroll-behavior: contain;
			touch-action: pan-y;
			height: auto;
			max-height: calc(
				100dvh - 3rem - 3.375rem - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)
			);
			background: transparent;
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

		.mobile-rainbow-bar {
			display: block;
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			width: 100%;
			z-index: 10050;
			background-image: var(--palette-rainbow-gradient-h);
			background-size: 240% 100%;
			animation: rainbow-dance-bottom 22s linear infinite;
			-webkit-tap-highlight-color: transparent;
		}

		.mobile-rainbow-bar--home {
			height: 5px;
		}

		.mobile-rainbow-bar--nav {
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: auto;
			padding: 0.5rem var(--landing-inset, 1rem);
			padding-top: calc(0.5rem + env(safe-area-inset-top, 0px));
		}

		.mobile-nav__home {
			display: flex;
			align-items: center;
			line-height: 0;
			background: none;
			border: none;
			padding: 0;
			cursor: pointer;
			color: var(--bg-color);
			opacity: 0.9;
			-webkit-tap-highlight-color: transparent;
		}

		.mobile-nav__home:hover {
			opacity: 1;
		}

		.mobile-nav__home :global(svg) {
			display: block;
		}

		.mobile-nav__icons {
			display: flex;
			align-items: center;
			gap: 1.1rem;
		}

		.mobile-nav__icons :global(.theme-toggle) {
			color: var(--bg-color);
			opacity: 1;
			display: flex;
			align-items: center;
			line-height: 0;
			padding: 0;
		}

		.mobile-nav__icons :global(.theme-toggle) :global(svg) {
			width: 24px !important;
			height: 24px !important;
		}

		.mobile-nav__icons :global(.floating-contact-dock) {
			display: inline-flex !important;
			align-items: center;
			gap: 1.1rem;
			pointer-events: auto;
			opacity: 1;
		}

		.mobile-nav__icons :global(.floating-contact-dock__link),
		.mobile-nav__icons :global(.floating-contact-dock__button) {
			color: var(--bg-color);
			opacity: 1;
			display: flex;
			align-items: center;
			line-height: 0;
			padding: 0;
		}

		.mobile-nav__icons :global(.floating-contact-dock__link:hover),
		.mobile-nav__icons :global(.floating-contact-dock__button:hover) {
			opacity: 1;
		}

		.mobile-nav__icons :global(.floating-contact-dock__link svg),
		.mobile-nav__icons :global(.floating-contact-dock__button svg),
		.mobile-nav__icons :global(.floating-contact-dock__link) :global(svg),
		.mobile-nav__icons :global(.floating-contact-dock__button) :global(svg) {
			width: 24px !important;
			height: 24px !important;
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

	.container.immersive-mode {
		gap: 0;
	}

	.mobile-immersive-nav {
		display: none;
	}

	@media (max-width: 768px) {
		.container {
			gap: var(--spacing-md);
		}

		.container.immersive-mode {
			padding-top: 0;
		}

		:global(body.detail-panel-open) {
			overflow-y: auto !important;
			overflow-x: hidden !important;
		}

		.mobile-immersive-nav {
			display: block;
		}
	}
</style>
