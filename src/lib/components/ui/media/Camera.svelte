<script lang="ts">
  import { getContext } from 'svelte';

  export let videoWidth: number;
  export let videoHeight: number;
  export let display: String;

  let loading = true;
  let stream: MediaProvider;
  let videoSource: HTMLVideoElement;
  let canvas: any;

  const videoSourceStore: SvelteStore<HTMLVideoElement> =
    getContext('videoSource');
  const canvasStore: SvelteStore<HTMLCanvasElement> = getContext('canvas');

  const startup = async () => {
    try {
      canvas = document.createElement('canvas');
      loading = true;
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      videoSource.srcObject = stream;
      videoSource.play();
      $videoSourceStore = videoSource;
      $canvasStore = canvas;
      loading = false;
    } catch (err) {
      console.error(`An error occurred: ${err}`);
    }
  };

  startup();
</script>

<div class="capture">
  {#if loading}
    <div class="image-holder--init">
      <p>Loading ...</p>
    </div>
  {/if}
  <!-- svelte-ignore a11y-media-has-caption -->
  <video
    bind:this={videoSource}
    style="--video-width: {videoWidth}px; --video-height: {videoHeight}px; width: {videoWidth}px; height: {videoHeight}px; display: {display}"
  >
    Video stream not available.
  </video>
</div>

<style>
  video {
    width: calc(var(--video-width) * 1px);
    height: calc(var(--video-height) * 1px);
    border-radius: 0.75em;
    object-fit: cover;
    transform: scaleX(-1);
  }

  .capture {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: calc(var(--video-width) * 1px);
    height: calc(var(--video-height) * 1px);
  }

  .image-holder--init {
    position: absolute;
    top: 0;
    display: flex;
    height: auto;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 0.75em;
    border: 1px solid #ffffff36;
    border-style: dashed;
    align-items: center;
    justify-content: center;
    padding-top: 2em;
    padding-bottom: 2em;
  }
</style>
