<script lang="ts">
	import { afterUpdate, onDestroy, tick } from 'svelte';
	import type { PortfolioItem } from '$lib/data/portfolio-items.js';
	import { contactLinks } from '$lib/data/contact-links';
	import {
		decryptSecurePortfolioPayload,
		type SecurePortfolioPayloadData
	} from '$lib/utils/secureCaseStudy';
	import aboutAscii from '$lib/data/about-ascii.txt?raw';

	const aboutBio =
		"I lead the design of tools for devs and creatives, all through the lens of play. I started my career in 2010 as a filmmaker and game designer, which gave me a sharp eye for storytelling, and 12 years ago delved into product design and game design. I've worked at MongoDB, Roblox, ConsenSys, and was the CEO and co-founder of my own AI startup, Panto. I currently work at a healthcare AI company bringing AI to medical chart review.";

	export let portfolioItems: PortfolioItem[] = [];
	export let onOpenPortfolio: (
		index: number,
		unlocked?: boolean,
		unlockedData?: SecurePortfolioPayloadData
	) => void = () => {};
	export let onCopyEmail: () => void = () => {};
	export let onPromptInteract: () => void = () => {};
	export let onCommandRun: ((cmd: string, outputPreview: string) => void) | null = null;
	export let commandInputId = 'cli-command-input-mobile';

	type PortfolioGroupedEntry = {
		item: PortfolioItem;
		sourceIndex: number;
	};

	type EntryDraft =
		| { id: string; cmd: string; kind: 'help' }
		| { id: string; cmd: string; kind: 'about' }
		| { id: string; cmd: string; kind: 'contact' }
		| { id: string; cmd: string; kind: 'portfolio' }
		| { id: string; cmd: string; kind: 'system'; message: string }
		| { id: string; cmd: string; kind: 'error'; message: string };

	type Entry = EntryDraft & {
		fullText: string;
		styledHtml: string;
		typingProgress: number;
		typingComplete: boolean;
	};

	let inputEl: HTMLInputElement | null = null;
	let historyEl: HTMLDivElement | null = null;
	let inputValue = '--help';
	let history: Entry[] = [];
	let pendingLockedPortfolioIndex: number | null = null;
	let entryCounter = 0;
	let typingTimer: ReturnType<typeof setInterval> | null = null;
	let lastTypingEntryId: string | null = null;
	let navigatedAway = false;
	const sideProjectSlugs = new Set(['la-guila-toys', 'torch']);

	export function focusPrompt() {
		inputEl?.focus({ preventScroll: true });
	}

	export function revealPrompt() {
		if (historyEl) {
			historyEl.scrollTop = historyEl.scrollHeight;
		}
		inputEl?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
	}

	export function blurPrompt() {
		inputEl?.blur();
	}

	function handlePromptInteract() {
		onPromptInteract();
	}

	function createEntryId() {
		entryCounter += 1;
		const randomUuid = globalThis.crypto?.randomUUID?.();
		return randomUuid ?? `mobile-cli-${Date.now()}-${entryCounter}`;
	}

	$: portfolioEntries = getPortfolioDisplayEntries(portfolioItems);
	$: promptLabel = pendingLockedPortfolioIndex !== null ? 'Password' : '$';

	function slugify(text: string) {
		return text
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}

	function isSideProject(item: PortfolioItem): boolean {
		return sideProjectSlugs.has(slugify(item.title));
	}

	function getPortfolioDisplayEntries(items: PortfolioItem[]): PortfolioGroupedEntry[] {
		const productDesign: PortfolioGroupedEntry[] = [];
		const sideProjects: PortfolioGroupedEntry[] = [];
		items.forEach((item, sourceIndex) => {
			const grouped = { item, sourceIndex };
			if (isSideProject(item)) {
				sideProjects.push(grouped);
			} else {
				productDesign.push(grouped);
			}
		});
		return [...productDesign, ...sideProjects];
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

	function esc(s: string): string {
		return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	function plainTextForEntry(entry: EntryDraft | Entry): string {
		switch (entry.kind) {
			case 'help':
				return [
					'Commands',
					'',
					'--help',
					'Show this list.',
					'',
					'--portfolio',
					'List work. Tap a title to open.',
					'',
					'--portfolio <name>',
					'Jump to a piece.',
					'',
					'--about',
					'Andy Morales Coto bio.',
					'',
					'--contact',
					'Links and email.',
					''
				].join('\n');
			case 'about':
				return `${aboutAscii}\n${aboutBio}\n\n`;
			case 'contact':
				return `Links\n\n${contactLinks.map((link) => link.label).join('  ')}\n`;
			case 'portfolio':
				return [
					'Work',
					'',
					...portfolioEntries.map(
						(entry) => `${entry.item.title}${entry.item.locked ? ' (locked)' : ''}`
					),
					''
				].join('\n');
			case 'system':
			case 'error':
				return `${entry.message}\n`;
		}
	}

	function styledHtmlForEntry(entry: EntryDraft | Entry): string {
		switch (entry.kind) {
			case 'help':
				return (
					`<span class="cli-t-bold">Commands</span>\n\n` +
					`<span class="cli-t-cmd">--help</span>\n` +
					`Show this list.\n\n` +
					`<span class="cli-t-cmd">--portfolio</span>\n` +
					`List work. Tap a title to open.\n\n` +
					`<span class="cli-t-cmd">--portfolio &lt;name&gt;</span>\n` +
					`Jump to a piece.\n\n` +
					`<span class="cli-t-cmd">--about</span>\n` +
					`Andy Morales Coto bio.\n\n` +
					`<span class="cli-t-cmd">--contact</span>\n` +
					`Links and email.\n`
				);
			case 'about':
				return (
					`<span class="cli-t-about-wrap">` +
					`<span class="cli-t-about-ascii-block">${esc(aboutAscii)}</span>` +
					`\n<span class="cli-t-about-bio">${esc(aboutBio)}</span>` +
					`</span>\n\n`
				);
			case 'contact':
				return (
					`<span class="cli-t-bold">Links</span>\n\n` +
					contactLinks
						.map((link) =>
							link.action === 'copy'
								? `<span class="cli-t-link" role="button" tabindex="0" data-copy-email>${esc(link.label)}</span>`
								: `<a class="cli-t-link" href="${esc(link.href)}" target="_blank" rel="noopener noreferrer">${esc(link.label)}</a>`
						)
						.join('  ') +
					`\n\n`
				);
			case 'portfolio': {
				const productCount = portfolioEntries.filter(
					(portfolioEntry) => !isSideProject(portfolioEntry.item)
				).length;
				const rows: string[] = ['<span class="cli-t-bold">Work</span>', ''];
				portfolioEntries.forEach((portfolioEntry, i) => {
					if (i === productCount)
						rows.push('', '<span class="cli-t-portfolio-heading">Side Projects</span>');
					if (i === 0) rows.push('<span class="cli-t-portfolio-heading">Product Design</span>');
					const labels = portfolioEntry.item.locked
						? ` <span class="cli-t-item-labels">(locked)</span>`
						: '';
					rows.push(
						`<span class="cli-t-portfolio-row" data-portfolio-source-index="${portfolioEntry.sourceIndex}"><span class="cli-t-bullet">•</span> <span class="cli-t-item">${esc(portfolioEntry.item.title)}</span>${labels}</span>`
					);
				});
				return `${rows.join('\n')}\n`;
			}
			case 'system':
				return `${esc(entry.message)}\n`;
			case 'error':
				return `<span class="cli-t-err">${esc(entry.message)}</span>\n`;
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
					visible += 1;
					continue;
				}
			}
			result += ch;
			visible += 1;
		}

		result += '<span class="cli-type-cursor" aria-hidden="true"></span>';
		for (let j = openTags.length - 1; j >= 0; j--) {
			result += `</${openTags[j]}>`;
		}
		return result;
	}

	function clearTypingTimer() {
		if (!typingTimer) return;
		clearInterval(typingTimer);
		typingTimer = null;
	}

	function typingStepForEntry(entry: Entry) {
		if (entry.kind === 'portfolio') return 3;
		return 2;
	}

	function advanceTyping(entryId: string) {
		history = history.map((entry) => {
			if (entry.id !== entryId || entry.typingComplete) return entry;
			let step = typingStepForEntry(entry);
			if (entry.kind === 'about') {
				const bioStart = aboutAscii.length + 1;
				if (entry.typingProgress < bioStart) {
					step = Math.min(36, bioStart - entry.typingProgress);
				} else {
					step = 2;
				}
			}
			const nextProgress = Math.min(entry.fullText.length, entry.typingProgress + step);
			return {
				...entry,
				typingProgress: nextProgress,
				typingComplete: nextProgress >= entry.fullText.length
			};
		});

		requestAnimationFrame(() => {
			if (historyEl) historyEl.scrollTop = historyEl.scrollHeight;
		});

		const activeEntry = history.find((entry) => entry.id === entryId);
		if (!activeEntry || activeEntry.typingComplete) {
			lastTypingEntryId = null;
			clearTypingTimer();
		}
	}

	function startTyping(entryId: string) {
		clearTypingTimer();
		typingTimer = setInterval(() => advanceTyping(entryId), 18);
	}

	function pushEntry(
		entry: EntryDraft,
		options: {
			notifyParent?: boolean;
			instant?: boolean;
		} = {}
	) {
		const fullText = plainTextForEntry(entry);
		const styledHtml = styledHtmlForEntry(entry);
		const instant = options.instant ?? false;
		const nextEntry: Entry = {
			...entry,
			fullText,
			styledHtml,
			typingProgress: instant ? fullText.length : 0,
			typingComplete: instant || fullText.length === 0
		};
		history = [...history, nextEntry];
		if (options.notifyParent ?? true) {
			onCommandRun?.(entry.cmd, fullText);
		}
	}

	function onHistoryPress(e: PointerEvent) {
		const target = e.target instanceof Element ? e.target : null;
		if (!target) return;
		if (target.closest('[data-copy-email]')) {
			e.preventDefault();
			onCopyEmail();
			return;
		}
		const row = target.closest<HTMLElement>('[data-portfolio-source-index]');
		if (!row) return;
		const sourceIndex = Number.parseInt(row.dataset.portfolioSourceIndex ?? '', 10);
		if (Number.isNaN(sourceIndex)) return;
		void openPortfolioFromTerminal(sourceIndex);
	}

	async function openPortfolioFromTerminal(index: number) {
		const piece = portfolioItems[index];
		if (!piece) return;
		if (piece.locked) {
			pendingLockedPortfolioIndex = index;
			pushEntry({
				id: createEntryId(),
				cmd: `open ${piece.title}`,
				kind: 'system',
				message: 'Password:'
			});
			inputValue = '';
			await tick();
			focusPrompt();
			return;
		}

		pendingLockedPortfolioIndex = null;
		inputValue = '';
		pushEntry({
			id: createEntryId(),
			cmd: `open ${piece.title}`,
			kind: 'system',
			message: `Opening: ${piece.title}`
		});
		navigatedAway = true;
		blurPrompt();
		onOpenPortfolio(index);
	}

	async function handlePasswordSubmit(snapshot: string) {
		const idx = pendingLockedPortfolioIndex;
		if (idx === null) return;

		const passwordAttempt = snapshot.trim();
		inputValue = '';
		if (!passwordAttempt) return;

		const piece = portfolioItems[idx];
		if (!piece?.encryptedPayload) {
			pushEntry({
				id: createEntryId(),
				cmd: 'password',
				kind: 'error',
				message: 'This piece cannot be unlocked right now.'
			});
			pendingLockedPortfolioIndex = null;
			return;
		}

		const decrypted = await decryptSecurePortfolioPayload(piece.encryptedPayload, passwordAttempt);
		if (!decrypted) {
			pushEntry({
				id: createEntryId(),
				cmd: 'password',
				kind: 'error',
				message: 'That password does not match.'
			});
			pushEntry({
				id: createEntryId(),
				cmd: 'password',
				kind: 'system',
				message: 'Password:'
			});
			await tick();
			focusPrompt();
			return;
		}

		pendingLockedPortfolioIndex = null;
		inputValue = '';
		const openedTitle = decrypted.projectTitle ?? piece.title;
		pushEntry({
			id: createEntryId(),
			cmd: 'password',
			kind: 'system',
			message: `Opening: ${openedTitle}`
		});
		navigatedAway = true;
		blurPrompt();
		onOpenPortfolio(idx, true, decrypted);
	}

	async function submitCommand(snapshot?: string) {
		let value = (snapshot ?? inputValue).replace(/\r\n/g, '\n');
		if (!history.length && !value.trim()) {
			value = '--help';
		}

		if (pendingLockedPortfolioIndex !== null) {
			await handlePasswordSubmit(value);
			return;
		}

		if (!value.trim()) return;

		const parsed = parseCommand(value);
		inputValue = '';

		switch (parsed.type) {
			case 'help':
				pushEntry({ id: createEntryId(), cmd: value, kind: 'help' });
				break;
			case 'about':
				pushEntry({ id: createEntryId(), cmd: value, kind: 'about' });
				break;
			case 'contact':
				pushEntry({ id: createEntryId(), cmd: value, kind: 'contact' });
				break;
			case 'portfolio_list':
				pushEntry({ id: createEntryId(), cmd: value, kind: 'portfolio' });
				break;
			case 'portfolio_jump': {
				const idx = findPortfolioIndex(parsed.query);
				if (idx === null) {
					pushEntry({
						id: createEntryId(),
						cmd: value,
						kind: 'error',
						message: `No piece matched "${parsed.query}". Try --portfolio first.`
					});
				} else {
					await openPortfolioFromTerminal(idx);
				}
				break;
			}
			default:
				pushEntry({
					id: createEntryId(),
					cmd: value,
					kind: 'error',
					message: `Unknown command: ${parsed.line}. Try --help.`
				});
		}

		await tick();
		if (!navigatedAway) {
			focusPrompt();
		}
		navigatedAway = false;
	}

	function onSubmit(e: SubmitEvent) {
		e.preventDefault();
		const form = e.currentTarget;
		if (!(form instanceof HTMLFormElement)) return;
		const data = new FormData(form);
		const snapshot = String(data.get('command') ?? inputValue);
		void submitCommand(snapshot);
	}

	afterUpdate(() => {
		if (historyEl) {
			historyEl.scrollTop = historyEl.scrollHeight;
		}

		const lastEntry = history[history.length - 1];
		if (lastEntry && !lastEntry.typingComplete && lastEntry.id !== lastTypingEntryId) {
			lastTypingEntryId = lastEntry.id;
			startTyping(lastEntry.id);
		}
	});

	onDestroy(() => {
		clearTypingTimer();
	});
</script>

<div class="mobile-cli">
	<div class="mobile-cli__history" bind:this={historyEl} on:pointerup={onHistoryPress}>
		{#if history.length}
			{#each history as entry (entry.id)}
				<div class="mobile-cli__entry">
					<div class="mobile-cli__cmd">$ {entry.cmd}</div>
					<pre class="mobile-cli__typewriter">{@html entry.typingComplete
							? entry.styledHtml
							: sliceStyledHtml(entry.styledHtml, entry.typingProgress)}</pre>
				</div>
			{/each}
		{/if}
	</div>

	<form class="mobile-cli__prompt" on:submit={onSubmit}>
		<label class="mobile-cli__label" for={commandInputId}>
			{promptLabel}
		</label>
		{#if pendingLockedPortfolioIndex !== null}
			<input
				id={commandInputId}
				name="command"
				bind:this={inputEl}
				bind:value={inputValue}
				class="mobile-cli__input"
				type="password"
				autocomplete="off"
				autocapitalize="off"
				autocorrect="off"
				spellcheck={false}
				inputmode="text"
				enterkeyhint="go"
				placeholder="Enter password"
				on:pointerdown={handlePromptInteract}
				on:focus={handlePromptInteract}
			/>
		{:else}
			<input
				id={commandInputId}
				name="command"
				bind:this={inputEl}
				bind:value={inputValue}
				class="mobile-cli__input"
				type="text"
				autocomplete="off"
				autocapitalize="off"
				autocorrect="off"
				spellcheck={false}
				inputmode="text"
				enterkeyhint="go"
				placeholder=""
				on:pointerdown={handlePromptInteract}
				on:focus={handlePromptInteract}
			/>
		{/if}
		<button type="submit" class="mobile-cli__submit">Return</button>
	</form>
</div>

<style>
	.mobile-cli {
		--mobile-cli-body-font-size: 16px;
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		font-family: 'IBM Plex Mono', ui-monospace, monospace;
		font-size: var(--mobile-cli-body-font-size);
		line-height: 1.4;
		color: var(--bg-color);
	}

	.mobile-cli__history {
		flex: 1 1 auto;
		min-height: 0;
		overflow-y: auto;
		padding: 0.75rem 0.85rem 0.25rem 0.75rem;
		-webkit-overflow-scrolling: touch;
	}

	.mobile-cli__entry {
		margin-bottom: 1rem;
	}

	.mobile-cli__entry:last-child {
		margin-bottom: 0;
	}

	.mobile-cli__cmd {
		color: var(--cli-terminal-muted-fg);
		margin-bottom: 0.2rem;
	}

	.mobile-cli__typewriter {
		display: block;
		margin: 0;
		padding: 0;
		color: var(--cli-terminal-body-fg);
		white-space: pre-wrap;
		word-break: break-word;
		overflow-wrap: anywhere;
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
		tab-size: 2;
	}

	.mobile-cli__typewriter :global(.cli-t-bold) {
		font-weight: 600;
		color: var(--bg-color);
	}

	.mobile-cli__typewriter :global(.cli-t-cmd) {
		color: var(--palette-rainbow-on-ink-4, var(--palette-rainbow-4));
		font-weight: 500;
	}

	.mobile-cli__typewriter :global(.cli-t-err) {
		color: var(
			--palette-rainbow-on-ink-err,
			color-mix(in srgb, var(--palette-rainbow-1) 88%, var(--palette-white-pure))
		);
	}

	.mobile-cli__typewriter :global(.cli-t-link) {
		color: var(--palette-rainbow-on-ink-6, var(--palette-rainbow-6));
		text-decoration: underline;
		text-underline-offset: 2px;
		cursor: pointer;
	}

	.mobile-cli__typewriter :global(.cli-t-portfolio-heading) {
		display: inline-block;
		margin: 0.25rem 0 0.1rem;
		color: var(--cli-terminal-muted-fg);
		font-size: 0.73em;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.mobile-cli__typewriter :global(.cli-t-portfolio-row) {
		display: flex;
		align-items: center;
		min-height: 30px;
		cursor: pointer;
	}

	.mobile-cli__typewriter :global(.cli-t-bullet) {
		color: var(--cli-terminal-muted-fg);
		margin-right: 0.35rem;
	}

	.mobile-cli__typewriter :global(.cli-t-item) {
		color: var(--palette-rainbow-on-ink-6, var(--palette-rainbow-6));
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.mobile-cli__typewriter :global(.cli-t-item-labels) {
		color: var(--cli-terminal-muted-fg);
		font-size: 0.78em;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.mobile-cli__typewriter :global(.cli-t-about-wrap) {
		display: block;
		width: 100%;
		max-width: 100%;
		overflow-x: hidden;
		overflow-y: visible;
	}

	.mobile-cli__typewriter :global(.cli-t-about-ascii-block) {
		display: block;
		margin: 0;
		padding: 0;
		width: max-content;
		/*
		 * 170 chars wide — scale so each character is roughly 0.6 × font-size.
		 * On a 390px iPhone with ~12px padding each side: (390−24)/170/0.6 ≈ 3.6px.
		 * Using vw keeps it proportional; the min() caps it on wider viewports.
		 */
		font-size: min(calc((100vw - 2rem) / 170 / 0.6), 2.8px);
		line-height: 1.35;
		letter-spacing: 0;
		font-variant-ligatures: none;
		white-space: pre;
		tab-size: 2;
		color: var(--cli-terminal-body-fg);
		transform-origin: top left;
	}

	.mobile-cli__typewriter :global(.cli-t-about-bio) {
		display: block;
		margin: 0.75rem 0 0;
		max-width: 65ch;
		white-space: normal;
		overflow-wrap: anywhere;
		word-break: break-word;
		color: var(--cli-terminal-body-fg);
	}

	.mobile-cli__typewriter :global(.cli-type-cursor) {
		display: inline-block;
		width: max(2px, 0.4ch);
		height: 1.15em;
		margin-left: 0.12em;
		vertical-align: text-bottom;
		background-color: var(--cli-terminal-body-fg);
		animation: cli-type-cursor-blink 1s steps(1, end) infinite;
	}

	@keyframes cli-type-cursor-blink {
		0%,
		45% {
			opacity: 1;
		}
		50%,
		100% {
			opacity: 0;
		}
	}

	.mobile-cli__prompt {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.5rem;
		padding: 0.7rem 0.85rem calc(0.75rem + env(safe-area-inset-bottom, 0px)) 0.75rem;
		border-top: 1px solid var(--cli-terminal-divider-fg);
		flex-shrink: 0;
	}

	.mobile-cli__label {
		color: var(--cli-terminal-muted-fg);
	}

	.mobile-cli__input {
		min-width: 0;
		border: none;
		background: transparent;
		color: var(--bg-color);
		font: inherit;
		font-size: var(--mobile-cli-body-font-size);
		line-height: 1.4;
		outline: none;
		caret-color: var(--cli-terminal-body-fg);
		-webkit-user-select: text;
		user-select: text;
	}

	.mobile-cli__submit {
		border: none;
		background: none;
		padding: 0;
		color: var(--cli-terminal-subtle-fg);
		font: inherit;
		font-size: 0.55rem;
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		white-space: nowrap;
		cursor: pointer;
	}
</style>
