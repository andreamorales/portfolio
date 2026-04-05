<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { theme } from '$lib/stores/theme';

	$: isDark = $theme === 'dark-theme';

	let host: HTMLDivElement;

	onMount(() => {
		if (host && host.parentNode !== document.body) {
			/* Portal to body so fixed positioning stacks above page chrome. */
			document.body.appendChild(host);
		}
	});

	onDestroy(() => {
		// eslint-disable-next-line svelte/no-dom-manipulating -- portal cleanup
		host?.remove();
	});
</script>

{#if browser}
	<div class="theme-toggle-portal" bind:this={host}>
		<button
			class="theme-toggle"
			on:click={() => theme.toggle()}
			aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
			title={isDark ? 'Light mode' : 'Dark mode'}
		>
			{#if isDark}
				<!-- Pixel sun -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					width="20"
					height="20"
					fill="currentColor"
					aria-hidden="true"
					style="image-rendering: pixelated"
				>
					<!-- center body -->
					<rect x="5" y="5" width="6" height="6" />
					<!-- cardinal rays -->
					<rect x="7" y="1" width="2" height="3" />
					<rect x="7" y="12" width="2" height="3" />
					<rect x="1" y="7" width="3" height="2" />
					<rect x="12" y="7" width="3" height="2" />
					<!-- diagonal ray dots -->
					<rect x="2" y="2" width="2" height="2" />
					<rect x="12" y="2" width="2" height="2" />
					<rect x="2" y="12" width="2" height="2" />
					<rect x="12" y="12" width="2" height="2" />
				</svg>
			{:else}
				<!-- Pixel crescent moon (C-shape, 7×7 grid at 3px/pixel = 21×21) -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 21 21"
					width="20"
					height="20"
					fill="currentColor"
					aria-hidden="true"
					style="image-rendering: pixelated"
				>
					<rect x="6" y="0" width="9" height="3" />
					<rect x="3" y="3" width="15" height="3" />
					<rect x="0" y="6" width="9" height="3" />
					<rect x="0" y="9" width="6" height="3" />
					<rect x="0" y="12" width="9" height="3" />
					<rect x="3" y="15" width="15" height="3" />
					<rect x="6" y="18" width="9" height="3" />
				</svg>
			{/if}
		</button>
	</div>
{/if}

<style>
	.theme-toggle-portal {
		position: fixed;
		bottom: calc(2rem + 1px + var(--spacing-sm));
		left: 2rem;
		z-index: 10050;
		margin: 0;
		padding: 0;
		border: none;
		background: none;
		pointer-events: none;
	}

	.theme-toggle {
		display: flex;
		align-items: flex-end;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		color: var(--text-color);
		opacity: 0.5;
		transition: opacity 0.15s ease;
		line-height: 0;
		pointer-events: auto;
	}

	.theme-toggle:hover {
		opacity: 1;
	}

	.theme-toggle:focus-visible {
		outline: 2px solid var(--text-color);
		outline-offset: 3px;
	}
</style>
