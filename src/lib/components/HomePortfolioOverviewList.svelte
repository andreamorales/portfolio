<script lang="ts">
	import { fade } from 'svelte/transition';
	import Label from '$lib/components/ui/input/Label.svelte';
	import type { PortfolioItem } from '$lib/data/portfolio-items.js';

	export let items: PortfolioItem[] = [];
	export let containerElement: HTMLElement | null = null;
	export let onOpen: (index: number) => void;
</script>

<div
	class="portfolio-list overview-portfolio-list"
	bind:this={containerElement}
	in:fade={{ duration: 600, delay: 1400 }}
>
	{#each items as item, index (item.title)}
		<div class="portfolio-item" in:fade={{ duration: 300, delay: 1400 + index * 150 }}>
			<button
				class="portfolio-header"
				on:click|stopPropagation={() => onOpen(index)}
				on:keydown={(e) => e.key === 'Enter' && onOpen(index)}
			>
				<h2>{item.title}</h2>
				<div class="tags">
					{#each item.tags as tag (`${item.title}-${tag}`)}
						<Label text={tag} variant="semisolid" color="default" />
					{/each}
				</div>
			</button>
		</div>
	{/each}
</div>

<style>
	.portfolio-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font-family: var(--font-recursive);
		font-variation-settings:
			'CASL' 0,
			'wght' 400;
		position: relative;
		z-index: 5;
	}

	.overview-portfolio-list {
		max-width: 720px;
		padding-bottom: 6rem;
	}

	.portfolio-item {
		position: relative;
		z-index: 5;
	}

	.portfolio-header {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		cursor: pointer;
		background-color: transparent;
		border: none;
		width: 100%;
		font-family: var(--font-recursive);
		padding: var(--spacing-xs) var(--spacing-sm) var(--spacing-xs) 0;
		margin: 0;
		text-align: left;
		gap: var(--spacing-md);
		border-radius: 4px;
		flex-wrap: nowrap;
		min-width: 0;
	}

	.portfolio-header:hover h2 {
		color: var(--cursor-indigo);
	}

	.portfolio-header h2 {
		color: var(--text-color);
		font-family: var(--font-family);
		font-size: 18px;
		font-style: normal;
		font-weight: 370;
		line-height: 18px;
		letter-spacing: 0.4px;
		text-decoration-line: underline;
		margin: 0;
		transition: color var(--transition);
		font-variation-settings:
			'CASL' 0,
			'wght' 370;
		background-color: var(--bg-color);
		padding: var(--spacing-xxs) 0;
		border-radius: 2px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		flex-shrink: 1;
		min-width: 0;
	}

	.tags {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		flex-wrap: nowrap;
		flex-shrink: 0;
	}

	@media (max-width: 768px) {
		.overview-portfolio-list {
			padding-bottom: 4rem;
		}

		.portfolio-header {
			padding-right: 0;
			gap: var(--spacing-sm);
			align-items: flex-start;
			flex-direction: column;
		}

		.portfolio-header h2 {
			font-size: 1rem;
			line-height: 1em;
			margin: 0;
			min-width: 0;
		}

		.tags {
			gap: 0.25rem;
			flex-wrap: wrap;
			flex-shrink: 1;
		}
	}
</style>
