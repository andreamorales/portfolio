<script lang="ts">
	import { fade } from 'svelte/transition';
	import { ArrowDown } from 'lucide-svelte';

	export let title: string;
	export let onClick: () => void;
</script>

<button class="next-piece-banner" on:click={onClick} in:fade={{ duration: 150 }}>
	<span>next piece: {title}</span>
	<ArrowDown size={16} />
</button>

<style>
	.next-piece-banner {
		position: fixed;
		left: 50%;
		bottom: 2rem;
		transform: translateX(-50%);
		z-index: 12;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 40px;
		padding: 0.75rem 1.5rem;
		background-color: var(--bg-color);
		color: var(--text-color);
		border: 2px solid var(--text-color);
		border-radius: var(--radius-xs);
		box-shadow: 4px 4px 0px 0px var(--grey-mid);
		font-family: var(--font-recursive);
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
	}

	@media (max-width: 768px) {
		.next-piece-banner {
			bottom: 5.25rem;
			width: calc(100vw - 4rem);
			max-width: 100%;
			justify-content: center;
			white-space: normal;
			text-align: center;
		}
	}
</style>
