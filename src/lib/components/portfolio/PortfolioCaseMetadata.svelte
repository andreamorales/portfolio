<script lang="ts">
	import {
		normalizePortfolioMetrics,
		type PortfolioMetricInput
	} from '$lib/utils/portfolioMetrics';

	export let year = '';
	export let link = '';
	export let metrics: PortfolioMetricInput[] | string[] = [];
	/** 'page' matches the main column; 'embedded' sits above slides (full-width row). */
	export let variant: 'page' | 'embedded' = 'page';

	$: impactMetrics = normalizePortfolioMetrics(metrics);
	$: impactsToShow = impactMetrics.slice(0, 2);
	$: impactsUsePixelMarks = impactsToShow.length > 1;
</script>

<div
	class="portfolio-case-metadata"
	class:portfolio-case-metadata--embedded={variant === 'embedded'}
>
	<div class="case-meta">
		<div class="case-meta-stack">
			<div class="case-meta-field">
				<div class="case-meta-label-block">
					<div class="details-label">Timeline</div>
					<div class="details-label-rule" aria-hidden="true"></div>
				</div>
				<div class="details-value">{year || '—'}</div>
			</div>
			<div class="case-meta-field">
				<div class="case-meta-label-block">
					<div class="details-label">Link</div>
					<div class="details-label-rule" aria-hidden="true"></div>
				</div>
				<div class="details-value">
					{#if link === 'Discontinued'}
						<span class="discontinued-text">Discontinued</span>
					{:else if link}
						<a href={link} target="_blank" rel="noopener noreferrer" class="project-link"
							>View Project</a
						>
					{:else}
						<span class="muted-text">Not Available</span>
					{/if}
				</div>
			</div>
			<div class="case-meta-field">
				<div class="case-meta-label-block">
					<div class="details-label">Impact</div>
					<div class="details-label-rule" aria-hidden="true"></div>
				</div>
				<div class="details-value impact-wrap">
					{#if impactsToShow.length > 0}
						{#each impactsToShow as m, index (`${m.text}-${index}`)}
							<p class="impact-item" class:impact-item--with-pixel-mark={impactsUsePixelMarks}>
								{#if impactsUsePixelMarks}
									<svg
										class="impact-item__pixel"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 1 1"
										width="4"
										height="4"
										fill="currentColor"
										shape-rendering="crispEdges"
										aria-hidden="true"
										style="image-rendering: pixelated"
									>
										<rect width="1" height="1" />
									</svg>
									<span class="impact-item__text">{m.text}</span>
								{:else}
									{m.text}
								{/if}
							</p>
						{/each}
					{:else}
						<span class="muted-text">—</span>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.portfolio-case-metadata {
		width: 100%;
		min-width: 0;
		max-width: 100%;
		box-sizing: border-box;
	}

	.portfolio-case-metadata--embedded {
		margin-bottom: 0;
	}

	.case-meta {
		width: 100%;
		font-family: inherit;
	}

	.case-meta-stack {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--spacing-lg);
		min-width: 0;
	}

	.case-meta-field {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		min-width: 0;
		width: 100%;
	}

	.case-meta-label-block {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xxs);
		width: 100%;
		min-width: 0;
	}

	.details-label-rule {
		margin: 0;
		align-self: stretch;
		flex-shrink: 0;
		height: 0;
		border: none;
		border-top: 1px solid var(--portfolio-metadata-rule);
	}

	.details-label {
		font-size: var(--font-size-xxs);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		line-height: 1.35;
		color: var(--palette-grey-600);
		font-variation-settings:
			'CASL' 0,
			'wght' 600;
	}

	.details-value {
		font-size: var(--font-size-base);
		line-height: 1.6;
		letter-spacing: -0.01em;
		color: var(--text-color);
		font-variation-settings:
			'CASL' 0,
			'wght' 370;
		word-wrap: break-word;
	}

	.project-link {
		color: var(--palette-rainbow-6);
		text-decoration: underline;
		text-underline-offset: 3px;
		transition: opacity var(--transition);
	}

	.project-link:hover {
		opacity: 0.75;
	}

	.muted-text {
		color: var(--muted-text);
		font-style: italic;
	}

	.discontinued-text {
		color: var(--muted-text);
		font-style: italic;
		font-variation-settings:
			'CASL' 0,
			'wght' 400;
	}

	.impact-wrap {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		min-width: 0;
	}

	.impact-item {
		margin: 0;
		font-size: inherit;
		line-height: inherit;
		font-variation-settings: inherit;
		color: inherit;
	}

	.impact-item--with-pixel-mark {
		display: flex;
		align-items: flex-start;
		gap: var(--spacing-xxs);
		min-width: 0;
	}

	.impact-item__pixel {
		flex-shrink: 0;
		display: block;
		margin-top: 0.32em;
		opacity: 0.72;
	}

	:global(html.dark-theme) .impact-item__pixel {
		opacity: 0.82;
	}

	.impact-item__text {
		min-width: 0;
	}

	:global(html.dark-theme) .details-value {
		letter-spacing: 0.03em;
		font-variation-settings:
			'CASL' 0,
			'wght' 360;
	}

	:global(html.dark-theme) .details-label {
		color: var(--palette-grey-hint);
	}

	@media (max-width: 768px) {
		.details-label {
			font-size: var(--font-size-xxs);
			line-height: 1.4;
		}

		.details-value {
			font-size: var(--font-size-base);
			line-height: 1.38;
		}
	}
</style>
