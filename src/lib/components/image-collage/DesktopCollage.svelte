<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { CollageImage } from './types.js';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  export let collageImages: CollageImage[] = [];
  export let imagesReady = false;
  export let visibleImages: number[] = [];
  export let onStartDrag: (event: MouseEvent, index: number) => void;
  export let onBringToFront: (index: number) => void;
  export let getDebugBorderStyle: (index: number) => string;

  let collageContainer: HTMLElement;

  // Initialize on mount
  onMount(() => {
    if (!browser) return;
    console.log(`DesktopCollage mounted with ${collageImages.length} images`);
  });
</script>

<div class="desktop-collage" bind:this={collageContainer}>
  {#if collageImages.length > 0 && imagesReady}
    {#each collageImages as img, i}
      {#if visibleImages.includes(i)}
        <button 
          class="collage-image-button"
          on:mousedown={(e) => {
            onStartDrag(e, i);
            onBringToFront(i);
          }}
          style="
            position: absolute;
            left: {img.left}px; 
            top: {img.top}px; 
            transform: rotate({img.rotation}deg);
            z-index: {img.zIndex};
            padding: 0;
            border: none;
            background: none;
            cursor: grab;
            width: {img.width}px;
            height: {img.height}px;
            {getDebugBorderStyle(i)};
            will-change: transform, box-shadow, outline;
          "
        >
          <img 
            src={img.src} 
            alt={img.alt} 
            class="collage-image" 
            in:fade={{ duration: 400 }}
            style="
              width: 100%;
              height: 100%;
              object-fit: contain;
              {img.flexShrink !== undefined ? `flex-shrink: ${img.flexShrink};` : ''}
              {img.aspectRatio ? `aspect-ratio: ${img.aspectRatio};` : ''}
            "
            draggable="false"
          />
        </button>
      {/if}
    {/each}
  {/if}
</div>

<style>
  .desktop-collage {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1; /* Lowered z-index so it doesn't overlap content */
    pointer-events: none;
    overflow: visible;
  }

  .collage-image-button {
    position: absolute;
    display: block;
    transform-origin: center;
    pointer-events: auto;
    cursor: grab;
    will-change: transform;
    -webkit-tap-highlight-color: transparent;
    touch-action: none;
  }

  .collage-image-button:not(:active) {
    transition: transform 0.3s ease;
  }

  .collage-image {
    display: block;
    pointer-events: none;
    user-select: none;
    -webkit-user-drag: none;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
  
  .collage-image-button:active {
    cursor: grabbing;
  }

  @media (max-width: 768px) {
    .desktop-collage {
      display: none;
    }
  }
</style> 