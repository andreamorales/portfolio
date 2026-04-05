<script lang="ts">
	import { scrollFadeEntry } from '$lib/actions/scrollFadeEntry';

	export let history: Array<any> = [];
	export let lastEntry: any = null;
	export let portfolioItems: Array<any> = [];
	export let portfolioPickIndex = 0;
	export let showReturnHint = true;
	export let outputId = 'cli-output-region';
	export let scrollLogEl: HTMLDivElement | null = null;
	export let sliceStyledHtml: (html: string, maxChars: number) => string = (html) => html;
	export let portfolioListStyledHtml: (items: Array<any>, activeIndex: number) => string = () => '';
</script>

<div class="cli-history-wrap" class:cli-history-wrap--empty={!history.length} id={outputId}>
	<div
		bind:this={scrollLogEl}
		class="cli-history-scroll"
		class:cli-history-scroll--compact={showReturnHint}
		role="log"
		aria-live="polite"
		aria-relevant="additions"
	>
		{#each history as entry (entry.id)}
			{#if entry.feedback.kind === 'about'}
				<div class="cli-history-entry">
					<div class="cli-history-cmd">$ {entry.cmd}</div>
					<div class="cli-history-result">
						{#if !entry.typingComplete}
							<pre class="cli-typewriter">{@html sliceStyledHtml(
									entry.styledHtml,
									entry.typingProgress
								)}</pre>
						{:else}
							<pre class="cli-typewriter cli-typewriter--done">{@html entry.styledHtml}</pre>
						{/if}
					</div>
				</div>
			{:else}
				<div class="cli-history-entry" use:scrollFadeEntry={{ root: scrollLogEl }}>
					<div class="cli-history-cmd">$ {entry.cmd}</div>
					<div class="cli-history-result">
						{#if !entry.typingComplete}
							<pre class="cli-typewriter">{@html sliceStyledHtml(
									entry.styledHtml,
									entry.typingProgress
								)}</pre>
						{:else}
							<pre class="cli-typewriter cli-typewriter--done">{@html entry.feedback.kind ===
									'portfolio' && entry.id === lastEntry?.id
									? portfolioListStyledHtml(portfolioItems, portfolioPickIndex)
									: entry.styledHtml}</pre>
						{/if}
					</div>
				</div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.cli-history-wrap {
		margin: 0;
		padding: 0.5rem 0.65rem 0.65rem 0.75rem;
	}

	.cli-history-wrap--empty {
		padding: 0;
	}

	.cli-history-wrap--empty .cli-history-scroll {
		max-height: 0;
		overflow: hidden;
	}

	:global(.cli-terminal-window--bottom-prompt) .cli-history-wrap {
		flex: 1 1 auto;
		min-height: 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		padding-bottom: 0;
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

	.cli-history-scroll--compact {
		flex: none;
		max-height: min(14rem, 42vh);
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

	/* Keep output flush with the bottom prompt divider. */
	:global(.cli-terminal-window--bottom-prompt) .cli-history-entry:last-child .cli-history-result {
		padding-bottom: 0;
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

	.cli-typewriter :global(.cli-t-portfolio-heading) {
		display: inline-block;
		margin: 0.25rem 0 0.1rem;
		color: var(--cli-terminal-muted-fg);
		font-size: 0.73em;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
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
		color: var(--palette-rainbow-on-ink-4, var(--palette-rainbow-4));
	}

	.cli-typewriter :global(.cli-t-item) {
		transition: color 0.12s ease;
	}

	/* Past --portfolio blocks stay clickable (not only when that command is "active"). */
	.cli-typewriter :global(.cli-t-portfolio-row) {
		cursor: pointer;
	}

	.cli-typewriter :global(.cli-t-portfolio-row:hover .cli-t-item) {
		font-weight: 600;
	}

	.cli-typewriter :global(.cli-t-item--active) {
		color: var(--bg-color);
	}

	.cli-typewriter :global(.cli-t-item-labels) {
		color: var(--cli-terminal-muted-fg);
	}

	.cli-typewriter :global(.cli-t-about-wrap) {
		display: block;
		margin: 0;
		padding: 0;
		width: 100%;
		max-width: 100%;
		overflow-x: auto;
		overflow-y: visible;
		-webkit-overflow-scrolling: touch;
		font-family: inherit;
		color: inherit;
		background: transparent;
		border: none;
		box-sizing: border-box;
	}

	.cli-typewriter :global(.cli-t-about-ascii-block) {
		display: block;
		margin: 0;
		padding: 0;
		width: max-content;
		max-width: 100%;
		font-size: calc(1.45 * clamp(0.07rem, 0.1vw + 0.04rem, 0.16rem));
		line-height: 1;
		letter-spacing: 0;
		font-variant-ligatures: none;
		white-space: pre;
		tab-size: 2;
	}

	.cli-typewriter :global(.cli-t-about-bio) {
		display: block;
		margin: 0.75rem 0 0;
		padding: 0;
		max-width: 65ch;
		font-family: inherit;
		font-size: inherit;
		font-weight: inherit;
		line-height: 1.5;
		letter-spacing: inherit;
		color: inherit;
		white-space: normal;
		overflow-wrap: anywhere;
		word-break: break-word;
	}

	/* :global — cursor HTML is injected via sliceStyledHtml so it sits in-flow at the slice point */
	.cli-typewriter :global(.cli-type-cursor) {
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
</style>
