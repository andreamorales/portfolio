<script lang="ts">
	import { browser } from '$app/environment';
	import { fade, fly } from 'svelte/transition';
	import { onDestroy, onMount } from 'svelte';
	import type { PortfolioItem } from '$lib/data/portfolio-items.js';
	import type { SecurePortfolioPayloadData } from '$lib/utils/secureCaseStudy';
	import HomeLandingTerminal from '$lib/components/HomeLandingTerminal.svelte';
	import HomeLandingMobileTerminal from '$lib/components/HomeLandingMobileTerminal.svelte';
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

	let mobileTerminalUsed = false;
	let mobileOutputTailLines: string[] = [];
	/** Eager-mount mobile drawer shell so the CLI input exists before the first tap (iOS keyboard). */
	let mountMobileDrawer = false;
	let mobileDrawerTerminal: {
		focusPrompt: () => void;
		revealPrompt: () => void;
		blurPrompt: () => void;
	} | null = null;
	let mobileDrawerEl: HTMLDivElement | null = null;
	/** True when visual viewport shrinks (software keyboard) while drawer is open. */
	let mobileKeyboardExpanded = false;
	let mobileDrawerVvStyle = '';
	/** Snapshot of the full viewport height captured when the drawer opens (before the keyboard). */
	let drawerBaseHeight = 0;

	const KEYBOARD_HEIGHT_DELTA_PX = 90;
	const KEYBOARD_FALLBACK_MIN_PX = 220;
	const KEYBOARD_FALLBACK_RATIO = 0.34;
	/** Pull-down past this distance dismisses the drawer (px). */
	const DRAWER_DISMISS_PULL_PX = 96;
	/** Quick fling velocity (px/ms) that should settle in fling direction. */
	const DRAWER_FLING_VELOCITY_PX_PER_MS = 0.55;
	/** Allow a little upward overshoot while dragging. */
	const DRAWER_UPWARD_OVERSHOOT_PX = 72;

	/** Chrome/Android pull-to-refresh listens to non-cancelable touchmove; block it on the handle. */
	function drawerHandleTouchLock(node: HTMLElement) {
		const prevent = (e: TouchEvent) => {
			e.preventDefault();
		};
		node.addEventListener('touchmove', prevent, { passive: false });
		return {
			destroy() {
				node.removeEventListener('touchmove', prevent);
			}
		};
	}

	let drawerPullPx = 0;
	let drawerDragActive = false;
	let drawerDragPointerId: number | null = null;
	let drawerDragStartY = 0;
	let drawerDragLastY = 0;
	let drawerDragLastTime = 0;
	let drawerDragVelocityY = 0;

	function getDrawerDismissThresholdPx(): number {
		const drawerH = mobileDrawerEl?.getBoundingClientRect().height ?? 0;
		if (drawerH <= 0) return DRAWER_DISMISS_PULL_PX;
		return Math.max(DRAWER_DISMISS_PULL_PX, Math.min(190, drawerH * 0.28));
	}

	function mobileDrawerSurfaceStyle(): string {
		const parts = [mobileDrawerVvStyle, `--drawer-pull:${drawerPullPx}px`].filter(Boolean);
		return parts.join(';');
	}

	function onDrawerHandlePointerDown(e: PointerEvent) {
		if (!mobileTerminalDrawerOpen) return;
		e.stopPropagation();
		drawerDragActive = true;
		drawerDragStartY = e.clientY;
		drawerDragLastY = e.clientY;
		drawerDragLastTime = performance.now();
		drawerDragVelocityY = 0;
		drawerDragPointerId = e.pointerId;
		try {
			(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		} catch {
			/* noop */
		}
	}

	function onDrawerHandlePointerMove(e: PointerEvent) {
		if (!drawerDragActive || e.pointerId !== drawerDragPointerId) return;
		const now = performance.now();
		const dt = Math.max(1, now - drawerDragLastTime);
		const instVelocity = (e.clientY - drawerDragLastY) / dt;
		drawerDragVelocityY = drawerDragVelocityY * 0.25 + instVelocity * 0.75;
		drawerDragLastY = e.clientY;
		drawerDragLastTime = now;

		const dy = e.clientY - drawerDragStartY;
		if (dy >= 0) {
			const maxPullDown =
				mobileDrawerEl?.getBoundingClientRect().height ?? Number.POSITIVE_INFINITY;
			drawerPullPx = Math.min(dy, maxPullDown);
		} else {
			// Resist upward pulls so it feels springy but still tracks the finger.
			drawerPullPx = Math.max(dy * 0.38, -DRAWER_UPWARD_OVERSHOOT_PX);
		}
		if (e.cancelable) {
			e.preventDefault();
		}
	}

	function endDrawerDrag(e: PointerEvent) {
		if (!drawerDragActive || e.pointerId !== drawerDragPointerId) return;
		try {
			(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		} catch {
			/* noop */
		}
		drawerDragActive = false;
		drawerDragPointerId = null;
		const flingDown = drawerDragVelocityY > DRAWER_FLING_VELOCITY_PX_PER_MS;
		const flingUp = drawerDragVelocityY < -DRAWER_FLING_VELOCITY_PX_PER_MS;
		const shouldDismiss = flingDown || (!flingUp && drawerPullPx >= getDrawerDismissThresholdPx());
		drawerPullPx = 0;
		drawerDragVelocityY = 0;
		if (shouldDismiss) {
			onToggleMobileTerminal();
		}
	}

	$: if (browser) {
		document.documentElement.classList.toggle(
			'mobile-terminal-drawer-active',
			mobileTerminalDrawerOpen
		);
	}

	$: if (!mobileTerminalDrawerOpen) {
		drawerPullPx = 0;
		drawerDragActive = false;
		drawerDragPointerId = null;
		drawerBaseHeight = 0;
	}

	let prevMobileTerminalDrawerOpen = false;
	$: {
		if (prevMobileTerminalDrawerOpen && !mobileTerminalDrawerOpen) {
			queueMicrotask(() => mobileDrawerTerminal?.blurPrompt());
		}
		prevMobileTerminalDrawerOpen = mobileTerminalDrawerOpen;
	}

	onDestroy(() => {
		if (browser) {
			document.documentElement.classList.remove('mobile-terminal-drawer-active');
		}
	});

	/**
	 * iOS Safari often fires a "ghost" click on the full-screen backdrop right after the
	 * virtual keyboard submits a form — no preceding pointerdown on the backdrop. Only
	 * dismiss when the user actually pressed on the dimmed area (real pointer sequence).
	 */
	let backdropDismissArmed = false;

	function armBackdropDismiss() {
		backdropDismissArmed = true;
	}

	function disarmBackdropDismiss() {
		backdropDismissArmed = false;
	}

	function onBackdropClick(e: MouseEvent) {
		if (!backdropDismissArmed) return;
		backdropDismissArmed = false;
		e.preventDefault();
		onToggleMobileTerminal();
	}

	function syncMobileDrawerViewport() {
		const vv = window.visualViewport;
		if (!vv || !mobileTerminalDrawerOpen) {
			mobileKeyboardExpanded = false;
			mobileDrawerVvStyle = '';
			return;
		}
		/*
		 * iOS Safari positions `position: fixed` elements relative to the LAYOUT
		 * viewport, which doesn't shrink when the keyboard opens.  So we anchor
		 * the drawer at `bottom: 0` (= bottom of layout viewport) and push it up
		 * by the keyboard height.
		 *
		 * On some mobile browsers the visual viewport also shifts vertically while
		 * the keyboard is open, so we derive occlusion from both the height delta
		 * and the current visual viewport bottom edge.
		 */
		const layoutViewportH = Math.max(
			drawerBaseHeight || 0,
			window.innerHeight,
			document.documentElement.clientHeight
		);
		const keyboardFromHeightDelta = Math.max(0, layoutViewportH - vv.height);
		const visualBottom = vv.offsetTop + vv.height;
		const keyboardFromViewportBottom = Math.max(0, layoutViewportH - visualBottom);
		let keyboardH = Math.max(keyboardFromHeightDelta, keyboardFromViewportBottom);
		/*
		 * Last-resort correction: if the prompt row still sits below the visible
		 * viewport edge, lift the whole drawer by the overlap amount.
		 */
		const promptEl = mobileDrawerEl?.querySelector<HTMLElement>('.mobile-cli__prompt');
		if (promptEl) {
			const promptRect = promptEl.getBoundingClientRect();
			const promptOverlapPx = Math.max(0, promptRect.bottom + 8 - visualBottom);
			keyboardH += promptOverlapPx;
		}
		const activeEl = document.activeElement;
		const promptFocused =
			activeEl instanceof HTMLElement &&
			activeEl.classList.contains('mobile-cli__input') &&
			!!activeEl.closest('.mobile-terminal-drawer');
		const isAppleMobile = /iPhone|iPad|iPod/i.test(navigator.userAgent);
		if (promptFocused && isAppleMobile && keyboardH < KEYBOARD_HEIGHT_DELTA_PX) {
			/*
			 * Safari sometimes fails to publish keyboard geometry. When the prompt is
			 * focused, apply a conservative fallback lift so the drawer clears the OSK.
			 */
			const fallbackKeyboardPx = Math.max(
				KEYBOARD_FALLBACK_MIN_PX,
				Math.round(layoutViewportH * KEYBOARD_FALLBACK_RATIO)
			);
			keyboardH = Math.max(keyboardH, fallbackKeyboardPx);
		}
		const keyboardLikely = keyboardH > KEYBOARD_HEIGHT_DELTA_PX;
		mobileKeyboardExpanded = keyboardLikely;
		mobileDrawerVvStyle = `--keyboard-offset:${keyboardH}px`;
	}

	onMount(() => {
		const mq = window.matchMedia('(max-width: 768px)');
		const sync = () => {
			mountMobileDrawer = mq.matches;
		};
		sync();
		mq.addEventListener('change', sync);

		const vv = window.visualViewport;
		const onVv = () => syncMobileDrawerViewport();
		const onFocusIn = () => {
			setTimeout(() => syncMobileDrawerViewport(), 0);
			setTimeout(() => syncMobileDrawerViewport(), 120);
			setTimeout(() => syncMobileDrawerViewport(), 320);
			setTimeout(() => syncMobileDrawerViewport(), 650);
		};
		const onFocusOut = () => {
			setTimeout(() => syncMobileDrawerViewport(), 0);
			setTimeout(() => syncMobileDrawerViewport(), 120);
		};
		if (vv) {
			vv.addEventListener('resize', onVv);
			vv.addEventListener('scroll', onVv);
		}
		window.addEventListener('resize', onVv);
		window.addEventListener('focusin', onFocusIn);
		window.addEventListener('focusout', onFocusOut);

		return () => {
			mq.removeEventListener('change', sync);
			if (vv) {
				vv.removeEventListener('resize', onVv);
				vv.removeEventListener('scroll', onVv);
			}
			window.removeEventListener('resize', onVv);
			window.removeEventListener('focusin', onFocusIn);
			window.removeEventListener('focusout', onFocusOut);
		};
	});

	$: if (mobileTerminalDrawerOpen || mountMobileDrawer) {
		queueMicrotask(() => syncMobileDrawerViewport());
	}

	function handleMobileTabClick() {
		const willOpen = !mobileTerminalDrawerOpen;
		if (willOpen) {
			drawerBaseHeight = window.visualViewport?.height ?? window.innerHeight;
		}
		onToggleMobileTerminal();
		if (willOpen) {
			backdropDismissArmed = false;
			/*
			 * Do not auto-focus on open. On iOS this can summon the keyboard before
			 * viewport metrics settle, which leaves the keyboard over the drawer.
			 * Let the user tap the prompt input explicitly (reliable behavior).
			 */
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					syncMobileDrawerViewport();
					mobileDrawerTerminal?.revealPrompt();
				});
			});
			setTimeout(() => {
				syncMobileDrawerViewport();
				mobileDrawerTerminal?.revealPrompt();
			}, 350);
			setTimeout(() => {
				syncMobileDrawerViewport();
			}, 650);
		}
	}

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
			<FloatingContactDock visible={true} {onCopyEmail} />
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
	on:click={handleMobileTabClick}
	role="button"
	tabindex="0"
	aria-label="Open terminal"
>
	{#if mobileTerminalUsed}
		<div class="mobile-terminal-tab__tail">
			{#each mobileOutputTailLines as line, index (`${line}-${index}`)}
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
	<div
		class="mobile-terminal-backdrop"
		on:pointerdown|stopPropagation={armBackdropDismiss}
		on:pointercancel={disarmBackdropDismiss}
		on:click|stopPropagation={onBackdropClick}
		transition:fade={{ duration: 200 }}
	></div>
{/if}

<!-- Mobile terminal drawer: mount on narrow viewports so focus() runs in the same gesture as the tab tap (keyboard). -->
{#if mountMobileDrawer}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="mobile-terminal-drawer"
		class:mobile-terminal-drawer--open={mobileTerminalDrawerOpen}
		class:mobile-terminal-drawer--keyboard={mobileKeyboardExpanded}
		class:mobile-terminal-drawer--dragging={drawerDragActive}
		bind:this={mobileDrawerEl}
		style={mobileDrawerSurfaceStyle()}
		on:touchstart|stopPropagation
		on:touchend|stopPropagation
		on:click|stopPropagation
	>
		<div
			class="mobile-terminal-drawer__handle"
			aria-hidden="true"
			use:drawerHandleTouchLock
			on:pointerdown|stopPropagation={onDrawerHandlePointerDown}
			on:pointermove={onDrawerHandlePointerMove}
			on:pointerup|stopPropagation={endDrawerDrag}
			on:pointercancel|stopPropagation={endDrawerDrag}
		>
			<span class="mobile-terminal-drawer__handle-bar"></span>
		</div>
		<div class="mobile-terminal-drawer__content">
			<HomeLandingMobileTerminal
				bind:this={mobileDrawerTerminal}
				{portfolioItems}
				{onOpenPortfolio}
				{onCopyEmail}
				commandInputId="cli-command-input-mobile"
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
		display: inline-block;
		white-space: nowrap;
		width: max-content;
		line-height: inherit;
		color: var(--text-color);
		transition: opacity 0.45s cubic-bezier(0.33, 1, 0.68, 1);
	}

	.description-base--typing {
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

	@media (max-width: 1180px) and (min-width: 769px) {
		.description {
			font-size: clamp(4.05rem, 7.8vw, 5.9rem);
		}
	}

	@media (max-width: 768px) {
		.description {
			font-size: 16vw;
			line-height: 1.12;
			letter-spacing: -0.03em;
			/* One full line: keeps height stable while typewriter clip-path reveals text */
			min-height: calc(16vw * 1.12);
		}

		.description-layers {
			min-height: calc(16vw * 1.12);
			vertical-align: top;
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

		.mobile-hero-icons :global(.floating-contact-dock__link),
		.mobile-hero-icons :global(.floating-contact-dock__button) {
			display: flex;
			align-items: center;
			line-height: 0;
			padding: 0;
			opacity: 1;
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
			opacity: 1;
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
			padding: 0.55rem 1rem;
			padding-bottom: calc(0.55rem + env(safe-area-inset-bottom, 0px));
			background-color: var(--text-color);
			color: var(--bg-color);
			border-top: none;
			cursor: pointer;
			touch-action: manipulation;
			-webkit-tap-highlight-color: transparent;
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
			background: color-mix(in srgb, var(--text-color) 22%, transparent);
			-webkit-backdrop-filter: blur(2px);
			backdrop-filter: blur(2px);
			animation: mobile-backdrop-in 0.2s ease forwards;
			touch-action: none;
			-webkit-tap-highlight-color: transparent;
		}

		/* ---- Mobile terminal drawer ---- */
		.mobile-terminal-drawer {
			display: flex;
			flex-direction: column;
			position: fixed;
			bottom: max(var(--keyboard-offset, 0px), env(keyboard-inset-height, 0px));
			left: 0;
			right: 0;
			height: 50svh;
			max-height: 50svh;
			z-index: 10200;
			background: var(--text-color);
			color: var(--bg-color);
			border-top: none;
			border-radius: 0;
			padding-bottom: env(safe-area-inset-bottom, 0px);
			overflow: hidden;
			transform: translateY(100%);
			transition:
				transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
				bottom 0.15s ease-out;
			touch-action: manipulation;
			overscroll-behavior-y: none;
			-webkit-backface-visibility: hidden;
			backface-visibility: hidden;
			-webkit-tap-highlight-color: transparent;
		}

		.mobile-terminal-drawer--open {
			transform: translate3d(0, var(--drawer-pull, 0px), 0);
		}

		.mobile-terminal-drawer--open.mobile-terminal-drawer--dragging {
			transition: none !important;
		}

		.mobile-terminal-drawer--keyboard {
			padding-bottom: 0;
			z-index: 12000;
		}

		.mobile-terminal-drawer__handle {
			flex-shrink: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			min-height: 2.75rem;
			padding-top: calc(0.35rem + env(safe-area-inset-top, 0px));
			padding-bottom: 0.4rem;
			position: relative;
			z-index: 2;
			touch-action: none;
			cursor: grab;
		}

		.mobile-terminal-drawer__handle:active {
			cursor: grabbing;
		}

		.mobile-terminal-drawer__handle-bar {
			display: block;
			width: 2.25rem;
			height: 0.28rem;
			border-radius: 999px;
			background: color-mix(in srgb, var(--bg-color) 32%, transparent);
			box-shadow: 0 0 0 1px color-mix(in srgb, var(--bg-color) 12%, transparent);
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
			opacity: 1 !important;
			pointer-events: auto !important;
			transition: none !important;
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

	/* Stops mobile Chrome pull-to-refresh from stealing vertical drags while the drawer is open. */
	:global(html.mobile-terminal-drawer-active),
	:global(html.mobile-terminal-drawer-active body) {
		overscroll-behavior-y: none;
	}
</style>
