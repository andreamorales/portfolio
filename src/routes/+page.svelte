<script lang="ts">
	import { onMount, tick } from 'svelte';
	import QuickNav from '$lib/components/portfolio/QuickNav.svelte';
	import HomeImmersiveTopbar from '$lib/components/HomeImmersiveTopbar.svelte';
	import HomeLandingHero from '$lib/components/HomeLandingHero.svelte';
	import HomeImmersivePortfolioList from '$lib/components/HomeImmersivePortfolioList.svelte';
	import HomeNextPieceBanner from '$lib/components/HomeNextPieceBanner.svelte';
	import { portfolioItems } from '$lib/data/portfolio-items.js';
	import type { PortfolioItem } from '$lib/data/portfolio-items.js';
	import { colibri } from '$lib/data/home-page-assets';

	const getLatestYear = (year: string) => {
		const years = year.split('-').map((value) => parseInt(value.trim(), 10));
		return Math.max(...years);
	};

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
		if (!immersiveMode) {
			enterImmersiveMode(index);
			return;
		}

		scrollToImmersiveSection(index);
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

		window.addEventListener('scroll', handleScroll, { passive: true });
		document.addEventListener('click', handleDocumentClick);

		document.querySelector(':root')?.classList.add('mounted');
		document.body.classList.add('js-enabled');

		return () => {
			window.removeEventListener('scroll', handleScroll);
			document.removeEventListener('click', handleDocumentClick);
		};
	});
</script>

<svelte:head>
	<title>Andy Morales | Product Designer</title>
	<meta name="description" content="Andy Morales - Product designer for creative tools." />
</svelte:head>

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
				<div class="landing-hero-anchor" bind:this={landingHeroElement}>
					<HomeLandingHero
						portfolioItems={sortedPortfolioItems}
						onOpenPortfolio={openPortfolioPiece}
					/>
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
	.landing-page {
		--landing-inset: 2rem;
		/* Pull frame lines inward so they end before the corner on the left / top */
		--frame-line-trim: 1.5rem;
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
	}

	.viewport-frame-line--right {
		width: 1px;
		height: 100%;
		flex-shrink: 0;
		background-image: var(--palette-rainbow-gradient-v);
		background-size: 100% 240%;
		background-position: 50% 0%;
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

	.landing-hero-anchor {
		width: 100%;
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
