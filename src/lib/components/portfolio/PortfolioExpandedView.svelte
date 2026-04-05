<script lang="ts">
	import Label from '$lib/components/ui/input/Label.svelte';
	import {
		decryptSecurePortfolioPayload,
		type SecurePortfolioEncryptedPayload
	} from '$lib/utils/secureCaseStudy';

	// Props
	export let projectTitle: string = '';
	export let titleId: string | undefined = undefined;
	export let tags: string[] = [];
	export let description: string;
	export let images: Array<{ src: string; alt: string; caption?: string }> = [];
	export let content: Array<{
		type: string;
		value: string;
		caption?: string;
		layout?: string;
		sideImage?: { value: string; caption?: string };
	}> = [];
	// Remove heroImage prop since we'll use images array
	export let year: string = '';
	export let role: string = '';
	export let link: string = '';
	export let metrics: Array<string> = [];
	export let team: Array<{ role: string; name: string; relationship: string }> = [];
	export let immersive = false;
	export let locked = false;
	export let encryptedPayload: SecurePortfolioEncryptedPayload | null = null;
	export let staggerReveal = false;
	export let staggerBaseDelayMs = 0;

	// Initialize the featuredImage variable
	let featuredImage: string = '';
	let enteredPassword = '';
	let passwordError = '';
	let isUnlocking = false;
	let isUnlocked = false;
	let unusedGalleryImages: Array<{ src: string; alt: string; caption?: string }> = [];
	let effectiveStaggerBaseDelayMs = 0;

	const REVEAL_TIME_SCALE = 1.35;
	const ms = (value: number) => Math.round(value * REVEAL_TIME_SCALE);
	const REVEAL_PARENT_DURATION_MS = ms(360);
	const REVEAL_PARENT_TO_CHILD_GAP_MS = ms(0);
	const REVEAL_CHILD_STEP_MS = ms(70);
	const REVEAL_GROUP_GAP_MS = ms(30);
	const REVEAL_PARENT_FADE_DURATION_MS = ms(620);
	const REVEAL_CHILD_FADE_DURATION_MS = ms(560);

	type RevealGroup = { parentDelayMs: number; childStartDelayMs: number };

	let introReveal: RevealGroup = { parentDelayMs: 0, childStartDelayMs: 0 };
	let detailsReveal: RevealGroup | null = null;
	let heroReveal: RevealGroup | null = null;
	let contentReveal: RevealGroup | null = null;
	let lockedReveal: RevealGroup | null = null;

	$: if (!locked) {
		isUnlocked = true;
	}

	/* If user unlocks from the page itself, skip the large initial panel delay so content starts right away. */
	$: effectiveStaggerBaseDelayMs = locked && isUnlocked ? 0 : staggerBaseDelayMs;

	// Computed prop for featured image - use first image from images array
	$: {
		if (images && images.length > 0) {
			featuredImage = images[0].src;
		} else {
			featuredImage = '';
		}
	}

	// Add a function to handle image error
	function handleImageError(event: Event) {
		const imgElement = event.target as HTMLImageElement;
		if (imgElement && imgElement.src.endsWith('.png')) {
			const newSrc = imgElement.src.replace('.png', '.jpg');
			imgElement.src = newSrc;
		}
	}

	// Function to get image caption from images array
	function getImageCaption(src: string): string | undefined {
		const image = images.find((img) => img.src === src);
		return image?.caption;
	}

	function revealStyle(delayMs: number): string | undefined {
		if (!staggerReveal) return undefined;
		return `--reveal-delay: ${Math.max(0, Math.round(delayMs))}ms;`;
	}

	function childDelayStyle(group: RevealGroup | null, step: number): string | undefined {
		const anchor = (group ?? introReveal).childStartDelayMs;
		return revealStyle(anchor + step * REVEAL_CHILD_STEP_MS);
	}

	$: {
		const usedImageSources = new Set([
			featuredImage,
			...content
				.filter((block) => block.type === 'image')
				.flatMap((block) => {
					const blockImages = [block.value];
					if (block.layout === 'side-by-side' && block.sideImage) {
						blockImages.push(block.sideImage.value);
					}
					return blockImages;
				})
		]);
		unusedGalleryImages = images.filter((img) => !usedImageSources.has(img.src));
	}

	$: {
		let cursor = effectiveStaggerBaseDelayMs;
		const schedule = (): RevealGroup => {
			const parentDelayMs = cursor;
			const childStartDelayMs = parentDelayMs + REVEAL_PARENT_DURATION_MS + REVEAL_PARENT_TO_CHILD_GAP_MS;
			const nextGroupStartMs = parentDelayMs + REVEAL_PARENT_DURATION_MS + REVEAL_GROUP_GAP_MS;
			cursor = Math.max(nextGroupStartMs, childStartDelayMs);
			return { parentDelayMs, childStartDelayMs };
		};

		introReveal = schedule();
		detailsReveal = null;
		heroReveal = null;
		contentReveal = null;
		lockedReveal = null;

		if (locked && !isUnlocked) {
			lockedReveal = schedule();
		} else {
			detailsReveal = schedule();
			if (featuredImage) {
				heroReveal = schedule();
			}
			contentReveal = schedule();
		}
	}

	function unlockCaseStudy() {
		if (!locked) {
			return;
		}

		if (!encryptedPayload) {
			passwordError = 'This case study is unavailable right now.';
			return;
		}

		isUnlocking = true;
		decryptSecurePortfolioPayload(encryptedPayload, enteredPassword)
			.then((decrypted) => {
				if (!decrypted) {
					passwordError = 'That password does not match.';
					return;
				}
				if (decrypted.projectTitle?.trim()) {
					projectTitle = decrypted.projectTitle;
				}
				if (decrypted.tags?.length) {
					tags = decrypted.tags;
				}
				description = decrypted.description;
				images = decrypted.images;
				content = decrypted.content;
				year = decrypted.year;
				role = decrypted.role;
				link = decrypted.link;
				metrics = decrypted.metrics;
				team = decrypted.team;
				enteredPassword = '';
				passwordError = '';
				isUnlocked = true;
			})
			.finally(() => {
				isUnlocking = false;
			});
	}
</script>

<div
	class="portfolio-expanded-view flex-column"
	class:immersive
	class:portfolio-expanded-view--staggered={staggerReveal}
	style={
		staggerReveal
			? `--reveal-parent-duration: ${REVEAL_PARENT_FADE_DURATION_MS}ms; --reveal-child-duration: ${REVEAL_CHILD_FADE_DURATION_MS}ms;`
			: undefined
	}
>
	<div class="project-intro reveal-parent" style={revealStyle(introReveal.parentDelayMs)}>
		<div class="project-title-row reveal-child" style={revealStyle(introReveal.childStartDelayMs)}>
			<h2 id={titleId} class="project-title">{projectTitle}</h2>
			{#if tags.length > 0}
				<div class="project-tags">
					{#each tags as tag (`${projectTitle}-${tag}`)}
						<Label text={tag} variant="semisolid" color="default" />
					{/each}
				</div>
			{/if}
		</div>

		<div
			class="hero-description reveal-child"
			style={revealStyle(introReveal.childStartDelayMs + REVEAL_CHILD_STEP_MS)}
		>
			{#each description.split('. ') as line, index (`${line}-${index}`)}
				<span class="highlight-line">{line}{line.endsWith('.') ? '' : '.'} </span>
			{/each}
		</div>
	</div>

	{#if locked && !isUnlocked}
		<div
			class="locked-gate reveal-parent"
			style={revealStyle((lockedReveal ?? introReveal).parentDelayMs)}
		>
			<div class="locked-gate-card">
				<div
					class="locked-gate-label reveal-child"
					style={revealStyle((lockedReveal ?? introReveal).childStartDelayMs)}
				>
					Pass Protected
				</div>
				<p
					class="locked-gate-copy reveal-child"
					style={revealStyle((lockedReveal ?? introReveal).childStartDelayMs + REVEAL_CHILD_STEP_MS)}
				>
					This is my most recent case study. Enter the password to unlock the full piece.
				</p>
				<div
					class="locked-gate-controls reveal-child"
					style={revealStyle((lockedReveal ?? introReveal).childStartDelayMs + REVEAL_CHILD_STEP_MS * 2)}
				>
					<input
						class="locked-gate-input"
						type="password"
						bind:value={enteredPassword}
						disabled={isUnlocking}
						placeholder="Enter password"
						aria-label="Portfolio password"
						on:keydown={(event) => event.key === 'Enter' && unlockCaseStudy()}
					/>
					<button
						class="locked-gate-button"
						type="button"
						disabled={isUnlocking}
						on:click={unlockCaseStudy}
					>
						{isUnlocking ? 'Unlocking...' : 'Unlock'}
					</button>
				</div>
				{#if passwordError}
					<p
						class="locked-gate-error reveal-child"
						style={revealStyle(
							(lockedReveal ?? introReveal).childStartDelayMs + REVEAL_CHILD_STEP_MS * 3
						)}
					>
						{passwordError}
					</p>
				{/if}
			</div>
		</div>
	{:else}
		<!-- Project details grid -->
		<div
			class="project-details-grid reveal-parent"
			style={revealStyle((detailsReveal ?? introReveal).parentDelayMs)}
		>
			<div
				class="details-row reveal-child"
				style={childDelayStyle(detailsReveal, 0)}
			>
				<div class="details-cell">
					<div class="details-label reveal-child" style={childDelayStyle(detailsReveal, 0)}>
						Year
					</div>
					<div class="details-value reveal-child" style={childDelayStyle(detailsReveal, 0)}>
						{year}
					</div>
				</div>
				<div class="details-cell">
					<div class="details-label reveal-child" style={childDelayStyle(detailsReveal, 1)}>
						Role
					</div>
					<div class="details-value reveal-child" style={childDelayStyle(detailsReveal, 1)}>
						{role}
					</div>
				</div>
				<div class="details-cell">
					<div class="details-label reveal-child" style={childDelayStyle(detailsReveal, 2)}>
						Link
					</div>
					<div class="details-value reveal-child" style={childDelayStyle(detailsReveal, 2)}>
						{#if link === 'Discontinued'}
							<span class="discontinued-text">Discontinued</span>
						{:else if link}
							<a href={link} target="_blank" rel="noopener noreferrer" class="project-link">
								View Project
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
									<polyline points="15 3 21 3 21 9"></polyline>
									<line x1="10" y1="14" x2="21" y2="3"></line>
								</svg>
							</a>
						{:else}
							<span class="muted-text">Not Available</span>
						{/if}
					</div>
				</div>
			</div>
			<div
				class="details-row metrics-row reveal-child"
				style={childDelayStyle(detailsReveal, 3)}
			>
				{#each metrics.slice(0, 2) as metric, index (`${metric}-${index}`)}
					<div class="details-cell">
						<div
							class="details-label reveal-child"
							style={childDelayStyle(detailsReveal, 3 + index)}
						>
							Impact
						</div>
						<div
							class="details-value reveal-child"
							style={childDelayStyle(detailsReveal, 3 + index)}
						>
							{metric}
						</div>
					</div>
				{/each}
				<div class="details-cell">
					<div class="details-label reveal-child" style={childDelayStyle(detailsReveal, 5)}>
						Team
					</div>
					<div class="details-value team-list reveal-child" style={childDelayStyle(detailsReveal, 5)}>
						{#if team && team.length > 0}
							{#each team as member (`${member.role}-${member.name}`)}
								<div class="team-member">
									<span class="role">{member.role}:</span>
									<span class="name">{member.name}</span>
									<span class="relationship">({member.relationship})</span>
								</div>
							{/each}
						{:else}
							<span class="muted-text">Solo project</span>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Featured hero image -->
		{#if featuredImage}
			<div class="hero-image-container reveal-parent" style={revealStyle((heroReveal ?? introReveal).parentDelayMs)}>
				<div class="image-frame reveal-child" style={revealStyle((heroReveal ?? introReveal).childStartDelayMs)}>
					<img
						src={featuredImage}
						alt={projectTitle}
						class="hero-image"
						on:error={handleImageError}
					/>
				</div>
			</div>
		{/if}

		<!-- Content sections -->
		<div class="content-container flex-column reveal-parent" style={revealStyle((contentReveal ?? introReveal).parentDelayMs)}>
			<div class="content-view width-100">
				<!-- Content blocks (text and images) -->
				<div class="content-blocks">
					{#each content as block, index (`${block.type}-${block.value}-${index}`)}
						{#if block.type === 'text'}
							<div
								class="text-block reveal-child"
								style={revealStyle((contentReveal ?? introReveal).childStartDelayMs + index * REVEAL_CHILD_STEP_MS)}
							>
								<p>{block.value}</p>
							</div>
						{:else if block.type === 'image'}
							<div
								class="image-block {block.layout === 'side-by-side' ? 'side-by-side' : ''} reveal-child"
								style={revealStyle((contentReveal ?? introReveal).childStartDelayMs + index * REVEAL_CHILD_STEP_MS)}
							>
								{#if block.layout === 'side-by-side'}
									<div class="image-pair">
										<div class="image-container">
											<div class="image-frame">
												<img
													src={block.value}
													alt={getImageCaption(block.value) || 'Project image'}
												/>
											</div>
											{#if getImageCaption(block.value)}
												<p class="image-caption">{getImageCaption(block.value)}</p>
											{/if}
										</div>
										{#if block.sideImage}
											{@const sideImage = block.sideImage}
											<div class="image-container">
												<div class="image-frame">
													<img
														src={sideImage.value}
														alt={getImageCaption(sideImage.value) || 'Project image'}
													/>
												</div>
												{#if getImageCaption(sideImage.value)}
													<p class="image-caption">{getImageCaption(sideImage.value)}</p>
												{/if}
											</div>
										{/if}
									</div>
								{:else}
									<div class="image-frame">
										<img src={block.value} alt={getImageCaption(block.value) || 'Project image'} />
									</div>
									{#if getImageCaption(block.value)}
										<p class="image-caption">{getImageCaption(block.value)}</p>
									{/if}
								{/if}
							</div>
						{/if}
					{/each}
				</div>

				<!-- Image gallery - only show unused images -->
				{#if unusedGalleryImages.length > 0}
						<div class="image-gallery">
							{#each unusedGalleryImages as image, index (image.src)}
								<div
									class="gallery-item reveal-child"
									style={revealStyle(
										(contentReveal ?? introReveal).childStartDelayMs +
											(content.length + index) * REVEAL_CHILD_STEP_MS
									)}
								>
									<div class="image-frame">
										<img src={image.src} alt={image.alt} />
									</div>
									{#if image.caption}
										<p class="image-caption">{image.caption}</p>
									{/if}
								</div>
							{/each}
						</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.portfolio-expanded-view {
		font-family:
			'Instrument Sans',
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			Helvetica,
			Arial,
			sans-serif;
		letter-spacing: -0.01em;
		width: 100%;
		max-width: 800px;
		height: 100%;
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
		overflow: hidden;
		margin: 0 auto;
		padding: 0;
		border-top: 16px solid var(--text-color);
	}

	.portfolio-expanded-view--staggered {
		--reveal-distance: 0px;
	}

	.portfolio-expanded-view--staggered .reveal-parent,
	.portfolio-expanded-view--staggered .reveal-child {
		opacity: 0;
		transform: none;
		animation-name: portfolio-reveal-in;
		animation-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
		animation-fill-mode: forwards;
		animation-delay: var(--reveal-delay, 0ms);
		will-change: opacity, transform;
	}

	.portfolio-expanded-view--staggered .reveal-parent {
		animation-duration: var(--reveal-parent-duration, 700ms);
	}

	.portfolio-expanded-view--staggered .reveal-child {
		animation-duration: var(--reveal-child-duration, 560ms);
	}

	.content-container {
		width: 100%;
		max-width: 800px;
		display: flex;
		flex-direction: column;
	}

	.content-view {
		width: 100%;
		min-width: 100%;
		box-sizing: border-box;
		flex: 1;
		flex-grow: 1;
	}

	:global(.portfolio-content) .content-view {
		width: 100%;
		min-width: 100%;
	}

	.portfolio-expanded-view.immersive,
	.portfolio-expanded-view.immersive .content-container,
	.portfolio-expanded-view.immersive .content-view,
	:global(.portfolio-content.immersive) .portfolio-expanded-view,
	:global(.portfolio-content.immersive) .content-container,
	:global(.portfolio-content.immersive) .content-view {
		max-width: 100%;
	}

	.content-view {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
		padding-top: 0;
		padding-bottom: var(--spacing-lg);
		padding-left: var(--spacing-lg);
		padding-right: var(--spacing-lg);
	}

	.content-blocks {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.text-block {
		font-size: var(--font-size-base);
		line-height: 1.6;
		font-variation-settings:
			'CASL' 0,
			'wght' 370;
		width: 100%;
	}

	.image-block {
		margin: var(--spacing-md) 0 0 0;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.image-block .image-frame {
		width: 100%;
		max-width: 800px;
		display: block;
		position: relative;
	}

	.image-block .image-frame img {
		width: 100%;
		max-height: 70vh;
		object-fit: contain;
		display: block;
		border-radius: var(--border-radius-sm);
		transform: translateZ(0);
		will-change: transform;
	}

	.image-caption {
		font-size: var(--font-size-sm);
		font-variation-settings:
			'CASL' 0,
			'wght' 340;
		color: var(--muted-text);
		margin-top: var(--spacing-xs);
		text-align: center;
		max-width: 65ch;
	}

	.image-gallery {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
	}

	.gallery-item {
		display: flex;
		flex-direction: column;
	}

	.gallery-item img {
		width: 100%;
		height: auto;
		border-radius: var(--border-radius-sm);
		aspect-ratio: 16 / 9;
		object-fit: cover;
	}

	@media (max-width: 768px) {
		.text-block {
			font-size: 15px;
		}

		.image-gallery {
			grid-template-columns: 1fr;
		}

		.portfolio-expanded-view,
		.content-container,
		.content-view,
		:global(.portfolio-content) .content-view {
			width: 100%;
			min-width: 100%;
			max-width: 100%;
		}

		.hero-description {
			font-size: var(--font-size-base);
			line-height: 1.6;
			padding: 0;
		}

		.highlight-line {
			display: inline;
			color: var(--text-color);
			font-family: inherit;
			line-height: 1.6;
			background: none;
			-webkit-mask-image: none;
			mask-image: none;
			padding: 0;
		}
	}

	.project-intro {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		padding: var(--spacing-lg) 1.5rem 0;
	}

	.project-title-row {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: var(--spacing-md);
		flex-wrap: wrap;
	}

	.project-title {
		margin: 0;
		font-family: 'Instrument Serif', serif;
		font-size: clamp(2rem, 3vw, 2.8rem);
		line-height: 1;
		letter-spacing: -0.04em;
		color: var(--text-color);
		font-variation-settings:
			'CASL' 0,
			'wght' 420;
	}

	.project-tags {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		flex-wrap: wrap;
		justify-content: flex-start;
	}

	.locked-gate {
		padding: 0 1.5rem var(--spacing-xl);
	}

	.locked-gate-card {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		padding: var(--spacing-lg);
		border: 1px solid var(--black);
		border-radius: var(--border-radius-sm);
		background: var(--alpha-black-002);
	}

	.locked-gate-label {
		font-size: var(--font-size-xs);
		color: var(--muted-text);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.locked-gate-copy {
		margin: 0;
		font-family: inherit;
		font-size: var(--font-size-sm);
		line-height: 1.5;
		color: var(--text-color);
	}

	.locked-gate-controls {
		display: flex;
		gap: var(--spacing-sm);
		flex-wrap: wrap;
	}

	.locked-gate-input {
		flex: 1 1 16rem;
		min-width: 0;
		padding: 0.75rem 0.9rem;
		border: 1px solid var(--black);
		border-radius: var(--radius-xs);
		background: var(--bg-color);
		color: var(--text-color);
		font-family: inherit;
		font-size: var(--font-size-sm);
		line-height: 1.4;
		font-variation-settings:
			'CASL' 0,
			'wght' 400;
	}

	.locked-gate-button {
		padding: 0.75rem 1rem;
		border: 1px solid var(--black);
		border-radius: var(--radius-xs);
		background: var(--text-color);
		color: var(--bg-color);
		font-family: inherit;
		font-size: var(--font-size-sm);
		line-height: 1.4;
		font-weight: 500;
		font-variation-settings:
			'CASL' 0,
			'wght' 500;
		cursor: pointer;
	}

	.locked-gate-button:disabled,
	.locked-gate-input:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.locked-gate-error {
		margin: 0;
		font-size: var(--font-size-xs);
		color: var(--palette-text-danger);
	}

	.hero-description,
	.text-block,
	.image-caption,
	.details-label,
	.details-value,
	.project-link,
	.muted-text,
	.discontinued-text,
	.role,
	.name,
	.relationship {
		letter-spacing: -0.01em;
	}

	:global(html.dark-theme) .hero-description,
	:global(html.dark-theme) .text-block,
	:global(html.dark-theme) .image-caption,
	:global(html.dark-theme) .details-label,
	:global(html.dark-theme) .details-value,
	:global(html.dark-theme) .project-link,
	:global(html.dark-theme) .muted-text,
	:global(html.dark-theme) .discontinued-text,
	:global(html.dark-theme) .role,
	:global(html.dark-theme) .name,
	:global(html.dark-theme) .relationship {
		letter-spacing: 0.03em;
	}

	/* Slightly lighter body weight in dark mode for easier reading on deep backgrounds */
	:global(html.dark-theme) .hero-description,
	:global(html.dark-theme) .text-block,
	:global(html.dark-theme) .project-link,
	:global(html.dark-theme) .muted-text,
	:global(html.dark-theme) .discontinued-text,
	:global(html.dark-theme) .role,
	:global(html.dark-theme) .name,
	:global(html.dark-theme) .relationship {
		font-variation-settings:
			'CASL' 0,
			'wght' 360;
	}

	:global(html.dark-theme) .image-caption,
	:global(html.dark-theme) .details-label {
		font-variation-settings:
			'CASL' 0,
			'wght' 330;
	}

	:global(html.dark-theme) .details-label {
		color: var(--palette-grey-hint);
	}

	:global(html.dark-theme) .details-value {
		font-variation-settings:
			'CASL' 0,
			'wght' 460;
	}

	:global(html.dark-theme) .highlight-line {
		letter-spacing: 0.025em;
	}

	/* Project details grid */
	.project-details-grid {
		width: 100%;
		background-color: transparent;
		font-family: inherit;
		border-top: 1px solid var(--black);
	}

	.details-row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border-bottom: 1px solid var(--black);
	}

	.details-row:first-child {
		border-bottom: none;
	}

	.metrics-row {
		border-top: 1px solid var(--black);
	}

	.details-cell {
		display: flex;
		flex-direction: column;
		padding: var(--spacing-sm);
		border-right: 1px solid var(--black);
	}

	.details-cell:last-child {
		border-right: none;
	}

	.details-label {
		font-size: var(--font-size-xxs);
		color: var(--muted-text);
		font-variation-settings:
			'CASL' 0,
			'wght' 400;
	}

	.details-value {
		font-size: var(--font-size-sm);
		color: var(--text-color);
		font-variation-settings:
			'CASL' 0,
			'wght' 500;
		word-wrap: break-word;
	}

	/* Make sure the grid is responsive */
	@media (max-width: 600px) {
		.project-intro {
			padding: 1rem 1rem 0;
		}

		.content-view {
			padding-left: 0;
			padding-right: 0;
		}

		.content-blocks,
		.image-gallery {
			padding-left: 0;
			padding-right: 0;
		}

		.project-title-row {
			flex-direction: column;
			align-items: flex-start;
		}

		.project-tags {
			justify-content: flex-start;
		}

		.details-row {
			grid-template-columns: 1fr;
		}

		.details-cell:not(:last-child) {
			border-right: none;
			border-bottom: 1px solid var(--black);
		}

		.metrics-row .details-cell:nth-last-child(2) {
			border-bottom: none;
		}

		.metrics-row .details-cell:last-child {
			border-top: 1px solid var(--black);
		}

		.locked-gate {
			padding-left: 1rem;
			padding-right: 1rem;
		}

		.locked-gate-card {
			padding: 1rem;
		}
	}

	.image-frame {
		display: block;
		width: 100%;
		overflow: visible;
	}

	.image-block .image-frame {
		border-radius: var(--border-radius-sm);
	}

	.image-block img {
		width: 100%;
		max-height: 70vh;
		border-radius: var(--border-radius-sm);
		object-fit: contain;
	}

	/* Hero image styling */
	.hero-image-container {
		width: 100%;
		display: flex;
		justify-content: center;
		overflow: hidden;
	}

	.hero-image-container .image-frame {
		width: 100%;
		max-width: 800px;
		display: block;
	}

	@media (max-width: 1024px) {
		.hero-image-container {
			padding-left: 1.5rem;
			padding-right: 1.5rem;
			box-sizing: border-box;
		}

		.hero-image-container .image-frame {
			max-width: 720px;
		}
	}

	@media (max-width: 600px) {
		.hero-image-container {
			padding-left: 0;
			padding-right: 0;
		}

		.hero-image-container .image-frame {
			max-width: 100%;
		}
	}

	/* Hero image */
	.hero-image {
		width: 100%;
		height: auto;
		display: block;
		object-fit: cover;
	}

	/* Add padding to specific content areas instead */
	.content-blocks,
	.image-gallery {
		padding: 0 1.5rem;
	}

	@media (max-width: 768px) {
		.content-blocks,
		.image-gallery {
			padding-left: 0;
			padding-right: 0;
		}
	}

	.project-link {
		color: var(--text-color);
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xxs);
		transition: color var(--transition);
	}

	.project-link:hover {
		color: var(--cursor-indigo);
	}

	.muted-text {
		color: var(--muted-text);
		font-style: italic;
	}

	.discontinued-text {
		color: var(--muted-text);
		font-style: italic;
		font-variation-settings:
			'CASL' 0,
			'wght' 400;
	}

	.hero-description {
		width: 100%;
		max-width: 65ch;
		font-family: inherit;
		font-size: var(--font-size-lg);
		line-height: 1.3;
		font-variation-settings:
			'CASL' 0,
			'wght' 400;
		color: var(--text-color);
		text-align: left;
	}

	.highlight-line {
		display: inline;
		line-height: 1.3;
		letter-spacing: -0.03em;
		padding: 0;
	}

	.team-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xxs);
	}

	.team-member {
		font-size: var(--font-size-xs);
		line-height: 1.4;
		padding-left: 0;
		position: relative;
	}

	/* Only add bullets when there's more than one team member */
	.team-list:has(.team-member:nth-child(2)) .team-member {
		padding-left: var(--spacing-sm);
	}

	.team-list:has(.team-member:nth-child(2)) .team-member::before {
		content: '•';
		position: absolute;
		left: 0;
		color: var(--text-color);
	}

	.role {
		color: var(--muted-text);
	}

	.name {
		color: var(--text-color);
	}

	.relationship {
		color: var(--muted-text);
		font-style: italic;
	}

	.image-pair {
		display: flex;
		gap: var(--spacing-md);
		width: 100%;
		justify-content: center;
		align-items: stretch;
	}

	.side-by-side .image-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.side-by-side .image-frame {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
	}

	.side-by-side .image-frame img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		mask-image: linear-gradient(to bottom, black 99%, transparent 100%);
		-webkit-mask-image: linear-gradient(to bottom, black 99%, transparent 100%);
	}

	.side-by-side .image-caption {
		margin-top: var(--spacing-xs);
		flex-shrink: 0;
	}

	@keyframes portfolio-reveal-in {
		from {
			opacity: 0;
			transform: none;
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.portfolio-expanded-view--staggered .reveal-parent,
		.portfolio-expanded-view--staggered .reveal-child {
			opacity: 1;
			transform: none;
			animation: none;
		}
	}
</style>
