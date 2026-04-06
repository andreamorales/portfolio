<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import type { PortfolioItem } from '$lib/data/portfolio-items.js';
	import type { SecurePortfolioPayloadData } from '$lib/utils/secureCaseStudy';
	import HomeLandingTerminal from '$lib/components/HomeLandingTerminal.svelte';
	import FloatingContactDock from '$lib/components/ui/FloatingContactDock.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import { CornerDownLeft } from 'lucide-svelte';

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

	let mobileTerminalEverOpened = false;
	let mobileTerminalUsed = false;
	let mobileOutputTailLines: string[] = [];

	$: if (mobileTerminalDrawerOpen) mobileTerminalEverOpened = true;

	function onMobileCommandRun(_cmd: string, fullOutput: string) {
		mobileTerminalUsed = true;
		const lines = fullOutput.split('\n').filter((l) => l.trim());
		mobileOutputTailLines = lines.slice(-3);
	}
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
	class:mobile-terminal-tab--tail={mobileTerminalUsed}
	on:click={onToggleMobileTerminal}
	role="button"
	tabindex="0"
	aria-label="Open terminal"
>
	{#if mobileTerminalUsed}
		<div class="mobile-terminal-tab__tail">
			{#each mobileOutputTailLines as line}
				<div class="mobile-terminal-tab__tail-line">{line}</div>
			{/each}
		</div>
	{:else}
		<div class="mobile-terminal-tab__row">
			<span class="mobile-terminal-tab__prompt" aria-hidden="true">$</span>
			<span class="mobile-terminal-tab__command">--help</span>
		</div>
		<div class="mobile-terminal-tab__return">
			<span class="mobile-terminal-tab__return-label">Return</span>
			<CornerDownLeft size={11} strokeWidth={1.5} aria-hidden="true" />
		</div>
	{/if}
</div>

<!-- Mobile terminal backdrop -->
{#if mobileTerminalDrawerOpen}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="mobile-terminal-backdrop" on:click={onToggleMobileTerminal} transition:fade={{ duration: 200 }}></div>
{/if}

<!-- Mobile terminal drawer — keep mounted once opened so history persists -->
{#if mobileTerminalEverOpened}
	<div
		class="mobile-terminal-drawer"
		class:mobile-terminal-drawer--open={mobileTerminalDrawerOpen}
	>
		<div class="mobile-terminal-drawer__content">
			<HomeLandingTerminal
				{portfolioItems}
				{onOpenPortfolio}
				{onCopyEmail}
				introVisible={true}
				skipIntro={true}
				onCommandRun={onMobileCommandRun}
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
			font-size: 16vw;
			line-height: 1.05;
			letter-spacing: -0.03em;
		}

		.hero-intro-stack {
			min-height: 0;
			justify-content: flex-start;
		}

		.hero-heading-group {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-md, 1rem);
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
			width: 44px !important;
			height: 44px !important;
		}

		.mobile-hero-icons :global(.theme-toggle) {
			display: flex;
			align-items: center;
			line-height: 0;
			padding: 0;
		}

		.mobile-hero-icons :global(.theme-toggle) :global(svg) {
			width: 44px !important;
			height: 44px !important;
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
			justify-content: space-between;
			min-height: calc(3.375rem + env(safe-area-inset-bottom, 0px));
			padding: 0.55rem 0.85rem 0.55rem 0.75rem;
			padding-bottom: calc(0.55rem + env(safe-area-inset-bottom, 0px));
			background-color: var(--text-color);
			color: var(--bg-color);
			border-top: none;
			cursor: pointer;
			transition: transform 0.25s ease;
			font-family: 'IBM Plex Mono', ui-monospace, monospace;
		}

		.mobile-terminal-tab--tail {
			flex-direction: column;
			align-items: stretch;
			justify-content: flex-end;
		}

		.mobile-terminal-tab__tail {
			display: flex;
			flex-direction: column;
			gap: 0;
		}

		.mobile-terminal-tab__tail-line {
			font-size: 0.75rem;
			font-weight: 400;
			color: var(--cli-terminal-body-fg);
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			line-height: 1.5;
		}

		.mobile-terminal-tab__tail-line:first-child {
			opacity: 0.3;
		}

		.mobile-terminal-tab__tail-line:nth-child(2) {
			opacity: 0.5;
		}

		.mobile-terminal-tab__tail-line:last-child {
			opacity: 0.85;
		}

		.mobile-terminal-tab::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 1px;
			background-image: var(--palette-rainbow-gradient-h);
			background-size: 240% 100%;
			animation: mobile-rainbow-slide 22s linear infinite;
			box-shadow: none;
		}

		.mobile-terminal-tab::after {
			content: '';
			position: absolute;
			top: -8px;
			left: 0;
			right: 0;
			height: 8px;
			background-image: var(--palette-rainbow-gradient-h);
			background-size: 240% 100%;
			animation: mobile-rainbow-slide 22s linear infinite;
			filter: blur(10px);
			opacity: 0.7;
			pointer-events: none;
		}

		.mobile-terminal-tab--hidden {
			transform: translateY(100%);
			pointer-events: none;
		}

		.mobile-terminal-tab__row {
			display: flex;
			align-items: center;
			gap: 0.4rem;
		}

		.mobile-terminal-tab__prompt {
			font-size: 0.82rem;
			font-weight: 500;
			color: var(--cli-terminal-muted-fg);
		}

		.mobile-terminal-tab__command {
			font-size: 0.82rem;
			font-weight: 400;
			color: var(--cli-terminal-body-fg);
		}

		.mobile-terminal-tab__return {
			display: inline-flex;
			align-items: center;
			gap: 0.25rem;
			font-size: 0.55rem;
			font-weight: 500;
			letter-spacing: 0.06em;
			text-transform: uppercase;
			color: var(--cli-terminal-subtle-fg);
		}

		.mobile-terminal-tab__return-label {
			white-space: nowrap;
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
			height: 50vh;
			z-index: 10200;
			background: var(--text-color);
			color: var(--bg-color);
			border-top: none;
			border-radius: 0;
			padding-bottom: env(safe-area-inset-bottom, 0px);
			overflow: hidden;
			transform: translateY(100%);
			transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
		}

		.mobile-terminal-drawer--open {
			transform: translateY(0);
		}

		.mobile-terminal-drawer::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 1px;
			background-image: var(--palette-rainbow-gradient-h);
			background-size: 240% 100%;
			animation: mobile-rainbow-slide 22s linear infinite;
			z-index: 1;
		}

		.mobile-terminal-drawer::after {
			content: '';
			position: absolute;
			top: -8px;
			left: 0;
			right: 0;
			height: 8px;
			background-image: var(--palette-rainbow-gradient-h);
			background-size: 240% 100%;
			animation: mobile-rainbow-slide 22s linear infinite;
			filter: blur(10px);
			opacity: 0.7;
			pointer-events: none;
			z-index: 1;
		}


		.mobile-terminal-drawer__content {
			flex: 1 1 auto;
			min-height: 0;
			overflow-y: auto;
			overscroll-behavior: contain;
			display: flex;
			flex-direction: column;
		}

		.mobile-terminal-drawer__content :global(.cli-block) {
			opacity: 1;
			pointer-events: auto;
			flex: 1 1 auto;
			min-height: 0;
		}

		.mobile-terminal-drawer__content :global(.cli-block::before) {
			display: none;
		}

		.mobile-terminal-drawer__content :global(.cli-block--loading::before) {
			display: block;
			inset: -8px 0 auto 0;
			height: 8px;
			border-radius: 0;
			background-image: var(--palette-rainbow-gradient-h);
			background-size: 240% 100%;
			filter: blur(10px);
			opacity: 0.9;
		}

		.mobile-terminal-drawer__content :global(.cli-terminal-window) {
			background: transparent;
			border-radius: 0;
			box-shadow: none;
			max-height: none;
			height: 100%;
			flex: 1 1 auto;
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

	@keyframes mobile-rainbow-slide {
		0% {
			background-position: 0% 50%;
		}
		100% {
			background-position: 240% 50%;
		}
	}
</style>
