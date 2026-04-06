<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { PortfolioItem } from '$lib/data/portfolio-items.js';
	import type { SecurePortfolioPayloadData } from '$lib/utils/secureCaseStudy';
	import HomeLandingTerminal from '$lib/components/HomeLandingTerminal.svelte';
	import FloatingContactDock from '$lib/components/ui/FloatingContactDock.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';

	export let portfolioItems: PortfolioItem[] = [];
	export let onOpenPortfolio: (
		index: number,
		unlocked?: boolean,
		unlockedData?: SecurePortfolioPayloadData
	) => void = () => {};
	export let onCopyEmail: () => void = () => {};
	export let onGoHome: () => void = () => {};
	export let introTypewriterActive = false;
	export let introTerminalVisible = true;
	export let mobileTerminalDrawerOpen = false;
	export let onToggleMobileTerminal: () => void = () => {};

</script>

<div class="hero-intro-stack">
	<div class="hero-heading-group">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="description"
			class:description--rainbow-ready={!introTypewriterActive}
			on:click={onGoHome}
			role="button"
			tabindex="0"
		>
			<span class="description-layers">
				<span class="description-base" class:description-base--typing={introTypewriterActive}
					>I design tools.</span
				>
				<span class="description-shimmer" aria-hidden="true">I design tools.</span>
				{#if introTypewriterActive}
					<span class="description-typewriter-caret" aria-hidden="true"></span>
				{/if}
			</span>
		</div>

		<div class="mobile-hero-icons">
			<ThemeToggle />
			<FloatingContactDock visible={true} onCopyEmail={onCopyEmail} />
		</div>
	</div>

	<HomeLandingTerminal
		{portfolioItems}
		{onOpenPortfolio}
		{onCopyEmail}
		introVisible={introTerminalVisible}
	/>
</div>

<!-- Mobile terminal trigger (fixed at bottom) -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="mobile-terminal-tab"
	class:mobile-terminal-tab--hidden={mobileTerminalDrawerOpen}
	on:click={onToggleMobileTerminal}
	role="button"
	tabindex="0"
	aria-label="Open terminal"
>
	<span class="mobile-terminal-tab__prompt" aria-hidden="true">$</span>
	<span class="mobile-terminal-tab__label">Terminal</span>
</div>

<!-- Mobile terminal drawer — only mount the terminal when open to avoid duplicate IDs / listeners -->
{#if mobileTerminalDrawerOpen}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="mobile-terminal-backdrop" on:click={onToggleMobileTerminal}></div>
	<div class="mobile-terminal-drawer mobile-terminal-drawer--open">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="mobile-terminal-drawer__handle"
			on:click={onToggleMobileTerminal}
			role="button"
			tabindex="0"
			aria-label="Close terminal"
		>
			<span class="mobile-terminal-drawer__handle-bar"></span>
		</div>
		<div class="mobile-terminal-drawer__content">
			<HomeLandingTerminal
				{portfolioItems}
				{onOpenPortfolio}
				{onCopyEmail}
				introVisible={true}
			/>
		</div>
	</div>
{/if}

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

	.description-base--typing {
		display: inline-block;
		white-space: nowrap;
		width: max-content;
		overflow: hidden;
		clip-path: inset(0 100% 0 0);
		animation: hero-typewriter 0.95s steps(15, end) forwards;
	}

	/* Separate from clipped text: border on the text stays outside the clip and only appears at the end. */
	.description-typewriter-caret {
		position: absolute;
		left: 0;
		top: 0.12em;
		width: 1px;
		height: 0.78em;
		background: currentColor;
		pointer-events: none;
		animation: hero-caret-move 0.95s steps(15, end) forwards;
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

	.description--rainbow-ready:hover .description-base,
	.description--rainbow-ready:focus-visible .description-base {
		opacity: 0;
	}

	.description--rainbow-ready:hover .description-shimmer,
	.description--rainbow-ready:focus-visible .description-shimmer {
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

	@keyframes hero-typewriter {
		from {
			clip-path: inset(0 100% 0 0);
		}
		to {
			clip-path: inset(0 0 0 0);
		}
	}

	@keyframes hero-caret-move {
		from {
			left: 0;
			transform: translateX(0);
		}
		to {
			left: 100%;
			transform: translateX(-100%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.description-shimmer {
			animation: none;
		}

		.description--rainbow-ready:hover .description-shimmer,
		.description--rainbow-ready:focus-visible .description-shimmer {
			background-position: 0% 45%;
		}

		.description-typewriter-caret {
			animation: none;
			left: 100%;
			transform: translateX(-100%);
		}
	}

	.hero-heading-group {
		display: contents;
	}

	.mobile-hero-icons {
		display: none;
	}

	/* ---- Mobile terminal tab (fixed bottom bar) ---- */
	.mobile-terminal-tab {
		display: none;
	}

	.mobile-terminal-backdrop {
		display: none;
	}

	.mobile-terminal-drawer {
		display: none;
	}

	@media (max-width: 768px) {
		.description {
			font-size: clamp(2.8rem, 12vw, 4.4rem);
			line-height: 1.1;
			letter-spacing: -0.02em;
		}

		.hero-intro-stack {
			min-height: 0;
			justify-content: flex-start;
		}

		.hero-heading-group {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-2xs, 0.25rem);
		}

		.hero-intro-stack > :global(.cli-block) {
			display: none;
		}

		.mobile-hero-icons {
			display: flex;
			align-items: center;
			gap: var(--spacing-sm);
		}

		.mobile-hero-icons :global(.floating-contact-dock) {
			display: inline-flex;
			align-items: center;
			gap: var(--spacing-sm);
			pointer-events: auto;
			opacity: 1;
		}

		.mobile-hero-icons :global(.floating-contact-dock__link) {
			display: flex;
			align-items: center;
			line-height: 0;
			padding: 0;
		}

		.mobile-hero-icons :global(.floating-contact-dock__link svg),
		.mobile-hero-icons :global(.floating-contact-dock__link) :global(svg) {
			width: 16px !important;
			height: 16px !important;
		}

		.mobile-hero-icons :global(.theme-toggle) {
			display: flex;
			align-items: center;
			line-height: 0;
			padding: 0;
		}

		.mobile-hero-icons :global(.theme-toggle) :global(svg) {
			width: 16px !important;
			height: 16px !important;
		}

		/* ---- Mobile terminal tab ---- */
		.mobile-terminal-tab {
			display: flex;
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			z-index: 10100;
			align-items: center;
			gap: 0.5rem;
			padding: 0.65rem 1.25rem;
			padding-bottom: calc(0.65rem + env(safe-area-inset-bottom, 0px));
			background: var(--bg-color);
			border-top: 1px solid var(--alpha-black-015);
			cursor: pointer;
			transition: transform 0.25s ease;
		}

		.mobile-terminal-tab--hidden {
			transform: translateY(100%);
			pointer-events: none;
		}

		.mobile-terminal-tab__prompt {
			font-family: 'IBM Plex Mono', ui-monospace, monospace;
			font-size: 0.82rem;
			font-weight: 500;
			color: var(--text-color);
			opacity: 0.5;
		}

		.mobile-terminal-tab__label {
			font-family: 'IBM Plex Mono', ui-monospace, monospace;
			font-size: 0.75rem;
			font-weight: 400;
			color: var(--text-color);
			opacity: 0.4;
		}

		/* ---- Mobile terminal backdrop ---- */
		.mobile-terminal-backdrop {
			display: block;
			position: fixed;
			inset: 0;
			z-index: 10199;
			background: rgba(0, 0, 0, 0.35);
			animation: mobile-backdrop-in 0.2s ease forwards;
		}

		/* ---- Mobile terminal drawer ---- */
		.mobile-terminal-drawer {
			display: flex;
			flex-direction: column;
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			z-index: 10200;
			max-height: 70vh;
			background: var(--bg-color);
			border-top: 1px solid var(--alpha-black-015);
			border-radius: 12px 12px 0 0;
			transform: translateY(100%);
			transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
			padding-bottom: env(safe-area-inset-bottom, 0px);
		}

		.mobile-terminal-drawer--open {
			transform: translateY(0);
		}

		.mobile-terminal-drawer__handle {
			display: flex;
			justify-content: center;
			padding: 0.6rem 0 0.35rem;
			cursor: pointer;
			flex-shrink: 0;
		}

		.mobile-terminal-drawer__handle-bar {
			width: 2.2rem;
			height: 3px;
			border-radius: 999px;
			background: var(--text-color);
			opacity: 0.18;
		}

		.mobile-terminal-drawer__content {
			flex: 1 1 auto;
			min-height: 0;
			overflow-y: auto;
			overscroll-behavior: contain;
			padding: 0 0.25rem 0.25rem;
		}
	}

	@keyframes mobile-backdrop-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
