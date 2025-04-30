<script lang="ts" context="module">
  // Export functions to be used by other components
  export function startDrag(event: MouseEvent, index: number) {
    // This will be implemented by the instance method
  }

  export function handleTouchStart(event: TouchEvent, index: number) {
    // This will be implemented by the instance method
  }
</script>

<script lang="ts">
  import type { CollageImage } from './types.js';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let collageImages: CollageImage[];
  export let onCollageImagesUpdate: (images: CollageImage[]) => void;
  export let imageLocks: Record<number, string>;
  export let onImageLocksUpdate: (locks: Record<number, string>) => void;
  export let draggedImageIndex: number | null = null;

  let grabOffsetX: number;
  let grabOffsetY: number;
  let dragStartX: number;
  let dragStartY: number;
  let initialRight: number;
  let initialBottom: number;
  let currentDragElement: HTMLElement | null = null;

  // Export these functions via dispatch events
  export function startDrag(event: MouseEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    
    if (imageLocks[index]) return;
    
    const imageElement = event.currentTarget as HTMLElement;
    if (!imageElement) return;
    
    const rect = imageElement.getBoundingClientRect();
    const container = imageElement.closest('.mobile-collage, .desktop-collage');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    // Calculate grab offset relative to the image's position within the container
    grabOffsetX = event.clientX - rect.left;
    grabOffsetY = event.clientY - rect.top;
    
    draggedImageIndex = index;
    currentDragElement = imageElement;
    
    imageLocks[index] = "human-user";
    onImageLocksUpdate(imageLocks);
    
    document.body.classList.add('dragging');
    
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', endDrag);

    dispatch('dragstart', { index });
  }

  export function handleTouchStart(event: TouchEvent, index: number) {
    // Only prevent default if we're actually starting a drag
    if (imageLocks[index]) {
      const keys = Object.keys(imageLocks);
      keys.forEach((key: string) => {
        const lockId = imageLocks[parseInt(key, 10)];
        if (lockId !== "human-user") {
          delete imageLocks[parseInt(key, 10)];
        }
      });
      onImageLocksUpdate(imageLocks);
      return;
    }
    
    // Now we know we're starting a drag, prevent default
    event.preventDefault();
    
    const touch = event.touches[0];
    const imageElement = event.currentTarget as HTMLElement;
    if (!imageElement) return;
    
    const rect = imageElement.getBoundingClientRect();
    const container = imageElement.closest('.mobile-collage, .desktop-collage');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    // Calculate grab offset relative to the image's position within the container
    grabOffsetX = touch.clientX - rect.left;
    grabOffsetY = touch.clientY - rect.top;
    
    draggedImageIndex = index;
    currentDragElement = imageElement;
    
    imageLocks[index] = "human-user";
    onImageLocksUpdate(imageLocks);
    
    document.body.classList.add('dragging');
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', endDrag, { once: true });

    dispatch('touchstart', { index });
  }

  function handleTouchMove(event: TouchEvent) {
    if (draggedImageIndex === null || !currentDragElement) {
      // If we're not dragging, don't prevent default (allow scrolling)
      return;
    }
    
    // Only prevent default if we're actually dragging
    event.preventDefault();
    
    const touch = event.touches[0];
    if (!touch) return;
    
    // Get the mobile collage container
    const container = currentDragElement.closest('.mobile-collage, .collage-container') as HTMLElement;
    if (!container) return;
    
    // Get absolute container position and dimensions
    const containerRect = container.getBoundingClientRect();
    
    // Image data
    const imageData = collageImages[draggedImageIndex];
    if (!imageData) return;
    
    // Calculate top and left limits of container - account for scroll position
    const containerTop = containerRect.top + window.scrollY;
    const containerLeft = containerRect.left + window.scrollX;
    const containerBottom = containerTop + containerRect.height;
    const containerRight = containerLeft + containerRect.width;
    
    // Calculate absolute touch position including scroll position
    const absoluteTouchX = touch.pageX;
    const absoluteTouchY = touch.pageY;
    
    // Calculate relative position within container
    const relX = absoluteTouchX - containerLeft;
    const relY = absoluteTouchY - containerTop;
    
    // Calculate new position with boundaries
    // For left boundary: don't let left edge of image go below 0
    // For right boundary: don't let right edge of image go beyond container width
    const left = Math.max(0, Math.min(containerRect.width - imageData.width, relX - grabOffsetX));
    
    // For top boundary: don't let top edge go above 0
    // For bottom boundary: don't let bottom edge go below container height
    const bottom = containerRect.height - ((relY - grabOffsetY) + imageData.height);
    const top = Math.max(0, Math.min(containerRect.height - imageData.height, relY - grabOffsetY));
    
    // Make absolutely sure bottom edge stays within container
    if (top + imageData.height > containerRect.height) {
      // Don't update - would exceed bottom boundary
      return;
    }
    
    // Update the element position 
    currentDragElement.style.left = `${left}px`;
    currentDragElement.style.top = `${top}px`;
    currentDragElement.style.transform = `rotate(${imageData.rotation}deg) scale(1)`;
    
    // Debug
    console.log(`Container height: ${containerRect.height}, Image height: ${imageData.height}, Top: ${top}, Bottom edge at: ${top + imageData.height}`);
    
    // Update the data model
    collageImages = collageImages.map((img, i) => {
      if (i === draggedImageIndex) {
        return { ...img, left, top };
      }
      return img;
    });
    
    onCollageImagesUpdate(collageImages);
    dispatch('touchmove', { index: draggedImageIndex });
  }

  function handleDrag(event: MouseEvent) {
    if (draggedImageIndex === null || !currentDragElement) return;
    
    // Get the container directly from the dragged element
    const container = currentDragElement.closest('.mobile-collage, .collage-container, .desktop-collage') as HTMLElement;
    if (!container) return;
    
    // Get absolute container position and dimensions
    const containerRect = container.getBoundingClientRect();
    
    // Image data
    const imageData = collageImages[draggedImageIndex];
    if (!imageData) return;
    
    // Calculate top and left limits of container - account for scroll position
    const containerTop = containerRect.top + window.scrollY;
    const containerLeft = containerRect.left + window.scrollX;
    const containerBottom = containerTop + containerRect.height;
    const containerRight = containerLeft + containerRect.width;
    
    // Calculate absolute mouse position including scroll position
    const absoluteMouseX = event.pageX;
    const absoluteMouseY = event.pageY;
    
    // Calculate relative position within container
    const relX = absoluteMouseX - containerLeft;
    const relY = absoluteMouseY - containerTop;
    
    // Calculate new position with boundaries
    // For left boundary: don't let left edge of image go below 0
    // For right boundary: don't let right edge of image go beyond container width
    const left = Math.max(0, Math.min(containerRect.width - imageData.width, relX - grabOffsetX));
    
    // For top boundary: don't let top edge go above 0
    // For bottom boundary: don't let bottom edge go below container height  
    const top = Math.max(0, Math.min(containerRect.height - imageData.height, relY - grabOffsetY));
    
    // Make absolutely sure bottom edge stays within container
    if (top + imageData.height > containerRect.height) {
      // Don't update - would exceed bottom boundary
      return;
    }
    
    // Update the element position
    currentDragElement.style.left = `${left}px`;
    currentDragElement.style.top = `${top}px`;
    currentDragElement.style.transform = `rotate(${imageData.rotation}deg) scale(1)`;
    
    // Debug
    console.log(`Container height: ${containerRect.height}, Image height: ${imageData.height}, Top: ${top}, Bottom edge at: ${top + imageData.height}`);
    
    // Update the data model
    collageImages = collageImages.map((img, i) => {
      if (i === draggedImageIndex) {
        return { ...img, left, top };
      }
      return img;
    });
    
    onCollageImagesUpdate(collageImages);
    dispatch('drag', { index: draggedImageIndex });
  }

  function endDrag() {
    document.body.classList.remove('dragging');
    
    window.removeEventListener('mousemove', handleDrag);
    window.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', handleTouchMove);
    
    if (draggedImageIndex !== null) {
      delete imageLocks[draggedImageIndex];
      onImageLocksUpdate(imageLocks);
      dispatch('dragend', { index: draggedImageIndex });
    }
    
    draggedImageIndex = null;
    currentDragElement = null;
  }
</script> 