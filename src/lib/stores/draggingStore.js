import { writable } from 'svelte/store';

// Store to track which images are actively being dragged
const createDraggingStore = () => {
  // Create the store with initial empty state
  const { subscribe, set, update } = writable({
    activeDrags: {}
  });

  return {
    subscribe,
    
    // Start dragging an image
    startDragging: (imageIndex) => {
      console.log(`STORE: Adding image ${imageIndex} to active drags`);
      update(state => {
        return {
          ...state,
          activeDrags: {
            ...state.activeDrags,
            [imageIndex]: true
          }
        };
      });
    },
    
    // Stop dragging an image
    stopDragging: (imageIndex) => {
      console.log(`STORE: Removing image ${imageIndex} from active drags`);
      update(state => {
        const newActiveDrags = { ...state.activeDrags };
        delete newActiveDrags[imageIndex];
        return {
          ...state,
          activeDrags: newActiveDrags
        };
      });
    },
    
    // Check if an image is being dragged
    isBeingDragged: (imageIndex) => {
      let result = false;
      subscribe(state => {
        result = !!state.activeDrags[imageIndex];
      })();
      return result;
    },
    
    // Reset the entire store
    resetStore: () => {
      console.log("STORE: Resetting entire drag store");
      set({ activeDrags: {} });
    }
  };
};

// Create and export the store
const draggingStore = createDraggingStore();
export default draggingStore;

// Export helper functions
export const { startDragging, stopDragging, isBeingDragged, resetStore } = draggingStore; 