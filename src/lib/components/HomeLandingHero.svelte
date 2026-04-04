<script lang="ts">
	import { afterUpdate, onDestroy, onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { CornerDownLeft } from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';
	import type { PortfolioItem } from '$lib/data/portfolio-items.js';
	import { contactLinks } from '$lib/data/contact-links';
	import { scrollFadeEntry } from '$lib/actions/scrollFadeEntry';

	export let portfolioItems: PortfolioItem[] = [];
	export let onOpenPortfolio: (index: number) => void = () => {};
	export let onCopyEmail: () => void = () => {};
	export let onGoHome: () => void = () => {};

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
	let typingTimer: ReturnType<typeof setInterval> | null = null;
	let prevShowReturnHint = true;
	let bottomPromptVisible = false;
	let bottomPromptFocused = false;

	$: lastEntry = history.length ? history[history.length - 1] : null;
	$: lastFeedback = lastEntry?.feedback ?? null;
	$: portfolioInteractive =
		lastFeedback?.kind === 'portfolio' && (lastEntry?.typingComplete ?? false);

	function esc(s: string): string {
		return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	function portfolioListPlainText(items: PortfolioItem[], activeIndex: number): string {
		return (
			`↑↓ select · Enter / Space open · Esc cancel\n\n` +
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
			`↑↓ select · Enter / Space open · Esc cancel\n\n` +
			items
				.map((it, i) => {
					const bulletClass = i === activeIndex ? 'cli-t-bullet cli-t-bullet--active' : 'cli-t-bullet';
					const itemClass = i === activeIndex ? 'cli-t-item cli-t-item--active' : 'cli-t-item';
					const bullet = i === activeIndex ? '●' : '•';
					const labels = it.tags?.length
						? ` <span class="cli-t-item-labels" data-portfolio-index="${i}">(${esc(it.tags.join(' · '))})</span>`
						: '';
					return `<span class="${bulletClass}" data-portfolio-index="${i}">${bullet}</span> <span class="${itemClass}" data-portfolio-index="${i}">${esc(it.title)}</span>${labels}`;
				})
				.join('\n') +
			`\n\n`
		);
	}

	function feedbackToPlainText(f: Feedback, items: PortfolioItem[]): string {
		switch (f.kind) {
			case 'help':
				return (
					`Commands\n\n` +
					`--help\n` +
					`Show this list.\n\n` +
					`--portfolio\n` +
					`List work — use ↑/↓ then Enter or Space to open.\n\n` +
					`--portfolio <name>\n` +
					`Jump to a piece (partial title ok).\n\n` +
					`--about\n` +
					`About page.\n\n` +
					`--contact\n` +
					`Clickable links (email & socials).\n\n`
				);
			case 'contact':
				return (
					`Links\n\n` +
					contactLinks.map((l) => l.label).join('  ') +
					`\n\n`
				);
			case 'error':
				return `${f.message}\n\n`;
			case 'system':
				return `${f.message}\n\n`;
			case 'portfolio':
				return portfolioListPlainText(items, 0);
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
					`List work — use ↑/↓ then Enter or Space to open.\n\n` +
					`<span class="cli-t-cmd">--portfolio &lt;name&gt;</span>\n` +
					`Jump to a piece (partial title ok).\n\n` +
					`<span class="cli-t-cmd">--about</span>\n` +
					`About page.\n\n` +
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
			}
		}, 18);
	}

	function pushEntry(cmd: string, feedback: Feedback) {
		const fullText = feedbackToPlainText(feedback, portfolioItems);
		const styledHtml = feedbackToStyledHtml(feedback, portfolioItems);
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
		}

		switch (parsed.type) {
			case 'help':
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
			if (!bottomPromptVisible) {
				bottomPromptVisible = true;
				tick().then(() => cliInputEl?.focus());
			}
		}
	});
</script>

<div class="hero-intro-stack">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="description" in:fade={{ duration: 600, delay: 300 }} on:click={onGoHome} role="button" tabindex="0">
		<span class="description-layers">
			<span class="description-base">I design tools.</span>
			<span class="description-shimmer" aria-hidden="true">I design tools.</span>
		</span>
	</div>
	<div class="cli-block" in:fade={{ duration: 600, delay: 380 }}>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-mouse-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div
				class="cli-terminal-window"
				class:cli-terminal-window--bottom-prompt={bottomPromptVisible}
				on:click={(e) => {
					const t = e.target instanceof HTMLElement ? e.target : null;
					if (t?.closest('[data-copy-email]')) {
						e.preventDefault();
						onCopyEmail();
					}
				}}
				on:mouseover={(e) => {
					if (!portfolioInteractive) return;
					const t = e.target instanceof HTMLElement ? e.target : null;
					const pick = t?.closest<HTMLElement>('[data-portfolio-index]')?.dataset.portfolioIndex;
					if (!pick) return;
					const parsed = Number.parseInt(pick, 10);
					if (Number.isNaN(parsed)) return;
					portfolioPickIndex = Math.max(0, Math.min(parsed, portfolioItems.length - 1));
				}}
			>
			{#if showReturnHint}
				<div class="cli-top-bar" class:cli-top-bar--has-body={history.length > 0}
					transition:fade={{ duration: 200 }}>
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
									<pre class="cli-typewriter">{@html sliceStyledHtml(entry.styledHtml, entry.typingProgress)}<span
											class="cli-type-cursor"
											aria-hidden="true"
										></span></pre>
									{:else}
										<pre class="cli-typewriter cli-typewriter--done">{@html entry.feedback.kind === 'portfolio' && entry.id === lastEntry?.id
											? portfolioListStyledHtml(portfolioItems, portfolioPickIndex)
											: entry.styledHtml}</pre>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
				{/if}

			{#if bottomPromptVisible}
				<div class="cli-bottom-prompt" role="group" aria-label="Command line"
					in:fade={{ duration: 250 }}>
						<label class="cli-label-visually-hidden" for="cli-command-input">Command</label>
						<span class="cli-prompt" aria-hidden="true">$</span>
						<div class="cli-input-shell">
							<input
								id="cli-command-input"
								bind:this={cliInputEl}
								type="text"
								class="cli-input"
								class:cli-input--empty={commandLine.length === 0}
								bind:value={commandLine}
								autocomplete="off"
								spellcheck={false}
								aria-describedby={history.length ? outputId : undefined}
								readonly={lastFeedback?.kind === 'portfolio' && portfolioInteractive}
								on:focus={() => (bottomPromptFocused = true)}
								on:blur={() => (bottomPromptFocused = false)}
								on:keydown={onInputKeydown}
							/>
							{#if bottomPromptFocused && commandLine.length === 0}
								<span class="cli-empty-caret" aria-hidden="true"></span>
							{/if}
						</div>
					</div>
				{/if}
		</div>
	</div>
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
			var(--palette-rainbow-gradient-h),
			var(--palette-rainbow-gradient-h),
			var(--palette-rainbow-gradient-h),
			var(--palette-rainbow-gradient-h);
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
		line-height: 1.35;
		letter-spacing: inherit;
		padding: 0;
		min-height: 1.35em;
		outline: none;
		caret-color: var(--cli-terminal-body-fg);
		font-variant-ligatures: none;
		-webkit-font-smoothing: antialiased;
	}

	.cli-input::placeholder {
		color: var(--cli-terminal-placeholder-fg);
	}

	.cli-input:read-only {
		cursor: default;
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
	}

	.cli-return-hint :global(svg) {
		display: block;
		color: var(--cli-terminal-subtle-fg);
		opacity: 1;
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
		scrollbar-color: var(--cli-terminal-scrollbar-thumb-fg) var(--alpha-black-022);
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
		/* Extra inset so the native caret isn’t clipped to a curve by overflow:hidden + border-radius */
		padding: 0.55rem 0.85rem 0.65rem 0.85rem;
		border-top: 1px solid var(--cli-terminal-divider-fg);
	}

	.cli-bottom-prompt .cli-prompt {
		margin-right: 0;
	}

	.cli-input-shell {
		position: relative;
		flex: 1;
		min-width: 0;
	}

	.cli-bottom-prompt .cli-input {
		line-height: 1.4;
		min-height: 1.4em;
		/* Nudge insertion point off the left edge so the first caret isn't clipped */
		padding-left: 0.08em;
	}

	/* Empty-state fallback caret: plain bar, avoids browser-specific tapered glyph */
	.cli-bottom-prompt .cli-input.cli-input--empty {
		caret-color: transparent;
	}

	.cli-empty-caret {
		position: absolute;
		left: 0.08em;
		top: 50%;
		transform: translateY(-50%);
		width: 1px;
		height: 1em;
		background: var(--cli-terminal-body-fg);
		pointer-events: none;
		animation: cli-cursor-blink 1s steps(1, end) infinite;
	}

	.cli-history-scroll::-webkit-scrollbar {
		width: 7px;
	}

	.cli-history-scroll::-webkit-scrollbar-track {
		background: var(--alpha-black-020);
		border-radius: var(--radius-full);
		margin: 0.2rem 0;
	}

	.cli-history-scroll::-webkit-scrollbar-thumb {
		background: var(--cli-terminal-scrollbar-thumb-fg);
		border-radius: var(--radius-full);
		border: 1px solid var(--alpha-black-015);
	}

	.cli-history-scroll::-webkit-scrollbar-thumb:hover {
		background: var(--cli-terminal-scrollbar-thumb-hover-fg);
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
		color: var(--cli-terminal-muted-fg);
		margin-bottom: 0.15rem;
	}

	.cli-history-result {
		color: var(--cli-terminal-body-fg);
		padding: 0.15rem 0 0.35rem;
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

	.cli-typewriter :global(.cli-t-bold) {
		font-weight: 600;
		color: var(--bg-color);
	}

	.cli-typewriter :global(.cli-t-cmd) {
		color: var(--palette-rainbow-on-ink-4, var(--palette-rainbow-4));
		font-weight: 500;
	}

	.cli-typewriter :global(.cli-t-dim) {
		opacity: 1;
		color: var(--cli-terminal-dim-fg);
	}

	.cli-typewriter :global(.cli-t-err) {
		color: var(
			--palette-rainbow-on-ink-err,
			color-mix(in srgb, var(--palette-rainbow-1) 88%, var(--palette-white-pure))
		);
	}

	/* Solid bar — avoids ▊ glyph clipping / “half a letter” in monospace at small sizes */
	.cli-type-cursor {
		display: inline-block;
		width: max(2px, 0.4ch);
		height: 1.15em;
		margin-left: 0.12em;
		vertical-align: text-bottom;
		background-color: var(--cli-terminal-body-fg);
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


	.cli-typewriter :global(.cli-t-link) {
		color: var(--palette-rainbow-on-ink-6, var(--palette-rainbow-6));
		text-decoration: underline;
		text-underline-offset: 2px;
		cursor: pointer;
	}

	.cli-typewriter :global(.cli-t-link:hover) {
		opacity: 0.92;
	}

	.cli-typewriter :global(.cli-t-bullet) {
		color: var(--cli-terminal-muted-fg);
		transition: color 0.12s ease;
	}

	.cli-typewriter :global(.cli-t-bullet--active) {
		/* Same green as .cli-t-cmd (not the brighter mint CLI token) */
		color: var(--palette-rainbow-on-ink-4, var(--palette-rainbow-4));
	}

	.cli-typewriter :global(.cli-t-item) {
		transition: color 0.12s ease;
	}

	.cli-typewriter :global(.cli-t-item--active) {
		color: var(--bg-color);
	}

	.cli-typewriter :global(.cli-t-item-labels) {
		color: var(--cli-terminal-muted-fg);
	}

	@media (max-width: 768px) {
		.description {
			font-size: clamp(2.32rem, 8vw, 3.6rem);
			line-height: 1.12;
			letter-spacing: -0.02em;
		}

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
