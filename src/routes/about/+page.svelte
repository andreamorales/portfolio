<script lang="ts">
	import { fade } from 'svelte/transition';
</script>

<svelte:head>
	<title>About | Andy Morales</title>
	<meta name="description" content="About Andy Morales — product designer." />
</svelte:head>

<article class="about-page" in:fade={{ duration: 280 }}>
	<a class="about-back" href="/">← Back</a>
	<h1 class="about-title">About</h1>
	<p class="about-lede">
		Product designer focused on creative and technical tools — from systems thinking to shipped UI.
	</p>
	<p class="about-body">
		This site is a small terminal-flavored home for selected work and contact. Use the command line on
		the home page to explore portfolio pieces, read this page, or open links.
	</p>
</article>

<style>
	.about-page {
		max-width: 40rem;
		margin: 0 auto;
		padding: clamp(1.5rem, 4vw, 3rem);
		color: var(--text-color);
		background-color: var(--bg-color);
		min-height: 100vh;
		box-sizing: border-box;
	}

	.about-back {
		display: inline-block;
		font-family: var(--font-family);
		font-size: 0.875rem;
		color: var(--palette-grey-500);
		text-decoration: none;
		margin-bottom: 2rem;
	}

	.about-back:hover {
		color: var(--text-color);
		text-decoration: underline;
	}

	.about-title {
		font-family: 'Instrument Serif', serif;
		font-size: clamp(2rem, 4vw, 2.75rem);
		font-weight: 400;
		letter-spacing: -0.02em;
		margin: 0 0 1rem;
	}

	.about-lede {
		font-size: 1.125rem;
		line-height: 1.5;
		margin: 0 0 1rem;
	}

	.about-body {
		font-size: 1rem;
		line-height: 1.6;
		color: var(--palette-grey-600);
		margin: 0;
	}
</style>
