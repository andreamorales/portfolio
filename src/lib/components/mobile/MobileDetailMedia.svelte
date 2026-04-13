<script lang="ts">
	export let showPanel = false;
	export let isDirectVideo = false;
	export let videoUrl = '';
	export let videoFallbackImage = '';
	export let mobileVideoVisible = true;
	export let mobileVideoCompactProgress = 0;
	export let mobileVideoEl: HTMLVideoElement | null = null;
	export let handleMobileAudioPlay: () => void;
	export let handleMobileAudioPause: () => void;
	export let handleMobileMediaTimeUpdate: (event: Event) => void;

	let primedUrl = '';
	let primingFrame = false;
	let frameReady = false;
	let hasUserPlayed = false;

	$: {
		primedUrl = '';
		frameReady = false;
		hasUserPlayed = false;
	}

	/**
	 * iOS often skips painting frame 0 until a non-zero seek. Start muted so the
	 * browser will decode a frame without a play gesture; unmute on play (user
	 * taps the media control) so the file’s audio is still heard.
	 */
	async function primeFirstFrame(e: Event) {
		const v = e.currentTarget as HTMLVideoElement;
		if (primedUrl === videoUrl) return;
		if (hasUserPlayed) return;
		if (v.readyState < HTMLMediaElement.HAVE_METADATA) return;
		// Never interrupt a real user play gesture.
		if (!v.paused) return;
		try {
			primingFrame = true;
			const t =
				v.duration > 0 && Number.isFinite(v.duration)
					? Math.min(0.08, Math.max(0.001, v.duration * 0.0005))
					: 0.001;
			if (Math.abs(v.currentTime - t) > 0.0005) {
				v.currentTime = t;
			}
			primedUrl = videoUrl;
			queueMicrotask(() => {
				if (
					v.videoWidth > 0 &&
					v.videoHeight > 0 &&
					v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
				) {
					frameReady = true;
				}
			});
		} catch {
			/* noop */
		} finally {
			primingFrame = false;
		}
	}

	function markFrameReady(e: Event) {
		const v = e.currentTarget as HTMLVideoElement;
		if (
			v.videoWidth > 0 &&
			v.videoHeight > 0 &&
			v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
		) {
			frameReady = true;
		}
	}

	function onVideoLoadedMetadata(e: Event) {
		handleMobileMediaTimeUpdate(e);
		markFrameReady(e);
	}

	function onVideoTimeUpdate(e: Event) {
		handleMobileMediaTimeUpdate(e);
		markFrameReady(e);
	}

	function onVideoPlay(e: Event) {
		hasUserPlayed = true;
		frameReady = true;
		if (primingFrame) return;
		(e.currentTarget as HTMLVideoElement).muted = false;
		handleMobileAudioPlay();
	}

	function onVideoPause() {
		if (primingFrame) return;
		handleMobileAudioPause();
	}
</script>

{#if showPanel}
	<div class="mobile-media-panel" style={`--mobile-video-compact:${mobileVideoCompactProgress};`}>
		{#if isDirectVideo}
			{#if mobileVideoVisible}
				<div class="mobile-media-video-panel">
					<div class="mobile-media-video-shell">
						{#if !frameReady}
							<div class="mobile-media-video-fallback" aria-hidden="true">
								{#if videoFallbackImage}
									<img
										class="mobile-media-video-fallback-image"
										src={videoFallbackImage}
										alt=""
										loading="eager"
										decoding="async"
									/>
								{:else}
									<div class="mobile-media-video-fallback-solid"></div>
								{/if}
							</div>
						{/if}
						<video
							class="mobile-media-video-preview"
							bind:this={mobileVideoEl}
							preload="auto"
							playsinline
							muted
							controlsList="nodownload"
							disablePictureInPicture
							src={videoUrl}
							on:contextmenu|preventDefault
							on:play={onVideoPlay}
							on:pause={onVideoPause}
							on:loadedmetadata={onVideoLoadedMetadata}
							on:loadeddata={primeFirstFrame}
							on:canplay={primeFirstFrame}
							on:timeupdate={onVideoTimeUpdate}
							on:seeked={onVideoTimeUpdate}
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
		-webkit-touch-callout: none;
		user-select: none;
	}

	.mobile-media-video-fallback {
		position: absolute;
		inset: 0;
		z-index: 1;
		border: 1px solid var(--text-color);
		background: var(--bg-color);
		pointer-events: none;
	}

	.mobile-media-video-fallback-image {
		width: 100%;
		height: 100%;
		display: block;
		object-fit: cover;
	}

	.mobile-media-video-fallback-solid {
		width: 100%;
		height: 100%;
		background: var(--bg-color);
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
