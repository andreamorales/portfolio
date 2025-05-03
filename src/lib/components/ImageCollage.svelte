<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { CollageImage, Cursor } from './image-collage/types.js';
  import CursorSystem from './image-collage/CursorSystem.svelte';
  import DesktopCollage from './image-collage/DesktopCollage.svelte';
  import MobileCollage from './image-collage/MobileCollage.svelte';
  import DragHandler from './image-collage/DragHandler.svelte';
  import draggingStore, { startDragging, stopDragging } from '../stores/draggingStore.js';
  import { browser } from '$app/environment';
  import { writable } from 'svelte/store';
  
  export let imageDimensions: any[] = [];
  export let largeScreenImages: any[] = [];
  let cursors: Cursor[] = [];
  let collageImages: CollageImage[] = [];
  let imagesReady = false;
  let visibleImages: number[] = [];
  let hasInteractedWithCollage = false;
  let imageLocks: Record<number, string> = {};
  let draggedImageIndex: number | null = null;
  let boundStartDrag: (e: MouseEvent, i: number) => void;
  let boundHandleTouchStart: (e: TouchEvent, i: number) => void;
  let isDesktop = true; // Default to desktop for SSR
  let resizeListener: () => void;
  let windowWidth = 1200; // Default SSR width
  let windowHeight = 800; // Default SSR height

  // Create isMobile store
  const isMobile = writable(false);
  
  // Update isMobile store on mount and window resize
  function updateMobileState() {
    if (browser) {
      $isMobile = window.innerWidth <= 768;
    }
  }
  
  onMount(() => {
    updateMobileState();
    if (browser) {
      window.addEventListener('resize', updateMobileState);
    }
    
    // Set initial window dimensions
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    isDesktop = windowWidth > 768;
  });

  // Handler to update collageImages when children emit events
  function updateCollageImages(event: CustomEvent) {
    if (!event.detail) return;
      
    const { name, collageImages: updatedImages } = event.detail;
    
    if (!name || !updatedImages) return;
      
    if ((isDesktop && name === 'desktop') || (!isDesktop && name === 'mobile')) {
      collageImages = updatedImages;
    }
  }

  // Function to bring image to front
  function bringToFront(index: number) {
    const highestZ = Math.max(...collageImages.map(img => img.zIndex)) + 1;
    collageImages = collageImages.map((img, i) => {
      if (i === index) {
        return { ...img, zIndex: highestZ };
      }
      return img;
    });
  }

  // Function to get debug border style for images being moved by cursors
  function getDebugBorderStyle(imageIndex: number): string {
    const lockOwnerId = imageLocks[imageIndex];
    if (!lockOwnerId || lockOwnerId === "human-user") {
      // Clear any existing highlight
      const element = document.querySelector(`.collage-image-button:nth-child(${imageIndex + 1})`);
      if (element instanceof HTMLElement) {
        element.style.boxShadow = '';
        element.style.outline = '';
        element.style.borderRadius = '';
      }
      return '';
    }
    
    const cursor = cursors.find(c => c.id === lockOwnerId);
    if (!cursor) {
      // Clear any existing highlight
      const element = document.querySelector(`.collage-image-button:nth-child(${imageIndex + 1})`);
      if (element instanceof HTMLElement) {
        element.style.boxShadow = '';
        element.style.outline = '';
        element.style.borderRadius = '';
      }
      return '';
    }
    
    // Only show highlight if cursor is actively dragging this image
    if (cursor.isDragging && cursor.targetImage === imageIndex) {
      return `
        box-shadow: 0 0 0 4px ${cursor.color}, 0 0 0 6px rgba(255,255,255,0.8);
        border-radius: 4px;
        outline: 2px dashed ${cursor.color};
        outline-offset: 2px;
        transition: box-shadow 0.2s ease-in-out, outline 0.2s ease-in-out;
      `;
    }
    
    // Clear highlight in all other cases
    const element = document.querySelector(`.collage-image-button:nth-child(${imageIndex + 1})`);
    if (element instanceof HTMLElement) {
      element.style.boxShadow = '';
      element.style.outline = '';
      element.style.borderRadius = '';
    }
    return '';
  }
  
  // Function to log the current state for debugging
  function logState(label: string) {
    console.log(`[${label}] collageImages: ${collageImages.length}, imagesReady: ${imagesReady}, visibleImages: ${visibleImages.length}`);
  }

  // Function to generate initial positions for all images
  function generateInitialPositions(images: any[]): CollageImage[] {
    if (!browser) return images;

    // Always get fresh window dimensions
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    const isMobile = windowWidth <= 768;

    console.log(`Generating positions with window size: ${windowWidth}x${windowHeight}, isMobile: ${isMobile}`);

    // Find special images first
    const womanIndex = images.findIndex(img => 
      img.alt?.toLowerCase().includes('woman') || 
      img.alt?.toLowerCase().includes('lady')
    );
    const knightIndex = images.findIndex(img => 
      img.alt?.toLowerCase().includes('knight') || 
      img.alt?.toLowerCase().includes('armor')
    );
    const flowersIndex = images.findIndex(img =>
      img.alt?.toLowerCase().includes('flower') ||
      img.alt?.toLowerCase().includes('bloom')
    );
    const snakeIndex = images.findIndex(img =>
      img.alt?.toLowerCase().includes('snake') ||
      img.alt?.toLowerCase().includes('serpent')
    );
    const owlIndex = images.findIndex(img =>
      img.alt?.toLowerCase().includes('owl')
    );
    const birdIndex = images.findIndex(img =>
      img.alt?.toLowerCase().includes('bird') ||
      img.alt?.toLowerCase().includes('parrot')
    );
    const beetleIndex = images.findIndex(img =>
      img.alt?.toLowerCase().includes('beetle') ||
      img.alt?.toLowerCase().includes('insect')
    );
    const rockIndex = images.findIndex(img =>
      img.alt?.toLowerCase().includes('rock') ||
      img.alt?.toLowerCase().includes('stone') ||
      img.alt?.toLowerCase().includes('mineral')
    );

    // Size all images first
    const sizedImages = images.map((img, index) => {
      const aspectRatio = img.width / img.height;
      let width: number;
      let height: number;

      // Check for orchid and dahlia specifically by filename
      const isOrchid = img.src.includes('orchid.png');
      const isDahlia = img.src.includes('dahlia.png');

      // Force minimum sizes for orchid and dahlia
      if (isOrchid) {
        // Force orchid to be at least 400px wide on desktop
        width = isMobile ? windowWidth * 0.40 : Math.max(400, windowWidth * 0.25);
        console.warn('Orchid size:', { width, windowWidth });
      } else if (isDahlia) {
        // Force dahlia to be at least 450px wide on desktop
        width = isMobile ? windowWidth * 0.40 : Math.max(450, windowWidth * 0.28);
        console.warn('Dahlia size:', { width, windowWidth });
      } else if (isMobile) {
        // Mobile sizing for other images
        if (index === womanIndex || index === knightIndex) {
          width = windowWidth * 0.35;
        } else if (index === beetleIndex) {
          width = windowWidth * 0.25;
        } else if (index === birdIndex) {
          width = windowWidth * 0.25;
        } else if (index === snakeIndex) {
          width = windowWidth * 0.35;
        } else if (index === rockIndex) {
          width = windowWidth * 0.20;
        } else {
          width = aspectRatio >= 1 ? 
            windowWidth * 0.30 :
            windowWidth * 0.25;
        }
      } else {
        // Desktop sizing for other images
        if (index === womanIndex) {
          width = windowWidth * 0.25;
        } else if (index === knightIndex) {
          width = windowWidth * 0.19;
        } else if (index === snakeIndex) {
          width = windowWidth * 0.22;
        } else if (index === owlIndex) {
          width = windowWidth * 0.20;
        } else if (index === birdIndex) {
          width = windowWidth * 0.12;
        } else if (index === beetleIndex) {
          width = windowWidth * 0.15;
        } else if (index === rockIndex) {
          width = windowWidth * 0.1;
        } else {
          width = aspectRatio >= 1 ? 
            windowWidth * 0.12 :
            windowWidth * 0.10;
        }
      }

      height = width / aspectRatio;
        
      return {
        ...img,
        width,
        height,
        area: width * height,
        zIndex: 100,
        rotation: isMobile ? (Math.random() * 6 - 3) : 0,
        scale: 1
      };
    });
  
    // Sort by area (largest to smallest) for z-index layering
    const sortedBySize = [...sizedImages].sort((a, b) => b.area - a.area);
    
    // Define the usable area for desktop (right two-thirds)
    const desktopLeftBoundary = windowWidth * 0.33; // Start at one-third from left
    const usableWidth = windowWidth - desktopLeftBoundary - 50; // Subtract right margin
    
    interface Rect {
      left: number;
      right: number;
      top: number;
      bottom: number;
    }

    interface PlacedImage {
      left: number;
      top: number;
      width: number;
      height: number;
    }

    // Function to check overlap percentage
    function getOverlapPercentage(newRect: Rect, existingRect: Rect): number {
      const xOverlap = Math.max(0, Math.min(newRect.right, existingRect.right) - Math.max(newRect.left, existingRect.left));
      const yOverlap = Math.max(0, Math.min(newRect.bottom, existingRect.bottom) - Math.max(newRect.top, existingRect.top));
      const overlapArea = xOverlap * yOverlap;
      const smallerArea = Math.min(
        (newRect.right - newRect.left) * (newRect.bottom - newRect.top),
        (existingRect.right - existingRect.left) * (existingRect.bottom - existingRect.top)
      );
      return smallerArea > 0 ? (overlapArea / smallerArea) * 100 : 0;
    }

    // Track placed images for overlap checking
    const placedImages: PlacedImage[] = [];

    return sortedBySize.map((img, index) => {
      let left = 0;
      let top = 0;
      let attempts = 0;
      const maxAttempts = 50;
      let bestPosition: { left: number; top: number } | null = null;
      let lowestOverlap = Infinity;

      // Try to find a position with minimal overlap
      while (attempts < maxAttempts) {
        if (isMobile) {
          // Mobile positioning - use viewport-relative height
          const margin = 20;
          const mobileContainerWidth = windowWidth - (margin * 2);
          const mobileContainerHeight = Math.floor(windowHeight * 0.85) - (margin * 2); // Match container's 85vh

          // Calculate position within fixed bounds
          left = margin + Math.random() * (mobileContainerWidth - img.width - margin * 2);
          top = margin + Math.random() * (mobileContainerHeight - img.height - margin * 2);

          // Ensure bounds - strictly enforce container boundaries
          left = Math.max(
            margin,
            Math.min(mobileContainerWidth - img.width - margin, left)
          );
          top = Math.max(
            margin,
            Math.min(mobileContainerHeight - img.height - margin, top)
          );

          // Add some spacing between images
          const MIN_SPACING = 20;
          let hasOverlap = false;

          // Check overlap with existing images
          for (const placed of placedImages) {
            const dx = Math.abs((left + img.width/2) - (placed.left + placed.width/2));
            const dy = Math.abs((top + img.height/2) - (placed.top + placed.height/2));
            const minSpacingX = (img.width + placed.width)/2 + MIN_SPACING;
            const minSpacingY = (img.height + placed.height)/2 + MIN_SPACING;

            if (dx < minSpacingX && dy < minSpacingY) {
              hasOverlap = true;
              break;
            }
          }

          if (!hasOverlap) {
            break;
          }
        } else {
          // Desktop positioning - use right two-thirds
          if (index < 4) {
            // For largest images, divide the right two-thirds into quadrants
            const quadrant = index % 4;
            const xRange = quadrant % 2 === 0 ? 
              [desktopLeftBoundary, desktopLeftBoundary + usableWidth * 0.5] : 
              [desktopLeftBoundary + usableWidth * 0.5, windowWidth - img.width - 50];
              
            // Ensure there's enough vertical space for the image
            const topMargin = 50; // Add top margin
            const bottomMargin = 50; // Bottom margin
            const yRange = quadrant < 2 ? 
              [topMargin, windowHeight * 0.5 - img.height] : 
              [windowHeight * 0.5, windowHeight - img.height - bottomMargin];
            
            left = xRange[0] + Math.random() * (xRange[1] - xRange[0]);
            top = yRange[0] + Math.random() * (yRange[1] - yRange[0]);
            
            // Extra safety to ensure image is fully visible
            top = Math.max(topMargin, Math.min(top, windowHeight - img.height - bottomMargin));
        } else {
            // For smaller images, find gaps within the right two-thirds
            left = desktopLeftBoundary + Math.random() * (usableWidth - img.width);
            
            // Ensure smaller images also stay within vertical bounds
            const topMargin = 50; // Add top margin
            const bottomMargin = 50; // Bottom margin
            top = topMargin + Math.random() * (windowHeight - img.height - bottomMargin - topMargin);
            
            // Extra safety check
            top = Math.max(topMargin, Math.min(top, windowHeight - img.height - bottomMargin));
          }
        }

        // Calculate overlap with existing images
        const newRect: Rect = {
      left,
          right: left + img.width,
          top,
          bottom: top + img.height
        };

        let maxOverlapWithAny = 0;

        for (const placed of placedImages) {
          const placedRect: Rect = {
            left: placed.left,
            right: placed.left + placed.width,
            top: placed.top,
            bottom: placed.top + placed.height
          };
          const overlap = getOverlapPercentage(newRect, placedRect);
          maxOverlapWithAny = Math.max(maxOverlapWithAny, overlap);
        }

        // If this position has less overlap than our best so far, save it
        if (maxOverlapWithAny < lowestOverlap) {
          lowestOverlap = maxOverlapWithAny;
          bestPosition = { left, top };
        }

        // If we found a position with acceptable overlap, use it
        if (maxOverlapWithAny <= 5) { // 5% overlap maximum
          break;
        }

        attempts++;
      }

      // Use the best position we found
      if (bestPosition) {
        left = bestPosition.left;
        top = bestPosition.top;
      }

      // Add this image to our placed images list
      placedImages.push({
          left,
          top,
        width: img.width,
        height: img.height
      });

      // Calculate z-index based on size (largest in back)
      const zIndex = 1000 + (sortedBySize.length - index) * 10;
      
      return {
        ...img,
        left,
        top,
        zIndex,
        rotation: isMobile ? (Math.random() * 6 - 3) : 0
      };
    });
  }

  // Add debounce function
  function debounce(func: Function, wait: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Initialize the collage
  onMount(async () => {
    if (!browser) return;
    
    console.log('ImageCollage mounting, loading images...');
    console.log('Image dimensions available:', imageDimensions.length);
    
    try {
        await preloadImages();
      console.log('Images preloaded successfully');
      
      const images = getImages();
      console.log(`Creating collage with ${images.length} images`);
      
      if (images.length === 0) {
        console.error('Error: No images available to create collage!');
        return;
      }
    
      collageImages = generateInitialPositions(images);
      console.log(`Generated positions for ${collageImages.length} images`);
      
      // Enable images after a short delay
        setTimeout(() => {
          imagesReady = true;
        console.log('Images ready set to true');
          
        // Show images gradually
        const delayTime = isDesktop ? 180 : 100;
          collageImages.forEach((img, index) => {
            setTimeout(() => {
              visibleImages = [...visibleImages, index];
            console.log(`Made image ${index} visible`);
          }, 150 + index * delayTime);
        });
      }, 200);
      
      // Add window resize listener to update device type
      resizeListener = debounce(() => {
        if (!browser) return;
        
        const wasDesktop = isDesktop;
        const oldWidth = windowWidth;
        const oldHeight = windowHeight;
        
        // Only update window dimensions, don't regenerate on every resize
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
        isDesktop = windowWidth > 768;
        
        // Only regenerate positions if:
        // 1. Device type changed (desktop <-> mobile)
        // 2. Window width changed significantly (more than 100px)
        // 3. Window height changed significantly (more than 100px) AND we're in desktop mode
        if (wasDesktop !== isDesktop || 
            Math.abs(oldWidth - windowWidth) > 100 || 
            (Math.abs(oldHeight - windowHeight) > 100 && !isMobile)) {
          console.log('Window size changed significantly, regenerating positions');
          collageImages = generateInitialPositions(images);
        }
      }, 250);
      window.addEventListener('resize', resizeListener);
      
      } catch (error) {
        console.error('Error loading images:', error);
      }
  });
    
    // Clean up event listeners
  onDestroy(() => {
    if (!browser) return;
    
    if (resizeListener) {
      window.removeEventListener('resize', resizeListener);
    }
  });
  
  function handleResize() {
    if (!browser) return;
    isDesktop = window.innerWidth > 768;
  }

  // Function to preload images
  async function preloadImages() {
    if (!browser) return Promise.resolve();
    
    let imagesToPreload = [...imageDimensions];
    if (window.innerWidth > 1920) {
      imagesToPreload = [...imageDimensions, ...largeScreenImages];
    }

    return Promise.all(imagesToPreload.map(img => {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(true);
        image.onerror = reject;
        image.src = img.src;
      });
    }));
  }

  // Function to get images based on screen size
  function getImages() {
    if (!browser) {
      return [...imageDimensions]; // Default during SSR
    }
    
    let images = [...imageDimensions];
    if (window.innerWidth > 1920) {
      images = [...imageDimensions, ...largeScreenImages];
    }
    return images;
  }

  function handleStartDrag(e: MouseEvent, i: number) {
            hasInteractedWithCollage = true;
    boundStartDrag(e, i);
            bringToFront(i);
  }

  function handleTouchStart(e: TouchEvent, i: number) {
            hasInteractedWithCollage = true;
    boundHandleTouchStart(e, i);
  }

  // Add reactive statement to update styles when cursors or locks change
  $: {
    if (collageImages && cursors.length > 0) {
      collageImages.forEach((_, index) => {
        const style = getDebugBorderStyle(index);
        const element = document.querySelector(`.collage-image-button:nth-child(${index + 1})`);
        if (element instanceof HTMLElement) {
          // Clear existing styles first
          element.style.boxShadow = '';
          element.style.outline = '';
          element.style.borderRadius = '';
          // Apply new styles if any
          if (style) {
            element.style.cssText += style;
          }
        }
      });
    }
  }
</script>

{#if browser}
  {#if $isMobile}
    <div class="collage-container">
      {#if imagesReady}
        <CursorSystem 
          {cursors}
          {collageImages}
          {imageLocks}
          {visibleImages}
          onCursorsUpdate={(updatedCursors) => {
            // Only log if cursors actually changed
            if (JSON.stringify(cursors) !== JSON.stringify(updatedCursors)) {
              cursors = updatedCursors;
            }
          }}
        />

        <DragHandler
          {collageImages}
          {imageLocks}
          onCollageImagesUpdate={(images) => {
            console.log('Images updated from drag');
            collageImages = images;
          }}
          onImageLocksUpdate={(locks) => {
            console.log('Image locks updated:', locks);
            imageLocks = locks;
          }}
          bind:draggedImageIndex
          on:dragstart={({ detail }) => bringToFront(detail.index)}
          bind:startDrag={boundStartDrag}
          bind:handleTouchStart={boundHandleTouchStart}
        />

        <MobileCollage
          {collageImages}
          {imagesReady}
          {visibleImages}
          {hasInteractedWithCollage}
          {draggedImageIndex}
          onStartDrag={handleStartDrag}
          onTouchStart={handleTouchStart}
          onBringToFront={bringToFront}
          {getDebugBorderStyle}
          on:update={updateCollageImages}
        >
          <svelte:fragment slot="drag-hint">
            <slot name="drag-hint" />
          </svelte:fragment>
        </MobileCollage>
  {/if}
</div>
  {:else}
    {#if imagesReady}
      <CursorSystem 
        {cursors}
        {collageImages}
        {imageLocks}
        {visibleImages}
        onCursorsUpdate={(updatedCursors) => {
          // Only log if cursors actually changed
          if (JSON.stringify(cursors) !== JSON.stringify(updatedCursors)) {
            cursors = updatedCursors;
          }
        }}
      />

      <DragHandler
        {collageImages}
        {imageLocks}
        onCollageImagesUpdate={(images) => {
          console.log('Images updated from drag');
          collageImages = images;
        }}
        onImageLocksUpdate={(locks) => {
          console.log('Image locks updated:', locks);
          imageLocks = locks;
        }}
        bind:draggedImageIndex
        on:dragstart={({ detail }) => bringToFront(detail.index)}
        bind:startDrag={boundStartDrag}
        bind:handleTouchStart={boundHandleTouchStart}
      />

      <DesktopCollage
        {collageImages}
        {imagesReady}
        {visibleImages}
        onStartDrag={handleStartDrag}
        onBringToFront={bringToFront}
        {getDebugBorderStyle}
        on:update={updateCollageImages}
      />
      {/if}
  {/if}
{/if}

<style>
  .collage-container {
    /* Create a positioning context */
    position: relative;
    width: 100%;
    height: 85vh;
    max-height: 85vh;
    overflow: hidden !important;
    margin: 0;
    padding: 0;
    /* Force containment */
    contain: strict;
    /* Force hard clipping */
    clip: rect(0, auto, 85vh, 0);
    /* Force hardware acceleration */
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    /* Create stacking context */
    isolation: isolate;
    /* Prevent scrolling */
    touch-action: none;
  }

  @media (max-width: 768px) {
    .collage-container {
      height: 85vh;
      max-height: 85vh;
      margin: var(--spacing-md) 0;
      /* Force containment */
      contain: strict;
      /* Force clipping */
      overflow: hidden !important;
      clip: rect(0, auto, 85vh, 0);
      /* Force hardware acceleration */
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
      /* Create stacking context */
      isolation: isolate;
      /* Prevent scrolling */
      touch-action: none;
    }
  }
</style> 