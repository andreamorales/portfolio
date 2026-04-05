<script lang="ts">
	import { fade } from 'svelte/transition';
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
				<div id={`portfolio-content-${index}`} class="portfolio-content immersive">
					<PortfolioExpandedView
						projectTitle={item.title}
						titleId={`immersive-piece-title-${index}`}
						tags={item.tags}
						description={item.description}
						images={item.images}
						content={item.content}
						year={item.year}
						role={item.role}
						link={item.link}
						metrics={item.metrics}
						team={item.team}
						locked={item.locked}
						encryptedPayload={item.encryptedPayload}
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
		background-color: transparent;
		border: none;
		border-radius: 0;
		box-shadow: none;
		overflow: visible;
	}

	.portfolio-content {
		font-family: var(--font-recursive);
		font-weight: 400;
		font-variation-settings:
			'CASL' 0,
			'wght' 400;
		position: relative;
		z-index: 5;
		background-color: transparent;
		border: none;
		border-radius: 0;
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
			border-radius: 0;
		}
	}
</style>
