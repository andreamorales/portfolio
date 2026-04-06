<script lang="ts">
	/** Must match the mask `id` in the defs below (unique per parent instance). */
	export let maskId: string;
	export let onGoHome: () => void;
	export let hasPrevPiece = false;
	export let hasNextPiece = false;
	export let onPrevPiece: (() => void) | undefined = undefined;
	export let onNextPiece: (() => void) | undefined = undefined;

	$: showPieceNav = typeof onPrevPiece === 'function' || typeof onNextPiece === 'function';
</script>

<div class="portfolio-end-home">
	<div class="portfolio-end-home__row">
		{#if showPieceNav}
			<button
				type="button"
				class="portfolio-end-home__nav"
				disabled={!hasPrevPiece}
				on:click={() => onPrevPiece?.()}
				aria-label="Previous portfolio piece"
			>
				<!-- Pixel triangle, tip left (3×5 grid) -->
				<svg
					class="portfolio-end-home__nav-icon"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 3 5"
					width="22"
					height="22"
					fill="currentColor"
					aria-hidden="true"
					style="image-rendering: pixelated"
				>
					<rect x="0" y="2" width="1" height="1" />
					<rect x="1" y="1" width="1" height="3" />
					<rect x="2" y="0" width="1" height="5" />
				</svg>
			</button>
		{/if}

		<button
			type="button"
			class="portfolio-end-home__button"
			on:click={() => onGoHome()}
			aria-label="Back to home"
		>
			<svg
				class="portfolio-end-smiley-mask-defs"
				width="0"
				height="0"
				aria-hidden="true"
				focusable="false"
			>
				<defs>
					<mask
						id={maskId}
						maskUnits="userSpaceOnUse"
						maskContentUnits="userSpaceOnUse"
						x="0"
						y="0"
						width="24"
						height="24"
					>
						<rect width="24" height="24" fill="#000" />
						<rect x="5" y="2" width="4" height="8" fill="#fff" />
						<rect x="15" y="2" width="4" height="8" fill="#fff" />
						<rect x="0" y="14" width="2" height="4" fill="#fff" />
						<rect x="2" y="16" width="2" height="4" fill="#fff" />
						<rect x="4" y="18" width="2" height="4" fill="#fff" />
						<rect x="6" y="20" width="12" height="4" fill="#fff" />
						<rect x="18" y="18" width="2" height="4" fill="#fff" />
						<rect x="20" y="16" width="2" height="4" fill="#fff" />
						<rect x="22" y="14" width="2" height="4" fill="#fff" />
					</mask>
				</defs>
			</svg>
			<span
				class="portfolio-end-smiley-rainbow"
				style="mask-image: {`url(#${maskId})`}; -webkit-mask-image: {`url(#${maskId})`};"
				aria-hidden="true"
			/>
		</button>

		{#if showPieceNav}
			<button
				type="button"
				class="portfolio-end-home__nav"
				disabled={!hasNextPiece}
				on:click={() => onNextPiece?.()}
				aria-label="Next portfolio piece"
			>
				<!-- Pixel triangle, tip right (3×5 grid) -->
				<svg
					class="portfolio-end-home__nav-icon"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 3 5"
					width="22"
					height="22"
					fill="currentColor"
					aria-hidden="true"
					style="image-rendering: pixelated"
				>
					<rect x="2" y="2" width="1" height="1" />
					<rect x="1" y="1" width="1" height="3" />
					<rect x="0" y="0" width="1" height="5" />
				</svg>
			</button>
		{/if}
	</div>
</div>

<style>
	.portfolio-end-home {
		width: 100%;
		display: flex;
		justify-content: center;
		padding: var(--spacing-md) 0 var(--spacing-xl);
	}

	.portfolio-end-home__row {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 1.25rem;
	}

	.portfolio-end-home__nav {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.35rem;
		margin: 0;
		border: none;
		background: transparent;
		line-height: 0;
		cursor: pointer;
		border-radius: var(--radius-sm);
		-webkit-tap-highlight-color: transparent;
		transition:
			color var(--transition),
			opacity var(--transition);
	}

	/* Mobile: unchanged — full-strength ink + opacity affordance */
	@media (max-width: 768px) {
		.portfolio-end-home__nav {
			color: var(--text-color);
			opacity: 0.85;
		}

		.portfolio-end-home__nav:hover:not(:disabled) {
			opacity: 1;
		}

		.portfolio-end-home__nav:disabled {
			opacity: 0.28;
			cursor: default;
		}
	}

	/* Desktop: lighter arrows, darken on hover */
	@media (min-width: 769px) {
		.portfolio-end-home__nav {
			color: var(--muted-text);
			opacity: 1;
		}

		.portfolio-end-home__nav:hover:not(:disabled) {
			color: var(--text-color);
		}

		.portfolio-end-home__nav:disabled {
			color: var(--muted-text);
			opacity: 0.35;
			cursor: default;
		}
	}

	.portfolio-end-home__nav-icon {
		display: block;
		flex-shrink: 0;
	}

	.portfolio-end-home__button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		margin: 0;
		border: none;
		background: transparent;
		line-height: 0;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		position: relative;
	}

	.portfolio-end-smiley-mask-defs {
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
		pointer-events: none;
	}

	/* Same rainbow motion as hero “I design tools.” shimmer (HomeLandingHero .description-shimmer). */
	.portfolio-end-smiley-rainbow {
		display: block;
		width: 28px;
		height: 28px;
		background-image: var(--palette-rainbow-gradient-h);
		background-size: 460% 130%;
		background-position: 0% 42%;
		animation: portfolio-end-smiley-rainbow 8s linear infinite;
		-webkit-mask-size: contain;
		mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		mask-repeat: no-repeat;
		-webkit-mask-position: center;
		mask-position: center;
		image-rendering: pixelated;
	}

	@keyframes portfolio-end-smiley-rainbow {
		0% {
			background-position: 0% 45%;
		}
		100% {
			background-position: 520% 45%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.portfolio-end-smiley-rainbow {
			animation: none;
			background-position: 0% 45%;
		}
	}

	.portfolio-end-home__button:hover {
		transform: scale(1.04);
	}
</style>
