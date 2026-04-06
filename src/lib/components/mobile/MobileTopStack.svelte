<script lang="ts">
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import FloatingContactDock from '$lib/components/ui/FloatingContactDock.svelte';

	export let showNav = false;
	export let showAudio = false;
	export let videoUrl = '';
	export let mobileAudioIsPlaying = false;
	export let mobileAudioDurationMs = 0;
	export let mobileAudioScrubMs = 0;
	export let mobileVideoVisible = true;
	export let mobileTickerCues: Array<{ text: string; startMs: number; endMs: number }> = [];
	export let currentMs = 0;
	export let mobileAudioEl: HTMLAudioElement | null = null;
	export let onGoHome: () => void;
	export let onCopyEmail: () => void;
	export let toggleMobileAudioPlayback: () => void;
	export let handleMobileAudioSeekInput: (event: Event) => void;
	export let commitMobileAudioSeek: () => void;
	export let toggleMobileVideoVisible: () => void;
	export let handleMobileAudioPlay: () => void;
	export let handleMobileAudioPause: () => void;
	export let handleMobileMediaTimeUpdate: (event: Event) => void;
	export let formatMediaTime: (ms: number) => string;

	type Phrase = { text: string; startMs: number; endMs: number };
	let captionPhrases: Phrase[] = [];
	let activePhrase: Phrase | null = null;

	$: {
		if (mobileTickerCues.length) {
			const phrases: Phrase[] = [];
			let chunk: typeof mobileTickerCues = [];
			for (let i = 0; i < mobileTickerCues.length; i++) {
				const cue = mobileTickerCues[i];
				const prev = chunk[chunk.length - 1];
				const gap = prev ? cue.startMs - prev.endMs : 0;
				if (chunk.length >= 6 || (chunk.length && gap > 400)) {
					phrases.push({
						text: chunk.map((c) => c.text).join(' '),
						startMs: chunk[0].startMs,
						endMs: chunk[chunk.length - 1].endMs
					});
					chunk = [];
				}
				chunk.push(cue);
			}
			if (chunk.length) {
				phrases.push({
					text: chunk.map((c) => c.text).join(' '),
					startMs: chunk[0].startMs,
					endMs: chunk[chunk.length - 1].endMs
				});
			}
			captionPhrases = phrases;
		} else {
			captionPhrases = [];
		}
	}

	$: {
		activePhrase =
			captionPhrases.find((p) => currentMs >= p.startMs && currentMs < p.endMs) ?? null;
	}
</script>

<div class="mobile-rainbow-bar" class:mobile-rainbow-bar--home={!showNav} class:mobile-rainbow-bar--nav={showNav}>
	{#if showNav}
		<button class="mobile-nav__home" on:click={onGoHome} aria-label="Back to home">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				width="24"
				height="24"
				fill="currentColor"
				aria-hidden="true"
				style="image-rendering: pixelated"
			>
				<rect x="5" y="2" width="4" height="8" />
				<rect x="15" y="2" width="4" height="8" />
				<rect x="0" y="14" width="2" height="4" />
				<rect x="2" y="16" width="2" height="4" />
				<rect x="4" y="18" width="2" height="4" />
				<rect x="6" y="20" width="12" height="4" />
				<rect x="18" y="18" width="2" height="4" />
				<rect x="20" y="16" width="2" height="4" />
				<rect x="22" y="14" width="2" height="4" />
			</svg>
		</button>
		<div class="mobile-nav__icons">
			<ThemeToggle />
			<FloatingContactDock visible={true} onCopyEmail={onCopyEmail} />
		</div>
	{/if}
</div>

{#if showAudio}
	<div class="mobile-media-audio-panel mobile-media-audio-panel--top">
		<div class="mobile-media-controls">
			<div class="mobile-media-controls__primary">
				<button
					type="button"
					class="mobile-media-play"
					on:click={toggleMobileAudioPlayback}
					aria-label={mobileAudioIsPlaying ? 'Pause audio' : 'Play audio'}
				>
					{#if mobileAudioIsPlaying}
						<svg
							class="mobile-media-play__icon"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 4 5"
							width="24"
							height="24"
							fill="currentColor"
							aria-hidden="true"
							style="image-rendering: pixelated"
						>
							<rect x="0" y="0" width="1" height="5" />
							<rect x="3" y="0" width="1" height="5" />
						</svg>
					{:else}
						<svg
							class="mobile-media-play__icon"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 3 5"
							width="24"
							height="24"
							fill="currentColor"
							aria-hidden="true"
							style="image-rendering: pixelated"
						>
							<rect x="2" y="2" width="1" height="1" />
							<rect x="1" y="1" width="1" height="3" />
							<rect x="0" y="0" width="1" height="5" />
						</svg>
					{/if}
				</button>
				<div class="mobile-media-scrubber-wrap">
					<input
						class="mobile-media-scrubber"
						type="range"
						min="0"
						max={Math.max(0, Math.floor(mobileAudioDurationMs))}
						value={Math.min(
							Math.max(0, Math.floor(mobileAudioScrubMs)),
							Math.max(0, Math.floor(mobileAudioDurationMs))
						)}
						on:input={handleMobileAudioSeekInput}
						on:change={commitMobileAudioSeek}
						on:pointerup={commitMobileAudioSeek}
						on:touchend={commitMobileAudioSeek}
						aria-label="Seek audio"
					/>
				</div>
			</div>
			<div class="mobile-media-controls__secondary">
				<span class="mobile-media-time" aria-hidden="true">{formatMediaTime(mobileAudioScrubMs)}</span>
				<button
					type="button"
					class="mobile-video-switch-wrap"
					on:click={toggleMobileVideoVisible}
					role="switch"
					aria-checked={mobileVideoVisible}
					aria-label={mobileVideoVisible ? 'Video on' : 'Video off'}
				>
					<span class="mobile-video-switch" class:mobile-video-switch--on={mobileVideoVisible}>
						<span class="mobile-video-switch__status">{mobileVideoVisible ? 'ON' : 'OFF'}</span>
						<span class="mobile-video-switch__thumb" aria-hidden="true"></span>
					</span>
					<span class="mobile-video-switch__label">Video</span>
				</button>
			</div>
		</div>
		<audio
			class="mobile-media-audio"
			bind:this={mobileAudioEl}
			preload="metadata"
			src={videoUrl}
			on:play={handleMobileAudioPlay}
			on:pause={handleMobileAudioPause}
			on:loadedmetadata={handleMobileMediaTimeUpdate}
			on:timeupdate={handleMobileMediaTimeUpdate}
			on:seeked={handleMobileMediaTimeUpdate}
		></audio>
	</div>
	{#if mobileAudioIsPlaying && activePhrase}
		<div class="mobile-media-floating-captions mobile-media-floating-captions--top" aria-live="polite">
			{#key activePhrase.startMs}
				<span class="mobile-media-floating-captions__text mobile-media-cc">
					{activePhrase.text}
				</span>
			{/key}
		</div>
	{/if}
{/if}

<style>
	.mobile-rainbow-bar {
		display: block;
		position: relative;
		width: 100%;
		background-image: var(--palette-rainbow-gradient-h);
		background-size: 240% 100%;
		animation: rainbow-dance-bottom 22s linear infinite;
		-webkit-tap-highlight-color: transparent;
	}

	.mobile-rainbow-bar--home {
		height: 5px;
	}

	.mobile-rainbow-bar--nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: auto;
		padding: 0.5rem var(--landing-inset, 1rem);
		padding-top: calc(0.5rem + env(safe-area-inset-top, 0px));
	}

	.mobile-nav__home {
		display: flex;
		align-items: center;
		line-height: 0;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		color: var(--bg-color);
		opacity: 0.9;
		-webkit-tap-highlight-color: transparent;
	}

	.mobile-nav__home:hover {
		opacity: 1;
	}

	.mobile-nav__home :global(svg) {
		display: block;
	}

	.mobile-nav__icons {
		display: flex;
		align-items: center;
		gap: 1.1rem;
	}

	.mobile-nav__icons :global(.theme-toggle) {
		color: var(--bg-color);
		opacity: 1;
		display: flex;
		align-items: center;
		line-height: 0;
		padding: 0;
	}

	.mobile-nav__icons :global(.theme-toggle) :global(svg) {
		width: 24px !important;
		height: 24px !important;
	}

	.mobile-nav__icons :global(.floating-contact-dock) {
		display: inline-flex !important;
		align-items: center;
		gap: 1.1rem;
		pointer-events: auto;
		opacity: 1;
	}

	.mobile-nav__icons :global(.floating-contact-dock__link),
	.mobile-nav__icons :global(.floating-contact-dock__button) {
		color: var(--bg-color);
		opacity: 1;
		display: flex;
		align-items: center;
		line-height: 0;
		padding: 0;
	}

	.mobile-nav__icons :global(.floating-contact-dock__link:hover),
	.mobile-nav__icons :global(.floating-contact-dock__button:hover) {
		opacity: 1;
	}

	.mobile-nav__icons :global(.floating-contact-dock__link svg),
	.mobile-nav__icons :global(.floating-contact-dock__button svg),
	.mobile-nav__icons :global(.floating-contact-dock__link) :global(svg),
	.mobile-nav__icons :global(.floating-contact-dock__button) :global(svg) {
		width: 24px !important;
		height: 24px !important;
	}

	.mobile-media-audio-panel {
		background: color-mix(in srgb, var(--bg-color) 72%, transparent);
		-webkit-backdrop-filter: blur(10px) saturate(120%);
		backdrop-filter: blur(10px) saturate(120%);
	}

	.mobile-media-audio-panel--top {
		width: 100%;
	}

	.mobile-media-controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-sm);
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
		padding-top: 0.25rem;
		padding-bottom: 0.25rem;
		padding-left: max(0.75rem, env(safe-area-inset-left));
		padding-right: max(0.75rem, env(safe-area-inset-right));
	}

	.mobile-media-controls__primary {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		flex: 1 1 auto;
		min-width: 0;
	}

	.mobile-media-controls__secondary {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		flex: 0 0 auto;
	}

	.mobile-media-scrubber-wrap {
		flex: 1 1 auto;
		min-width: 0;
	}

	.mobile-media-scrubber {
		width: 100%;
		accent-color: var(--text-color);
		height: 1px;
	}

	.mobile-media-time {
		color: var(--text-color);
		font-family: inherit;
		font-size: var(--font-size-xs);
		opacity: 0.8;
		min-width: 2.4rem;
		text-align: right;
	}

	.mobile-media-play {
		border: none;
		background: transparent;
		color: var(--text-color);
		padding: 0;
		line-height: 0;
		cursor: pointer;
		opacity: 0.88;
		flex: 0 0 auto;
	}

	.mobile-media-play:hover {
		opacity: 1;
	}

	.mobile-media-play__icon {
		display: block;
		flex-shrink: 0;
		width: 24px;
		height: 24px;
	}

	.mobile-video-switch-wrap {
		border: none;
		background: transparent;
		padding: 0;
		margin: 0;
		display: inline-flex;
		align-items: center;
		gap: 0.38rem;
		cursor: pointer;
		color: var(--text-color);
		flex: 0 0 auto;
	}

	.mobile-video-switch {
		position: relative;
		width: 54px;
		height: 24px;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--text-color) 74%, transparent);
		background: color-mix(in srgb, var(--text-color) 7%, transparent);
		display: inline-flex;
		align-items: center;
		padding: 0 6px;
		box-sizing: border-box;
		transition: background-color 120ms ease;
	}

	.mobile-video-switch--on {
		background: color-mix(in srgb, var(--text-color) 16%, transparent);
	}

	.mobile-video-switch__status {
		position: absolute;
		right: 6px;
		font-size: 0.58rem;
		letter-spacing: 0.06em;
		opacity: 0.92;
		font-variation-settings:
			'CASL' 0,
			'wght' 600;
	}

	.mobile-video-switch--on .mobile-video-switch__status {
		left: 6px;
		right: auto;
	}

	.mobile-video-switch__thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 18px;
		height: 18px;
		border-radius: 999px;
		background: var(--text-color);
		box-shadow: 0 1px 2px color-mix(in srgb, var(--text-color) 22%, transparent);
		transition: transform 120ms ease;
	}

	.mobile-video-switch--on .mobile-video-switch__thumb {
		transform: translateX(30px);
	}

	.mobile-video-switch__label {
		font-size: 0.68rem;
		letter-spacing: 0.02em;
		opacity: 0.82;
	}

	.mobile-media-audio {
		width: 100%;
		height: 0;
		opacity: 0;
		pointer-events: none;
		position: absolute;
	}

	.mobile-media-floating-captions {
		align-self: center;
		margin: 0.18rem 0 0.4rem;
	}

	.mobile-media-floating-captions__text {
		display: inline-block;
		font-size: var(--font-size-base);
		line-height: 1.62;
		color: var(--bg-color);
		background: color-mix(in srgb, var(--text-color) 88%, transparent);
		padding: 0.34rem 0.62rem;
		border-radius: 0;
	}

	.mobile-media-cc {
		display: inline-block;
		text-align: center;
		animation: cc-fade 220ms ease-out;
	}

	@keyframes cc-fade {
		0% { opacity: 0; }
		100% { opacity: 1; }
	}

	@media (min-width: 769px) {
		.mobile-rainbow-bar,
		.mobile-media-audio-panel,
		.mobile-media-floating-captions {
			display: none !important;
		}
	}
</style>
