<script lang="ts">
	export let showPanel = false;
	export let isDirectVideo = false;
	export let videoUrl = '';
	/** Shown until the first frame decodes (iOS often needs poster + seek). */
	export let videoPoster = '';
	export let mobileVideoVisible = true;
	export let mobileVideoCompactProgress = 0;
	export let mobileVideoEl: HTMLVideoElement | null = null;
	export let handleMobileAudioPlay: () => void;
	export let handleMobileAudioPause: () => void;
	export let handleMobileMediaTimeUpdate: (event: Event) => void;

	let primedUrl = '';

	$: {
		videoUrl;
		primedUrl = '';
	}

	/**
	 * iOS often skips painting frame 0 until a non-zero seek. Start muted so the
	 * browser will decode a frame without a play gesture; unmute on play (user
	 * taps the media control) so the file’s audio is still heard.
	 */
	function primeFirstFrame(e: Event) {
		const v = e.currentTarget as HTMLVideoElement;
		if (primedUrl === videoUrl) return;
		if (v.readyState < HTMLMediaElement.HAVE_METADATA) return;
		try {
			const t =
				v.duration > 0 && Number.isFinite(v.duration)
					? Math.min(0.08, Math.max(0.001, v.duration * 0.0005))
					: 0.001;
			v.currentTime = t;
			primedUrl = videoUrl;
		} catch {
			/* noop */
		}
	}

	function onVideoPlay(e: Event) {
		(e.currentTarget as HTMLVideoElement).muted = false;
		handleMobileAudioPlay();
	}
</script>

{#if showPanel}
	<div class="mobile-media-panel" style={`--mobile-video-compact:${mobileVideoCompactProgress};`}>
		{#if isDirectVideo}
			{#if mobileVideoVisible}
				<div class="mobile-media-video-panel">
					<div class="mobile-media-video-shell">
						<!-- svelte-ignore a11y-media-has-caption -->
						<video
							class="mobile-media-video-preview"
							bind:this={mobileVideoEl}
							preload="auto"
							playsinline
							muted
							poster={videoPoster || undefined}
							src={videoUrl}
							on:play={onVideoPlay}
							on:pause={handleMobileAudioPause}
							on:loadedmetadata={handleMobileMediaTimeUpdate}
							on:loadeddata={primeFirstFrame}
							on:canplay={primeFirstFrame}
							on:timeupdate={handleMobileMediaTimeUpdate}
							on:seeked={handleMobileMediaTimeUpdate}
						></video>
					</div>
				</div>
			{/if}
		{:else}
			<div class="mobile-media-unsupported">
				Audio controls are available for direct video files.
			</div>
		{/if}
	</div>
{/if}

<style>
	.mobile-media-panel {
		display: flex;
		flex-direction: column;
		gap: 0;
		padding: 0;
		margin: 0 0 0.55rem;
		width: 100vw;
		margin-left: calc(50% - 50vw);
		margin-right: calc(50% - 50vw);
		position: sticky;
		top: 0;
		z-index: 8;
		background: transparent;
	}

	.mobile-media-video-panel {
		background: transparent;
		display: flex;
		justify-content: center;
	}

	.mobile-media-video-shell {
		position: relative;
		width: 100%;
		transform-origin: top center;
		transform: scale(calc(1 - var(--mobile-video-compact, 0) * 0.4));
		transition: transform 120ms linear;
	}

	.mobile-media-video-preview {
		width: 100%;
		aspect-ratio: 16 / 9;
		border: 1px solid var(--text-color);
		background: var(--bg-color);
		object-fit: cover;
		display: block;
	}

	.mobile-media-unsupported {
		border: 1px solid var(--text-color);
		padding: 0.45rem 0.6rem;
		font-size: var(--font-size-xs);
		line-height: 1.5;
		color: var(--text-color);
		opacity: 0.85;
	}

	@media (min-width: 769px) {
		.mobile-media-panel {
			display: none !important;
		}
	}
</style>
