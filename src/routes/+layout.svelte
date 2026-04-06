<script lang="ts">
	import { onMount } from 'svelte';
	import '../lib/styles/global.css';
	import { theme } from '$lib/stores/theme';

	onMount(() => {
		const stored = (localStorage.getItem('theme') as 'light-theme' | 'dark-theme') ?? 'light-theme';
		theme.set(stored);
	});
</script>

<svelte:head>
	<meta property="og:title" content="Andrea Morales - Product Design Leader" />
	<meta
		property="og:description"
		content="Produce Designer focused on creative and technical tools."
	/>
	<meta
		property="og:image"
		content="https://www.andreamoralescoto.com/images/og-preview.png?v=9"
	/>
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta
		property="og:image:alt"
		content="Andy Morales — beige background with stacked name, homepage-style terminal reading I design tools., and a small pixel smiley in the lower right"
	/>
	<meta property="og:url" content="https://www.andreamoralescoto.com" />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta
		name="twitter:image"
		content="https://www.andreamoralescoto.com/images/og-preview.png?v=9"
	/>
</svelte:head>

<div class="app-container">
	<main class="app-main">
		<slot />
	</main>
</div>

<style>
	.app-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		position: relative;
	}

	.app-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
	}
</style>
