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
    
    if (imageLocks[index]) {
      return;
    }
    
    // Store target element directly from the event
    const imageElement = event.currentTarget as HTMLElement;
    if (!imageElement) return;
    
    const rect = imageElement.getBoundingClientRect();
    
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
    event.preventDefault();
    
    if (imageLocks[index]) {
      const keys = Object.keys(imageLocks);
      keys.forEach((key: string) => {
        const lockId = imageLocks[parseInt(key, 10)];
        if (lockId !== "human-user") {
          delete imageLocks[parseInt(key, 10)];
        }
      });
      onImageLocksUpdate(imageLocks);
      
      imageLocks[index] = "human-user";
    } else {
      imageLocks[index] = "human-user";
    }
    onImageLocksUpdate(imageLocks);
    
    const touch = event.touches[0];
    // Store target element directly from the event
    const imageElement = event.currentTarget as HTMLElement;
    if (!imageElement) return;
    
    const rect = imageElement.getBoundingClientRect();
    
    grabOffsetX = touch.clientX - rect.left;
    grabOffsetY = touch.clientY - rect.top;
    
    draggedImageIndex = index;
    currentDragElement = imageElement;
    
    document.body.classList.add('dragging');
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', endDrag, { once: true });

    dispatch('touchstart', { index });
  }

  function handleDrag(event: MouseEvent) {
    if (draggedImageIndex === null || !currentDragElement) return;
    
    // Get the actual desktop collage container
    const container = document.querySelector('.desktop-collage') as HTMLElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    // Calculate the position relative to the viewport, not the container
    // Since the .desktop-collage is position: fixed and covers the entire viewport
    const desiredImageLeft = event.clientX - grabOffsetX;
    const desiredImageTop = event.clientY - grabOffsetY;
    
    const MIN_MARGIN = 0;
    
    const imageData = collageImages[draggedImageIndex];
    if (!imageData) return;
    
    const imageWidth = imageData.width;
    const imageHeight = imageData.height;
    
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    
    const isOwl = imageData.alt === 'Owl' || (typeof imageData.alt === 'string' && imageData.alt.includes('owl'));
    const isSnake = imageData.alt === 'Snake' || (typeof imageData.alt === 'string' && imageData.alt.includes('snake'));
    const minTop = (isOwl || isSnake) ? -imageHeight * 0.1 : MIN_MARGIN;
    
    const left = Math.max(
      MIN_MARGIN,
      Math.min(containerWidth - imageWidth - MIN_MARGIN, desiredImageLeft)
    );
    const top = Math.max(
      minTop,
      Math.min(containerHeight - imageHeight - MIN_MARGIN, desiredImageTop)
    );
    
    // Use the stored element reference
    const imageElement = currentDragElement;
    
    // Set the styles directly on the element
    imageElement.style.left = `${left}px`;
    imageElement.style.top = `${top}px`;
    
    const scaleFactor = 1;
    imageElement.style.transform = `rotate(${imageData.rotation}deg) scale(${scaleFactor})`;
    
    // Update the collageImages array
    collageImages = collageImages.map((img, i) => {
      if (i === draggedImageIndex) {
        return {
          ...img,
          left,
          top
        };
      }
      return img;
    });
    
    onCollageImagesUpdate(collageImages);
    dispatch('drag', { index: draggedImageIndex });
  }

  function handleTouchMove(event: TouchEvent) {
    if (draggedImageIndex === null || !currentDragElement) return;
    
    event.preventDefault();
    
    const touch = event.touches[0];
    if (!touch) return;
    
    // Get the mobile collage container
    const container = document.querySelector('.mobile-collage') as HTMLElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    // Calculate positions relative to the container since mobile uses position: absolute
    const desiredImageLeft = touch.clientX - grabOffsetX - containerRect.left;
    const desiredImageTop = touch.clientY - grabOffsetY - containerRect.top;
    
    const MIN_MARGIN = 0;
    
    const imageData = collageImages[draggedImageIndex];
    if (!imageData) return;
    
    const imageWidth = imageData.width;
    const imageHeight = imageData.height;
    
    // Use container dimensions for bounds checking
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    const isOwl = imageData.alt === 'Owl' || (typeof imageData.alt === 'string' && imageData.alt.includes('owl'));
    const isSnake = imageData.alt === 'Snake' || (typeof imageData.alt === 'string' && imageData.alt.includes('snake'));
    const minTop = (isOwl || isSnake) ? -imageHeight * 0.1 : MIN_MARGIN;
    
    const left = Math.max(
      MIN_MARGIN,
      Math.min(containerWidth - imageWidth - MIN_MARGIN, desiredImageLeft)
    );
    const top = Math.max(
      minTop,
      Math.min(containerHeight - imageHeight - MIN_MARGIN, desiredImageTop)
    );
    
    // Use the stored element reference
    const imageElement = currentDragElement;
    
    // Update the element
    imageElement.style.left = `${left}px`;
    imageElement.style.top = `${top}px`;
    
    // Apply transforms
    const scaleFactor = 1;
    imageElement.style.transform = `rotate(${imageData.rotation}deg) scale(${scaleFactor})`;
    
    // Update the data
    collageImages = collageImages.map((img, i) => {
      if (i === draggedImageIndex) {
        return {
          ...img,
          left,
          top
        };
      }
      return img;
    });
    
    onCollageImagesUpdate(collageImages);
    dispatch('touchmove', { index: draggedImageIndex });
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