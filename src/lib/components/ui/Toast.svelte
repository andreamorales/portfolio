<script lang="ts">
	import { afterUpdate, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';

	export let message: string;
	export let duration: number = 3000; // Duration in milliseconds
	export let visible: boolean = false;

	let timer: ReturnType<typeof setTimeout>;
	let previousVisible = false;

	afterUpdate(() => {
		if (visible === previousVisible) return;

		if (timer) {
			clearTimeout(timer);
		}

		if (visible) {
			timer = setTimeout(() => {
				visible = false;
			}, duration);
		}

		previousVisible = visible;
	});

	// Handle toast click for email fallback
	function handleToastClick() {
		// If message contains email, make it clickable
		if (message.includes('andreamoralescoto@gmail.com')) {
			window.location.href = 'mailto:andreamoralescoto@gmail.com';
		}
	}

	// Clean up timer on component destruction
	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});
</script>

{#if visible}
	<button
		type="button"
		class="toast"
		transition:fade={{ duration: 200 }}
		on:click={() => {
			handleToastClick();
			visible = false;
		}}
		on:keydown={(e) => {
			if (e.key === 'Enter' || e.key === 'Space') {
				handleToastClick();
				visible = false;
			}
		}}
		aria-live="polite"
	>
		{message}
	</button>
{/if}

<style>
	.toast {
		position: fixed;
		bottom: calc(2rem + 1px + var(--spacing-sm) + 1.25rem + var(--spacing-sm));
		left: 1.25rem;
		background-color: var(--text-color);
		color: var(--bg-color);
		padding: var(--spacing-sm) var(--spacing-lg);
		border-radius: var(--border-radius);
		font-size: var(--font-size-sm);
		font-family: var(--font-recursive);
		font-variation-settings:
			'CASL' 0,
			'wght' 400;
		z-index: 10051;
		cursor: pointer;
		pointer-events: auto;
		white-space: nowrap;
	}
</style>
