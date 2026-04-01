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
		gap: var(--spacing-md);
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
		padding: 0 var(--spacing-sm) 0 0 !important;
		margin: 0 !important;
		text-align: left;
		gap: 0.45rem;
		border-radius: var(--radius-xs);
		flex-wrap: nowrap;
		min-width: 0;
		min-height: 0 !important;
		height: auto !important;
		line-height: 1;
	}

	.portfolio-header:hover h2 {
		color: var(--cursor-indigo);
	}

	.portfolio-header h2 {
		color: var(--text-color);
		font-family: var(--font-family);
		font-size: 17px;
		font-style: normal;
		font-weight: 370;
		line-height: 17px;
		letter-spacing: 0.35px;
		text-decoration: none;
		margin: 0;
		transition: color var(--transition);
		font-variation-settings:
			'CASL' 0,
			'wght' 370;
		background-color: var(--bg-color);
		padding: 0;
		border-radius: var(--radius-2xs);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		flex-shrink: 1;
		min-width: 0;
		background-repeat: no-repeat;
		background-image:
			linear-gradient(2deg, rgba(93, 103, 233, 0.15), rgba(93, 103, 233, 0.18)),
			linear-gradient(1.5deg, rgba(93, 103, 233, 0.12), rgba(93, 103, 233, 0.15));
		background-position:
			0 62%,
			0 66%;
		background-size:
			100% 0.5em,
			98% 0.45em;
		-webkit-mask-image:
			radial-gradient(5px at 92% 65%, transparent 92%, #000 100%),
			radial-gradient(3px at 78% 63%, transparent 93%, #000 100%),
			radial-gradient(4px at 62% 67%, transparent 91%, #000 100%),
			radial-gradient(3px at 45% 64%, transparent 94%, #000 100%),
			radial-gradient(5px at 30% 66%, transparent 92%, #000 100%),
			radial-gradient(3px at 15% 63%, transparent 93%, #000 100%),
			radial-gradient(4px at 5% 67%, transparent 91%, #000 100%),
			linear-gradient(#000 0 0);
		mask-image:
			radial-gradient(5px at 92% 65%, transparent 92%, #000 100%),
			radial-gradient(3px at 78% 63%, transparent 93%, #000 100%),
			radial-gradient(4px at 62% 67%, transparent 91%, #000 100%),
			radial-gradient(3px at 45% 64%, transparent 94%, #000 100%),
			radial-gradient(5px at 30% 66%, transparent 92%, #000 100%),
			radial-gradient(3px at 15% 63%, transparent 93%, #000 100%),
			radial-gradient(4px at 5% 67%, transparent 91%, #000 100%),
			linear-gradient(#000 0 0);
	}

	.tags {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		flex-wrap: nowrap;
		flex-shrink: 0;
	}

	.tags :global(.label) {
		padding: 0 6px;
		border-radius: var(--radius-md);
		font-size: 0.55rem;
		line-height: 1;
	}

	@media (max-width: 768px) {
		.overview-portfolio-list {
			padding-bottom: 4rem;
		}

		.portfolio-header {
			padding-right: 0;
			gap: 0.25rem;
			align-items: flex-start;
			flex-direction: column;
		}

		.portfolio-header h2 {
			font-size: 1rem;
			line-height: 1.2em;
			margin: 0;
			min-width: 0;
		}

		.tags {
			gap: 0.15rem;
			flex-wrap: wrap;
			flex-shrink: 1;
		}
	}
</style>
