<script lang="ts">
	import type { SlideItem } from '$lib/data/portfolio-items';
	import PortfolioCaseMetadata from '$lib/components/portfolio/PortfolioCaseMetadata.svelte';

	export let slides: SlideItem[] = [];
	export let year = '';
	export let role = '';
	export let link = '';
	export let metrics: string[] = [];
	export let team: Array<{ role: string; name: string; relationship: string }> = [];
	export let staggerReveal = false;
	export let revealDelayMs = 0;
	export let videoCurrentMs = 0;
	export let videoIsPlaying = false;
	export let hasPrevPiece = false;
	export let hasNextPiece = false;
	export let onPrevPiece: (() => void) | null = null;
	export let onNextPiece: (() => void) | null = null;
	export let onGoHome: (() => void) | null = null;

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
		if (e.key === 'ArrowRight') next();
		else if (e.key === 'ArrowLeft') prev();
	}

	function revealStyle(delayMs: number): string | undefined {
		if (!staggerReveal) return undefined;
		return `--reveal-delay: ${Math.max(0, Math.round(delayMs))}ms;`;
	}
</script>

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
	<div class="slide reveal-child" style={revealStyle(revealDelayMs)}>
		<div class="slide-count" role="status" aria-live="polite" aria-atomic="true">
			{currentSlide + 1}/{totalSlides}
		</div>

		<!-- Prev nav overlay -->
		<button
			class="slide-nav slide-nav--prev"
			class:slide-nav--piece={isFirstSlide}
			disabled={isFirstSlide && !hasPrevPiece}
			on:click={() => {
				if (isFirstSlide) {
					onPrevPiece?.();
				} else {
					prev();
				}
			}}
			aria-label={isFirstSlide ? 'Previous portfolio piece' : 'Previous slide'}
		>
			<svg
				class="slide-nav__icon"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 3 5"
				width="18"
				height="18"
				fill="currentColor"
				aria-hidden="true"
				style="image-rendering: pixelated"
			>
				<rect x="0" y="2" width="1" height="1" />
				<rect x="1" y="1" width="1" height="3" />
				<rect x="2" y="0" width="1" height="5" />
			</svg>
		</button>

		{#key currentSlide}
			{#if isMetadataSlide}
				<div class="slide-content slide-content--metadata">
					<PortfolioCaseMetadata variant="embedded" {year} {role} {link} {metrics} {team} />
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
						<div class="slide-image-centered">
							{#if hasImage}
								<img src={slide.image} alt={slide.imageAlt || ''} />
							{/if}
						</div>
					{:else if layout === 'text-only'}
						<div class="slide-text-full">
							{#if slide.title}
								<h3 class="slide-title">{slide.title}</h3>
							{/if}
							{#if slide.text}
								<p class="slide-body">{slide.text}</p>
							{/if}
						</div>
					{:else}
						{@const imageFirst = layout === 'text-right'}
						<div class="slide-split" class:reverse={imageFirst}>
							<div class="slide-text-half">
								{#if slide.title}
									<h3 class="slide-title">{slide.title}</h3>
								{/if}
								{#if slide.text}
									<p class="slide-body">{slide.text}</p>
								{/if}
							</div>
							{#if hasImage}
								<div class="slide-image-half">
									<img src={slide.image} alt={slide.imageAlt || ''} />
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/if}
		{/key}

		<!-- Next nav overlay -->
		{#if isLastSlide}
			<div class="slide-end-actions">
				{#if hasNextPiece}
					<button
						class="slide-end-btn"
						on:click={() => onNextPiece?.()}
						aria-label="Next portfolio piece"
					>
						Next Case
						<svg
							class="slide-end-btn__icon"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 3 5"
							width="14"
							height="14"
							fill="currentColor"
							aria-hidden="true"
							style="image-rendering: pixelated"
						>
							<rect x="2" y="2" width="1" height="1" />
							<rect x="1" y="1" width="1" height="3" />
							<rect x="0" y="0" width="1" height="5" />
						</svg>
					</button>
				{/if}
				{#if onGoHome}
					<button
						class="slide-end-btn slide-end-btn--home"
						on:click={() => onGoHome?.()}
						aria-label="Back to home"
					>
						Home
					</button>
				{/if}
			</div>
		{:else}
			<button
				class="slide-nav slide-nav--next"
				on:click={next}
				aria-label="Next slide"
			>
				<svg
					class="slide-nav__icon"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 3 5"
					width="18"
					height="18"
					fill="currentColor"
					aria-hidden="true"
					style="image-rendering: pixelated"
				>
					<rect x="2" y="2" width="1" height="1" />
					<rect x="1" y="1" width="1" height="3" />
					<rect x="0" y="0" width="1" height="5" />
				</svg>
			</button>
		{/if}
	</div>
</div>

<style>
	.slide-content--metadata {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-lg);
		height: 440px;
		box-sizing: border-box;
		overflow-y: auto;
		--black: var(--white, #f3ead6);
		--text-color: var(--white, #f3ead6);
		--palette-grey-600: rgba(243, 234, 214, 0.55);
		--palette-grey-hint: rgba(243, 234, 214, 0.55);
		--muted-text: rgba(243, 234, 214, 0.45);
		--palette-rainbow-6: #f0c674;
	}

	:global(html.dark-theme) .slide-content--metadata {
		--black: var(--palette-bg, #141312);
		--text-color: var(--palette-bg, #141312);
		--palette-grey-600: rgba(20, 19, 18, 0.6);
		--palette-grey-hint: rgba(20, 19, 18, 0.6);
		--muted-text: rgba(20, 19, 18, 0.5);
		--palette-rainbow-6: #8b6914;
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

	/* ── Slide nav arrows (bottom corners, equal inset + soft gradient) ── */
	/* inset matches on both bottom edge and side edge of the slide */
	.slide-nav {
		--slide-nav-inset: 12px;
		position: absolute;
		bottom: 0;
		z-index: 2;
		display: flex;
		align-items: flex-end;
		border: none;
		color: inherit;
		opacity: 0.65;
		cursor: pointer;
		transition: opacity 200ms ease;
		padding: var(--slide-nav-inset);
		background: transparent;
		min-width: calc(18px + 2 * var(--slide-nav-inset));
		min-height: calc(18px + 2 * var(--slide-nav-inset));
	}

	.slide-nav::before {
		content: '';
		position: absolute;
		pointer-events: none;
		z-index: 0;
	}

	.slide-nav--prev {
		left: 0;
		justify-content: flex-start;
	}

	.slide-nav--prev::before {
		left: 0;
		bottom: 0;
		width: 200px;
		height: 160px;
		background: radial-gradient(
			ellipse 100% 95% at 0% 100%,
			rgba(0, 0, 0, 0.42) 0%,
			rgba(0, 0, 0, 0.22) 28%,
			rgba(0, 0, 0, 0.1) 48%,
			rgba(0, 0, 0, 0.03) 70%,
			rgba(0, 0, 0, 0.008) 86%,
			transparent 100%
		);
	}

	.slide-nav--next {
		right: 0;
		justify-content: flex-end;
	}

	.slide-nav--next::before {
		right: 0;
		bottom: 0;
		width: 200px;
		height: 160px;
		background: radial-gradient(
			ellipse 100% 95% at 100% 100%,
			rgba(0, 0, 0, 0.42) 0%,
			rgba(0, 0, 0, 0.22) 28%,
			rgba(0, 0, 0, 0.1) 48%,
			rgba(0, 0, 0, 0.03) 70%,
			rgba(0, 0, 0, 0.008) 86%,
			transparent 100%
		);
	}

	:global(html.dark-theme) .slide-nav--prev::before {
		background: radial-gradient(
			ellipse 100% 95% at 0% 100%,
			rgba(0, 0, 0, 0.32) 0%,
			rgba(0, 0, 0, 0.16) 30%,
			rgba(0, 0, 0, 0.07) 52%,
			rgba(0, 0, 0, 0.025) 74%,
			rgba(0, 0, 0, 0.006) 88%,
			transparent 100%
		);
	}

	:global(html.dark-theme) .slide-nav--next::before {
		background: radial-gradient(
			ellipse 100% 95% at 100% 100%,
			rgba(0, 0, 0, 0.32) 0%,
			rgba(0, 0, 0, 0.16) 30%,
			rgba(0, 0, 0, 0.07) 52%,
			rgba(0, 0, 0, 0.025) 74%,
			rgba(0, 0, 0, 0.006) 88%,
			transparent 100%
		);
	}

	.slide-nav:hover:not(:disabled) {
		opacity: 1;
	}

	.slide-nav:disabled {
		opacity: 0.15;
		cursor: default;
	}

	.slide-nav--piece {
		opacity: 0.3;
	}

	.slide-nav__icon {
		position: relative;
		z-index: 1;
		display: block;
		flex-shrink: 0;
	}

	/* ── End-of-slides actions (last slide, bottom-right) ── */

	.slide-end-actions {
		--slide-nav-inset: 12px;
		position: absolute;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--slide-nav-inset);
		z-index: 2;
		background: transparent;
	}

	.slide-end-actions::before {
		content: '';
		position: absolute;
		right: 0;
		bottom: 0;
		width: min(280px, 75vw);
		height: 120px;
		pointer-events: none;
		z-index: 0;
		background: radial-gradient(
			ellipse 100% 95% at 100% 100%,
			rgba(0, 0, 0, 0.46) 0%,
			rgba(0, 0, 0, 0.24) 26%,
			rgba(0, 0, 0, 0.1) 48%,
			rgba(0, 0, 0, 0.03) 72%,
			rgba(0, 0, 0, 0.008) 88%,
			transparent 100%
		);
	}

	:global(html.dark-theme) .slide-end-actions::before {
		background: radial-gradient(
			ellipse 100% 95% at 100% 100%,
			rgba(0, 0, 0, 0.34) 0%,
			rgba(0, 0, 0, 0.17) 28%,
			rgba(0, 0, 0, 0.075) 52%,
			rgba(0, 0, 0, 0.028) 76%,
			rgba(0, 0, 0, 0.007) 90%,
			transparent 100%
		);
	}

	.slide-end-actions > * {
		position: relative;
		z-index: 1;
	}

	.slide-end-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		border: 1px solid currentColor;
		border-radius: var(--border-radius-full, 9999px);
		background: transparent;
		color: inherit;
		font-family: inherit;
		font-size: var(--font-size-xs);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 200ms ease, background 200ms ease;
		font-variation-settings: 'CASL' 0, 'wght' 450;
		white-space: nowrap;
	}

	.slide-end-btn:hover {
		opacity: 1;
		background: rgba(255, 255, 255, 0.1);
	}

	:global(html.dark-theme) .slide-end-btn:hover {
		background: rgba(0, 0, 0, 0.08);
	}

	.slide-end-btn--home {
		border: none;
		opacity: 0.4;
		font-size: var(--font-size-xxs);
	}

	.slide-end-btn--home:hover {
		opacity: 0.8;
		background: transparent;
	}

	.slide-end-btn__icon {
		display: block;
		flex-shrink: 0;
	}

	.slide-content {
		width: 100%;
		height: 100%;
		display: flex;
		animation: slide-fade-in 360ms cubic-bezier(0.22, 0.61, 0.36, 1);
	}

	/* Text-only layout */
	.layout-text-only {
		align-items: center;
		justify-content: center;
	}

	.slide-text-full {
		max-width: 55ch;
		padding: var(--spacing-xl) var(--spacing-lg);
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

	.slide-split.reverse {
		flex-direction: row-reverse;
	}

	.slide-text-half {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-lg);
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
		font-variation-settings: 'CASL' 0, 'wght' 370;
		color: inherit;
		letter-spacing: -0.01em;
		opacity: 0.85;
	}

	/* Dark mode text tuning */
	:global(html.dark-theme) .slide-body {
		font-variation-settings: 'CASL' 0, 'wght' 400;
		letter-spacing: -0.01em;
	}

	/* Mobile */
	@media (max-width: 768px) {
		.slide {
			height: 340px;
		}

		.slide-split {
			flex-direction: column !important;
		}

		.slide-image-half img {
			max-height: 180px;
			object-fit: contain;
		}

		.slide-title {
			font-size: clamp(1.65rem, 6.5vw, 2.35rem);
		}

		.slide-body {
			font-size: var(--font-size-base);
			line-height: 1.38;
		}

		.slide-text-full {
			padding: var(--spacing-lg) var(--spacing-md);
		}

		.slide-count {
			--slide-nav-inset: 10px;
		}

		.slide-nav {
			--slide-nav-inset: 10px;
		}

		.slide-nav__icon {
			width: 14px;
			height: 14px;
		}

		.slide-end-actions {
			--slide-nav-inset: 10px;
		}

		.slide-end-btn {
			font-size: var(--font-size-xxs);
			padding: 5px 10px;
		}

		.slide-content--metadata {
			height: 340px;
			padding: var(--spacing-md);
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
