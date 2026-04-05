<script lang="ts">
	import { afterUpdate, onDestroy, onMount, tick } from 'svelte';
	import { CornerDownLeft } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import type { PortfolioItem } from '$lib/data/portfolio-items.js';
	import { contactLinks } from '$lib/data/contact-links';
	import aboutAscii from '$lib/data/about-ascii.txt?raw';
	import HomeTerminalHistory from '$lib/components/HomeTerminalHistory.svelte';

	const aboutBio =
		"I lead the design of creative and technical products. I lead the design of tools for devs and creatives, all through the lens of play. I started my career in 2010 as a filmmaker and game designer, which gave me a sharp eye for storytelling, and 12 years ago delved into product design and game design. I've worked at MongoDB, Roblox, ConsenSys, and was the CEO and co-founder of my own AI startup, Panto. I currently work at Layer Health bringing AI to medical chart review.";

	export let portfolioItems: PortfolioItem[] = [];
	export let onOpenPortfolio: (index: number) => void = () => {};
	export let onCopyEmail: () => void = () => {};
	export let introVisible = true;

	type Feedback =
		| { kind: 'help' }
		| { kind: 'contact' }
		| { kind: 'portfolio' }
		| { kind: 'about' }
		| { kind: 'error'; message: string }
		| { kind: 'system'; message: string };

	type HistoryEntry = {
		id: string;
		cmd: string;
		feedback: Feedback;
		fullText: string;
		styledHtml: string;
		typingProgress: number;
		typingComplete: boolean;
	};

	let commandLine = '--help';
	let history: HistoryEntry[] = [];
	let portfolioPickIndex = 0;
	let cliInputEl: HTMLInputElement | null = null;
	let scrollLogEl: HTMLDivElement | null = null;
	let outputId = 'cli-output-region';
	/** After the first `--help` / help, hide Return and expand the CLI. */
	let showReturnHint = true;
	let lastTypingStartedId: string | null = null;
	/** Detect typingComplete edge so we focus the prompt once (not every afterUpdate). */
	let prevLastEntrySnapshot: { id: string; typingComplete: boolean } | null = null;
	let typingTimer: ReturnType<typeof setInterval> | null = null;
	let bottomPromptVisible = false;
	let showStartCaret = false;
	let introSequenceStarted = false;
	let introBgVisible = false;
	let introTypingVisible = false;
	let introTypingDone = false;
	let introReturnVisible = false;
	let introGlowVisible = false;
	const introTimers: ReturnType<typeof setTimeout>[] = [];

	$: lastEntry = history.length ? history[history.length - 1] : null;
	$: lastFeedback = lastEntry?.feedback ?? null;
	$: portfolioInteractive =
		lastFeedback?.kind === 'portfolio' &&
		(lastEntry?.typingComplete ?? false) &&
		commandLine.trim().length === 0;
	$: if (introVisible && !introSequenceStarted) {
		introSequenceStarted = true;
		introBgVisible = true;
		introTypingVisible = false;
		introTypingDone = false;
		introReturnVisible = false;
		introGlowVisible = false;
		introTimers.push(
			setTimeout(() => {
				introTypingVisible = true;
			}, 260),
			setTimeout(() => {
				introTypingDone = true;
				introReturnVisible = true;
			}, 1240),
			setTimeout(() => {
				introGlowVisible = true;
			}, 1660)
		);
	}

	function esc(s: string): string {
		return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	function portfolioListPlainText(items: PortfolioItem[], activeIndex: number): string {
		return (
			`↑↓ = select | ENTER/SPACE = open | ESC = cancel\n\n` +
			items
				.map((it, i) => {
					const labels = it.tags?.length ? ` (${it.tags.join(' · ')})` : '';
					return `${i === activeIndex ? '●' : '•'} ${it.title}${labels}`;
				})
				.join('\n') +
			`\n\n`
		);
	}

	function portfolioListStyledHtml(items: PortfolioItem[], activeIndex: number): string {
		return (
			`↑↓ = select | ENTER/SPACE = open | ESC = cancel\n\n` +
			items
				.map((it, i) => {
					const bulletClass =
						i === activeIndex ? 'cli-t-bullet cli-t-bullet--active' : 'cli-t-bullet';
					const itemClass = i === activeIndex ? 'cli-t-item cli-t-item--active' : 'cli-t-item';
					const bullet = i === activeIndex ? '●' : '•';
					const labels = it.tags?.length
						? ` <span class="cli-t-item-labels" data-portfolio-index="${i}">(${esc(it.tags.join(' · '))})</span>`
						: '';
					return `<span class="cli-t-portfolio-row" data-portfolio-index="${i}"><span class="${bulletClass}" data-portfolio-index="${i}">${bullet}</span> <span class="${itemClass}" data-portfolio-index="${i}">${esc(it.title)}</span>${labels}</span>`;
				})
				.join('\n') +
			`\n\n`
		);
	}

	/** Text nodes between spans have no closest(); resolve to parent element first. */
	function getPortfolioIndexFromPointerEvent(e: MouseEvent): number | null {
		const raw = e.target;
		const el = raw instanceof Element ? raw : (raw as Node | null)?.parentElement;
		if (!el) return null;
		const picked = el.closest<HTMLElement>('[data-portfolio-index]');
		if (!picked) return null;
		const parsed = Number.parseInt(picked.dataset.portfolioIndex ?? '', 10);
		return Number.isNaN(parsed) ? null : parsed;
	}

	function feedbackToPlainText(f: Feedback, items: PortfolioItem[]): string {
		switch (f.kind) {
			case 'help':
				return (
					`Commands\n\n` +
					`--help\n` +
					`Show this list.\n\n` +
					`--portfolio\n` +
					`List work — use ↑/↓, then ENTER or SPACE to open.\n\n` +
					`--portfolio <name>\n` +
					`Jump to a piece (partial title ok).\n\n` +
					`--about\n` +
					`ASCII art in the terminal below.\n\n` +
					`--contact\n` +
					`Clickable links (email & socials).\n\n`
				);
			case 'contact':
				return `Links\n\n` + contactLinks.map((l) => l.label).join('  ') + `\n\n`;
			case 'error':
				return `${f.message}\n\n`;
			case 'system':
				return `${f.message}\n\n`;
			case 'portfolio':
				return portfolioListPlainText(items, 0);
			case 'about':
				/* Single \n between blocks matches styled HTML visible newlines (sliceStyledHtml). */
				return `${aboutAscii}\n${aboutBio}\n\n`;
		}
	}

	function sliceStyledHtml(html: string, maxChars: number): string {
		let visible = 0;
		let inTag = false;
		let result = '';
		const openTags: string[] = [];
		let currentTag = '';

		for (let i = 0; i < html.length; i++) {
			const ch = html[i];

			if (ch === '<') {
				if (visible >= maxChars && !inTag) break;
				inTag = true;
				currentTag = '';
				result += ch;
				continue;
			}

			if (inTag) {
				result += ch;
				if (ch === '>') {
					inTag = false;
					if (currentTag.startsWith('/')) {
						openTags.pop();
					} else {
						const tagName = currentTag.split(/[\s/>]/)[0];
						if (tagName) openTags.push(tagName);
					}
					currentTag = '';
				} else {
					currentTag += ch;
				}
				continue;
			}

			if (visible >= maxChars) break;

			if (ch === '&') {
				const semi = html.indexOf(';', i);
				if (semi !== -1 && semi - i < 8) {
					result += html.slice(i, semi + 1);
					i = semi;
					visible++;
					continue;
				}
			}

			result += ch;
			visible++;
		}

		/* Inline at the slice point so the caret follows the last typed character (incl. multi-line --about). */
		result += '<span class="cli-type-cursor" aria-hidden="true"></span>';

		for (let j = openTags.length - 1; j >= 0; j--) {
			result += `</${openTags[j]}>`;
		}
		return result;
	}

	function feedbackToStyledHtml(f: Feedback, items: PortfolioItem[]): string {
		switch (f.kind) {
			case 'help':
				return (
					`<span class="cli-t-bold">Commands</span>\n\n` +
					`<span class="cli-t-cmd">--help</span>\n` +
					`Show this list.\n\n` +
					`<span class="cli-t-cmd">--portfolio</span>\n` +
					`List work — use ↑/↓, then ENTER or SPACE to open.\n\n` +
					`<span class="cli-t-cmd">--portfolio &lt;name&gt;</span>\n` +
					`Jump to a piece (partial title ok).\n\n` +
					`<span class="cli-t-cmd">--about</span>\n` +
					`ASCII art in the terminal below.\n\n` +
					`<span class="cli-t-cmd">--contact</span>\n` +
					`Clickable links (email &amp; socials).\n\n`
				);
			case 'contact':
				return (
					`<span class="cli-t-bold">Links</span>\n\n` +
					contactLinks
						.map((l) =>
							l.action === 'copy'
								? `<span class="cli-t-link" role="button" tabindex="0" data-copy-email>${esc(l.label)}</span>`
								: `<a class="cli-t-link" href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`
						)
						.join('  ') +
					`\n\n`
				);
			case 'error':
				return `<span class="cli-t-err">${esc(f.message)}</span>\n\n`;
			case 'system':
				return `${esc(f.message)}\n\n`;
			case 'portfolio':
				return portfolioListStyledHtml(items, 0);
			case 'about':
				/* Keep markup phrasing-only inside the typewriter <pre> to avoid browser reflow/jump. */
				return (
					`<span class="cli-t-about-wrap">` +
					`<span class="cli-t-about-ascii-block">${esc(aboutAscii)}</span>` +
					`\n<span class="cli-t-about-bio">${esc(aboutBio)}</span>` +
					`</span>\n\n`
				);
		}
	}

	function slugify(text: string) {
		return text
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}

	function findPortfolioIndex(query: string): number | null {
		const q = query.trim().toLowerCase();
		if (!q) return null;
		const slugQ = slugify(q);

		for (let i = 0; i < portfolioItems.length; i++) {
			if (slugify(portfolioItems[i].title) === slugQ) return i;
		}
		for (let i = 0; i < portfolioItems.length; i++) {
			if (portfolioItems[i].title.toLowerCase().includes(q)) return i;
		}
		for (let i = 0; i < portfolioItems.length; i++) {
			if (slugify(portfolioItems[i].title).includes(slugQ)) return i;
		}
		return null;
	}

	function parseCommand(raw: string) {
		const trimmed = raw.trim().replace(/^\$\s*/, '');
		if (!trimmed) return { type: 'help' as const };
		const lower = trimmed.toLowerCase();
		if (lower === '--help' || lower === '-h' || lower === '--h') return { type: 'help' as const };
		if (lower === '--about') return { type: 'about' as const };
		if (lower === '--contact') return { type: 'contact' as const };
		if (lower.startsWith('--portfolio')) {
			const rest = trimmed.slice('--portfolio'.length).trim();
			if (!rest) return { type: 'portfolio_list' as const };
			return { type: 'portfolio_jump' as const, query: rest };
		}
		return { type: 'unknown' as const, line: trimmed };
	}

	function clearTypingTimer() {
		if (typingTimer) {
			clearInterval(typingTimer);
			typingTimer = null;
		}
	}

	function advanceTypingStep(entryId: string) {
		history = history.map((h) => {
			if (h.id !== entryId || h.typingComplete) return h;
			// For --about only: stream ASCII much faster, then return to normal speed for the bio copy.
			let step = 2;
			if (h.feedback.kind === 'about') {
				const bioStart = aboutAscii.length + 1; // +1 accounts for newline between ASCII and bio
				if (h.typingProgress < bioStart) {
					step = Math.min(36, bioStart - h.typingProgress);
				}
			}
			const np = Math.min(h.typingProgress + step, h.fullText.length);
			const done = np >= h.fullText.length;
			return { ...h, typingProgress: np, typingComplete: done };
		});

		requestAnimationFrame(() => {
			if (scrollLogEl) scrollLogEl.scrollTop = scrollLogEl.scrollHeight;
		});

		const el = history.find((h) => h.id === entryId);
		if (!el || el.typingComplete) {
			clearTypingTimer();
		}
	}

	function startTypingAnimation(entryId: string) {
		clearTypingTimer();
		typingTimer = setInterval(() => advanceTypingStep(entryId), 18);
	}

	function pushEntry(cmd: string, feedback: Feedback) {
		const fullText = feedbackToPlainText(feedback, portfolioItems);
		const styledHtml = feedbackToStyledHtml(feedback, portfolioItems);
		history = history.map((h) =>
			h.typingComplete ? h : { ...h, typingProgress: h.fullText.length, typingComplete: true }
		);
		history = [
			...history,
			{
				id: crypto.randomUUID(),
				cmd,
				feedback,
				fullText,
				styledHtml,
				typingProgress: 0,
				typingComplete: fullText.length === 0
			}
		];
	}

	function popLast() {
		clearTypingTimer();
		lastTypingStartedId = null;
		history = history.slice(0, -1);
	}

	async function submitCommand() {
		const cmdSnapshot = commandLine;
		// Empty Enter should be a no-op, not an implicit --help.
		if (!cmdSnapshot.trim().replace(/^\$\s*/, '')) {
			commandLine = '';
			return;
		}
		commandLine = '';
		const parsed = parseCommand(cmdSnapshot);
		const isFirstCommand = showReturnHint;
		showReturnHint = false;

		if (isFirstCommand) {
			await new Promise<void>((r) => setTimeout(r, 250));
			bottomPromptVisible = true;
			await tick();
		}

		switch (parsed.type) {
			case 'help':
				pushEntry(cmdSnapshot, { kind: 'help' });
				break;
			case 'about':
				pushEntry(cmdSnapshot, { kind: 'about' });
				break;
			case 'contact':
				pushEntry(cmdSnapshot, { kind: 'contact' });
				break;
			case 'portfolio_list':
				if (!portfolioItems.length) {
					pushEntry(cmdSnapshot, {
						kind: 'error',
						message: 'No portfolio pieces to show yet.'
					});
					break;
				}
				if (lastFeedback?.kind === 'portfolio') {
					popLast();
				}
				portfolioPickIndex = 0;
				pushEntry(cmdSnapshot, { kind: 'portfolio' });
				break;
			case 'portfolio_jump': {
				const idx = findPortfolioIndex(parsed.query);
				if (idx === null) {
					pushEntry(cmdSnapshot, {
						kind: 'error',
						message: `No piece matched “${parsed.query}”. Try --portfolio to browse, or use part of the title.`
					});
				} else {
					pushEntry(cmdSnapshot, {
						kind: 'system',
						message: `Opening: ${portfolioItems[idx].title}`
					});
					await tick();
					onOpenPortfolio(idx);
				}
				break;
			}
			default:
				pushEntry(cmdSnapshot, {
					kind: 'error',
					message: `Unknown command: ${parsed.line}. Try --help for available commands.`
				});
		}
	}

	function confirmPortfolioPick() {
		if (!portfolioInteractive || !portfolioItems.length) return;
		const idx = portfolioPickIndex;
		const title = portfolioItems[idx].title;
		const last = history[history.length - 1];
		const msg = `Opened: ${title}`;
		const feedback: Feedback = { kind: 'system', message: msg };
		lastTypingStartedId = null;
		clearTypingTimer();
		history = [
			...history.slice(0, -1),
			{
				...last,
				feedback,
				fullText: feedbackToPlainText(feedback, portfolioItems),
				styledHtml: feedbackToStyledHtml(feedback, portfolioItems),
				typingProgress: 0,
				typingComplete: false
			}
		];
		onOpenPortfolio(idx);
	}

	function onInputKeydown(e: KeyboardEvent) {
		const portfolioStillTyping =
			lastFeedback?.kind === 'portfolio' && !(lastEntry?.typingComplete ?? false);
		if (portfolioStillTyping) {
			e.preventDefault();
			return;
		}
		if (e.key === 'Enter') {
			e.preventDefault();
			submitCommand();
		}
		requestAnimationFrame(syncStartCaret);
	}

	function syncStartCaret() {
		const el = cliInputEl;
		if (!el || document.activeElement !== el) {
			showStartCaret = false;
			return;
		}
		const start = el.selectionStart ?? 0;
		const end = el.selectionEnd ?? 0;
		showStartCaret = start === 0 && end === 0;
	}

	function onGlobalKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && history.length) {
			e.preventDefault();
			const wasPortfolio = lastFeedback?.kind === 'portfolio';
			popLast();
			if (wasPortfolio) cliInputEl?.focus();
			return;
		}
		if (!portfolioInteractive) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			portfolioPickIndex = (portfolioPickIndex + 1) % portfolioItems.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			portfolioPickIndex = (portfolioPickIndex - 1 + portfolioItems.length) % portfolioItems.length;
		} else if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			confirmPortfolioPick();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', onGlobalKeydown);
	});

	onDestroy(() => {
		window.removeEventListener('keydown', onGlobalKeydown);
		clearTypingTimer();
		for (const timer of introTimers) clearTimeout(timer);
	});

	$: if (lastFeedback?.kind === 'portfolio' && portfolioItems.length && portfolioInteractive) {
		portfolioPickIndex = Math.max(0, Math.min(portfolioPickIndex, portfolioItems.length - 1));
	}

	afterUpdate(() => {
		if (scrollLogEl && history.length) {
			scrollLogEl.scrollTop = scrollLogEl.scrollHeight;
		}

		const last = history[history.length - 1];
		if (last && !last.typingComplete && last.id !== lastTypingStartedId) {
			lastTypingStartedId = last.id;
			startTypingAnimation(last.id);
		}

		const justFinishedTyping =
			last?.typingComplete &&
			(!prevLastEntrySnapshot ||
				prevLastEntrySnapshot.id !== last.id ||
				!prevLastEntrySnapshot.typingComplete);

		if (last?.typingComplete) {
			lastTypingStartedId = null;
			if (!bottomPromptVisible) {
				bottomPromptVisible = true;
			}
			/* First command sets bottomPromptVisible before streaming; still need focus + blink caret. */
			if (justFinishedTyping) {
				tick().then(() => {
					cliInputEl?.focus();
					requestAnimationFrame(syncStartCaret);
				});
			}
		}

		prevLastEntrySnapshot = last
			? { id: last.id, typingComplete: last.typingComplete }
			: null;
	});
</script>

<div
	class="cli-block"
	class:cli-block--intro-bg={introBgVisible}
	class:cli-block--intro-glow={introGlowVisible}
>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-mouse-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="cli-terminal-window"
		class:cli-terminal-window--bottom-prompt={bottomPromptVisible}
		class:cli-terminal-window--portfolio-interactive={portfolioInteractive}
		on:click={(e) => {
			const t = e.target instanceof HTMLElement ? e.target : null;
			if (t?.closest('[data-copy-email]')) {
				e.preventDefault();
				onCopyEmail();
				return;
			}
			if (!portfolioInteractive) return;
			const parsed = getPortfolioIndexFromPointerEvent(e);
			if (parsed === null) return;
			portfolioPickIndex = Math.max(0, Math.min(parsed, portfolioItems.length - 1));
			confirmPortfolioPick();
		}}
		on:mouseover={(e) => {
			if (!portfolioInteractive) return;
			const parsed = getPortfolioIndexFromPointerEvent(e);
			if (parsed === null) return;
			portfolioPickIndex = Math.max(0, Math.min(parsed, portfolioItems.length - 1));
		}}
	>
		{#if showReturnHint}
			<div
				class="cli-top-bar"
				class:cli-top-bar--has-body={history.length > 0}
				transition:fade={{ duration: 200 }}
			>
				<div class="cli-row">
					<div class="cli-shell">
						<div class="cli-inner" role="group" aria-label="Command line">
							<label class="cli-label-visually-hidden" for="cli-command-input">Command</label>
							<span class="cli-prompt" aria-hidden="true">$</span>
							<div class="cli-input-shell">
								<input
									id="cli-command-input"
									bind:this={cliInputEl}
									type="text"
									class="cli-input"
									class:cli-input--intro-hidden={showReturnHint &&
										introSequenceStarted &&
										!introTypingDone}
									class:cli-input--at-start={showStartCaret}
									bind:value={commandLine}
									autocomplete="off"
									spellcheck={false}
									aria-describedby={history.length ? outputId : undefined}
									on:focus={syncStartCaret}
									on:blur={() => (showStartCaret = false)}
									on:click={() => requestAnimationFrame(syncStartCaret)}
									on:keyup={() => requestAnimationFrame(syncStartCaret)}
									on:input={() => requestAnimationFrame(syncStartCaret)}
									on:select={() => requestAnimationFrame(syncStartCaret)}
									on:keydown={onInputKeydown}
								/>
								{#if showReturnHint && introTypingVisible && !introTypingDone}
									<span class="cli-intro-typed" aria-hidden="true">--help</span>
								{/if}
								{#if showStartCaret}
									<span class="cli-start-caret" aria-hidden="true"></span>
								{/if}
							</div>
						</div>
					</div>
					<div
						class="cli-return-hint"
						class:cli-return-hint--visible={!introSequenceStarted || introReturnVisible}
					>
						<span class="cli-return-label">Return</span>
						<CornerDownLeft size={11} strokeWidth={1.5} aria-hidden="true" />
					</div>
				</div>
			</div>
		{/if}

		<HomeTerminalHistory
			{history}
			{lastEntry}
			{portfolioItems}
			{portfolioPickIndex}
			{showReturnHint}
			{outputId}
			bind:scrollLogEl
			{sliceStyledHtml}
			{portfolioListStyledHtml}
		/>

		{#if bottomPromptVisible}
			<div
				class="cli-bottom-prompt"
				role="group"
				aria-label="Command line"
				in:fade={{ duration: 250 }}
			>
				<label class="cli-label-visually-hidden" for="cli-command-input">Command</label>
				<span class="cli-prompt" aria-hidden="true">$</span>
				<div class="cli-input-shell">
					<input
						id="cli-command-input"
						bind:this={cliInputEl}
						type="text"
						class="cli-input"
						class:cli-input--at-start={showStartCaret}
						bind:value={commandLine}
						autocomplete="off"
						spellcheck={false}
						aria-describedby={history.length ? outputId : undefined}
						on:focus={syncStartCaret}
						on:blur={() => (showStartCaret = false)}
						on:click={() => requestAnimationFrame(syncStartCaret)}
						on:keyup={() => requestAnimationFrame(syncStartCaret)}
						on:input={() => requestAnimationFrame(syncStartCaret)}
						on:select={() => requestAnimationFrame(syncStartCaret)}
						on:keydown={onInputKeydown}
					/>
					{#if showStartCaret}
						<span class="cli-start-caret" aria-hidden="true"></span>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.cli-block {
		display: flex;
		flex-direction: column;
		gap: 0;
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
		contain: inline-size;
		position: relative;
		z-index: 0;
		isolation: isolate;
		opacity: 0;
		transition: opacity 760ms ease;
		pointer-events: none;
	}

	.cli-block--intro-bg {
		opacity: 1;
		pointer-events: auto;
	}

	/* Rainbow glow from the edges outward (no center hotspot) */
	.cli-block::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 0;
		border-radius: var(--border-radius);
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
			100% 5px,
			100% 5px,
			5px 100%,
			5px 100%;
		background-repeat: no-repeat;
		filter: blur(10px);
		opacity: 0;
		transition: opacity 520ms ease;
	}

	.cli-block--intro-glow::before {
		opacity: var(--glow-cli-opacity, 0.9);
	}

	@media (prefers-reduced-motion: reduce) {
		.cli-block::before {
			opacity: var(--glow-cli-opacity-rm, 0.08);
		}
	}

	/* Single dark surface: input + output grow together */
	.cli-terminal-window {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		min-height: 0;
		max-height: min(48vh, 22rem);
		background-color: var(--text-color);
		color: var(--bg-color);
		border-radius: var(--border-radius);
		box-shadow: inset 0 0 0 1px var(--alpha-black-012);
		overflow: hidden;
		transition: box-shadow 0.25s ease;
		font-family: 'IBM Plex Mono', ui-monospace, monospace;
		font-size: 0.82rem;
		font-weight: 400;
		line-height: 1.45;
		letter-spacing: 0.02em;
	}

	.cli-top-bar {
		flex-shrink: 0;
		padding: 0.55rem 0.85rem 0.55rem 0.75rem;
	}

	.cli-top-bar--has-body {
		border-bottom: 1px solid var(--cli-terminal-divider-fg);
	}

	.cli-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.65rem;
		width: 100%;
		min-width: 0;
	}

	.cli-shell {
		flex: 1;
		min-width: 0;
	}

	.cli-input-shell {
		position: relative;
		flex: 1;
		min-width: 0;
	}

	.cli-inner {
		display: flex;
		align-items: center;
		width: 100%;
		box-sizing: border-box;
		min-width: 0;
		padding: 0;
	}

	.cli-label-visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.cli-prompt {
		color: var(--cli-terminal-muted-fg);
		user-select: none;
		margin-right: 0.35rem;
		flex-shrink: 0;
	}

	.cli-input {
		flex: 1;
		min-width: 0;
		border: none;
		background: transparent;
		color: var(--bg-color);
		font: inherit;
		line-height: 1.4;
		letter-spacing: inherit;
		/* Give native caret extra breathing room at start + vertically */
		padding: 0.02em 0 0.02em 0.18em;
		min-height: 1.4em;
		outline: none;
		caret-color: var(--cli-terminal-body-fg);
		font-variant-ligatures: none;
		-webkit-font-smoothing: antialiased;
	}

	.cli-input::placeholder {
		color: var(--cli-terminal-placeholder-fg);
	}

	.cli-input--intro-hidden {
		color: transparent;
		caret-color: transparent;
	}

	.cli-intro-typed {
		position: absolute;
		left: 0.18em;
		top: 50%;
		transform: translateY(-53%);
		color: var(--bg-color);
		white-space: nowrap;
		overflow: hidden;
		width: 0;
		pointer-events: none;
		animation: cli-intro-type 920ms steps(6, end) forwards;
	}

	.cli-input:read-only {
		cursor: default;
	}

	/* Only at column 0: hide native caret and draw a clean bar */
	.cli-input.cli-input--at-start {
		caret-color: transparent;
	}

	.cli-start-caret {
		position: absolute;
		left: 0.18em;
		top: 50%;
		transform: translateY(-53.5%);
		width: 1px;
		height: 1.18em;
		background: var(--cli-terminal-body-fg);
		pointer-events: none;
		animation: cli-cursor-blink 1s steps(1, end) infinite;
	}

	@keyframes cli-cursor-blink {
		0%,
		45% {
			opacity: 1;
		}
		50%,
		100% {
			opacity: 0;
		}
	}

	@keyframes cli-intro-type {
		from {
			width: 0;
		}
		to {
			width: 6ch;
		}
	}

	.cli-return-hint {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		flex-shrink: 0;
		font-family: var(--font-family);
		font-size: 0.55rem;
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--cli-terminal-subtle-fg);
		white-space: nowrap;
		opacity: 0;
		transition: opacity 320ms ease;
	}

	.cli-return-hint--visible {
		opacity: 1;
	}

	.cli-return-hint :global(svg) {
		display: block;
		color: var(--cli-terminal-subtle-fg);
		opacity: 1;
	}

	/*
	  Fixed size once bottom-prompt mode is on — scrollback scrolls inside;
	  window does not grow taller when more commands are run.
	*/
	.cli-terminal-window--bottom-prompt {
		height: min(48vh, 22rem);
		max-height: min(48vh, 22rem);
		min-height: 0;
		flex-shrink: 0;
	}

	.cli-bottom-prompt {
		display: flex;
		flex-direction: row;
		align-items: center;
		flex-shrink: 0;
		gap: 0.35rem;
		/* Extra inset so the native caret isn’t clipped to a curve by overflow:hidden + border-radius */
		padding: 0.55rem 0.85rem 0.65rem 0.85rem;
		border-top: 1px solid var(--cli-terminal-divider-fg);
	}

	.cli-bottom-prompt .cli-prompt {
		margin-right: 0;
	}

	.cli-bottom-prompt .cli-input {
		line-height: 1.4;
		min-height: 1.4em;
	}

	@media (max-width: 768px) {
		.cli-top-bar {
			padding: 0.5rem 0.7rem;
		}

		.cli-terminal-window {
			font-size: 0.76rem;
			max-height: min(42vh, 18rem);
		}

		.cli-return-hint {
			font-size: 0.5rem;
			gap: 0.2rem;
		}

		.cli-terminal-window--bottom-prompt {
			height: min(42vh, 18rem);
			max-height: min(42vh, 18rem);
		}
	}
</style>
