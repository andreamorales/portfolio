<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import draggingStore, { startDragging, stopDragging } from '../stores/draggingStore.js';
  
  // Import images from props instead of directly
  export let imageDimensions: any[] = [];
  export let largeScreenImages: any[] = [];
  export let fakeCursors: any[] = [];
  
  // Updated to use CSS variables with better contrast
  const fakeUserColors = [
    'var(--cursor-red)', 
    'var(--cursor-teal)', 
    'var(--cursor-blue)', 
    'var(--cursor-green)', 
    'var(--cursor-purple)', 
    'var(--cursor-pink)', 
    'var(--cursor-indigo)',
    'var(--cursor-yellow)'
    // Using the proper cursor-yellow variable
  ];
  
  // Optional callback for updating fakeCursors
  export let onFakeCursorsUpdate: (cursors: any[]) => void = () => {};
  
  // Collage state
  let collageImages: any[] = [];
  let imagesReady = false;
  let visibleImages: number[] = [];
  let hasInteractedWithCollage = false;
  
  // Add image lock tracking to collage images
  let imageLocks: Record<number, string> = {}; // Map of image index to cursor ID
  
  // Add to state variables
  let grabOffsetX: number;
  let grabOffsetY: number;
  let grabbedImageWidth: number;
  let grabbedImageHeight: number;

  // Cursor appearance control
  let lastCursorCreationTime = 0;
  let cursorActivityTimers: Record<string, number> = {}; // Track cursor inactivity timers
  let initialStaticCursorCreated = false; // Track if we've created the initial static cursor
  let cursorInitializationDelay = 0; // Delay before any cursors appear
  let hasCursorInitialized = false; // Track if cursor system has been initialized
  let guaranteedCursorTimer = 0; // Timer to ensure cursor activity within 1 minute
  let pageVisitStartTime = 0; // When the user started visiting the page
  
  // Function to create a new fake cursor
  function createFakeCursor(isStatic = false, isPreexisting = false) {
    const id = Math.random().toString(36).substr(2, 9);
    // Generate a random user number between 100 and 999
    const randomUserNumber = Math.floor(100 + Math.random() * 900);
    const name = `User${randomUserNumber}`;
    const color = fakeUserColors[Math.floor(Math.random() * fakeUserColors.length)];
    
    // Only log if not a pre-existing cursor (reduces console noise)
    if (!isPreexisting) {
      console.log(`Creating cursor ${name} with color: ${color}`);
    }
    
    // For preexisting cursors, start them in a more advanced state
    // This makes it look like they've been using the system for a while
    let initialState = {
      isDragging: false,
      isMovingToTarget: false,
      targetImage: null
    };
    
    // For preexisting cursors, sometimes have them already dragging an image
    if (isPreexisting && Math.random() < 0.3) {
      // Determine if we should start by dragging an image
      // We'll set the proper targets after the cursor is created
      initialState = {
        isDragging: false, // Will be set to true after target acquisition
        isMovingToTarget: true, // Start by moving toward an image
        targetImage: null // Will be set later
      };
    }
    
    return {
      id,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      color,
      name,
      isDragging: initialState.isDragging,
      isMovingToTarget: initialState.isMovingToTarget,
      targetImage: initialState.targetImage,
      targetX: 0,
      targetY: 0,
      destinationX: 100 + Math.random() * (window.innerWidth - 200),
      destinationY: 100 + Math.random() * (window.innerHeight - 200),
      delayCount: 0,
      // Add curve offsets for curved movement
      curveOffsetX: (Math.random() * 100) - 50,
      curveOffsetY: (Math.random() * 100) - 50,
      // Add time counter for curved movement
      timeFactor: isPreexisting ? Math.random() * 10 : 0, // Give preexisting cursors some initial movement
      randomOffset: { x: 0, y: 0 },
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      originX: 0,
      originY: 0,
      holdDuration: 0,
      // Image tracking properties
      grabOffsetX: 0,
      grabOffsetY: 0,
      initialImageRight: 0,
      initialImageBottom: 0,
      initialImageLeftPx: 0,
      initialImageTopPx: 0,
      initialGrabX: 0,
      initialGrabY: 0,
      // Activity tracking
      lastActiveTime: Date.now(),
      isStatic: isStatic, // Whether this cursor should remain stationary
      restingPeriod: isPreexisting ? Math.random() * 4000 : 0, // Some preexisting cursors may be resting
      isPreexisting: isPreexisting, // Used to identify cursors that were "already there"
      lifespan: 30000 + Math.random() * 60000 // Cursor will stay for 30-90 seconds by default
    };
  }
  
  // Initialize preexisting cursors with proper image targets
  function setupPreexistingCursor(cursor: any) {
    if (!cursor.isMovingToTarget) return cursor;
    
    // Only for cursors that are supposed to be moving to a target
    const visibleImageIndexes = [...visibleImages]; 
    if (visibleImageIndexes.length === 0) {
      // No images visible yet, can't set up dragging
      cursor.isMovingToTarget = false;
      return cursor;
    }
    
    // Filter out images that are already being dragged
    const availableIndexes = visibleImageIndexes.filter(index => !imageLocks[index]);
    if (availableIndexes.length === 0) {
      // No available images, revert to wandering
      cursor.isMovingToTarget = false;
      return cursor;
    }
    
    // Pick a random available image
    const randomIndex = Math.floor(Math.random() * availableIndexes.length);
    const randomImageIndex = availableIndexes[randomIndex];
    
    // Get the DOM element for the selected image
    const imageElement = document.querySelector(`.collage-image-button:nth-child(${randomImageIndex + 1})`);
    if (!imageElement) {
      // Can't find image element, revert to wandering
      cursor.isMovingToTarget = false;
      return cursor;
    }
    
    // Get image position and prepare to move cursor there
    const rect = imageElement.getBoundingClientRect();
    // Target the center of the image
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;
    
    // Set up transition to image
    cursor.targetImage = randomImageIndex;
    cursor.targetX = targetX;
    cursor.targetY = targetY;
    
    // For preexisting cursors, position them partway to their target
    // This makes it look like they're already in the process of grabbing
    const progress = 0.3 + Math.random() * 0.5; // Position 30-80% of the way there
    const dirX = targetX - cursor.x;
    const dirY = targetY - cursor.y;
    cursor.x += dirX * progress;
    cursor.y += dirY * progress;
    
    // Lock this image
    imageLocks[randomImageIndex] = cursor.id;
    
    return cursor;
  }

  // Function to simulate fake cursor interactions
  function simulateFakeInteraction() {
    // Check if cursor system is initialized
    if (!hasCursorInitialized) {
      // If we haven't set the initialization delay yet, set it now
      if (cursorInitializationDelay === 0) {
        // Set a variable delay (15-50 seconds) before any cursor activity
        cursorInitializationDelay = 15000 + Math.random() * 35000;
        console.log(`Will delay cursor appearance by ${Math.round(cursorInitializationDelay/1000)} seconds`);
        
        // Initialize the page visit timer for the guaranteed cursor appearance
        pageVisitStartTime = Date.now();
        // Set timer to ensure a cursor appears within 1 minute
        guaranteedCursorTimer = 60000; // 1 minute
        
        return;
      }
      
      // Countdown the initialization delay
      cursorInitializationDelay -= 16; // Assuming 16ms per frame (60fps)
      
      // Also countdown the guaranteed cursor timer
      guaranteedCursorTimer -= 16;
      
      // Check if we've reached the guaranteed cursor appearance time
      if (guaranteedCursorTimer <= 0 && !hasCursorInitialized) {
        // Force initialization now to guarantee cursor appears within 1 minute
        hasCursorInitialized = true;
        initializeCursorSystem(true); // Force cursor appearance
        return;
      }
      
      // Check if regular delay has expired
      if (cursorInitializationDelay <= 0) {
        hasCursorInitialized = true;
        // Initialize cursor system without forcing cursor appearance
        initializeCursorSystem(false);
      }
      
      return; // Wait until initialization is complete
    }
    
    // Update the guaranteed cursor timer if there are no cursors present
    if (fakeCursors.length === 0) {
      // If no cursors exist, start or continue the countdown
      if (guaranteedCursorTimer <= 0 || isNaN(guaranteedCursorTimer)) {
        // Reset the timer to ensure a cursor appears within 1 minute
        guaranteedCursorTimer = 60000; // 1 minute
      } else {
        // Continue counting down
        guaranteedCursorTimer -= 16;
        
        // If timer expires, create a new cursor
        if (guaranteedCursorTimer <= 0) {
          // Create a single cursor to show activity
          const newCursor = createFakeCursor(false, false);
          fakeCursors = [...fakeCursors, newCursor];
          onFakeCursorsUpdate(fakeCursors);
          console.log(`Created guaranteed activity cursor after quiet period`);
          
          // Reset the timer
          guaranteedCursorTimer = 60000 + Math.random() * 120000; // 1-3 minutes until next guaranteed activity
        }
      }
    } else {
      // If cursors exist, reset the guaranteed timer
      // This prevents adding too many cursors
      guaranteedCursorTimer = 60000 + Math.random() * 120000; // 1-3 minutes
    }
    
    // Decrease cursor lifespan
    fakeCursors = fakeCursors.map(cursor => {
      if (cursor.lifespan !== undefined) {
        cursor.lifespan -= 16;
      }
      return cursor;
    });
    
    // BRUTE FORCE: Always clear the drag store at the beginning
    // This ensures no highlights will persist
    let activeInStore: Record<string, boolean> = {};
    draggingStore.subscribe(state => {
      activeInStore = {...state.activeDrags};
    })();
    
    // Clear any lingering highlights
    Object.keys(activeInStore).forEach(indexStr => {
      const imageIndex = parseInt(indexStr, 10);
      stopDragging(imageIndex);
    });
    
    // Force sync between cursor state and locks
    fakeCursors.forEach(cursor => {
      // Skip updating when cursor is in the process of moving to target 
      // This prevents removing locks during the transition
      if (cursor.isMovingToTarget) return;
      
      // If cursor is not dragging but has a targetImage, clean it up
      if (!cursor.isDragging && cursor.targetImage !== null) {
        // Clean up any inconsistent state
        delete imageLocks[cursor.targetImage];
        stopDragging(cursor.targetImage);
        cursor.targetImage = null;
      }
      
      // If cursor is dragging, make sure the locks are correct
      if (cursor.isDragging && cursor.targetImage !== null) {
        // Make sure this cursor owns the lock on this image
        if (imageLocks[cursor.targetImage] !== cursor.id) {
          // This cursor doesn't own the lock - it's invalid state
          console.log(`Cursor ${cursor.name} thinks it's dragging image ${cursor.targetImage} but doesn't own the lock`);
          cursor.isDragging = false;
          cursor.targetImage = null;
          stopDragging(cursor.targetImage);
        }
      }
    });
    
    // Only allow cursors to stay for their lifespan (except static first cursor)
    fakeCursors = fakeCursors.filter(cursor => {
      // Only remove if there's a defined lifespan and it's expired
      if (cursor.lifespan !== undefined && cursor.lifespan <= 0) {
        // If the cursor was dragging an image, release it
        if (cursor.isDragging && cursor.targetImage !== null) {
          const imageIndex = cursor.targetImage;
          stopDragging(imageIndex);
          delete imageLocks[imageIndex];
        }
        console.log(`Cursor ${cursor.name} leaving the site after its visit`);
        return false;
      }
      return true;
    });
    
    // Check for inactive cursors and remove them (additional check)
    fakeCursors = fakeCursors.filter(cursor => {
      const inactivityTime = Date.now() - cursor.lastActiveTime;
      // If cursor is not in a resting period and has been inactive for more than 2 minutes (120000ms), remove it
      if (cursor.restingPeriod <= 0 && inactivityTime > 120000 && !cursor.isStatic) {
        console.log(`Removing inactive cursor ${cursor.name} after ${Math.floor(inactivityTime/1000)} seconds of inactivity`);
        
        // If the cursor was dragging an image, release it
        if (cursor.isDragging && cursor.targetImage !== null) {
          const imageIndex = cursor.targetImage;
          stopDragging(imageIndex);
          delete imageLocks[imageIndex];
        }
        return false;
      }
      return true;
    });
    
    // MODIFIED: Only check the store for cursors that are NOT moving to target
    // This prevents the store from removing locks during the transition
    draggingStore.subscribe((state: {activeDrags: Record<string, boolean>}) => {
      // Only check for non-transitioning cursors
      const activeCursors = fakeCursors.filter(c => !c.isMovingToTarget);
      
      // Check each active drag to ensure it has an active cursor
      Object.keys(state.activeDrags).forEach(indexStr => {
        const imageIndex = parseInt(indexStr, 10);
        // Check if any active (non-transitioning) cursor is currently dragging this image
        const isCursorDragging = activeCursors.some(c => 
          c.isDragging === true && 
          c.targetImage === imageIndex
        );
        
        // If no cursor is dragging this image, AND no cursor is transitioning to it,
        // remove it from active drags
        const isAnyoneTransitioning = fakeCursors.some(c => 
          c.isMovingToTarget && c.targetImage === imageIndex
        );
        
        if (!isCursorDragging && !isAnyoneTransitioning) {
          console.log(`Simulation cleanup: Image ${imageIndex} in drag store but no cursor is dragging it`);
          stopDragging(imageIndex);
        }
      });
    })();
    
    // Move existing cursors with improved physics
    fakeCursors = fakeCursors.map(cursor => {
      // Skip static cursors completely
      if (cursor.isStatic) {
        return cursor;
      }
      
      // If cursor is in a resting period, decrement it and skip movement
      if (cursor.restingPeriod > 0) {
        cursor.restingPeriod -= 16; // Assuming 16ms per frame (60fps)
        return cursor;
      }
      
      // Save previous position for velocity calculation
      const prevX = cursor.x;
      const prevY = cursor.y;
      
      // Increment time factor for curved movement (0.01-0.05 radians per frame)
      cursor.timeFactor += 0.01 + (Math.random() * 0.04);
      
      // Update curve offsets occasionally to change the curve pattern
      if (Math.random() < 0.01) {
        cursor.curveOffsetX = (Math.random() * 100) - 50;
        cursor.curveOffsetY = (Math.random() * 100) - 50;
      }
      
      // STEP 1: HANDLE STATE TRANSITIONS
      // Note: We'll only check for state changes, but won't apply position changes here
      
      // If not dragging, randomly decide to start dragging - lower probability (2% chance instead of 5%)
      if (!cursor.isDragging && !cursor.isMovingToTarget && Math.random() < 0.02) {
        // If cursor was previously targeting an image but state changed,
        // ensure we clean up any existing target
        if (cursor.targetImage !== null) {
          // Clean up any previous target that wasn't properly released
          console.log(`Cursor ${cursor.name} was targeting image ${cursor.targetImage} but state doesn't match - cleaning up`);
          if (imageLocks[cursor.targetImage] === cursor.id) {
            // CRITICAL FIX: Make sure we stop dragging BEFORE deleting the lock
            stopDragging(cursor.targetImage);
            delete imageLocks[cursor.targetImage];
          }
          cursor.targetImage = null;
        }

        // Pick a random image to drag, preferring ones already near the top
        const visibleImageIndexes = [...visibleImages]; // Get array of indexes that are visible
        
        // Filter out images that are already being dragged
        const availableIndexes = visibleImageIndexes.filter(index => !imageLocks[index]);
        
        if (availableIndexes.length === 0) {
          // All images are locked, can't drag any
          return cursor;
        }
        
        // Don't filter by z-index - pick any available image
        const randomIndex = Math.floor(Math.random() * availableIndexes.length);
        const randomImageIndex = availableIndexes[randomIndex];
        
        // Get the DOM element for the selected image
        const imageElement = document.querySelector(`.collage-image-button:nth-child(${randomImageIndex + 1})`);
        
        if (imageElement) {
          // First, ensure we release any existing image this cursor might be targeting
          // (This is a safety check in case our previous state cleanup missed anything)
          if (cursor.targetImage !== null && cursor.targetImage !== randomImageIndex) {
            // Double check we're not already targeting this same image
            if (imageLocks[cursor.targetImage] === cursor.id) {
              delete imageLocks[cursor.targetImage];
              stopDragging(cursor.targetImage);
              console.log(`Cursor ${cursor.name} releasing previous target ${cursor.targetImage} before grabbing ${randomImageIndex}`);
            }
          }
          
          // Get image position and prepare to move cursor there
          const rect = imageElement.getBoundingClientRect();
          // Target the center of the image instead of a random point
          const targetX = rect.left + rect.width / 2;
          const targetY = rect.top + rect.height / 2;
          
          // Set up transition to image - cursor will move to image before dragging
          cursor.isMovingToTarget = true; // Moving to target
          cursor.targetImage = randomImageIndex;
          cursor.targetX = targetX;
          cursor.targetY = targetY;
          
          // Make sure isDragging is explicitly false during approach
          cursor.isDragging = false;
          
          // Lock this image
          imageLocks[randomImageIndex] = cursor.id;
          
          // Update activity timestamp
          cursor.lastActiveTime = Date.now();
          
          console.log(`Cursor ${cursor.name} preparing to grab image ${randomImageIndex}`);
        }
      }
      // If moving to target and reached it, start dragging
      else if (cursor.isMovingToTarget && 
               Math.abs(cursor.x - cursor.targetX) < 10 && 
               Math.abs(cursor.y - cursor.targetY) < 10) {
        
        // Preserve the targetImage before state changes
        const targetImageIndex = cursor.targetImage;
        
        if (targetImageIndex !== null) {
          // Make sure we still own the lock on this image
          if (imageLocks[targetImageIndex] !== cursor.id) {
            // Someone else grabbed the image while we were moving to it
            cursor.isMovingToTarget = false;
            cursor.targetImage = null;
            return cursor;
          }
          
          // First register in the drag store BEFORE changing cursor state
          // This ensures the image is marked as being dragged before the state changes
          startDragging(targetImageIndex);
          
          // Now we've reached the image, start dragging it - update state
          cursor.isMovingToTarget = false;
          cursor.isDragging = true;
          
          // Ensure the imageLocks still points to us
          imageLocks[targetImageIndex] = cursor.id;
          
          // Update activity timestamp
          cursor.lastActiveTime = Date.now();
          
          console.log(`Cursor ${cursor.name} started ACTIVE dragging of image ${targetImageIndex}`);
          
          // Choose random destination with margins
          const horizontalMargin = 100; // 100px from sides
          const verticalMargin = 100; // 100px from top/bottom
          cursor.destinationX = horizontalMargin + Math.random() * (window.innerWidth - horizontalMargin * 2);
          cursor.destinationY = verticalMargin + Math.random() * (window.innerHeight - verticalMargin * 2);
          
          console.log(`Cursor ${cursor.name} started dragging image ${targetImageIndex}`);
        } else {
          // Something is wrong, the cursor was moving to target but targetImage is null
          console.log(`Cursor ${cursor.name} was moving to target but targetImage is null - resetting state`);
          cursor.isMovingToTarget = false;
          cursor.isDragging = false;
        }
        
        return cursor;
      }
      // If dragging, very rarely decide to stop
      else if (cursor.isDragging && Math.random() < 0.003) {
        // Release the image immediately
        const releasedImageIndex = cursor.targetImage;
        if (releasedImageIndex !== null) {
          // TRIPLE-CHECK release protocol:
          // 1. First update the drag store to remove highlight
          stopDragging(releasedImageIndex);
          
          // 2. Remove the image lock in the locks dictionary
          if (imageLocks[releasedImageIndex] === cursor.id) {
            delete imageLocks[releasedImageIndex];
          }
          
          // 3. Clear cursor state properties
          cursor.isDragging = false;
          cursor.targetImage = null;
          
          // 4. CRITICAL FIX: Verify the highlight is actually gone
          let isStillHighlighted = false;
          draggingStore.subscribe(state => {
            isStillHighlighted = !!state.activeDrags[releasedImageIndex];
          })();
          
          if (isStillHighlighted) {
            console.log(`[CRITICAL] Image ${releasedImageIndex} highlight persisted after cursor release - forcing cleanup`);
            stopDragging(releasedImageIndex);
          }
          
          // Update activity timestamp
          cursor.lastActiveTime = Date.now();
          
          // Set a resting period (8-12 seconds) after dropping the image
          cursor.restingPeriod = 8000 + Math.random() * 4000;
          
          console.log(`Cursor ${cursor.name} dropped the image and will rest for ${Math.round(cursor.restingPeriod/1000)} seconds`);
        }
        
        cursor.isMovingToTarget = false;
        
        // Choose a new wandering destination with margins
        const horizontalMargin = 100; // 100px from sides
        const verticalMargin = 100; // 100px from top/bottom
        cursor.destinationX = horizontalMargin + Math.random() * (window.innerWidth - horizontalMargin * 2);
        cursor.destinationY = verticalMargin + Math.random() * (window.innerHeight - verticalMargin * 2);
        
        // Return immediately to apply the cursor state change
        return cursor;
      }
      
      // STEP 2: HANDLE MOVEMENT BASED ON STATE
      // Use faster speeds for all movement
      const MOVEMENT_SPEED = 5.0; // Faster movement
      
      // CASE 1: Moving to target image
      if (cursor.isMovingToTarget && !cursor.isDragging) {
        // Calculate direction to target
        const dx = cursor.targetX - cursor.x;
        const dy = cursor.targetY - cursor.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If close to target, start dragging
        if (distance < 5) { // Reduced from 10 for quicker transition to dragging
          // First set up the dragging destination
          const horizontalMargin = 100;
          const verticalMargin = 100;
          cursor.destinationX = horizontalMargin + Math.random() * (window.innerWidth - horizontalMargin * 2);
          cursor.destinationY = verticalMargin + Math.random() * (window.innerHeight - verticalMargin * 2);
          
          // Make sure the image lock is consistent
          if (cursor.targetImage !== null) {
            // Update the image lock
            imageLocks[cursor.targetImage] = cursor.id;
            
            // FIRST mark in the drag store that we're actively dragging
            // This must happen before changing cursor.isDragging
            startDragging(cursor.targetImage);
            
            console.log(`Cursor ${cursor.name} STARTED DRAGGING image ${cursor.targetImage}`);
          }
          
          // THEN change state to dragging (order matters for highlighting)
          cursor.isMovingToTarget = false;
          cursor.isDragging = true;
          
          return cursor;
        }
        
        // Move toward target
        const SPEED = 8.0; // Faster approach to images
        const dirX = dx / distance;
        const dirY = dy / distance;
        cursor.x += dirX * SPEED;
        cursor.y += dirY * SPEED;
      }
      // CASE 2: Dragging an image
      else if (cursor.isDragging && cursor.targetImage !== null) {
        // Double-verify the cursor still owns this image lock
        if (imageLocks[cursor.targetImage] !== cursor.id) {
          console.log(`Cursor ${cursor.name} lost control of image ${cursor.targetImage} - stopping drag`);
          cursor.isDragging = false;
          cursor.targetImage = null;
          return cursor;
        }
        
        // Get the image element
        const imageElement = document.querySelector(`.collage-image-button:nth-child(${cursor.targetImage + 1})`);
        if (!imageElement) {
          // Image element not found, release the image
          if (cursor.targetImage !== null) {
            delete imageLocks[cursor.targetImage];
            stopDragging(cursor.targetImage);
            cursor.targetImage = null;
            cursor.isDragging = false;
          }
          return cursor;
        }
        
        // Calculate direction to destination  
        const dx = cursor.destinationX - cursor.x;
        const dy = cursor.destinationY - cursor.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If close to destination, either drop the image or set a new destination
        if (distance < 10) {
          // 70% chance to drop the image
          if (Math.random() < 0.7) {
            // Release the image immediately
            const releasedImageIndex = cursor.targetImage;
            if (releasedImageIndex !== null) {
              // Very simple release: just clear everything
              // CRITICAL FIX: First remove from drag store before clearing the lock
              stopDragging(releasedImageIndex);
              delete imageLocks[releasedImageIndex];
              
              // CRITICAL FIX: Double-check the highlight is actually gone
              let isStillHighlighted = false;
              draggingStore.subscribe(state => {
                isStillHighlighted = !!state.activeDrags[releasedImageIndex];
              })();
              
              if (isStillHighlighted) {
                console.log(`[CRITICAL] Image ${releasedImageIndex} highlight persisted after cursor release - forcing cleanup`);
                stopDragging(releasedImageIndex);
              }
              
              cursor.targetImage = null;
              cursor.isDragging = false;
              
              // Set a resting period (10-20 seconds) after dropping the image
              cursor.restingPeriod = 10000 + Math.random() * 10000;
              
              // Update activity timestamp
              cursor.lastActiveTime = Date.now();
              
              console.log(`Cursor ${cursor.name} dropped the image and will rest for ${Math.round(cursor.restingPeriod/1000)} seconds`);
            }
            
            cursor.isMovingToTarget = false;
            
            // Choose a new wandering destination with margins
            const horizontalMargin = 100;
            const verticalMargin = 100;
            cursor.destinationX = horizontalMargin + Math.random() * (window.innerWidth - horizontalMargin * 2);
            cursor.destinationY = verticalMargin + Math.random() * (window.innerHeight - verticalMargin * 2);
            
            // Return immediately to apply the cursor state change
            return cursor;
          } else {
            // Just set a new destination to continue dragging
            const horizontalMargin = 100;
            const verticalMargin = 100;
            cursor.destinationX = horizontalMargin + Math.random() * (window.innerWidth - horizontalMargin * 2);
            cursor.destinationY = verticalMargin + Math.random() * (window.innerHeight - verticalMargin * 2);
            
            // Simplified curve setup
            const curveStrength = 30 + Math.random() * 70; 
            const startX = cursor.x;
            const startY = cursor.y;
            const endX = cursor.destinationX;
            const endY = cursor.destinationY;
            
            // Just use midpoint with offset for control point
            cursor.controlX = (startX + endX) / 2 + (Math.random() - 0.5) * curveStrength;
            cursor.controlY = (startY + endY) / 2 + (Math.random() - 0.5) * curveStrength;
            
            // Reset curve progress
            cursor.curveProgress = 0;
            
            // Update activity timestamp
            cursor.lastActiveTime = Date.now();
            
            return cursor;
          }
        }
        
        // Get current image center
        const imgRect = imageElement.getBoundingClientRect();
        const imageCenterX = imgRect.left + imgRect.width / 2;
        const imageCenterY = imgRect.top + imgRect.height / 2;
        
        // Calculate direction to destination
        const dirX = (cursor.destinationX - imageCenterX) / distance;
        const dirY = (cursor.destinationY - imageCenterY) / distance;

        // Direct movement approach - move image with cursor
        const MOVEMENT_DELTA = 4.0; // Larger movement for more visible motion
        
        // Calculate the exact position where the cursor should move
        const newCursorX = imageCenterX + dirX * MOVEMENT_DELTA;
        const newCursorY = imageCenterY + dirY * MOVEMENT_DELTA;
        
        // Calculate the delta (how much the cursor has moved)
        const deltaX = newCursorX - imageCenterX;
        const deltaY = newCursorY - imageCenterY;
        
        // Convert delta to percentage for image position update
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;
        
        const deltaRightPercent = -(deltaX / containerWidth) * 100;
        const deltaBottomPercent = -(deltaY / containerHeight) * 100;
        
        // Get current image data
        const originalImage = collageImages[cursor.targetImage];
        
        // Calculate new position with the delta
        const newRight = originalImage.right + deltaRightPercent;
        const newBottom = originalImage.bottom + deltaBottomPercent;
        
        // Apply constraints
        const margin = 5;
        const constrainedRight = Math.max(margin, Math.min(95 - margin, newRight));
        const constrainedBottom = Math.max(margin, Math.min(95 - margin, newBottom));
        
        // Only update if we're actually going to move the image
        if (Math.abs(deltaX) > 0.01 || Math.abs(deltaY) > 0.01) {
          // Update the image position directly
          collageImages = collageImages.map((img, i) => {
            if (i === cursor.targetImage) {
              return {
                ...img,
                right: constrainedRight,
                bottom: constrainedBottom
              };
            }
            return img;
          });
        }
        
        // Update cursor position to match the center of the image
        // Use synchronous update to avoid lag
        const updatedRect = imageElement.getBoundingClientRect();
        cursor.x = updatedRect.left + updatedRect.width / 2;
        cursor.y = updatedRect.top + updatedRect.height / 2;
        
        // VITAL FIX: Explicitly manage the highlight state
        // First remove any existing highlight
        stopDragging(cursor.targetImage);
        
        // Only add the highlight if the cursor is EXACTLY on the image
        const isExactlyOnImage = 
          cursor.x >= updatedRect.left && 
          cursor.x <= updatedRect.right && 
          cursor.y >= updatedRect.top && 
          cursor.y <= updatedRect.bottom;
        
        if (isExactlyOnImage) {
          startDragging(cursor.targetImage);
        }
      }
      // CASE 3: Just wandering (not dragging)
      else {
        // If we don't have a destination or are close to it, set a new one
        if (!cursor.destinationX || 
            Math.abs(cursor.x - cursor.destinationX) < 10 && 
            Math.abs(cursor.y - cursor.destinationY) < 10) {
          
          // Make sure the cursor isn't still linked to an image
          if (cursor.targetImage !== null) {
            // If the cursor has a targetImage but is wandering,
            // we need to clean up the lock and drag state
            if (imageLocks[cursor.targetImage] === cursor.id) {
              delete imageLocks[cursor.targetImage];
              stopDragging(cursor.targetImage);
              console.log(`Cursor ${cursor.name} released lock on image ${cursor.targetImage} while wandering`);
            }
            cursor.targetImage = null;
            cursor.isDragging = false;
            cursor.isMovingToTarget = false;
          }
          
          // Choose random destination with margins
          const horizontalMargin = 100; // 100px from sides
          const verticalMargin = 100; // 100px from top/bottom
          cursor.destinationX = horizontalMargin + Math.random() * (window.innerWidth - horizontalMargin * 2);
          cursor.destinationY = verticalMargin + Math.random() * (window.innerHeight - verticalMargin * 2);
        }
        
        // Move towards destination with curved path
        const dx = cursor.destinationX - cursor.x;
        const dy = cursor.destinationY - cursor.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
          // Add sine wave variation based on time
          const curveX = Math.sin(cursor.timeFactor) * cursor.curveOffsetX * 0.05;
          const curveY = Math.cos(cursor.timeFactor * 0.7) * cursor.curveOffsetY * 0.05;
          
          cursor.x += (dx / distance) * MOVEMENT_SPEED + curveX;
          cursor.y += (dy / distance) * MOVEMENT_SPEED + curveY;
        }
      }
      
      // Calculate velocity for debugging
      const velocity = Math.sqrt(Math.pow(cursor.x - prevX, 2) + Math.pow(cursor.y - prevY, 2));
      
      // Log significant velocity changes (but not state transition jumps)
      if (cursor.lastVelocity && 
          Math.abs(velocity - cursor.lastVelocity) > 0.1 &&
          !(cursor.isMovingToTarget && cursor.lastVelocity < 0.1)) { // Ignore initial grab
        console.log(`Cursor ${cursor.name} velocity: ${velocity.toFixed(2)} (state: ${cursor.isDragging ? 'dragging' : cursor.isMovingToTarget ? 'moving-to-image' : 'wandering'})`);
      }
      
      cursor.lastVelocity = velocity;
      return cursor;
    });
    
    // Update parent component with new cursor states
    onFakeCursorsUpdate(fakeCursors);
    
    // Check for cursor limits - create new cursor only if:
    // 1. It's been at least 3-8 minutes since last cursor creation (rare visitor frequency)
    // 2. We have fewer cursors than our max limit
    // 3. Very low random chance (0.0005 = about 0.05% chance per frame at 60fps) - MUCH reduced
    const currentTime = Date.now();
    const minInterval = 3 * 60 * 1000; // 3 minutes minimum
    const randomAdditionalTime = 5 * 60 * 1000; // Up to 5 more minutes
    const minTimeBetweenCursors = minInterval + Math.random() * randomAdditionalTime;
    const timeSinceLastCreation = currentTime - lastCursorCreationTime;
    
    // Limit to max 2 cursors about 30% of the time (increased from 10%)
    const maxCursors = Math.random() < 0.7 ? 1 : 2; // 70% chance of allowing 1 cursor, 30% chance of allowing 2
    
    // Slightly increase the probability of cursor creation
    if (fakeCursors.length < maxCursors && 
        timeSinceLastCreation > minTimeBetweenCursors && 
        Math.random() < 0.001) { // Increased from 0.0005 to 0.001 (2x more likely)
      const newCursor = createFakeCursor();
      console.log(`New visitor: ${newCursor.name} with ID ${newCursor.id} after ${Math.floor(timeSinceLastCreation/60000)} minutes`);
      fakeCursors = [...fakeCursors, newCursor];
      lastCursorCreationTime = currentTime;
      onFakeCursorsUpdate(fakeCursors);
    }

    // If we're below our target of having 2 cursors 30% of the time, increase chances
    // This helps ensure we maintain the desired distribution
    if (fakeCursors.length < 2 && Math.random() < 0.3 && 
        timeSinceLastCreation > 60000 && // At least 1 minute since last cursor
        Math.random() < 0.0002) { // Still quite rare, but helps maintain 2-cursor state
      const newCursor = createFakeCursor();
      console.log(`Adding secondary visitor to reach desired 30% multi-user state`);
      fakeCursors = [...fakeCursors, newCursor];
      lastCursorCreationTime = currentTime;
      onFakeCursorsUpdate(fakeCursors);
    }
    
    // Very rarely remove a cursor (simulating a user leaving)
    if (fakeCursors.length > 0 && Math.random() < 0.0002) { // 0.02% chance per frame
      const removedIndex = fakeCursors.length - 1;
      const removedCursor = fakeCursors[removedIndex];
      
      // If the removed cursor was dragging an image, release the lock
      if (removedCursor.isDragging && removedCursor.targetImage !== null) {
        const imageIndex = removedCursor.targetImage;
        
        // IMMEDIATELY update the store FIRST to remove highlight
        stopDragging(imageIndex);
        console.log(`Cursor ${removedCursor.name} removed - CLEANING drag store for image ${imageIndex}`);
        
        // Then remove from image locks
        delete imageLocks[imageIndex];
        
        // Then update cursor state
        removedCursor.targetImage = null;
        removedCursor.isDragging = false;
      }
      
      // Force immediate store cleanup check when removing a cursor
      // This is a safeguard to ensure no highlights remain
      draggingStore.subscribe((state: {activeDrags: Record<string, boolean>}) => {
        Object.keys(state.activeDrags).forEach(indexStr => {
          const imageIndex = parseInt(indexStr, 10);
          const isCursorDragging = fakeCursors
            .filter((c, i) => i !== removedIndex) // Exclude the cursor being removed
            .some(c => c.isDragging && c.targetImage === imageIndex);
          
          if (!isCursorDragging) {
            console.log(`Cursor removal cleanup: Image ${imageIndex} highlight removed`);
            stopDragging(imageIndex);
          }
        });
      })();
      
      console.log(`Visitor ${removedCursor.name} left the site`);
      fakeCursors = fakeCursors.slice(0, -1);
      onFakeCursorsUpdate(fakeCursors);
    }
  }

  // Function to initialize the cursor system with variety
  function initializeCursorSystem(forceInitialCursor = false) {
    console.log("Initializing cursor system with sparse natural behavior");
    
    // Decide if we should have any cursors at start (increased to 30% chance normally)
    // If forceInitialCursor is true, we always create one
    const shouldHaveCursorsAtStart = forceInitialCursor || Math.random() < 0.3; // 30% chance of initial cursors
    
    if (shouldHaveCursorsAtStart) {
      // Determine how many cursors to start with - 30% chance of 2 cursors at start
      const initialCursorCount = Math.random() < 0.3 ? 2 : 1;
      console.log(`Creating ${initialCursorCount} initial visitor${initialCursorCount > 1 ? 's' : ''}`);
      
      // Create the initial cursor(s)
      for (let i = 0; i < initialCursorCount; i++) {
        // Create a preexisting cursor (appears to already be using the site)
        const newCursor = createFakeCursor(false, true);
        
        // Set up the cursor if it's supposed to be interacting with images
        const configuredCursor = setupPreexistingCursor(newCursor);
        
        // Add to cursor array
        fakeCursors = [...fakeCursors, configuredCursor];
        
        // Set a slightly longer lifespan for these cursors (30-120 seconds)
        // This ensures the site isn't constantly populated
        configuredCursor.lifespan = 30000 + Math.random() * 90000;
      }
      
      // Update the parent with new cursor state
      onFakeCursorsUpdate(fakeCursors);
      
      // Mark that we've created cursors
      initialStaticCursorCreated = true;
      
      // Set the last creation time to now to ensure we wait before creating additional cursors
      lastCursorCreationTime = Date.now();
    } else {
      // No cursors at start - still mark as initialized
      console.log("No cursors at start - site starts empty");
      
      // Set a short delay for potential first cursor to appear
      lastCursorCreationTime = Date.now() - (2.5 * 60 * 1000); // 2.5 minutes ago
    }
  }

  // Add type for resize timer
  let resizeTimer: number;
  let simulationInterval: number;
  
  // Dragging functionality
  let draggedImageIndex: number | null = null;
  let dragStartX: number;
  let dragStartY: number;
  let initialRight: number;
  let initialBottom: number;
  
  // Generate positions for images with better randomization
  function generateRandomPositions() {
    // Calculate a scale factor based on viewport width
    const viewportWidth = window.innerWidth;
    let scaleFactor = 1;
    
    // Determine which images to use based on screen size
    let imagesToUse = [...imageDimensions];
    
    // Add additional images for large screens
    if (viewportWidth > 1920) {
      imagesToUse = [...imageDimensions, ...largeScreenImages];
      scaleFactor = viewportWidth / 1920; // Scale up proportionally for large screens
    } else if (viewportWidth < 768) {
      scaleFactor = Math.max(0.4, viewportWidth / 1024); // Adjust scale for mobile
      
      // For mobile, create a layout that fills the playground space
      const sizedImages = imagesToUse.map(img => ({
        ...img,
        width: img.width * scaleFactor,
        height: img.height * scaleFactor,
        area: img.width * img.height
      }));

      // Sort by area (descending) for z-index stacking
      const sortedBySize = [...sizedImages].sort((a, b) => b.area - a.area);
      
      // Get container dimensions
      const container = document.querySelector('.mobile-collage');
      const containerWidth = container ? container.getBoundingClientRect().width : window.innerWidth;
      const containerHeight = container ? container.getBoundingClientRect().height : window.innerHeight;
      
      // Create a layout that maximizes playground space usage while keeping images fully visible
      return sortedBySize.map((img, i) => {
        // Calculate the space needed for the image (accounting for rotation)
        const maxRotation = 20; // Maximum rotation in degrees
        const radians = Math.abs(maxRotation * Math.PI / 180);
        const imageSpace = {
          width: img.width * (Math.cos(radians) + Math.sin(radians)),
          height: img.height * (Math.cos(radians) + Math.sin(radians))
        };

        // Calculate usable space (percentage) accounting for image dimensions
        const imageWidthPercent = (imageSpace.width / containerWidth) * 100;
        const imageHeightPercent = (imageSpace.height / containerHeight) * 100;
        
        // Calculate the available space for positioning
        const usableWidth = 100 - imageWidthPercent;
        const usableHeight = 100 - imageHeightPercent;
        
        // Use a grid-like layout with some randomness
        const totalImages = sortedBySize.length;
        const columns = 3; // Number of rough columns
        const rows = Math.ceil(totalImages / columns);
        
        // Calculate base position with more spread
        const col = i % columns;
        const row = Math.floor(i / columns);
        
        // Calculate base positions within the usable space
        const baseRight = (usableWidth * (col / (columns - 1)));
        const baseBottom = (usableHeight * (row / (rows - 1)));
        
        // Add controlled randomness
        const randomRight = (Math.random() * 15);
        const randomBottom = (Math.random() * 15);
        
        // Calculate final position ensuring images stay within bounds
        const right = Math.min(usableWidth, Math.max(0, baseRight + randomRight));
        const bottom = Math.min(usableHeight, Math.max(0, baseBottom + randomBottom));
        
        // Add rotation
        const rotation = (Math.random() * 40) - 20; // Random rotation between -20 and 20 degrees
        
        return {
          ...img,
          right,
          bottom,
          rotation,
          zIndex: sortedBySize.length - i // Stack from back to front
        };
      });
    }

    // First, calculate area for each image and sort by size (largest to smallest)
    const sizedImages = imagesToUse.map(img => ({
      ...img,
      // Apply scale factor to dimensions
      width: img.width * scaleFactor,
      height: img.height * scaleFactor,
      area: img.width * img.height
    }));

    // Sort by area (descending) - largest images will be first
    const sortedBySize = [...sizedImages].sort((a, b) => b.area - a.area);
    
    // Assign z-indexes based on size - largest gets lowest z-index (back)
    // Preserve some small variation within size groups
    const sizeRankedImages = sortedBySize.map((img, i) => ({
      ...img,
      // The largest image gets z-index 1, and increases as images get smaller
      zIndex: i + 1
    }));
    
    // Now shuffle positions (but not z-index ordering)
    // We create position groups to maintain some consistency
    // Larger images will tend to be positioned more towards the edges
    // Smaller images will tend to be positioned more centrally
    
    // Define the area bounds for the lower right region (in percentages from edge)
    const rightMin = 3;   // minimum distance from right edge
    const rightMax = 50;  // maximum distance from right edge (reduced to leave space on left)
    const bottomMin = 3;  // minimum distance from bottom edge
    const bottomMax = 50; // maximum distance from bottom edge
    
    // Width of the positioning area
    const areaWidth = rightMax - rightMin;
    const areaHeight = bottomMax - bottomMin;
    
    // Calculate roughly how many images can fit in a row and column
    // Allow for a bit more natural overlap
    const imagesPerRow = Math.ceil(Math.sqrt(sizeRankedImages.length * 1.2));
    const cellWidth = areaWidth / imagesPerRow;
    const cellHeight = areaHeight / imagesPerRow;
    
    // Shuffle horizontal positions only
    const shuffledHorizontal = [...sizeRankedImages];
    for (let i = shuffledHorizontal.length - 1; i > 0; i--) {
      // Only swap items if they're within the same size range (e.g., within 3 positions of each other)
      const maxSwapDistance = 3;
      const minPos = Math.max(0, i - maxSwapDistance);
      const j = minPos + Math.floor(Math.random() * (i - minPos + 1));
      [shuffledHorizontal[i], shuffledHorizontal[j]] = [shuffledHorizontal[j], shuffledHorizontal[i]];
    }
    
    // Create array of images with positions and random delays
    const positionedImages = shuffledHorizontal.map((imgData, index) => {
      // Use a more varied distribution pattern combining:
      // 1. Spiral base for initial positioning
      // 2. Size-based offsets to separate images by their dimensions
      // 3. Unique offsets for each image to prevent perfect stacking
      
      // Custom angle with different patterns per image for more unique positions
      const spiralIndex = index;
      const baseAngle = spiralIndex * 0.75; // Basic spiral pattern
      
      // Add irregularity to the spiral - make it less mathematically perfect
      const angleVariation = (spiralIndex % 3) * 0.2; // Changes angle pattern every 3 images
      const angle = baseAngle + angleVariation + (Math.random() * 0.3);
      
      // Radius that varies based on image properties, not just index
      const sizeBasedOffset = (imgData.width / 100) * 0.5; // Larger images get more space
      const radius = 5 + (spiralIndex * 2.8) + sizeBasedOffset;
      
      // Center point with slight offsets based on image attributes
      const centerRight = rightMin + (areaWidth / 2) + (index % 2 ? 2 : -2); // Slight left-right alternation
      const centerBottom = bottomMin + (areaHeight / 2) + (index % 3 === 0 ? 3 : -3); // Varied vertical positioning
      
      // Calculate base position with spiral pattern
      const spiralRight = centerRight + radius * Math.cos(angle);
      const spiralBottom = centerBottom + radius * Math.sin(angle);
      
      // Add controlled randomness for artistic overlap without complete stacking
      const randomRight = (Math.random() * 0.6 - 0.3) * cellWidth;
      const randomBottom = (Math.random() * 0.6 - 0.3) * cellHeight;
      
      // Add unique offsets based on image name/alt to ensure consistenly different positioning
      const hashOffset = imgData.alt.charCodeAt(0) % 10; // Get a number 0-9 based on first character
      const hashOffsetRight = ((hashOffset % 3) - 1) * 3; // Convert to -3, 0, or 3
      const hashOffsetBottom = (Math.floor(hashOffset / 3) - 1) * 3; // Different pattern for bottom
      
      // Calculate content-aware positioning based on the visible content area
      // This helps prevent complete overlaps of important visual elements
      
      // Get the contentOffsets (percentage of the image that is empty/transparent)
      const offsets = imgData.contentOffsets || { top: 0, right: 0, bottom: 0, left: 0 };
      
      // Calculate adjusted position based on content area
      // Shift position to make the content area the center of positioning calculations
      const contentOffsetRight = (offsets.left - offsets.right) * 0.2; // Adjust horizontal position based on content
      const contentOffsetBottom = (offsets.top - offsets.bottom) * 0.2; // Adjust vertical position based on content
      
      // Final calculated position with all factors combined, including content awareness
      const right = spiralRight + randomRight + hashOffsetRight + contentOffsetRight;
      const bottom = spiralBottom + randomBottom + hashOffsetBottom + contentOffsetBottom;
      
      // Add more variation to rotation angles to ensure images aren't parallel
      // Images will have a wider range of rotation angles (-12° to +12°)
      const baseRotation = imgData.rotation !== undefined ? imgData.rotation : 0;
      const rotationVariance = 12; // Increased from 8
      const rotation = baseRotation + (Math.random() * rotationVariance * 2 - rotationVariance);
      
      // Add some additional random offsets for specific images
      let extraOffsetRight = 0;
      let extraOffsetBottom = 0;
      
      // Add special randomness for the owl to ensure it moves more
      if (imgData.alt === "Owl") {
        extraOffsetRight = (Math.random() * 10) - 5; // Reduced from 20 to 10
        extraOffsetBottom = (Math.random() * 10) - 5; // Reduced from 20 to 10
      }
      
      return {
        ...imgData,
        // Ensure positions stay within bounds
        right: Math.max(rightMin, Math.min(rightMax, right + extraOffsetRight)),
        bottom: Math.max(bottomMin, Math.min(bottomMax, bottom + extraOffsetBottom)),
        rotation,
        aspectRatio: imgData.aspectRatio
      };
    });

    // Sort by z-index (ascending) so larger images (back) appear first, followed by smaller images (front)
    return positionedImages.sort((a, b) => a.zIndex - b.zIndex);
  }

  // Function to preload images
  function preloadImages() {
    // Determine which images to preload based on screen size
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
  
  // Define component methods for handling touch events
  function handleTouchStart(event: TouchEvent, index: number) {
    // Prevent default to stop scrolling
    event.preventDefault();
    
    // Mark that user has interacted with collage
    hasInteractedWithCollage = true;
    
    // Check if this image is already being dragged by a cursor
    if (imageLocks[index]) {
      // Image is locked, can't drag it
      console.log(`Image ${index} is currently being moved by another cursor`);
      return;
    }
    
    // Get the image element and its rect
    const imageElement = document.querySelector(`.collage-image-button:nth-child(${index + 1})`);
    if (!imageElement) return;
    
    const rect = imageElement.getBoundingClientRect();
    const touch = event.touches[0];
    
    // Store the exact image dimensions at grab time to ensure consistency
    grabbedImageWidth = rect.width;
    grabbedImageHeight = rect.height;
    
    // Calculate grab offset from touch position within the image
    grabOffsetX = touch.clientX - rect.left;
    grabOffsetY = touch.clientY - rect.top;
    
    // Handle touch as drag start
    draggedImageIndex = index;
    dragStartX = touch.clientX;
    dragStartY = touch.clientY;
    initialRight = collageImages[index].right;
    initialBottom = collageImages[index].bottom;
    
    // Lock this image for human user
    imageLocks[index] = "human-user";
    
    // Add dragging class
    document.body.classList.add('dragging');
    
    bringToFront(index);
  }
  
  // Handle touch move events for dragging
  function handleTouchMove(event: TouchEvent) {
    if (draggedImageIndex === null) return;
    
    // Prevent default to stop scrolling while dragging
    event.preventDefault();
    
    const touch = event.touches[0];
    
    // Get viewport or container dimensions
    const isMobile = window.innerWidth <= 768;
    let containerWidth = window.innerWidth;
    let containerHeight = window.innerHeight;
    
    if (isMobile) {
      const container = document.querySelector('.mobile-collage');
      if (container) {
        const rect = container.getBoundingClientRect();
        containerWidth = rect.width;
        containerHeight = rect.height;
      }
    }
    
    // DIRECT HUMAN TOUCH DRAG: Use the original stored dimensions
    // Calculate where the image's top-left corner should be (in pixels)
    const desiredImageLeft = touch.clientX - grabOffsetX;
    const desiredImageTop = touch.clientY - grabOffsetY;
    
    // Convert directly to right/bottom CSS position using the STORED dimensions
    const desiredRightPx = containerWidth - (desiredImageLeft + grabbedImageWidth);
    const desiredBottomPx = containerHeight - (desiredImageTop + grabbedImageHeight);
    
    // Convert to percentage
    const desiredRightPercent = (desiredRightPx / containerWidth) * 100;
    const desiredBottomPercent = (desiredBottomPx / containerHeight) * 100;
    
    // Apply constraints
    let constrainedRight, constrainedBottom;
    
    if (isMobile) {
      // For mobile, constrain to container boundaries
      const imageWidthPercent = (grabbedImageWidth / containerWidth) * 100;
      const imageHeightPercent = (grabbedImageHeight / containerHeight) * 100;
      
      constrainedRight = Math.max(
        0,
        Math.min(100 - imageWidthPercent, desiredRightPercent)
      );
      constrainedBottom = Math.max(
        0,
        Math.min(100 - imageHeightPercent, desiredBottomPercent)
      );
    } else {
      // For desktop, use the viewport margin
      const viewportMargin = 3;
      const imageWidthPercent = (grabbedImageWidth / window.innerWidth) * 100;
      
      constrainedRight = Math.max(
        viewportMargin,
        Math.min(100 - viewportMargin - imageWidthPercent, desiredRightPercent)
      );
      // CRITICAL FIX: Enforce top margin by ensuring bottom doesn't go below viewportMargin
      constrainedBottom = Math.max(
        viewportMargin, // This creates a minimum distance from the top
        Math.min(100 - viewportMargin, desiredBottomPercent)
      );
    }
    
    // Update the image position IMMEDIATELY
    collageImages = collageImages.map((img, i) => {
      if (i === draggedImageIndex) {
        return {
          ...img,
          right: constrainedRight,
          bottom: constrainedBottom
        };
      }
      return img;
    });
  }

  function endDrag() {
    // Remove dragging class from body
    document.body.classList.remove('dragging');
    
    // Clean up event listeners
    window.removeEventListener('mousemove', handleDrag);
    window.removeEventListener('mouseup', endDrag);
    
    // Release the lock on this image
    if (draggedImageIndex !== null) {
      delete imageLocks[draggedImageIndex];
    }
    
    draggedImageIndex = null;
  }

  // Bring image to front when clicked
  function bringToFront(index: number) {
    // Find the highest z-index
    const highestZ = Math.max(...collageImages.map(img => img.zIndex)) + 1;
    
    // Update the clicked image's z-index to be the highest
    collageImages = collageImages.map((img, i) => {
      if (i === index) {
        return {
          ...img,
          zIndex: highestZ
        };
      }
      return img;
    });
  }

  // Function to get debug border style for images being moved by cursors
  function getDebugBorderStyle(imageIndex: number): string {
    // COMPLETELY REVAMPED - ONLY show highlight when cursor is physically ON the image
    
    // Get the cursor that is locking this image
    const lockOwnerId = imageLocks[imageIndex];
    
    // Skip if no owner or human user
    if (!lockOwnerId || lockOwnerId === "human-user") {
      return '';
    }
    
    // Find the cursor
    const cursor = fakeCursors.find(c => c.id === lockOwnerId);
    if (!cursor || !cursor.isDragging) {
      return '';
    }
    
    // Get image element
    const imageElement = document.querySelector(`.collage-image-button:nth-child(${imageIndex + 1})`);
    if (!imageElement) {
      return '';
    }
    
    // Get cursor and image positions
    const imgRect = imageElement.getBoundingClientRect();
    const cursorX = cursor.x;
    const cursorY = cursor.y;
    
    // STRICT CHECK - Only show if cursor is INSIDE the image bounds
    if (!(cursorX >= imgRect.left && 
        cursorX <= imgRect.right && 
        cursorY >= imgRect.top && 
        cursorY <= imgRect.bottom)) {
      return '';
    }
    
    // If we got here, all conditions are met - show the highlight
    return `
      box-shadow: 0 0 0 4px ${cursor.color}, 0 0 0 6px rgba(255,255,255,0.8);
      border-radius: var(--border-radius-md);
      outline: 2px dashed ${cursor.color};
      outline-offset: 2px;
    `;
  }
  
  // Add a dedicated function to diagnose highlight issues
  function diagnoseHighlightIssues() {
    console.log('--------- DIAGNOSTIC CHECK ---------');
    
    // STEP 1: Check drag store
    let activeInStore: Record<string, boolean> = {};
    draggingStore.subscribe(state => {
      activeInStore = {...state.activeDrags};
    })();
    
    console.log(`Images in drag store: ${Object.keys(activeInStore).join(', ') || 'None'}`);
    
    // STEP 2: Check image locks
    console.log(`Image locks: ${JSON.stringify(imageLocks)}`);
    
    // STEP 3: Check each cursor's state and make sure IDs match
    fakeCursors.forEach(cursor => {
      // Check if any cursor ID doesn't match its lockId
      if (cursor.isDragging && cursor.targetImage !== null) {
        const lockId = imageLocks[cursor.targetImage];
        if (lockId !== cursor.id) {
          console.log(`[ERROR] ID mismatch: Cursor ${cursor.name} (id: ${cursor.id}) thinks it's dragging image ${cursor.targetImage}, but lock is owned by ${lockId}`);
          
          // Fix the ID mismatch
          if (lockId) {
            // Find the cursor with that ID
            const realOwner = fakeCursors.find(c => c.id === lockId);
            if (realOwner) {
              console.log(`   Fixing: Removing dragging state from cursor ${cursor.name} since ${realOwner.name} owns the lock`);
              cursor.isDragging = false;
              cursor.targetImage = null;
            } else {
              // The lock points to a non-existent cursor, update it
              console.log(`   Fixing: Updating lock to point to cursor ${cursor.name}`);
              imageLocks[cursor.targetImage] = cursor.id;
            }
          } else {
            // No lock at all, but cursor thinks it's dragging
            console.log(`   Fixing: Setting lock for image ${cursor.targetImage} to cursor ${cursor.name}`);
            imageLocks[cursor.targetImage] = cursor.id;
            startDragging(cursor.targetImage);
          }
        }
      }
      
      // Handle inconsistent cursor state
      if (cursor.isDragging) {
        if (cursor.targetImage !== null) {
          // If a cursor is dragging, make sure it's in the drag store
          if (!activeInStore[cursor.targetImage]) {
            console.log(`[ERROR] Cursor ${cursor.name} is dragging image ${cursor.targetImage} but it's not in the drag store - fixing`);
            startDragging(cursor.targetImage);
          }
          console.log(`Cursor ${cursor.name} (id: ${cursor.id}): Dragging image ${cursor.targetImage}`);
        } else {
          console.log(`[ERROR] Cursor ${cursor.name}: isDragging=true but targetImage=null - fixing`);
          cursor.isDragging = false;
        }
      } else if (cursor.isMovingToTarget) {
        // If cursor is moving to target, make sure it's not in the drag store
        if (cursor.targetImage !== null && activeInStore[cursor.targetImage]) {
          console.log(`[ERROR] Cursor ${cursor.name} is moving to image ${cursor.targetImage} but it's already in the drag store - fixing`);
          stopDragging(cursor.targetImage);
        }
        console.log(`Cursor ${cursor.name}: Moving to image ${cursor.targetImage}`);
      } else {
        if (cursor.targetImage !== null) {
          console.log(`[ERROR] Cursor ${cursor.name}: Not dragging but targetImage=${cursor.targetImage} - fixing`);
          // If the cursor has a lock on this image, release it
          if (imageLocks[cursor.targetImage] === cursor.id) {
            delete imageLocks[cursor.targetImage];
            stopDragging(cursor.targetImage);
          }
          cursor.targetImage = null;
        } else {
          console.log(`Cursor ${cursor.name}: Wandering`);
        }
      }
    });
    
    // STEP 4: Check for inconsistencies
    // Check for images in drag store but without locks
    Object.keys(activeInStore).forEach(indexStr => {
      const imageIndex = parseInt(indexStr, 10);
      
      // Check if any cursor is dragging this image
      const isCursorDragging = fakeCursors.some(c => c.isDragging && c.targetImage === imageIndex);
      
      // Also check if any cursor is transitioning to this image
      const isAnyoneTransitioning = fakeCursors.some(c => c.isMovingToTarget && c.targetImage === imageIndex);
      
      // Only remove if no one is dragging AND no one is transitioning to it
      if (!isCursorDragging && !isAnyoneTransitioning) {
        // No cursor is dragging this image but it's in the store
        console.log(`FIXING: Image ${imageIndex} is in drag store but no cursor is dragging it`);
        stopDragging(imageIndex);
      }
    });
    
    // Check for images with locks but not in drag store
    Object.entries(imageLocks).forEach(([indexStr, lockId]) => {
      const imageIndex = parseInt(indexStr, 10);
      if (!activeInStore[indexStr] && lockId !== "human-user") {
        console.log(`[ERROR] Image ${imageIndex} has lock but is not in drag store - fixing`);
        const lockOwner = fakeCursors.find(c => c.id === lockId);
        if (lockOwner && lockOwner.isDragging && lockOwner.targetImage === imageIndex) {
          console.log(`   Adding to drag store because cursor ${lockOwner.name} is dragging it`);
          startDragging(imageIndex);
        } else {
          console.log(`   Removing lock because no cursor is actively dragging it`);
          delete imageLocks[imageIndex];
        }
      }
    });
    
    console.log('-----------------------------------');
  }

  // Add the handleDrag function that's referenced but not defined
  function handleDrag(event: MouseEvent) {
    if (draggedImageIndex === null) return;
    
    // Get viewport or container dimensions
    const isMobile = window.innerWidth <= 768;
    let containerWidth = window.innerWidth;
    let containerHeight = window.innerHeight;
    
    if (isMobile) {
      const container = document.querySelector('.mobile-collage');
      if (container) {
        const rect = container.getBoundingClientRect();
        containerWidth = rect.width;
        containerHeight = rect.height;
      }
    }
    
    // DIRECT HUMAN CURSOR DRAG: Use the original stored dimensions from grab time
    // This prevents jumping due to getBoundingClientRect variations during drag
    
    // Calculate where the image's top-left corner should be (in pixels)
    const desiredImageLeft = event.clientX - grabOffsetX;
    const desiredImageTop = event.clientY - grabOffsetY;
    
    // Convert directly to right/bottom CSS position using the STORED dimensions
    // Right = containerWidth - (left + width)
    // Bottom = containerHeight - (top + height)
    const desiredRightPx = containerWidth - (desiredImageLeft + grabbedImageWidth);
    const desiredBottomPx = containerHeight - (desiredImageTop + grabbedImageHeight);
    
    // Convert to percentage
    const desiredRightPercent = (desiredRightPx / containerWidth) * 100;
    const desiredBottomPercent = (desiredBottomPx / containerHeight) * 100;
    
    // Apply constraints
    let constrainedRight, constrainedBottom;
    
    if (isMobile) {
      // For mobile, constrain to container boundaries
      const imageWidthPercent = (grabbedImageWidth / containerWidth) * 100;
      const imageHeightPercent = (grabbedImageHeight / containerHeight) * 100;
      
      constrainedRight = Math.max(
        0,
        Math.min(100 - imageWidthPercent, desiredRightPercent)
      );
      constrainedBottom = Math.max(
        0,
        Math.min(100 - imageHeightPercent, desiredBottomPercent)
      );
    } else {
      // For desktop, use the viewport margin
      const viewportMargin = 3;
      const imageWidthPercent = (grabbedImageWidth / window.innerWidth) * 100;
      
      constrainedRight = Math.max(
        viewportMargin,
        Math.min(100 - viewportMargin - imageWidthPercent, desiredRightPercent)
      );
      // CRITICAL FIX: Enforce top margin by ensuring bottom doesn't go below viewportMargin
      constrainedBottom = Math.max(
        viewportMargin, // This creates a minimum distance from the top
        Math.min(100 - viewportMargin, desiredBottomPercent)
      );
    }
    
    // Update the image position IMMEDIATELY
    collageImages = collageImages.map((img, i) => {
      if (i === draggedImageIndex) {
        return {
          ...img,
          right: constrainedRight,
          bottom: constrainedBottom
        };
      }
      return img;
    });
  }

  // Add the startDrag function that's referenced but not defined
  function startDrag(event: MouseEvent, index: number) {
    // Prevent default behavior and propagation
    event.preventDefault();
    event.stopPropagation();
    
    // Check if this image is already being dragged by a cursor
    if (imageLocks[index]) {
      // Image is locked, can't drag it
      console.log(`Image ${index} is currently being moved by another cursor`);
      return;
    }
    
    // Get the image element and its rect
    const imageElement = document.querySelector(`.collage-image-button:nth-child(${index + 1})`);
    if (!imageElement) return;
    
    const rect = imageElement.getBoundingClientRect();
    
    // Store the exact image dimensions at grab time to ensure consistency
    grabbedImageWidth = rect.width;
    grabbedImageHeight = rect.height;
    
    // Calculate grab offset from click position within the image
    grabOffsetX = event.clientX - rect.left;
    grabOffsetY = event.clientY - rect.top;
    
    // Record which image is being dragged and initial position
    draggedImageIndex = index;
    
    // Track the initial mouse and image positions
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    initialRight = collageImages[index].right;
    initialBottom = collageImages[index].bottom;
    
    // Lock this image for human user
    imageLocks[index] = "human-user";
    
    // Add dragging class to body to ensure cursor stays as grabbing
    document.body.classList.add('dragging');
    
    // Add event listeners for move and end
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', endDrag);
  }

  // Add or fix the onMount function that starts everything
  onMount(() => {
    // Run a force cleanup to ensure no stale state
    if (typeof diagnoseHighlightIssues === 'function') {
      diagnoseHighlightIssues();
    }
    
    // Define event handlers for both mouse and touch
    const handleResize = () => {
      // Debounce the resize event
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        collageImages = generateRandomPositions();
      }, 250); // Wait 250ms after resize ends before updating
    };

    // Add resize and touch event handlers
    window.addEventListener('resize', handleResize);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', endDrag);
    
    // Handle touch end events for cleaning up after touch dragging
    const handleTouchEnd = () => {
      // Remove dragging class from body
      document.body.classList.remove('dragging');
      
      // Release the lock on this image
      if (draggedImageIndex !== null) {
        delete imageLocks[draggedImageIndex];
      }
      
      draggedImageIndex = null;
    };
    
    // Set up periodic cleanup of orphaned locks
    const lockCleanupInterval = setInterval(() => {
      // Clean up any inconsistent state
      const activeCursorIds = fakeCursors.map(cursor => cursor.id);
      activeCursorIds.push("human-user");
      
      // Check each lock
      Object.entries(imageLocks).forEach(([imageIndexStr, lockId]) => {
        const imageIndex = parseInt(imageIndexStr, 10);
        if (!activeCursorIds.includes(lockId)) {
          // This is an orphaned lock
          delete imageLocks[imageIndex];
          stopDragging(imageIndex);
        }
      });
    }, 5000);
    
    // Start the app
    (async () => {
      try {
        // First preload all images
        await preloadImages();
        
        // Then generate positions
        collageImages = generateRandomPositions();
        
        // Start introducing images one by one
        setTimeout(() => {
          imagesReady = true;
          
          // Add images one by one with staggered timing
          collageImages.forEach((img, index) => {
            setTimeout(() => {
              visibleImages = [...visibleImages, index];
            }, 150 + index * 180);
          });
          
          // Set the cursor creation time - note we don't initialize cursors yet
          // cursors will be initialized after the cursorInitializationDelay expires
          lastCursorCreationTime = Date.now();
          
          // Start fake cursor simulation after images are visible
          console.log("Starting cursor simulation with natural delay...");
          simulationInterval = window.setInterval(simulateFakeInteraction, 16);
        }, 200);
      } catch (error) {
        console.error('Error loading images:', error);
      }
    })();

    // Cleanup event listeners and timer on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      clearTimeout(resizeTimer);
      clearInterval(simulationInterval);
      clearInterval(lockCleanupInterval);
      
      // Clean up any remaining active drags in the store
      draggingStore.update(state => ({ activeDrags: {} }));
    };
  });
</script>

<!-- Desktop collage (hidden on mobile) -->
<div class="desktop-collage">
  {#if collageImages.length > 0 && imagesReady}
    {#each collageImages as img, i}
      {#if visibleImages.includes(i)}
        <button 
          class="collage-image-button"
          on:mousedown={(e) => {
            // Mark that user has interacted with collage
            hasInteractedWithCollage = true;
            
            startDrag(e, i);
            bringToFront(i);
          }}
          style="
            position: absolute;
            right: {img.right}%; 
            bottom: {img.bottom}%; 
            transform: rotate({img.rotation}deg);
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

<!-- Mobile playground collage -->
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
            // Mark that user has interacted with collage
            hasInteractedWithCollage = true;
            
            startDrag(e, i);
            bringToFront(i);
          }}
          on:touchstart={(e) => {
            // Mark that user has interacted with collage
            hasInteractedWithCollage = true;
            
            handleTouchStart(e, i);
          }}
          style="
            position: absolute;
            right: {img.right}%; 
            bottom: {img.bottom}%; 
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
  .desktop-collage {
    position: fixed;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    overflow: visible;
    pointer-events: none;
  }

  .mobile-collage {
    display: none;
    position: relative;
    width: 100%;
    height: 60vh;
    overflow: hidden;
    margin-top: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .drag-hint {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #363636;
    z-index: 100;
    width: 48px;
    height: 48px;
    pointer-events: none;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.1);
    }
    100% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  .collage-image-button {
    position: absolute;
    display: block;
    transform-origin: center;
    pointer-events: auto;
    cursor: grab;
    will-change: transform; /* Optimize for transforms */
  }

  /* Only apply transition when not dragging */
  .collage-image-button:not(:active) {
    transition: transform 0.3s ease;
  }

  .collage-image {
    display: block;
    pointer-events: none;
    user-select: none;
    -webkit-user-drag: none;
    -webkit-backface-visibility: hidden; /* Prevent blurriness */
    backface-visibility: hidden;
  }
  
  .collage-image-button:active {
    cursor: grabbing;
  }

  @media (max-width: 768px) {
    .desktop-collage {
      display: none;
    }

    .mobile-collage {
      display: block;
      margin: var(--spacing-md) 0;
      height: 60vh;
      position: relative;
      overflow: hidden;
    }
  }
</style> 