import { writable } from 'svelte/store';

// Store to track which images are actively being dragged
interface DraggingState {
  // Map of imageIndex to true if being actively dragged
  activeDrags: Record<number, boolean>;
}

// Create the store with initial empty state
const draggingStore = writable<DraggingState>({
  activeDrags: {}
});

// Helper functions to update the store
export const startDragging = (imageIndex: number) => {
  draggingStore.update(state => {
    return {
      ...state,
      activeDrags: {
        ...state.activeDrags,
        [imageIndex]: true
      }
    };
  });
};

export const stopDragging = (imageIndex: number) => {
  draggingStore.update(state => {
    const newActiveDrags = { ...state.activeDrags };
    delete newActiveDrags[imageIndex];
    return {
      ...state,
      activeDrags: newActiveDrags
    };
  });
};

export const isBeingDragged = (imageIndex: number): boolean => {
  let result = false;
  draggingStore.subscribe(state => {
    result = !!state.activeDrags[imageIndex];
  })();
  return result;
};

export default draggingStore; 