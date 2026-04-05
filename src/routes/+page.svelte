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
	import { colibri } from '$lib/data/home-page-assets';

	const getLatestYear = (year: string) => {
		const years = year.split('-').map((value) => parseInt(value.trim(), 10));
		return Math.max(...years);
	};

	const toPieceSlug = (title: string) =>
		title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');

	function isDirectVideoFile(url: string): boolean {
		const path = url.split('?')[0] ?? url;
		return /\.(mp4|webm|ogg)$/i.test(path);
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
	let detailPieceEl: HTMLDivElement | null = null;
	let introTypewriterActive = true;
	let introLinesVisible = false;
	let introControlsVisible = false;
	let introTerminalVisible = false;

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
			url.searchParams.set('piece', toPieceSlug(piece.title));
		} else {
			url.searchParams.delete('piece');
		}
		window.history.replaceState(
			window.history.state,
			'',
			`${url.pathname}${url.search}${url.hash}`
		);
	}

	function openPieceFromUrl() {
		if (typeof window === 'undefined' || immersiveMode) return;
		const slug = new URLSearchParams(window.location.search).get('piece');
		if (!slug) {
			activeDetailItem = null;
			return;
		}
		const found = sortedPortfolioItems.find((item) => toPieceSlug(item.title) === slug) ?? null;
		activeDetailItem = found;
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

	function openPortfolioPiece(index: number) {
		if (immersiveMode) {
			scrollToImmersiveSection(index);
			return;
		}
		activeDetailItem = sortedPortfolioItems[index] ?? null;
		updatePieceQuery(activeDetailItem);
	}

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
							onOpenPortfolio={openPortfolioPiece}
							onCopyEmail={copyEmailToClipboard}
							introTypewriterActive={introTypewriterActive}
							introTerminalVisible={introTerminalVisible}
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
											locked={activeDetailItem.locked}
											unlockPassword={activeDetailItem.unlockPassword}
											immersive={false}
										/>
									</div>
									<div class="detail-panel-sidebar">
										<div class="detail-panel-video">
											{#if activeDetailItem.videoUrl}
												{#if isDirectVideoFile(activeDetailItem.videoUrl)}
													<!-- svelte-ignore a11y-media-has-caption -->
													<video
														class="detail-panel-video-embed"
														controls
														playsinline
														preload="metadata"
														src={activeDetailItem.videoUrl}
														title="Video for {activeDetailItem.title}"
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
										<div class="detail-panel-transcript">
											<span class="detail-panel-placeholder">Transcript</span>
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
		object-fit: contain;
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
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-color);
	}

	.detail-panel-placeholder {
		font-family: 'IBM Plex Mono', ui-monospace, monospace;
		font-size: 0.75rem;
		color: var(--text-color);
		opacity: 0.35;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	@media (max-width: 768px) {
		.landing-landing-row {
			flex-direction: column;
			align-items: stretch;
			gap: var(--spacing-md);
		}

		.landing-hero-anchor {
			width: 100%;
		}

		.landing-portfolio-shell {
			flex: 1 1 auto;
			min-height: min(70vh, 32rem);
			width: 100%;
		}

		.detail-panel-grid {
			grid-template-columns: 1fr;
			grid-template-rows: 1fr auto auto;
		}

		.detail-panel-piece {
			border: 1px solid var(--text-color);
			border-radius: 0;
		}

		.detail-panel-sidebar {
			grid-template-rows: auto auto;
		}

		.detail-panel-sidebar::before,
		.detail-panel-sidebar::after {
			display: none;
		}

		.detail-panel-video {
			border: 1px solid var(--text-color);
			border-top: none;
			border-left-color: var(--text-color);
			min-height: 8rem;
		}

		.detail-panel-transcript {
			border-radius: 0;
			border-left-color: var(--text-color);
			border-top-color: var(--text-color);
			min-height: 6rem;
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

		.landing-page {
			--landing-inset: 2rem;
			padding: var(--landing-inset);
		}

		.mobile-immersive-nav {
			display: block;
		}
	}
</style>
