<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { PortfolioItem } from '$lib/data/portfolio-items.js';
	import HomeLandingTerminal from '$lib/components/HomeLandingTerminal.svelte';

	export let portfolioItems: PortfolioItem[] = [];
	export let onOpenPortfolio: (index: number) => void = () => {};
	export let onCopyEmail: () => void = () => {};
	export let onGoHome: () => void = () => {};
</script>

<div class="hero-intro-stack">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="description"
		in:fade={{ duration: 600, delay: 300 }}
		on:click={onGoHome}
		role="button"
		tabindex="0"
	>
		<span class="description-layers">
			<span class="description-base">I design tools.</span>
			<span class="description-shimmer" aria-hidden="true">I design tools.</span>
		</span>
	</div>

	<HomeLandingTerminal {portfolioItems} {onOpenPortfolio} {onCopyEmail} />
</div>

<style>
	.hero-intro-stack {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.35rem;
		width: fit-content;
		max-width: 100%;
	}

	.description {
		font-family: 'Instrument Serif', serif;
		font-size: clamp(3.52rem, 5.6vw, 5.44rem);
		font-style: normal;
		font-weight: 400;
		/* Bit looser than 1.08 so “g” isn’t clipped; avoid extra padding (adds gap to terminal) */
		line-height: 1.12;
		letter-spacing: -0.02em;
		position: relative;
		z-index: 2;
		width: 100%;
		white-space: nowrap;
		overflow: visible;
		cursor: default;
		box-decoration-break: clone;
		-webkit-box-decoration-break: clone;
	}

	.description-layers {
		position: relative;
		display: inline-block;
		max-width: 100%;
		overflow: visible;
	}

	.description-base {
		display: block;
		color: var(--text-color);
		transition: opacity 0.45s cubic-bezier(0.33, 1, 0.68, 1);
	}

	.description-shimmer {
		display: block;
		position: absolute;
		left: 0;
		top: 0;
		white-space: nowrap;
		color: transparent;
		-webkit-text-fill-color: transparent;
		background-image: var(--palette-rainbow-gradient-h);
		background-size: 460% 130%;
		background-position: 0% 42%;
		background-clip: text;
		-webkit-background-clip: text;
		opacity: 0;
		transition: opacity 0.45s cubic-bezier(0.33, 1, 0.68, 1);
		pointer-events: none;
		animation: description-rainbow 8s linear infinite;
		overflow: visible;
	}

	.description:hover,
	.description:focus-visible {
		cursor: pointer;
	}

	.description:hover .description-base,
	.description:focus-visible .description-base {
		opacity: 0;
	}

	.description:hover .description-shimmer,
	.description:focus-visible .description-shimmer {
		opacity: 1;
	}

	@keyframes description-rainbow {
		0% {
			background-position: 0% 45%;
		}
		100% {
			background-position: 520% 45%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.description-shimmer {
			animation: none;
		}

		.description:hover .description-shimmer,
		.description:focus-visible .description-shimmer {
			background-position: 0% 45%;
		}
	}

	@media (max-width: 768px) {
		.description {
			font-size: clamp(2.32rem, 8vw, 3.6rem);
			line-height: 1.12;
			letter-spacing: -0.02em;
		}
	}
</style>
