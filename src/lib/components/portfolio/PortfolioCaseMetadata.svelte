<script lang="ts">
	export let year = '';
	export let role = '';
	export let link = '';
	export let metrics: string[] = [];
	export let team: Array<{ role: string; name: string; relationship: string }> = [];
	/** 'page' matches the main column; 'embedded' sits above slides (full-width row). */
	export let variant: 'page' | 'embedded' = 'page';
</script>

<div class="portfolio-case-metadata" class:portfolio-case-metadata--embedded={variant === 'embedded'}>
	<div class="project-details-grid">
		<div class="details-row">
			<div class="details-cell">
				<div class="details-label">Year</div>
				<div class="details-value">{year}</div>
			</div>
			<div class="details-cell">
				<div class="details-label">Role</div>
				<div class="details-value">{role}</div>
			</div>
			<div class="details-cell">
				<div class="details-label">Link</div>
				<div class="details-value">
					{#if link === 'Discontinued'}
						<span class="discontinued-text">Discontinued</span>
					{:else if link}
						<a href={link} target="_blank" rel="noopener noreferrer" class="project-link">View Project</a>
					{:else}
						<span class="muted-text">Not Available</span>
					{/if}
				</div>
			</div>
		</div>
		<div class="details-row metrics-row">
			{#each metrics.slice(0, 2) as metric, index (`${metric}-${index}`)}
				<div class="details-cell">
					<div class="details-label">Impact</div>
					<div class="details-value">{metric}</div>
				</div>
			{/each}
			<div class="details-cell">
				<div class="details-label">Team</div>
				<div class="details-value team-list">
					{#if team && team.length > 0}
						{#each team as member (`${member.role}-${member.name}`)}
							<div class="team-member">
								<span class="role">{member.role}:</span>
								<span class="name">{member.name}</span>
								<span class="relationship">({member.relationship})</span>
							</div>
						{/each}
					{:else}
						<span class="muted-text">Solo project</span>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.portfolio-case-metadata {
		width: 100%;
	}

	.portfolio-case-metadata--embedded {
		margin-bottom: 0;
	}

	.project-details-grid {
		width: 100%;
		background-color: transparent;
		font-family: inherit;
		border-top: 1px solid var(--black);
	}

	.details-row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border-bottom: 1px solid var(--black);
	}

	.details-row:first-child {
		border-bottom: none;
	}

	.metrics-row {
		border-top: 1px solid var(--black);
	}

	.details-cell {
		display: flex;
		flex-direction: column;
		padding: var(--spacing-sm);
		border-right: 1px solid var(--black);
	}

	.details-cell:last-child {
		border-right: none;
	}

	.details-label {
		font-size: var(--font-size-xxs);
		color: var(--palette-grey-600);
		font-variation-settings:
			'CASL' 0,
			'wght' 400;
	}

	.details-value {
		font-size: var(--font-size-sm);
		color: var(--text-color);
		font-variation-settings:
			'CASL' 0,
			'wght' 500;
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

	.team-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xxs);
	}

	.team-member {
		font-size: var(--font-size-xs);
		line-height: 1.4;
		padding-left: 0;
		position: relative;
	}

	.team-list:has(.team-member:nth-child(2)) .team-member {
		padding-left: var(--spacing-sm);
	}

	.team-list:has(.team-member:nth-child(2)) .team-member::before {
		content: '•';
		position: absolute;
		left: 0;
		color: var(--palette-grey-600);
	}

	.role {
		color: var(--text-color);
		font-variation-settings:
			'CASL' 0,
			'wght' 500;
	}

	.name,
	.relationship {
		color: var(--palette-grey-600);
	}

	.relationship {
		font-style: italic;
	}

	:global(html.dark-theme) .details-label,
	:global(html.dark-theme) .name,
	:global(html.dark-theme) .relationship {
		color: var(--palette-grey-hint);
	}

	:global(html.dark-theme) .details-value {
		font-variation-settings:
			'CASL' 0,
			'wght' 460;
	}

	:global(html.dark-theme) .role {
		color: var(--text-color);
	}

	:global(html.dark-theme) .team-list:has(.team-member:nth-child(2)) .team-member::before {
		color: var(--palette-grey-hint);
	}

	@media (max-width: 768px) {
		.details-label {
			font-size: var(--font-size-base);
			line-height: 1.4;
		}

		.details-value {
			font-size: var(--font-size-base);
			line-height: 1.45;
		}

		.team-member {
			font-size: var(--font-size-base);
			line-height: 1.4;
		}
	}

	@media (max-width: 600px) {
		.project-details-grid {
			border-left: 1px solid var(--black);
			border-right: 1px solid var(--black);
		}

		.details-row {
			grid-template-columns: 1fr;
		}

		.details-cell:not(:last-child) {
			border-right: none;
			border-bottom: 1px solid var(--black);
		}

		.metrics-row .details-cell:nth-last-child(2) {
			border-bottom: none;
		}

		.metrics-row .details-cell:last-child {
			border-top: 1px solid var(--black);
		}
	}
</style>
