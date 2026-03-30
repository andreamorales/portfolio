<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { PortfolioItem } from '$lib/data/portfolio-items.js';

	export let isOpen = false;
	export let activeIndex = 0;
	export let items: PortfolioItem[] = [];
	export let colibri: string;
	export let onToggle: () => void;
	export let onSelect: (index: number) => void;

	function splitTitle(title: string) {
		const parts = title.split(':');
		if (parts.length > 1) {
			return {
				main: parts[0].trim(),
				descriptor: parts.slice(1).join(':').trim()
			};
		}

		return {
			main: title,
			descriptor: ''
		};
	}
</script>

<div class="immersive-topbar" in:fade={{ duration: 250 }}>
	<button
		class="immersive-brand"
		on:click={onToggle}
		aria-expanded={isOpen}
		aria-controls="portfolio-menu"
		aria-label="Toggle portfolio navigation"
	>
		<span class="brand-button"> Andy Morales </span>
		<span class="bird-menu-button">
			<img src={colibri} alt="" class="topbar-colibri-image" />
		</span>
	</button>

	{#if isOpen}
		<div id="portfolio-menu" class="immersive-nav-menu" transition:fade={{ duration: 150 }}>
			{#each items as item, index (item.title)}
				{@const titleParts = splitTitle(item.title)}
				<button
					class="immersive-nav-item {activeIndex === index ? 'active' : ''}"
					on:click={() => onSelect(index)}
				>
					<div class="immersive-nav-item-content">
						<div class="immersive-preview-copy">
							<div class="immersive-title-main">{titleParts.main}</div>
							{#if titleParts.descriptor}
								<div class="immersive-title-descriptor">{titleParts.descriptor}</div>
							{/if}
						</div>
						<div class="immersive-preview-thumbnail">
							{#if item.quickNavThumbnail}
								<img src={item.quickNavThumbnail} alt={item.title} />
							{/if}
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.immersive-topbar {
		position: sticky;
		top: 1.5rem;
		z-index: 12;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.75rem;
		width: fit-content;
		margin-bottom: 1.5rem;
	}

	.immersive-brand {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 40px;
		padding: 0.75rem 1rem;
		background-color: var(--bg-color);
		color: var(--text-color);
		border: 2px solid var(--text-color);
		border-radius: 4px;
		box-shadow: 4px 4px 0px 0px var(--grey-mid);
		font-family: var(--font-recursive);
		font-variation-settings:
			'CASL' 0,
			'wght' 600;
	}

	.brand-button,
	.bird-menu-button,
	.immersive-nav-item {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
	}

	.brand-button {
		font-family: var(--font-refract);
		font-size: 1.35rem;
		font-weight: 400;
		line-height: 0.9;
		letter-spacing: -0.02em;
		font-feature-settings:
			'dlig' on,
			'ss01' on;
		color: var(--text-color);
		cursor: pointer;
		text-align: left;
	}

	.topbar-colibri-image {
		width: 44px;
		height: auto;
		display: block;
	}

	.bird-menu-button {
		cursor: pointer;
		transform: translateY(-0.05rem);
	}

	.immersive-nav-menu {
		display: inline-flex;
		flex-direction: column;
		align-self: flex-start;
		inline-size: max-content;
		max-inline-size: min(80vw, 32ch);
		gap: 0;
		padding: 0;
		background-color: var(--bg-color);
		color: var(--text-color);
		border: 2px solid var(--text-color);
		border-radius: 4px;
		box-shadow: 4px 4px 0px 0px var(--grey-mid);
		overflow: hidden;
	}

	.immersive-nav-item {
		width: 100%;
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: 0;
		color: var(--text-color);
		font-family: var(--font-recursive);
		cursor: pointer;
		text-align: left;
		transition: all var(--transition-fast) var(--easing-standard);
		margin: 0;
	}

	.immersive-nav-item-content {
		display: flex;
		align-items: center;
		gap: var(--spacing-xxl);
		width: 100%;
	}

	.immersive-nav-item:hover,
	.immersive-nav-item.active {
		background-color: var(--text-color);
		color: var(--bg-color);
	}

	.immersive-preview-copy {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		gap: var(--spacing-xxs);
		min-width: 0;
		max-inline-size: 16ch;
		overflow: hidden;
	}

	.immersive-title-main {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: inherit;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		width: 100%;
		text-align: left;
	}

	.immersive-title-descriptor {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-normal);
		color: var(--muted-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		width: 100%;
		text-align: left;
	}

	.immersive-nav-item:hover .immersive-title-descriptor,
	.immersive-nav-item.active .immersive-title-descriptor {
		color: var(--bg-color);
	}

	.immersive-preview-thumbnail {
		inline-size: 7ch;
		flex: 0 0 auto;
		margin-left: auto;
		aspect-ratio: 14 / 11;
		border-radius: 4px;
		overflow: hidden;
		background-color: var(--grey-lighter);
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--grey-light);
	}

	.immersive-preview-thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	@media (max-width: 768px) {
		.immersive-topbar {
			display: none;
		}

		.brand-button {
			font-size: 1.05rem;
		}

		.topbar-colibri-image {
			width: 34px;
		}
	}
</style>
