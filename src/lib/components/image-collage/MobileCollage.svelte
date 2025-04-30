<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { CollageImage } from './types.js';
  import { onMount, onDestroy } from 'svelte';
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

  let mobileCollageElement: HTMLDivElement;
  
  function enforceContainerBoundaries() {
    if (!browser || !mobileCollageElement) return;
    
    const collageImages = mobileCollageElement.querySelectorAll('.collage-image-button');
    const containerRect = mobileCollageElement.getBoundingClientRect();
    
    collageImages.forEach((imgElement: Element) => {
      if (!(imgElement instanceof HTMLElement)) return;
      
      const imgRect = imgElement.getBoundingClientRect();
      const imgData = {
        left: parseFloat(imgElement.style.left),
        top: parseFloat(imgElement.style.top),
        width: imgRect.width,
        height: imgRect.height
      };
      
      // Check if image exceeds container bottom
      if (imgData.top + imgData.height > containerRect.height) {
        // Pull up image to fit within container
        imgElement.style.top = `${containerRect.height - imgData.height}px`;
      }
    });
  }

  // Initialize on mount
  onMount(() => {
    if (!browser) return;
    console.log(`MobileCollage mounted with ${collageImages.length} images`);
    
    // Initial check on mount
    setTimeout(enforceContainerBoundaries, 100);
    
    // Add mutation observer to catch any DOM changes
    const observer = new MutationObserver(() => {
      enforceContainerBoundaries();
    });
    
    if (mobileCollageElement) {
      observer.observe(mobileCollageElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
      });
    }
    
    return () => {
      observer.disconnect();
    };
  });
</script>

<style>
  .mobile-collage {
    display: none;
    position: relative;
    width: 100%;
    height: 85vh;
    /* Force clipping */
    overflow: hidden !important;
    overflow-y: clip !important;
    /* Hard-clipping boundaries */
    clip-path: inset(0 0 0 0) !important;
    /* Container positioning */
    margin-top: var(--spacing-md);
    margin-bottom: var(--spacing-md);
    padding: 0;
    box-sizing: border-box;
    z-index: 5;
    /* Create stacking context */
    isolation: isolate;
    /* Allow scrolling by default */
    touch-action: pan-y;
  }

  @media (max-width: 768px) {
    .mobile-collage {
      display: block;
      width: 100%;
      height: 85vh;
      max-height: 85vh;
      position: relative;
      margin: var(--spacing-md) 0;
      /* Force clipping */
      overflow: hidden !important;
      overflow-y: clip !important;
      /* Hard-clipping boundaries */
      clip-path: inset(0 0 0 0) !important;
      /* Create stacking context */
      isolation: isolate;
      /* Allow scrolling by default */
      touch-action: pan-y;
    }
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
    /* Only prevent touch actions on the image buttons */
    touch-action: none;
    /* Ensure images can't exceed container */
    max-height: 85vh;
  }

  .collage-image-button:not(:active) {
    transition: transform 0.3s ease;
  }

  .collage-image {
    display: block;
    pointer-events: none;
    user-select: none;
    -webkit-user-drag: none;
    /* Ensure images can't exceed container */
    max-height: 85vh;
  }
  
  .collage-image-button:active {
    cursor: grabbing;
  }
  
  .bottom-boundary {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background-color: transparent;
    pointer-events: none;
    z-index: 1000;
  }
</style>

<div class="mobile-collage" bind:this={mobileCollageElement}>
  <div class="bottom-boundary"></div>
  
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