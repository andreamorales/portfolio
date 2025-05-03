import { writable } from 'svelte/store';

// Create a store to track which images are being dragged
const activeDrags = new Set();
const draggingStore = writable(activeDrags);

// Function to add an image to active drags
export function startDragging(imageIndex) {
  activeDrags.add(imageIndex);
  draggingStore.set(activeDrags);
}

// Function to remove an image from active drags
export function stopDragging(imageIndex) {
  activeDrags.delete(imageIndex);
  draggingStore.set(activeDrags);
}

export default draggingStore; 