<script lang="ts">
	import { browser } from '$app/environment';
	import { contactLinks } from '$lib/data/contact-links';

	export let visible = true;
	export let onCopyEmail: () => void = () => {};

	const githubHref = contactLinks.find((link) => link.label === 'GitHub')?.href ?? '#';
	const linkedInHref = contactLinks.find((link) => link.label === 'LinkedIn')?.href ?? '#';
	const cvHref = contactLinks.find((link) => link.label === 'CV')?.href ?? '#';

</script>

{#if browser}
	<div class="floating-contact-dock" class:floating-contact-dock--hidden={!visible} aria-label="Contact links">
			<a
				class="floating-contact-dock__link"
				href={githubHref}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="GitHub"
				title="GitHub"
			>
				<svg
					class="floating-contact-dock__icon"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 124 119"
					width="24"
					height="24"
					fill="none"
					aria-hidden="true"
					style="image-rendering: pixelated"
				>
					<path
						d="M44.5547 22.1494H82.1592V0H97.0957V22.1494H108.687V66.9639H82.1582V76.2363H77.0068V118.475H48.1621V103.149H25.8828V97.3555H14.4219V88.2129H48.1621V76.2363H41.208V66.9639H14.6797V52.0264H0V35.7998H14.6797V22.1494H29.6182V0H44.5547V22.1494ZM26.9131 88.2109H10.5586V77.7812H26.9131V88.2109ZM123.624 52.0264H108.688V35.7998H123.624V52.0264Z"
						fill="currentColor"
					/>
				</svg>
			</a>
			<a
				class="floating-contact-dock__link"
				href={linkedInHref}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="LinkedIn"
				title="LinkedIn"
			>
				<svg
					class="floating-contact-dock__icon"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					width="24"
					height="24"
					fill="currentColor"
					aria-hidden="true"
					style="image-rendering: pixelated"
				>
					<rect x="1" y="0" width="2" height="2" />
					<rect x="1" y="4" width="2" height="12" />
					<rect x="6" y="4" width="2" height="12" />
					<rect x="8" y="4" width="8" height="3" />
					<rect x="14" y="6" width="2" height="10" />
				</svg>
			</a>
			<a
				class="floating-contact-dock__link"
				href={cvHref}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="CV"
				title="CV"
			>
				<svg
					class="floating-contact-dock__icon"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="1 0 14 16"
					width="24"
					height="24"
					fill="currentColor"
					aria-hidden="true"
					style="image-rendering: pixelated"
				>
					<rect x="0" y="0" width="14" height="2" />
					<rect x="14" y="2" width="2" height="2" />
					<rect x="0" y="2" width="2" height="14" />
					<rect x="14" y="4" width="2" height="12" />
					<rect x="2" y="14" width="12" height="2" />
					<rect x="2" y="4" width="10" height="1" />
					<rect x="2" y="7" width="11" height="1" />
					<rect x="2" y="10" width="10" height="1" />
				</svg>
			</a>
			<button
				type="button"
				class="floating-contact-dock__link floating-contact-dock__button"
				on:click={onCopyEmail}
				aria-label="Copy email"
				title="Copy email"
			>
				<svg
					class="floating-contact-dock__icon"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="1 0 14 16"
					width="24"
					height="24"
					fill="currentColor"
					aria-hidden="true"
					style="image-rendering: pixelated"
				>
					<rect x="0" y="0" width="16" height="2" />
					<rect x="0" y="2" width="2" height="14" />
					<rect x="14" y="2" width="2" height="14" />
					<rect x="2" y="14" width="12" height="2" />
					<rect x="2" y="3" width="2" height="1" />
					<rect x="3" y="4" width="2" height="1" />
					<rect x="4" y="5" width="2" height="1" />
					<rect x="5" y="6" width="2" height="1" />
					<rect x="6" y="7" width="2" height="1" />
					<rect x="8" y="7" width="2" height="1" />
					<rect x="9" y="6" width="2" height="1" />
					<rect x="10" y="5" width="2" height="1" />
					<rect x="11" y="4" width="2" height="1" />
					<rect x="12" y="3" width="2" height="1" />
				</svg>
			</button>
	</div>
{/if}

<style>
	.floating-contact-dock--hidden {
		opacity: 0;
		pointer-events: none;
	}

	.floating-contact-dock {
		display: inline-flex;
		align-items: flex-end;
		gap: var(--spacing-sm);
		pointer-events: auto;
		opacity: 1;
		transition: opacity 0.18s ease;
	}

	.floating-contact-dock__link {
		display: inline-flex;
		align-items: flex-end;
		justify-content: center;
		padding: 0;
		margin: 0;
		border: none;
		background: none;
		color: var(--text-color);
		opacity: 0.5;
		cursor: pointer;
		line-height: 0;
		text-decoration: none;
		transition: opacity 0.15s ease;
	}

	.floating-contact-dock__link:hover {
		opacity: 1;
	}

	.floating-contact-dock__link:focus-visible {
		outline: 2px solid var(--text-color);
		outline-offset: 3px;
		opacity: 1;
	}

	.floating-contact-dock__button {
		font: inherit;
	}

	.floating-contact-dock__link :global(svg) {
		display: block;
		width: 24px;
		height: 24px;
		shape-rendering: crispEdges;
		image-rendering: pixelated;
	}

	@media (max-width: 768px) {
		.floating-contact-dock {
			gap: var(--spacing-sm);
		}
	}
</style>
