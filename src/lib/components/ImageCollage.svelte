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
    // Only update if event comes from the active collage component
    console.log('Got update event from collage component:', event.detail);
    
    // Check if event detail exists
    if (!event.detail) {
      console.error('Missing event detail in update event');
        return;
      }
      
    const { name, collageImages: updatedImages } = event.detail;
    
    if (!name || !updatedImages) {
      console.error('Missing required data in collage update event:', event.detail);
        return;
      }
      
    if ((isDesktop && name === 'desktop') || (!isDesktop && name === 'mobile')) {
      console.log(`Updating collage images from ${name} component`, updatedImages.length);
      collageImages = updatedImages;
      } else {
      console.log(`Ignoring update from ${name} component (current mode: ${isDesktop ? 'desktop' : 'mobile'})`);
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
      let width, height;

      // Check for orchid and dahlia specifically by filename
      const isOrchid = img.src.includes('orchid.png');
      const isDahlia = img.src.includes('dahlia.png');

      if (isMobile) {
        // Mobile sizing - balanced sizes
        if (isOrchid || isDahlia) {
          width = windowWidth * 0.55; // Make orchid and dahlia prominent
        } else if (index === womanIndex || index === knightIndex) {
          width = windowWidth * 0.45;
        } else if (index === beetleIndex) {
          width = windowWidth * 0.25;
        } else if (index === birdIndex) {
          width = windowWidth * 0.25; // Smaller parrots (was 0.35)
        } else if (index === snakeIndex) {
          width = windowWidth * 0.40; // Bigger snake
        } else if (index === rockIndex) {
          width = windowWidth * 0.20;
        } else {
          width = aspectRatio >= 1 ? 
            windowWidth * 0.35 : // Landscape
            windowWidth * 0.30;  // Portrait
        }
      } else {
        // Desktop sizing
        if (isOrchid) {
          width = windowWidth * 0.18; // Make orchid and dahlia very large on desktop
        } else if (isDahlia) {
          width = windowWidth * 0.23;
        } else if (index === womanIndex) {
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
            windowWidth * 0.12 : // Landscape
            windowWidth * 0.10;  // Portrait
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
          // Mobile positioning - use container dimensions instead of window
          const container = document.querySelector('.mobile-collage');
          if (container) {
            const rect = container.getBoundingClientRect();
            const margin = 20;
            left = margin + Math.random() * (rect.width - img.width - margin * 2);
            top = margin + Math.random() * (rect.height - img.height - margin * 2);
          } else {
            // Fallback if container not found
            left = 50 + Math.random() * (windowWidth - img.width - 100);
            top = 50 + Math.random() * (windowHeight - img.height - 100);
          }
        } else {
          // Desktop positioning - use right two-thirds
          if (index < 4) {
            // For largest images, divide the right two-thirds into quadrants
            const quadrant = index % 4;
            const xRange = quadrant % 2 === 0 ? 
              [desktopLeftBoundary, desktopLeftBoundary + usableWidth * 0.5] : 
              [desktopLeftBoundary + usableWidth * 0.5, windowWidth - img.width - 50];
            const yRange = quadrant < 2 ? 
              [50, windowHeight * 0.5] : 
              [windowHeight * 0.5, windowHeight - img.height - 50];
            
            left = xRange[0] + Math.random() * (xRange[1] - xRange[0]);
            top = yRange[0] + Math.random() * (yRange[1] - yRange[0]);
        } else {
            // For smaller images, find gaps within the right two-thirds
            left = desktopLeftBoundary + Math.random() * (usableWidth - img.width);
            top = 50 + Math.random() * (windowHeight - img.height - 100);
          }
        }

        // Update the bounds checking for mobile
        if (isMobile) {
          const container = document.querySelector('.mobile-collage');
          if (container) {
            const rect = container.getBoundingClientRect();
            const margin = 20;
            left = Math.max(margin, Math.min(rect.width - img.width - margin, left));
            top = Math.max(margin, Math.min(rect.height - img.height - margin, top));
          } else {
            left = Math.max(50, Math.min(windowWidth - img.width - 50, left));
            top = Math.max(50, Math.min(windowHeight - img.height - 50, top));
          }
        } else {
          left = Math.max(desktopLeftBoundary, Math.min(windowWidth - img.width - 50, left));
          top = Math.max(50, Math.min(windowHeight - img.height - 50, top));
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
      
      // Enable images after a delay
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
        
        isDesktop = window.innerWidth > 768;
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
        
        // Regenerate positions if window size changed significantly
        if (Math.abs(oldWidth - windowWidth) > 50 || Math.abs(oldHeight - windowHeight) > 50) {
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
            console.log('Cursor update:', updatedCursors.map(c => ({
              name: c.name,
              isDragging: c.isDragging,
              targetImage: c.targetImage
            })));
            cursors = updatedCursors;
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
          console.log('Cursor update:', updatedCursors.map(c => ({
            name: c.name,
            isDragging: c.isDragging,
            targetImage: c.targetImage
          })));
          cursors = updatedCursors;
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
    position: relative;
    width: 100%;
    min-height: 85vh;
    overflow: hidden;
  }
</style> 