<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { CollageImage } from './types.js';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  export let collageImages: CollageImage[] = [];
  export let imagesReady = false;
  export let visibleImages: number[] = [];
  export let hasInteractedWithCollage = false;
  export let draggedImageIndex: number | null = null;
  export let onStartDrag: (event: MouseEvent, index: number) => void;
  export let onTouchStart: (event: TouchEvent, index: number) => void;
  export let onBringToFront: (index: number) => void;
  export let getDebugBorderStyle: (index: number) => string;

  // Initialize on mount
  onMount(() => {
    if (!browser) return;
    console.log(`MobileCollage mounted with ${collageImages.length} images`);
  });
</script>

<div class="mobile-collage">
  {#if !hasInteractedWithCollage && !draggedImageIndex && collageImages.length > 0 && imagesReady}
    <div class="drag-hint">
      <slot name="drag-hint"></slot>
    </div>
  {/if}
  {#if collageImages.length > 0 && imagesReady}
    {#each collageImages as img, i}
      {#if visibleImages.includes(i)}
        <button 
          class="collage-image-button"
          on:mousedown={(e) => {
            onStartDrag(e, i);
            onBringToFront(i);
          }}
          on:touchstart={(e) => {
            onTouchStart(e, i);
            onBringToFront(i);
          }}
          style="
            position: absolute;
            left: {img.left}px; 
            top: {img.top}px; 
            transform: rotate({img.rotation}deg) scale({img.scale || 1});
            z-index: {img.zIndex};
            padding: 0;
            border: none;
            background: none;
            cursor: grab;
            width: {img.width}px;
            height: {img.height}px;
            {getDebugBorderStyle(i)}
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
          >
        </button>
      {/if}
    {/each}
  {/if}
</div>

<style>
  .mobile-collage {
    display: none;
    position: relative;
    width: 100%;
    height: 85vh;
    overflow: hidden;
    margin-top: var(--spacing-md);
    margin-bottom: var(--spacing-md);
    padding: 10px;
    box-sizing: border-box;
    z-index: 5;
    transform: translateZ(0);
    will-change: transform;
    contain: layout paint size;
    isolation: isolate;
  }

  .drag-hint {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #363636;
    z-index: 1000;
    width: 64px;
    height: 64px;
    pointer-events: none;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 0.8;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.2);
    }
    100% {
      opacity: 0.8;
      transform: translate(-50%, -50%) scale(1);
    }
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
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    perspective: 1000px;
    -webkit-perspective: 1000px;
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
    .mobile-collage {
      display: block;
      width: 100%;
      height: 85vh;
      position: relative;
      transform: translateZ(0);
      contain: layout paint size;
      isolation: isolate;
    }
  }
</style> 