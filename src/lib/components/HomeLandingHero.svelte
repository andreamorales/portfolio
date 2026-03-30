<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Mail, Linkedin, Github } from 'lucide-svelte';

	export let colibri: string;
	export let consensysLogo: string;
	export let mongodbLogo: string;
	export let robloxLogo: string;
	export let pantoLogo: string;
	export let onCopyEmail: () => void;
	export let onOpenLinkedIn: () => void;
	export let onOpenResume: () => void;
	export let onOpenGithub: () => void;
</script>

<div class="header flex-column-left gap-large">
	<div class="title-container" in:fade={{ duration: 600, delay: 200 }}>
		<h1 class="title">Andy<br />Morales</h1>
		<div class="colibri-container">
			<img src={colibri} alt="Colibri" class="colibri-image" />
		</div>
	</div>
	<div class="flex-column-left gap-small" in:fade={{ duration: 600, delay: 400 }}>
		<div class="description">I lead the design of creative and technical products.</div>
		<div class="company-logos">
			<span in:fade={{ duration: 400, delay: 600 }}>
				{@html consensysLogo}
			</span>
			<span in:fade={{ duration: 400, delay: 750 }}>
				{@html mongodbLogo}
			</span>
			<span in:fade={{ duration: 400, delay: 900 }}>
				{@html robloxLogo}
			</span>
			<span in:fade={{ duration: 400, delay: 1050 }}>
				{@html pantoLogo}
			</span>
		</div>
	</div>

	<div class="cta" in:fade={{ duration: 600, delay: 1200 }}>
		<button class="button-secondary" on:click={onCopyEmail}>
			<Mail size={18} class="icon" />
			<span>Email</span>
		</button>
		<button class="button-secondary" on:click={onOpenLinkedIn}>
			<Linkedin size={18} class="icon" />
			<span>LinkedIn</span>
		</button>
		<button class="button-secondary" on:click={onOpenResume}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
				<polyline points="14 2 14 8 20 8"></polyline>
				<line x1="16" y1="13" x2="8" y2="13"></line>
				<line x1="16" y1="17" x2="8" y2="17"></line>
				<polyline points="10 9 9 9 8 9"></polyline>
			</svg>
			<span>CV</span>
		</button>
		<button class="button-secondary" on:click={onOpenGithub}>
			<Github size={18} class="icon" />
			<span>GitHub</span>
		</button>
	</div>
</div>

<style>
	.title-container {
		position: relative;
		display: inline-block;
	}

	.colibri-container {
		position: absolute;
		top: 0;
		right: 0;
		width: 236px;
		height: auto;
		transform: translate(29%, -4.5%) scale(0.86);
		transform-origin: top right;
		z-index: 3;
		pointer-events: none;
	}

	.colibri-image {
		width: 100%;
		height: auto;
		display: block;
	}

	.title {
		font-family: var(--font-refract);
		font-size: 112px;
		font-style: normal;
		font-weight: 400;
		line-height: 90px;
		letter-spacing: -1.12px;
		font-feature-settings:
			'dlig' on,
			'ss01' on;
		position: relative;
		z-index: 2;
	}

	.description {
		font-family: var(--font-recursive);
		font-size: 24px;
		font-style: normal;
		font-weight: 370;
		line-height: 24px;
		letter-spacing: 0.28px;
		font-variation-settings:
			'CASL' 0,
			'wght' 370;
		position: relative;
		z-index: 2;
		color: var(--text-color);
	}

	.company-logos {
		display: inline-flex;
		align-items: center;
		gap: 1rem;
	}

	.company-logos span {
		display: flex;
		align-items: center;
	}

	.company-logos :global(svg) {
		height: 24px;
		width: auto;
		color: var(--text-color);
		fill: currentColor;
	}

	.company-logos :global(svg:first-child) {
		height: 22px;
	}

	.company-logos :global(svg:nth-child(2)) {
		height: 25.2px;
	}

	.company-logos :global(svg:nth-child(3)) {
		height: 15px;
	}

	.company-logos :global(svg:last-child) {
		height: 20px;
	}

	.cta {
		position: relative;
		z-index: 5;
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.button-secondary {
		cursor: pointer;
		position: relative;
		z-index: 5;
		padding: 0.75rem 1.5rem;
		border: 2px solid var(--text-color);
		border-radius: 4px;
		font-weight: 600;
		font-size: 1rem;
		transition: all 0.3s ease;
		pointer-events: auto;
		font-family: var(--font-recursive);
		font-variation-settings:
			'CASL' 0,
			'wght' 600;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background-color: var(--bg-color);
		color: var(--text-color);
	}

	.button-secondary:hover {
		background-color: var(--text-color);
		color: var(--bg-color);
	}

	@media (max-width: 768px) {
		.title {
			font-size: 72px;
			line-height: 60px;
			letter-spacing: -0.72px;
		}

		.colibri-container {
			transform: translate(17.5%, -3%) scale(0.5);
		}

		.description {
			font-size: 18px;
			line-height: 20px;
			letter-spacing: 0.22px;
		}

		.company-logos {
			display: flex;
			align-items: center;
			gap: 0.75rem;
			width: 100%;
		}

		.company-logos :global(svg) {
			height: 16px;
		}

		.company-logos :global(svg:first-child) {
			height: 15px;
		}

		.company-logos :global(svg:nth-child(2)) {
			height: 17px;
		}

		.company-logos :global(svg:nth-child(3)) {
			height: 12px;
		}

		.company-logos :global(svg:last-child) {
			height: 14px;
		}

		.cta {
			width: 100%;
			flex-direction: row;
			gap: 0.5rem;
		}

		.button-secondary {
			flex: 1;
			padding: 0.6rem 0.5rem;
			font-size: 0.875rem;
			justify-content: center;
			gap: 0.25rem;
		}
	}

	@media (max-width: 548px) {
		.colibri-container {
			transform: translate(17.5%, -3.1%) scale(0.5);
		}
	}
</style>
