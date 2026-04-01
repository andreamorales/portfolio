<script lang="ts">
	import { afterUpdate, onDestroy, onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { CornerDownLeft } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import type { PortfolioItem } from '$lib/data/portfolio-items.js';
	import { contactLinks } from '$lib/data/contact-links';
	import { scrollFadeEntry } from '$lib/actions/scrollFadeEntry';

	export let portfolioItems: PortfolioItem[] = [];
	export let onOpenPortfolio: (index: number) => void = () => {};

	type Feedback =
		| { kind: 'help' }
		| { kind: 'contact' }
		| { kind: 'portfolio' }
		| { kind: 'error'; message: string }
		| { kind: 'system'; message: string };

	type HistoryEntry = {
		id: string;
		cmd: string;
		feedback: Feedback;
		fullText: string;
		typingProgress: number;
		typingComplete: boolean;
	};

	let commandLine = '--h';
	let history: HistoryEntry[] = [];
	let portfolioPickIndex = 0;
	let cliInputEl: HTMLInputElement | null = null;
	let scrollLogEl: HTMLDivElement | null = null;
	let outputId = 'cli-output-region';
	/** After the first `--h` / help, hide Return and expand the CLI. */
	let showReturnHint = true;
	let lastTypingStartedId: string | null = null;
	let typingTimer: ReturnType<typeof setInterval> | null = null;
	let prevShowReturnHint = true;

	$: lastEntry = history.length ? history[history.length - 1] : null;
	$: lastFeedback = lastEntry?.feedback ?? null;
	$: portfolioInteractive =
		lastFeedback?.kind === 'portfolio' && (lastEntry?.typingComplete ?? false);

	function feedbackToPlainText(f: Feedback, items: PortfolioItem[]): string {
		switch (f.kind) {
			case 'help':
				return (
					`Commands\n\n` +
					`  --portfolio\n` +
					`    List work — use ↑/↓ then Enter or Space to open.\n\n` +
					`  --portfolio <name>\n` +
					`    Jump to a piece (partial title ok).\n\n` +
					`  --about\n` +
					`    About page.\n\n` +
					`  --contact\n` +
					`    Clickable links (email & socials).\n\n`
				);
			case 'contact':
				return (
					`Links\n\n` +
					contactLinks.map((l) => `${l.label}\n  ${l.href}`).join('\n\n') +
					`\n\n`
				);
			case 'error':
				return `${f.message}\n\n`;
			case 'system':
				return `${f.message}\n\n`;
			case 'portfolio':
				return (
					`↑↓ select · Enter / Space open · Esc cancel\n\n` +
					items.map((it) => it.title).join('\n') +
					`\n\n`
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

	function startTypingAnimation(entryId: string) {
		clearTypingTimer();
		typingTimer = setInterval(() => {
			history = history.map((h) => {
				if (h.id !== entryId || h.typingComplete) return h;
				const step = 2;
				const np = Math.min(h.typingProgress + step, h.fullText.length);
				const done = np >= h.fullText.length;
				return { ...h, typingProgress: np, typingComplete: done };
			});

			const el = history.find((h) => h.id === entryId);
			if (!el || el.typingComplete) {
				clearTypingTimer();
				if (el?.typingComplete && el.feedback.kind === 'portfolio') {
					tick().then(() =>
						scrollLogEl?.querySelector<HTMLElement>('.cli-output--portfolio')?.focus()
					);
				}
			}
		}, 18);
	}

	function pushEntry(cmd: string, feedback: Feedback) {
		const fullText = feedbackToPlainText(feedback, portfolioItems);
		history = history.map((h) =>
			h.typingComplete
				? h
				: { ...h, typingProgress: h.fullText.length, typingComplete: true }
		);
		history = [
			...history,
			{
				id: crypto.randomUUID(),
				cmd,
				feedback,
				fullText,
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
		commandLine = '';
		const parsed = parseCommand(cmdSnapshot);

		switch (parsed.type) {
			case 'help':
				showReturnHint = false;
				pushEntry(cmdSnapshot, { kind: 'help' });
				break;
			case 'about':
				pushEntry(cmdSnapshot, { kind: 'system', message: 'Opening About…' });
				await tick();
				goto('/about');
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
					message: `Unknown command: ${parsed.line}. Try --h for available commands.`
				});
		}
	}

	function confirmPortfolioPick() {
		if (!portfolioInteractive || !portfolioItems.length) return;
		const idx = portfolioPickIndex;
		const title = portfolioItems[idx].title;
		const last = history[history.length - 1];
		const msg = `Opened: ${title}`;
		lastTypingStartedId = null;
		clearTypingTimer();
		history = [
			...history.slice(0, -1),
			{
				...last,
				feedback: { kind: 'system', message: msg },
				fullText: `${msg}\n\n`,
				typingProgress: 0,
				typingComplete: false
			}
		];
		onOpenPortfolio(idx);
	}

	function onInputKeydown(e: KeyboardEvent) {
		if (lastFeedback?.kind === 'portfolio' && !portfolioInteractive) {
			e.preventDefault();
			return;
		}
		if (e.key === 'Enter') {
			e.preventDefault();
			submitCommand();
		}
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
			portfolioPickIndex =
				(portfolioPickIndex - 1 + portfolioItems.length) % portfolioItems.length;
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
	});

	$: if (lastFeedback?.kind === 'portfolio' && portfolioItems.length && portfolioInteractive) {
		portfolioPickIndex = Math.max(0, Math.min(portfolioPickIndex, portfolioItems.length - 1));
	}

	afterUpdate(() => {
		if (prevShowReturnHint && !showReturnHint) {
			tick().then(() => cliInputEl?.focus());
		}
		prevShowReturnHint = showReturnHint;

		if (scrollLogEl && history.length) {
			scrollLogEl.scrollTop = scrollLogEl.scrollHeight;
		}

		const last = history[history.length - 1];
		if (last && !last.typingComplete && last.id !== lastTypingStartedId) {
			lastTypingStartedId = last.id;
			startTypingAnimation(last.id);
		}
		if (last?.typingComplete) {
			lastTypingStartedId = null;
		}
	});
</script>

<div class="header flex-column-left gap-small">
	<div class="hero-column">
		<div class="description" in:fade={{ duration: 600, delay: 300 }}>
			I design tools.
		</div>
		<div class="cli-block" in:fade={{ duration: 600, delay: 380 }}>
			<div
				class="cli-terminal-window"
				class:cli-terminal-window--bottom-prompt={!showReturnHint}
			>
				{#if showReturnHint}
					<div class="cli-top-bar" class:cli-top-bar--has-body={history.length > 0}>
						<div class="cli-row">
							<div class="cli-shell">
								<div class="cli-inner" role="group" aria-label="Command line">
									<label class="cli-label-visually-hidden" for="cli-command-input">Command</label>
									<span class="cli-prompt" aria-hidden="true">$</span>
									<input
										id="cli-command-input"
										bind:this={cliInputEl}
										type="text"
										class="cli-input"
										bind:value={commandLine}
										autocomplete="off"
										spellcheck={false}
										aria-describedby={history.length ? outputId : undefined}
										readonly={lastFeedback?.kind === 'portfolio' && portfolioInteractive}
										on:keydown={onInputKeydown}
									/>
								</div>
							</div>
							<div class="cli-return-hint">
								<span class="cli-return-label">Return</span>
								<CornerDownLeft size={11} strokeWidth={1.5} aria-hidden="true" />
							</div>
						</div>
					</div>
				{/if}

				{#if history.length}
				<div class="cli-history-wrap" id={outputId}>
					<div
						bind:this={scrollLogEl}
						class="cli-history-scroll"
						class:cli-history-scroll--compact={showReturnHint}
						role="log"
						aria-live="polite"
						aria-relevant="additions"
					>
						{#each history as entry (entry.id)}
							<div
								class="cli-history-entry"
								use:scrollFadeEntry={{ root: scrollLogEl }}
							>
								<div class="cli-history-cmd">$ {entry.cmd}</div>
								<div class="cli-history-result">
									{#if !entry.typingComplete}
										<pre class="cli-typewriter">{entry.fullText.slice(0, entry.typingProgress)}<span
												class="cli-type-cursor"
												aria-hidden="true">▊</span
											></pre>
									{:else if entry.feedback.kind === 'portfolio'}
										{#if entry.id === lastEntry?.id}
											<div
												class="cli-output cli-output--portfolio"
												role="listbox"
												tabindex="0"
												aria-label="Portfolio pieces — use arrow keys to select, Enter or Space to open"
											>
												<p class="cli-portfolio-hint" id="cli-portfolio-hint-{entry.id}">
													<kbd>↑</kbd><kbd>↓</kbd> select · <kbd>Enter</kbd> / <kbd>Space</kbd> open ·
													<kbd>Esc</kbd> cancel
												</p>
												<div class="cli-portfolio-list">
													{#each portfolioItems as item, i}
														<div
															class="cli-portfolio-item"
															class:cli-portfolio-item--active={i === portfolioPickIndex}
															role="option"
															aria-selected={i === portfolioPickIndex}
															aria-describedby="cli-portfolio-hint-{entry.id}"
														>
															{item.title}
														</div>
													{/each}
												</div>
											</div>
										{:else}
											<pre class="cli-typewriter cli-typewriter--done">Portfolio browser (ended).</pre>
										{/if}
									{:else}
										<pre
											class="cli-typewriter cli-typewriter--done"
											class:cli-typewriter--error={entry.feedback.kind === 'error'}>{entry.fullText}</pre>
										{#if entry.feedback.kind === 'contact'}
											<div class="cli-contact-actions" aria-label="Open links">
												{#each contactLinks as link}
													<a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
												{/each}
											</div>
										{/if}
									{/if}
									{#if entry.typingComplete}
										<div class="cli-empty-line" aria-hidden="true">&nbsp;</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
				{/if}

				{#if !showReturnHint}
					<div class="cli-bottom-prompt" role="group" aria-label="Command line">
						<label class="cli-label-visually-hidden" for="cli-command-input">Command</label>
						<span class="cli-prompt" aria-hidden="true">$</span>
						<input
							id="cli-command-input"
							bind:this={cliInputEl}
							type="text"
							class="cli-input"
							bind:value={commandLine}
							autocomplete="off"
							spellcheck={false}
							aria-describedby={history.length ? outputId : undefined}
							readonly={lastFeedback?.kind === 'portfolio' && portfolioInteractive}
							on:keydown={onInputKeydown}
						/>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.hero-column {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.5rem;
		align-self: flex-start;
		width: fit-content;
		max-width: 100%;
	}

	.description {
		font-family: 'Instrument Serif', serif;
		font-size: clamp(3.52rem, 5.6vw, 5.44rem);
		font-style: normal;
		font-weight: 400;
		line-height: 0.92;
		letter-spacing: -0.02em;
		position: relative;
		z-index: 2;
		color: var(--text-color);
		width: 100%;
		white-space: nowrap;
		overflow: visible;
	}

	.cli-block {
		display: flex;
		flex-direction: column;
		gap: 0;
		/* Fixed width: do not grow/shrink with streamed text (was fit-to-content during typing). */
		width: min(100%, 42rem);
		max-width: 42rem;
		box-sizing: border-box;
	}

	/* Single dark surface: input + output grow together */
	.cli-terminal-window {
		display: flex;
		flex-direction: column;
		width: 100%;
		min-height: 0;
		background-color: var(--text-color);
		color: var(--bg-color);
		border-radius: var(--border-radius);
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
		overflow: hidden;
		transition: box-shadow 0.25s ease;
	}

	.cli-top-bar {
		flex-shrink: 0;
		padding: 0.55rem 0.85rem 0.55rem 0.75rem;
	}

	.cli-top-bar--has-body {
		border-bottom: 1px solid rgba(243, 234, 214, 0.12);
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

	.cli-inner {
		display: flex;
		align-items: center;
		width: 100%;
		box-sizing: border-box;
		min-width: 0;
		padding: 0;
		font-family: 'IBM Plex Mono', ui-monospace, monospace;
		font-size: 0.875rem;
		font-weight: 400;
		line-height: 1.35;
		letter-spacing: 0.02em;
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
		color: rgba(243, 234, 214, 0.65);
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
		letter-spacing: inherit;
		padding: 0;
		outline: none;
	}

	.cli-input::placeholder {
		color: rgba(243, 234, 214, 0.45);
	}

	.cli-input:read-only {
		cursor: default;
		opacity: 0.85;
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
		color: rgba(243, 234, 214, 0.42);
		white-space: nowrap;
	}

	.cli-return-hint :global(svg) {
		display: block;
		color: rgba(243, 234, 214, 0.45);
		opacity: 0.92;
	}

	.cli-history-wrap {
		margin: 0;
		padding: 0.5rem 0.65rem 0.65rem 0.75rem;
	}

	.cli-terminal-window--bottom-prompt .cli-history-wrap {
		flex: 1 1 auto;
		min-height: 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		padding-bottom: 0.35rem;
	}

	.cli-history-scroll {
		flex: 1 1 auto;
		min-height: 0;
		overflow-x: hidden;
		overflow-y: auto;
		padding-right: 0.35rem;
		margin-right: -0.15rem;
		scrollbar-width: thin;
		scrollbar-color: rgba(243, 234, 214, 0.35) rgba(0, 0, 0, 0.2);
	}

	/* Top input + scrollback: cap scroll height */
	.cli-history-scroll--compact {
		flex: none;
		max-height: min(14rem, 42vh);
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
		padding: 0.55rem 0.85rem 0.6rem 0.75rem;
		border-top: 1px solid rgba(243, 234, 214, 0.12);
		font-family: 'IBM Plex Mono', ui-monospace, monospace;
		font-size: 0.875rem;
		font-weight: 400;
		line-height: 1.35;
		letter-spacing: 0.02em;
	}

	.cli-bottom-prompt .cli-prompt {
		margin-right: 0;
	}

	.cli-history-scroll::-webkit-scrollbar {
		width: 7px;
	}

	.cli-history-scroll::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.2);
		border-radius: var(--radius-full);
		margin: 0.2rem 0;
	}

	.cli-history-scroll::-webkit-scrollbar-thumb {
		background: rgba(243, 234, 214, 0.28);
		border-radius: var(--radius-full);
		border: 1px solid rgba(0, 0, 0, 0.15);
	}

	.cli-history-scroll::-webkit-scrollbar-thumb:hover {
		background: rgba(243, 234, 214, 0.42);
	}

	.cli-history-scroll::-webkit-scrollbar-button {
		display: block;
		height: 5px;
	}

	.cli-history-entry {
		margin-bottom: 0.85rem;
		transition: opacity 0.12s ease;
	}

	.cli-history-entry:last-child {
		margin-bottom: 0;
	}

	.cli-history-cmd {
		font-family: 'IBM Plex Mono', ui-monospace, monospace;
		font-size: 0.72rem;
		color: rgba(243, 234, 214, 0.42);
		margin-bottom: 0.35rem;
		letter-spacing: 0.02em;
	}

	/* Single stream: same <pre> while typing and when done (no HTML swap). */
	.cli-history-result {
		--cli-out-size: 0.78rem;
		--cli-out-lh: 1.45;
		--cli-out-color: rgba(243, 234, 214, 0.9);
		font-family: 'IBM Plex Mono', ui-monospace, monospace;
		font-size: var(--cli-out-size);
		line-height: var(--cli-out-lh);
		padding: 0.15rem 0 0.35rem;
		border-radius: 0;
		background: transparent;
		color: var(--cli-out-color);
		box-shadow: none;
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
	}

	.cli-typewriter {
		display: block;
		margin: 0;
		padding: 0;
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
		white-space: pre-wrap;
		word-break: break-word;
		overflow-wrap: anywhere;
		font-family: inherit;
		font-size: inherit;
		font-weight: inherit;
		line-height: inherit;
		letter-spacing: inherit;
		color: inherit;
		tab-size: 2;
	}

	.cli-typewriter--error {
		color: color-mix(in srgb, var(--palette-rainbow-1) 88%, white) !important;
	}

	.cli-type-cursor {
		display: inline-block;
		margin-left: 1px;
		color: rgba(243, 234, 214, 0.55);
		animation: cli-cursor-blink 1s steps(1, end) infinite;
		vertical-align: text-bottom;
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

	.cli-empty-line {
		min-height: 1.15em;
		margin-top: 0.35rem;
		border-top: 1px solid rgba(243, 234, 214, 0.08);
	}

	.cli-contact-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem 0.75rem;
		margin-top: 0.4rem;
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
	}

	.cli-contact-actions a {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 2px;
		font-size: inherit;
	}

	.cli-contact-actions a:hover {
		opacity: 0.92;
	}

	.cli-output--portfolio {
		outline: none;
		padding: 0;
		background: transparent;
		box-shadow: none;
		color: inherit;
	}

	.cli-output--portfolio:focus-visible {
		box-shadow:
			inset 0 0 0 1px rgba(243, 234, 214, 0.25),
			0 0 0 2px var(--text-color),
			0 0 0 4px color-mix(in srgb, var(--palette-rainbow-6) 55%, transparent);
		border-radius: var(--radius-xs);
	}

	.cli-portfolio-hint {
		margin: 0 0 0.5rem;
		font-size: inherit;
		line-height: inherit;
		color: inherit;
		opacity: 0.9;
	}

	.cli-portfolio-hint kbd {
		display: inline-block;
		padding: 0.06rem 0.22rem;
		font-size: inherit;
		line-height: inherit;
		font-family: inherit;
		font-weight: inherit;
		border-radius: var(--radius-xs);
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: inherit;
		margin: 0 0.05rem;
		vertical-align: baseline;
	}

	.cli-portfolio-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.cli-portfolio-item {
		padding: 0.35rem 0.45rem;
		border-radius: var(--radius-xs);
		cursor: default;
		transition: background 0.12s ease;
		font-size: inherit;
		line-height: inherit;
		color: inherit;
	}

	.cli-portfolio-item--active {
		background: rgba(255, 255, 255, 0.08);
		box-shadow: inset 2px 0 0 0 var(--palette-rainbow-6);
	}

	@media (max-width: 768px) {
		.description {
			font-size: clamp(2.32rem, 8vw, 3.6rem);
			line-height: 1;
			letter-spacing: -0.02em;
		}

		.cli-top-bar {
			padding: 0.5rem 0.7rem;
		}

		.cli-inner {
			font-size: 0.8125rem;
		}

		.cli-return-hint {
			font-size: 0.5rem;
			gap: 0.2rem;
		}

		.cli-history-result {
			--cli-out-size: 0.72rem;
		}

		.cli-terminal-window--bottom-prompt {
			height: min(42vh, 18rem);
			max-height: min(42vh, 18rem);
		}
	}
</style>
