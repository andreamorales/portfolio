<script lang="ts">
	import type { SlideItem } from '$lib/data/portfolio-items';
	import PortfolioCaseMetadata from '$lib/components/portfolio/PortfolioCaseMetadata.svelte';
	import type { PortfolioMetricInput } from '$lib/utils/portfolioMetrics';

	export let slides: SlideItem[] = [];
	/** Case summary paragraphs (`description` split by blank lines); shown only on carousel slide index 0. */
	export let introSummaryParagraphs: string[] = [];
	export let year = '';
	export let link = '';
	export let metrics: PortfolioMetricInput[] | string[] = [];
	export let staggerReveal = false;
	export let revealDelayMs = 0;
	export let videoCurrentMs = 0;
	export let videoIsPlaying = false;

	let currentSlide = 0;
	let userOverrodeSlide = false;

	/** Index 1 is a virtual metadata slide; total = data slides + 1. */
	$: totalSlides = slides.length + 1;
	$: isMetadataSlide = currentSlide === 1;
	/** Map display index → data slide (skip over the metadata slot at 1). */
	$: dataIndex = currentSlide === 0 ? 0 : currentSlide - 1;
	$: slide = slides[dataIndex] ?? slides[0];
	$: layout = slide?.layout ?? 'text-left';
	$: hasText = !!(slide?.title || slide?.text);
	$: hasImage = !!slide?.image;
	$: isFirstSlide = currentSlide === 0;
	$: useIntroText = dataIndex === 0 && introSummaryParagraphs.length > 0;
	$: isLastSlide = currentSlide === totalSlides - 1;

	$: hasTiming = slides.some((s) => s.startMs != null);

	$: if (videoIsPlaying && hasTiming && !userOverrodeSlide) {
		const target = getSlideForTime(videoCurrentMs);
		if (target !== currentSlide) {
			currentSlide = target;
		}
	}

	$: if (!videoIsPlaying) {
		userOverrodeSlide = false;
	}

	/** Map video time → display index (accounts for virtual metadata slide at 1). */
	function getSlideForTime(ms: number): number {
		let bestDataIdx = 0;
		for (let i = 0; i < slides.length; i++) {
			const s = slides[i];
			if (s.startMs != null && ms >= s.startMs) {
				bestDataIdx = i;
			}
		}
		return bestDataIdx === 0 ? 0 : bestDataIdx + 1;
	}

	function goTo(index: number) {
		currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
		if (videoIsPlaying) userOverrodeSlide = true;
	}

	function next() {
		if (currentSlide < totalSlides - 1) goTo(currentSlide + 1);
	}

	function prev() {
		if (currentSlide > 0) goTo(currentSlide - 1);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (isFullscreen && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) return;
		if (e.key === 'ArrowRight') next();
		else if (e.key === 'ArrowLeft') prev();
		else if (e.key === 'Escape' && isFullscreen) exitFullscreen();
	}

	function handleFullscreenWindowKeydown(e: KeyboardEvent) {
		if (!isFullscreen) return;
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			next();
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			prev();
		} else if (e.key === 'Escape') {
			exitFullscreen();
		}
	}

	let slideEl: HTMLElement;
	let isFullscreen = false;

	function toggleFullscreen() {
		if (isFullscreen) {
			exitFullscreen();
		} else {
			enterFullscreen();
		}
	}

	function enterFullscreen() {
		if (slideEl?.requestFullscreen) {
			slideEl.requestFullscreen().catch(() => {});
		}
	}

	function exitFullscreen() {
		if (document.fullscreenElement) {
			document.exitFullscreen().catch(() => {});
		}
	}

	function onFullscreenChange() {
		isFullscreen = !!document.fullscreenElement;
	}

	let splitRatio = 50;
	let isDraggingSplit = false;
	let splitContainerEl: HTMLElement | null = null;

	function onSplitPointerDown(e: PointerEvent) {
		isDraggingSplit = true;
		splitContainerEl = (e.currentTarget as HTMLElement).parentElement;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		e.preventDefault();
		e.stopPropagation();
	}

	function onSplitPointerMove(e: PointerEvent) {
		if (!isDraggingSplit || !splitContainerEl) return;
		e.stopPropagation();
		const rect = splitContainerEl.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const pct = (x / rect.width) * 100;
		splitRatio = Math.max(20, Math.min(80, pct));
	}

	function onSplitPointerUp(e?: PointerEvent) {
		isDraggingSplit = false;
		splitContainerEl = null;
		e?.stopPropagation();
	}

	function resetSplitRatio() {
		splitRatio = 50;
	}

	let prevSlide = currentSlide;
	$: if (currentSlide !== prevSlide) {
		prevSlide = currentSlide;
		resetSplitRatio();
	}

	$: textPanePct = layout === 'text-right' ? 100 - splitRatio : splitRatio;
	$: textCollapsed = hasImage && textPanePct < 38;
	$: imagePanePct = 100 - textPanePct;
	$: imageExpanded = hasImage && imagePanePct > 52;

	function revealStyle(delayMs: number): string | undefined {
		if (!staggerReveal) return undefined;
		return `--reveal-delay: ${Math.max(0, Math.round(delayMs))}ms;`;
	}
</script>

<svelte:window
	on:fullscreenchange={onFullscreenChange}
	on:keydown={handleFullscreenWindowKeydown}
/>
<!-- svelte-ignore a11y-no-noninteractive-tabindex a11y-no-noninteractive-element-interactions -->
<div
	class="slides-container"
	class:slides-container--staggered={staggerReveal}
	on:keydown={handleKeydown}
	role="region"
	aria-roledescription="carousel"
	aria-label="Project slides"
	tabindex="0"
>
	<div
		class="slide reveal-child"
		class:slide--fullscreen={isFullscreen}
		style={revealStyle(revealDelayMs)}
		bind:this={slideEl}
	>
		<div class="slide-count" role="status" aria-live="polite" aria-atomic="true">
			{currentSlide + 1}/{totalSlides}
		</div>

		<!-- Prev nav overlay -->
		{#if !isFirstSlide}
			<button class="slide-nav slide-nav--prev" class:slide-nav--disabled={isDraggingSplit} on:click={prev} aria-label="Previous slide">
				<svg
					class="slide-nav__icon"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 3 5"
					width="14"
					height="14"
					fill="currentColor"
					aria-hidden="true"
				>
					<rect x="0" y="2" width="1" height="1" />
					<rect x="1" y="1" width="1" height="1" />
					<rect x="1" y="3" width="1" height="1" />
					<rect x="2" y="0" width="1" height="1" />
					<rect x="2" y="4" width="1" height="1" />
				</svg>
			</button>
		{/if}

		{#key currentSlide}
			{#if isMetadataSlide}
				<div class="slide-content slide-content--metadata">
					<PortfolioCaseMetadata variant="embedded" {year} {link} {metrics} />
				</div>
			{:else}
				<div
					class="slide-content"
					class:layout-text-only={layout === 'text-only'}
					class:layout-image-only={layout === 'image-only'}
					class:layout-text-left={layout === 'text-left'}
					class:layout-text-right={layout === 'text-right'}
					class:layout-full-bleed={layout === 'full-bleed'}
				>
					{#if layout === 'full-bleed'}
						<div class="slide-image-full">
							{#if hasImage}
								<img src={slide.image} alt={slide.imageAlt || ''} />
							{/if}
						</div>
					{:else if layout === 'image-only'}
						{#if useIntroText}
							<div class="slide-split">
								<div class="slide-text-half">
									{#if slide.title}
										<h3 class="slide-title">{slide.title}</h3>
									{/if}
									{#each introSummaryParagraphs as para, sumIdx (`slide-sum-${sumIdx}`)}
										<p class="slide-body">{para}</p>
									{/each}
								</div>
								<div class="slide-image-half">
									{#if hasImage}
										<img src={slide.image} alt={slide.imageAlt || ''} />
									{/if}
								</div>
							</div>
						{:else}
							<div class="slide-image-centered">
								{#if hasImage}
									<img src={slide.image} alt={slide.imageAlt || ''} />
								{/if}
							</div>
						{/if}
					{:else if layout === 'text-only'}
						<div class="slide-text-full">
							{#if slide.title}
								<h3 class="slide-title">{slide.title}</h3>
							{/if}
							{#if useIntroText}
								{#each introSummaryParagraphs as para, sumIdx (`slide-sum-${sumIdx}`)}
									<p class="slide-body">{para}</p>
								{/each}
							{:else if slide.text}
								<p class="slide-body">{slide.text}</p>
							{/if}
						</div>
					{:else}
						{@const imageFirst = layout === 'text-right'}
						<div class="slide-split" class:reverse={imageFirst} class:slide-split--dragging={isDraggingSplit}>
							<div class="slide-text-half" class:slide-text-half--collapsed={textCollapsed} style={hasImage ? `flex: 0 0 ${imageFirst ? 100 - splitRatio : splitRatio}%;` : ''}>
								{#if slide.title}
									<h3 class="slide-title">{slide.title}</h3>
								{/if}
								<div class="slide-text-body" class:slide-text-body--hidden={textCollapsed}>
									{#if useIntroText}
										{#each introSummaryParagraphs as para, sumIdx (`slide-sum-${sumIdx}`)}
											<p class="slide-body">{para}</p>
										{/each}
									{:else if slide.text}
										<p class="slide-body">{slide.text}</p>
									{/if}
								</div>
							</div>
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							{#if hasImage}
								<div
									class="slide-split-handle"
									class:slide-split-handle--dragging={isDraggingSplit}
									on:pointerdown={onSplitPointerDown}
									on:pointermove={onSplitPointerMove}
									on:pointerup={onSplitPointerUp}
									on:pointercancel={onSplitPointerUp}
								>
									<div class="slide-split-handle__grip"></div>
								</div>
								<div class="slide-image-half" class:slide-image-half--contain={imageExpanded} style="flex: 0 0 {imageFirst ? splitRatio : 100 - splitRatio}%;">
									<img src={slide.image} alt={slide.imageAlt || ''} />
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/if}
		{/key}

		<!-- Next nav overlay (not shown on last slide) -->
		{#if !isLastSlide}
			<button class="slide-nav slide-nav--next" class:slide-nav--disabled={isDraggingSplit} on:click={next} aria-label="Next slide">
				<svg
					class="slide-nav__icon"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 3 5"
					width="14"
					height="14"
					fill="currentColor"
					aria-hidden="true"
				>
					<rect x="2" y="2" width="1" height="1" />
					<rect x="1" y="1" width="1" height="1" />
					<rect x="1" y="3" width="1" height="1" />
					<rect x="0" y="0" width="1" height="1" />
					<rect x="0" y="4" width="1" height="1" />
				</svg>
			</button>
		{/if}

		<!-- Fullscreen toggle (bottom-right) -->
		<button
			class="slide-fullscreen-btn"
			on:click={toggleFullscreen}
			aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
		>
			{#if isFullscreen}
				<!-- Collapse icon: four inward-pointing corners -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 8 8"
					width="14"
					height="14"
					fill="currentColor"
					aria-hidden="true"
				>
					<rect x="2" y="0" width="1" height="3" />
					<rect x="0" y="2" width="3" height="1" />
					<rect x="5" y="0" width="1" height="3" />
					<rect x="5" y="2" width="3" height="1" />
					<rect x="2" y="5" width="1" height="3" />
					<rect x="0" y="5" width="3" height="1" />
					<rect x="5" y="5" width="1" height="3" />
					<rect x="5" y="5" width="3" height="1" />
				</svg>
			{:else}
				<!-- Expand icon: four outward-pointing corners -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 8 8"
					width="14"
					height="14"
					fill="currentColor"
					aria-hidden="true"
				>
					<rect x="0" y="0" width="1" height="3" />
					<rect x="0" y="0" width="3" height="1" />
					<rect x="7" y="0" width="1" height="3" />
					<rect x="5" y="0" width="3" height="1" />
					<rect x="0" y="5" width="1" height="3" />
					<rect x="0" y="7" width="3" height="1" />
					<rect x="7" y="5" width="1" height="3" />
					<rect x="5" y="7" width="3" height="1" />
				</svg>
			{/if}
		</button>
	</div>
</div>

<style>
	.slide-content--metadata {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-lg) var(--spacing-xxl);
		height: 440px;
		box-sizing: border-box;
		overflow-y: auto;
		--black: var(--white, #f3ead6);
		--text-color: var(--white, #f3ead6);
		--palette-grey-600: rgba(243, 234, 214, 0.72);
		--palette-grey-hint: rgba(243, 234, 214, 0.72);
		--portfolio-metadata-rule: rgba(243, 234, 214, 0.22);
		--portfolio-metadata-label: rgba(243, 234, 214, 0.72);
		--muted-text: rgba(243, 234, 214, 0.65);
		--palette-rainbow-6: #f0c674;
	}

	:global(html.dark-theme) .slide-content--metadata {
		--black: var(--palette-bg, #141312);
		--text-color: var(--palette-bg, #141312);
		--palette-grey-600: rgba(20, 19, 18, 0.75);
		--palette-grey-hint: rgba(20, 19, 18, 0.75);
		--portfolio-metadata-rule: rgba(20, 19, 18, 0.2);
		--portfolio-metadata-label: rgba(20, 19, 18, 0.75);
		--muted-text: rgba(20, 19, 18, 0.65);
		--palette-rainbow-6: var(--portfolio-metadata-link-on-ink);
	}

	.slides-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0;
		outline: none;
	}

	.slides-container--staggered .reveal-child {
		opacity: 0;
		animation-name: portfolio-reveal-in;
		animation-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
		animation-fill-mode: forwards;
		animation-delay: var(--reveal-delay, 0ms);
		animation-duration: var(--reveal-child-duration, 560ms);
	}

	.slide {
		width: 100%;
		height: 440px;
		border-radius: var(--border-radius-sm);
		overflow: hidden;
		background: var(--black, #252022);
		color: var(--white, #f3ead6);
		border: none;
		position: relative;
	}

	:global(html.dark-theme) .slide {
		background: var(--palette-ink, #c4b6a4);
		color: var(--palette-bg, #141312);
	}

	.slide-count {
		--slide-nav-inset: 12px;
		position: absolute;
		top: 0;
		right: 0;
		z-index: 3;
		padding: var(--slide-nav-inset);
		font-size: var(--font-size-xs);
		letter-spacing: 0.06em;
		font-variation-settings:
			'CASL' 0,
			'wght' 450;
		opacity: 0.55;
		pointer-events: none;
		font-variant-numeric: tabular-nums;
	}

	.slide--fullscreen {
		width: 100vw;
		height: 100vh;
		border-radius: 0;
	}

	.slide--fullscreen .slide-title {
		font-size: clamp(2.4rem, 4vw, 3.6rem);
	}

	.slide--fullscreen .slide-body {
		font-size: clamp(1.15rem, 1.8vw, 1.5rem);
		line-height: 1.55;
	}

	.slide--fullscreen .slide-text-half {
		padding: var(--spacing-xl) var(--spacing-xxl);
		gap: var(--spacing-md);
	}

	.slide--fullscreen .slide-text-full {
		max-width: 70ch;
		padding: var(--spacing-xxl);
		gap: var(--spacing-md);
	}

	.slide--fullscreen .slide-count {
		font-size: var(--font-size-sm);
	}

	.slide--fullscreen .slide-content--metadata {
		padding: var(--spacing-xl) var(--spacing-xxl);
		height: 100%;
		--font-size-xxs: 0.85rem;
		--font-size-xs: 0.95rem;
		--font-size-base: 1.35rem;
		--font-size-sm: 1.1rem;
		--spacing-lg: 2.5rem;
		--spacing-xs: 0.75rem;
	}

	.slide-fullscreen-btn {
		--slide-nav-inset: 12px;
		position: absolute;
		bottom: 0;
		right: 0;
		z-index: 3;
		padding: var(--slide-nav-inset);
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: 0;
		background: transparent;
		color: inherit;
		opacity: 0.4;
		cursor: pointer;
		transition: opacity 200ms ease;
		min-height: unset;
		height: auto;
		transform: none;
	}

	.slide-fullscreen-btn:hover {
		opacity: 0.85;
		transform: none;
	}

	/* ── Slide nav arrows (vertically centered, soft edge gradient) ── */
	/* inset matches on both bottom edge and side edge of the slide */
	.slide-nav {
		--slide-nav-inset: 12px;
		position: absolute;
		top: 0;
		bottom: 0;
		z-index: 2;
		display: flex;
		align-items: center;
		border: none;
		color: inherit;
		opacity: 0.55;
		cursor: pointer;
		transition: opacity 200ms ease;
		padding: 0 var(--slide-nav-inset);
		background: transparent;
		min-width: calc(14px + 2 * var(--slide-nav-inset));
	}

	.slide-nav::before {
		content: '';
		position: absolute;
		pointer-events: none;
		z-index: 0;
		top: 0;
		bottom: 0;
		width: 80px;
	}

	.slide-nav--prev {
		left: 0;
		justify-content: flex-start;
	}

	.slide-nav--prev::before {
		left: 0;
		background: linear-gradient(to right, rgba(0, 0, 0, 0.18) 0%, transparent 100%);
	}

	.slide-nav--next {
		right: 0;
		justify-content: flex-end;
	}

	.slide-nav--next::before {
		right: 0;
		background: linear-gradient(to left, rgba(0, 0, 0, 0.18) 0%, transparent 100%);
	}

	:global(html.dark-theme) .slide-nav--prev::before {
		background: linear-gradient(to right, rgba(0, 0, 0, 0.14) 0%, transparent 100%);
	}

	:global(html.dark-theme) .slide-nav--next::before {
		background: linear-gradient(to left, rgba(0, 0, 0, 0.14) 0%, transparent 100%);
	}

	.slide-nav:hover:not(:disabled) {
		opacity: 1;
	}

	.slide-nav:disabled {
		opacity: 0.15;
		cursor: default;
	}

	.slide-nav--disabled {
		pointer-events: none;
	}

	.slide-nav__icon {
		position: relative;
		z-index: 1;
		display: block;
		flex-shrink: 0;
	}

	.slide-content {
		width: 100%;
		height: 100%;
		display: flex;
		animation: slide-fade-in 360ms cubic-bezier(0.22, 0.61, 0.36, 1);
	}

	.layout-text-only {
		align-items: center;
		justify-content: center;
	}

	.slide-text-full {
		max-width: 55ch;
		padding: var(--spacing-xl) var(--spacing-xxl);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	/* Image-only layout */
	.layout-image-only {
		align-items: center;
		justify-content: center;
	}

	.slide-image-centered {
		width: 100%;
		padding: var(--spacing-lg);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.slide-image-centered img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		border-radius: var(--border-radius-sm);
		flex: 1;
		min-height: 0;
	}

	/* Full-bleed layout */
	.layout-full-bleed {
		align-items: stretch;
	}

	.slide-image-full {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.slide-image-full img {
		width: 100%;
		flex: 1;
		min-height: 0;
		object-fit: cover;
	}

	/* Split layout (text-left / text-right) */
	.slide-split {
		width: 100%;
		display: flex;
		align-items: stretch;
	}

	.slide-split--dragging {
		user-select: none;
	}

	.slide-split.reverse {
		flex-direction: row-reverse;
	}

	.slide-text-half {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-lg) var(--spacing-xxl);
		overflow: hidden;
	}

	.slide-text-half--collapsed {
		justify-content: center;
	}

	.slide-text-body {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		opacity: 1;
		max-height: 500px;
		transition: opacity 180ms ease, max-height 180ms ease;
		overflow: hidden;
	}

	.slide-text-body--hidden {
		opacity: 0;
		max-height: 0;
	}

	.slide-image-half {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.slide-image-half img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: object-fit 0s;
	}

	.slide-image-half--contain {
		background: rgba(0, 0, 0, 0.04);
	}

	.slide-image-half--contain img {
		object-fit: contain;
		padding: var(--spacing-sm);
	}

	.slide-split-handle {
		flex-shrink: 0;
		width: 12px;
		cursor: col-resize;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		z-index: 3;
		touch-action: none;
	}

	.slide-split-handle__grip {
		width: 3px;
		height: 32px;
		border-radius: 2px;
		background: currentColor;
		opacity: 0.18;
		transition: opacity 150ms, height 150ms;
	}

	.slide-split-handle:hover .slide-split-handle__grip,
	.slide-split-handle--dragging .slide-split-handle__grip {
		opacity: 0.45;
		height: 48px;
	}

	/* Typography */
	.slide-title {
		margin: 0;
		font-family: 'Instrument Serif', serif;
		font-size: clamp(1.55rem, 2.65vw, 2.2rem);
		line-height: 1.08;
		letter-spacing: -0.04em;
		color: inherit;
		font-weight: normal;
	}

	.slide-body {
		margin: 0;
		font-size: var(--font-size-base);
		line-height: 1.6;
		font-variation-settings:
			'CASL' 0,
			'wght' 370;
		color: inherit;
		letter-spacing: -0.01em;
		opacity: 0.85;
	}

	/* Dark mode text tuning */
	:global(html.dark-theme) .slide-body {
		font-variation-settings:
			'CASL' 0,
			'wght' 400;
		letter-spacing: -0.01em;
	}

	/* Mobile */
	@media (max-width: 768px) {
		.slide {
			height: 340px;
		}

		.slide-image-half img {
			max-height: none;
			object-fit: cover;
		}

		.slide-text-half {
			padding: var(--spacing-sm) var(--spacing-lg);
			gap: var(--spacing-xs);
		}

		.slide-title {
			font-size: clamp(1.1rem, 4.5vw, 1.5rem);
		}

		.slide-body {
			font-size: var(--font-size-sm);
			line-height: 1.38;
		}

		.slide-text-full {
			padding: var(--spacing-lg) var(--spacing-lg);
		}

		.slide-count {
			--slide-nav-inset: 10px;
		}

		.slide-nav {
			--slide-nav-inset: 10px;
		}

		.slide-nav__icon {
			width: 12px;
			height: 12px;
		}

		.slide-content--metadata {
			height: 340px;
			padding: var(--spacing-md) var(--spacing-lg);
		}
	}

	@keyframes slide-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes portfolio-reveal-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
