<script lang="ts">
	export let showPanel = false;
	export let isDirectVideo = false;
	export let videoUrl = '';
	export let mobileVideoVisible = true;
	export let mobileVideoCompactProgress = 0;
	export let mobileVideoEl: HTMLVideoElement | null = null;
	export let handleMobileAudioPlay: () => void;
	export let handleMobileAudioPause: () => void;
	export let handleMobileMediaTimeUpdate: (event: Event) => void;
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
							preload="metadata"
							playsinline
							src={videoUrl}
							on:play={handleMobileAudioPlay}
							on:pause={handleMobileAudioPause}
							on:loadedmetadata={handleMobileMediaTimeUpdate}
							on:timeupdate={handleMobileMediaTimeUpdate}
							on:seeked={handleMobileMediaTimeUpdate}
						></video>
					</div>
				</div>
			{/if}
		{:else}
			<div class="mobile-media-unsupported">Audio controls are available for direct video files.</div>
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
