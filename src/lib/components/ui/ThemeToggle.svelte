<script lang="ts">
	import { theme } from '$lib/stores/theme';
	$: isDark = $theme === 'dark-theme';
</script>

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
			width="16"
			height="16"
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
		<!-- Pixel crescent moon -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 14 14"
			width="14"
			height="14"
			fill="currentColor"
			aria-hidden="true"
			style="image-rendering: pixelated"
		>
			<rect x="4" y="0" width="4" height="2" />
			<rect x="2" y="2" width="6" height="2" />
			<rect x="0" y="4" width="4" height="2" />
			<rect x="0" y="6" width="4" height="2" />
			<rect x="0" y="8" width="4" height="2" />
			<rect x="2" y="10" width="6" height="2" />
			<rect x="4" y="12" width="4" height="2" />
		</svg>
	{/if}
</button>

<style>
	.theme-toggle {
		position: fixed;
		bottom: 1.25rem;
		left: 1.25rem;
		z-index: 9000;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		background-color: var(--text-color);
		color: var(--bg-color);
		border: none;
		border-radius: var(--border-radius);
		cursor: pointer;
		padding: 0;
		transition:
			background-color 0.2s ease,
			color 0.2s ease,
			opacity 0.15s ease;
		opacity: 0.55;
	}

	.theme-toggle:hover {
		opacity: 1;
	}

	.theme-toggle:focus-visible {
		outline: 2px solid var(--text-color);
		outline-offset: 2px;
	}
</style>
