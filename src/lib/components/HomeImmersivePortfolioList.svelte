<script lang="ts">
	import { fade } from 'svelte/transition';
	import Label from '$lib/components/ui/input/Label.svelte';
	import PortfolioExpandedView from '$lib/components/portfolio/PortfolioExpandedView.svelte';
	import type { PortfolioItem } from '$lib/data/portfolio-items.js';

	export let items: PortfolioItem[] = [];
</script>

<div class="immersive-portfolio-list" in:fade={{ duration: 250 }}>
	{#each items as item, index (item.title)}
		<section
			id={`immersive-piece-${index}`}
			class="immersive-piece"
			aria-labelledby={`immersive-piece-title-${index}`}
		>
			<div class="piece-shell">
				<div class="piece-header">
					<div class="piece-header-row">
						<h2 id={`immersive-piece-title-${index}`} class="piece-title">{item.title}</h2>
						<div class="tags">
							{#each item.tags as tag (`${item.title}-${tag}`)}
								<Label text={tag} variant="semisolid" color="default" />
							{/each}
						</div>
					</div>
				</div>

				<div id={`portfolio-content-${index}`} class="portfolio-content immersive">
					<PortfolioExpandedView
						title={item.title}
						description={item.description}
						images={item.images}
						content={item.content}
						year={item.year}
						role={item.role}
						link={item.link}
						metrics={item.metrics}
						team={item.team}
						immersive={true}
					/>
				</div>
			</div>
		</section>
	{/each}
</div>

<style>
	.immersive-portfolio-list {
		display: flex;
		flex-direction: column;
		gap: 3rem;
		padding-bottom: 8rem;
		position: relative;
		z-index: 6;
	}

	.immersive-piece {
		min-height: calc(100vh - 7rem);
		scroll-margin-top: 6rem;
		display: flex;
		align-items: stretch;
	}

	.piece-shell {
		width: 100%;
		background-color: var(--bg-color);
		border: 1px solid var(--grey-darker);
		border-radius: 12px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}

	.piece-header {
		padding: 1.5rem 1.5rem 0;
	}

	.piece-header-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.piece-title {
		margin: 0;
		font-family: var(--font-family);
		font-size: clamp(1.5rem, 2vw, 2rem);
		line-height: 1;
		font-variation-settings:
			'CASL' 0,
			'wght' 420;
	}

	.tags {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		flex-wrap: nowrap;
		flex-shrink: 0;
	}

	.portfolio-content {
		font-family: var(--font-recursive);
		font-weight: 400;
		font-variation-settings:
			'CASL' 0,
			'wght' 400;
		position: relative;
		z-index: 5;
		background-color: var(--bg-color);
		border: 1px solid var(--grey-darker);
		border-radius: 4px;
		width: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
	}

	.portfolio-content.immersive {
		border: none;
		border-radius: 0;
	}

	.portfolio-content > :global(*) {
		width: 100%;
		max-width: 100%;
	}

	@media (max-width: 768px) {
		.immersive-portfolio-list {
			gap: 1.5rem;
			padding-bottom: 10rem;
		}

		.immersive-piece {
			min-height: auto;
		}

		.piece-shell {
			border-radius: 8px;
		}

		.piece-header {
			padding: 1rem 1rem 0;
		}
	}
</style>
