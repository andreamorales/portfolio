<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  
  // Import images from props instead of directly
  export let imageDimensions: any[] = [];
  export let largeScreenImages: any[] = [];
  export let fakeCursors: any[] = [];
  
  // Add fake user colors
  const fakeUserColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'
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
  
  // Function to create a new fake cursor
  function createFakeCursor() {
    const id = Math.random().toString(36).substr(2, 9);
    // Generate a random user number between 100 and 999
    const randomUserNumber = Math.floor(100 + Math.random() * 900);
    const name = `User${randomUserNumber}`;
    const color = fakeUserColors[Math.floor(Math.random() * fakeUserColors.length)];
    
    return {
      id,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      color,
      name,
      isDragging: false,
      isMovingToTarget: false,
      targetImage: null,
      targetX: 0,
      targetY: 0,
      destinationX: 100 + Math.random() * (window.innerWidth - 200),
      destinationY: 100 + Math.random() * (window.innerHeight - 200),
      delayCount: 0,
      // Add curve offsets for curved movement
      curveOffsetX: (Math.random() * 100) - 50,
      curveOffsetY: (Math.random() * 100) - 50,
      // Add time counter for curved movement
      timeFactor: 0,
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
      initialGrabY: 0
    };
  }

  // Function to simulate fake cursor interactions
  function simulateFakeInteraction() {
    // Only allow max 2 cursors at a time
    if (fakeCursors.length < 1 && Math.random() < 0.005) {
      const newCursor = createFakeCursor();
      console.log(`Created new cursor: ${newCursor.name}`);
      fakeCursors = [...fakeCursors, newCursor];
      onFakeCursorsUpdate(fakeCursors);
    }
    
    // Move existing cursors with improved physics
    fakeCursors = fakeCursors.map(cursor => {
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
      
      // If not dragging, randomly decide to start dragging
      if (!cursor.isDragging && !cursor.isMovingToTarget && Math.random() < 0.01) {
        // Pick a random image to drag, preferring ones already near the top
        const visibleImageIndexes = [...visibleImages]; // Get array of indexes that are visible
        
        // Filter out images that are already being dragged
        const availableIndexes = visibleImageIndexes.filter(index => !imageLocks[index]);
        
        if (availableIndexes.length === 0) {
          // All images are locked, can't drag any
          return cursor;
        }
        
        const visibleImagesData = collageImages.filter((img, i) => availableIndexes.includes(i));
        
        // Sort images by z-index (highest first)
        const sortedImages = [...visibleImagesData].sort((a, b) => b.zIndex - a.zIndex);
        
        // Take one of the top 3 images (or a random one if less than 3)
        const topImages = sortedImages.slice(0, Math.min(3, sortedImages.length));
        const randomTopImage = topImages[Math.floor(Math.random() * topImages.length)];
        
        // Find the index of this image in the original array
        const randomImageIndex = collageImages.findIndex(img => img === randomTopImage);
        
        if (randomImageIndex >= 0 && !imageLocks[randomImageIndex]) {
          const imageElement = document.querySelector(`.collage-image-button:nth-child(${randomImageIndex + 1})`);
          
          if (imageElement) {
            // Get image position and prepare to move cursor there
            const rect = imageElement.getBoundingClientRect();
            const targetX = rect.left + rect.width / 2;
            const targetY = rect.top + rect.height / 2;
            
            // Set up transition to image - cursor will move to image before dragging
            cursor.isMovingToTarget = true; // Moving to target
            cursor.targetImage = randomImageIndex;
            cursor.targetX = targetX;
            cursor.targetY = targetY;
            
            // Lock this image
            imageLocks[randomImageIndex] = cursor.id;
            
            console.log(`Cursor ${cursor.name} preparing to grab image ${randomImageIndex}`);
          }
        }
      }
      // If moving to target and reached it, start dragging
      else if (cursor.isMovingToTarget && 
               Math.abs(cursor.x - cursor.targetX) < 10 && 
               Math.abs(cursor.y - cursor.targetY) < 10) {
        
        // Now we've reached the image, start dragging it
        cursor.isDragging = true;
        cursor.isMovingToTarget = false;
        
        // Choose random destination with margins
        const horizontalMargin = 100; // 100px from sides
        const verticalMargin = 100; // 100px from top/bottom
        cursor.destinationX = horizontalMargin + Math.random() * (window.innerWidth - horizontalMargin * 2);
        cursor.destinationY = verticalMargin + Math.random() * (window.innerHeight - verticalMargin * 2);
        
        console.log(`Cursor ${cursor.name} started dragging image ${cursor.targetImage}`);
      }
      // If dragging, very rarely decide to stop
      else if (cursor.isDragging && Math.random() < 0.003) {
        // Release the lock on the image
        if (cursor.targetImage !== null) {
          delete imageLocks[cursor.targetImage];
          cursor.targetImage = null;
        }
        
        cursor.isDragging = false;
        cursor.isMovingToTarget = false;
        
        // Choose a new wandering destination with margins
        const horizontalMargin = 100; // 100px from sides
        const verticalMargin = 100; // 100px from top/bottom
        cursor.destinationX = horizontalMargin + Math.random() * (window.innerWidth - horizontalMargin * 2);
        cursor.destinationY = verticalMargin + Math.random() * (window.innerHeight - verticalMargin * 2);
        
        console.log(`Cursor ${cursor.name} stopped dragging`);
      }
      
      // STEP 2: HANDLE MOVEMENT BASED ON STATE
      // Use faster speeds for all movement
      const MOVEMENT_SPEED = 3.0; // Much faster movement
      
      // CASE 1: Moving to target image (before dragging)
      if (cursor.isMovingToTarget) {
        // Move cursor towards the target image at fast speed (faster than normal)
        const dx = cursor.targetX - cursor.x;
        const dy = cursor.targetY - cursor.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Move faster when approaching an image
        const approachSpeed = MOVEMENT_SPEED * 1.5;
        
        if (distance > 10) {
          // Add curve to movement (sine wave based on time)
          const curveFactor = 0.2; // How much curve to add
          const sinOffset = Math.sin(cursor.timeFactor) * curveFactor;
          const cosOffset = Math.cos(cursor.timeFactor * 0.7) * curveFactor;
          
          // Apply curve at perpendicular angle to movement
          const normalX = -dy / distance;
          const normalY = dx / distance;
          
          cursor.x += (dx / distance) * approachSpeed + normalX * sinOffset * 5;
          cursor.y += (dy / distance) * approachSpeed + normalY * cosOffset * 5;
        } else {
          // Snap to target when very close
          cursor.x = cursor.targetX;
          cursor.y = cursor.targetY;
        }
      }
      // CASE 2: Dragging an image
      else if (cursor.isDragging && cursor.targetImage !== null) {
        // Calculate direction to destination  
        const dx = cursor.destinationX - cursor.x;
        const dy = cursor.destinationY - cursor.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If close to destination, set new one
        if (distance < 10) {
          // Choose random destination with margins
          const horizontalMargin = 100; // 100px from sides
          const verticalMargin = 100; // 100px from top/bottom
          cursor.destinationX = horizontalMargin + Math.random() * (window.innerWidth - horizontalMargin * 2);
          cursor.destinationY = verticalMargin + Math.random() * (window.innerHeight - verticalMargin * 2);
          return cursor;
        }
        
        // Get the image element
        const imageElement = document.querySelector(`.collage-image-button:nth-child(${cursor.targetImage + 1})`);
        if (!imageElement) return cursor;
        
        // Get the image rect
        const imgRect = imageElement.getBoundingClientRect();
        
        // Initialize grab offset if not yet set
        if (cursor.grabOffsetX === undefined || cursor.grabOffsetY === undefined) {
          // Save the exact offset where cursor "grabbed" the image (relative to image top-left)
          cursor.grabOffsetX = cursor.x - imgRect.left;
          cursor.grabOffsetY = cursor.y - imgRect.top;
          
          // Also save the initial image bottom-right position (percentage)
          cursor.initialImageRight = collageImages[cursor.targetImage].right;
          cursor.initialImageBottom = collageImages[cursor.targetImage].bottom;
          
          // Log detailed position information
          console.log(`${cursor.name} GRAB: 
            - cursor: (${cursor.x.toFixed(2)}, ${cursor.y.toFixed(2)})
            - image: (${imgRect.left.toFixed(2)}, ${imgRect.top.toFixed(2)})
            - offset: (${cursor.grabOffsetX.toFixed(2)}, ${cursor.grabOffsetY.toFixed(2)})
          `);
          
          // Get initial image position in pixels
          cursor.initialImageLeftPx = imgRect.left;
          cursor.initialImageTopPx = imgRect.top;
          
          // And initial cursor position when grabbed
          cursor.initialGrabX = cursor.x;
          cursor.initialGrabY = cursor.y;
        }
        
        // REDESIGNED ALGORITHM:
        // 1. Calculate how far cursor has moved since grab in pixels
        // 2. Apply that same movement to image directly
        // 3. Apply constraints
        // 4. Keep cursor position exactly synchronized with image
        
        // Add curved movement to cursor position
        const curveMagnitude = 0.3;
        const sinOffset = Math.sin(cursor.timeFactor) * curveMagnitude;
        const cosOffset = Math.cos(cursor.timeFactor * 0.7) * curveMagnitude;
        
        // Calculate perpendicular direction for curve
        const perpX = -dy / distance;
        const perpY = dx / distance;
        
        // Direction vector
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        // Calculate new cursor position with curve
        const moveX = (dirX * MOVEMENT_SPEED) + (perpX * sinOffset * 3);
        const moveY = (dirY * MOVEMENT_SPEED) + (perpY * cosOffset * 3);
        
        // Move cursor
        cursor.x += moveX;
        cursor.y += moveY;
        
        // Calculate total cursor movement since initial grab (in pixels)
        const cursorDeltaX = cursor.x - cursor.initialGrabX;
        const cursorDeltaY = cursor.y - cursor.initialGrabY;
        
        // Calculate the new desired image position in pixels
        const desiredImageLeftPx = cursor.initialImageLeftPx + cursorDeltaX;
        const desiredImageTopPx = cursor.initialImageTopPx + cursorDeltaY;
        
        // Convert to viewport percentage for right/bottom positioning (inverted)
        const newRightPercent = (window.innerWidth - desiredImageLeftPx - imgRect.width) / window.innerWidth * 100;
        const newBottomPercent = (window.innerHeight - desiredImageTopPx - imgRect.height) / window.innerHeight * 100;
        
        // Apply constraints with margins
        const margin = 5; // 5% margin from edges
        const constrainedRight = Math.max(margin, Math.min(95, newRightPercent));
        const constrainedBottom = Math.max(margin, Math.min(95, newBottomPercent));
        
        // Update image position
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
        
        // Now we need to re-sync the cursor position to the exact image position
        requestAnimationFrame(() => {
          // Get updated image position
          const updatedRect = imageElement.getBoundingClientRect();
          
          // Set cursor position to maintain exact grab point
          cursor.x = updatedRect.left + cursor.grabOffsetX;
          cursor.y = updatedRect.top + cursor.grabOffsetY;
          
          // Update the initial values if constraints were applied
          if (constrainedRight !== newRightPercent || constrainedBottom !== newBottomPercent) {
            // We hit a constraint, so we need to update our initial values
            cursor.initialImageLeftPx = updatedRect.left;
            cursor.initialImageTopPx = updatedRect.top;
            cursor.initialGrabX = cursor.x;
            cursor.initialGrabY = cursor.y;
          }
        });
      }
      // CASE 3: Just wandering (not dragging)
      else {
        // If we don't have a destination or are close to it, set a new one
        if (!cursor.destinationX || 
            Math.abs(cursor.x - cursor.destinationX) < 10 && 
            Math.abs(cursor.y - cursor.destinationY) < 10) {
          
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
    
    // Very rarely remove a cursor
    if (fakeCursors.length > 0 && Math.random() < 0.001) {
      const removedCursor = fakeCursors[fakeCursors.length - 1];
      
      // If the removed cursor was dragging an image, release the lock
      if (removedCursor.isDragging && removedCursor.targetImage !== null) {
        delete imageLocks[removedCursor.targetImage];
      }
      
      fakeCursors = fakeCursors.slice(0, -1);
      onFakeCursorsUpdate(fakeCursors);
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
    
    // Store the exact point where the touch grabbed the image
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
    
    // Get the image element
    const imageElement = document.querySelector(`.collage-image-button:nth-child(${draggedImageIndex + 1})`);
    if (!imageElement) return;
    
    // Calculate desired image position to maintain grab point
    const desiredImageLeft = touch.clientX - grabOffsetX;
    const desiredImageTop = touch.clientY - grabOffsetY;
    
    // Get current image position and dimensions
    const currentRect = imageElement.getBoundingClientRect();
    
    // Calculate the delta in pixels
    const deltaLeft = desiredImageLeft - currentRect.left;
    const deltaTop = desiredImageTop - currentRect.top;
    
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
    
    // Convert to percentage (right/bottom are inverse of left/top)
    const deltaRightPercent = -(deltaLeft / containerWidth) * 100;
    const deltaBottomPercent = -(deltaTop / containerHeight) * 100;
    
    // Get original image data
    const originalImage = collageImages[draggedImageIndex];
    
    // Calculate new image position
    const newRight = originalImage.right + deltaRightPercent;
    const newBottom = originalImage.bottom + deltaBottomPercent;
    
    // Apply constraints
    let constrainedRight, constrainedBottom;
    
    if (isMobile) {
      // For mobile, constrain to container boundaries
      const imageWidthPercent = (originalImage.width / containerWidth) * 100;
      const imageHeightPercent = (originalImage.height / containerHeight) * 100;
      
      constrainedRight = Math.max(
        0,
        Math.min(100 - imageWidthPercent, newRight)
      );
      constrainedBottom = Math.max(
        0,
        Math.min(100 - imageHeightPercent, newBottom)
      );
    } else {
      // For desktop, use the viewport margin
      const viewportMargin = 3;
      const imageWidthPercent = (originalImage.width / window.innerWidth) * 100;
      
      constrainedRight = Math.max(
        viewportMargin,
        Math.min(100 - viewportMargin - imageWidthPercent, newRight)
      );
      constrainedBottom = Math.max(0, Math.min(100, newBottom));
    }
    
    // Update the image position
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
  
  // Handle touch end events
  function handleTouchEnd() {
    // Remove dragging class from body
    document.body.classList.remove('dragging');
    
    // Release the lock on this image
    if (draggedImageIndex !== null) {
      delete imageLocks[draggedImageIndex];
    }
    
    draggedImageIndex = null;
  }
  
  // Cleanup orphaned image locks every few seconds
  function cleanupOrphanedLocks() {
    // Get all cursor IDs
    const activeCursorIds = fakeCursors.map(cursor => cursor.id);
    
    // Add human user to the active IDs list
    activeCursorIds.push("human-user");
    
    // Check each lock to see if it belongs to an active cursor
    Object.entries(imageLocks).forEach(([imageIndexStr, lockId]) => {
      const imageIndex = parseInt(imageIndexStr, 10);
      if (!activeCursorIds.includes(lockId)) {
        // This is an orphaned lock - remove it
        console.log(`Cleaning up orphaned lock on image ${imageIndex} (ID: ${lockId})`);
        delete imageLocks[imageIndex];
      }
    });
  }

  onMount(() => {
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
    window.addEventListener('touchend', handleTouchEnd);
    
    // Set up periodic cleanup of orphaned locks
    const lockCleanupInterval = setInterval(cleanupOrphanedLocks, 5000);
        
    (async () => {
      try {
        // First preload all images
        await preloadImages();
        
        // Run initial cleanup of any existing locks
        cleanupOrphanedLocks();
        
        // Then generate positions and start animation sequence
        collageImages = generateRandomPositions();
        
        // Start introducing images one by one with a faster speed
        setTimeout(() => {
          imagesReady = true;
          
          // Add images one by one with faster staggered timing
          collageImages.forEach((img, index) => {
            setTimeout(() => {
              visibleImages = [...visibleImages, index];
            }, 150 + index * 180);
          });
          
          // Start fake cursor simulation after images are visible
          simulationInterval = window.setInterval(simulateFakeInteraction, 16);
        }, 200);
      } catch (error) {
        console.error('Error loading images:', error);
      }
    })();

    // Cleanup event listeners and timer
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      clearTimeout(resizeTimer);
      clearInterval(simulationInterval);
      clearInterval(lockCleanupInterval);
    };
  });

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
    
    // Store the exact point where the cursor grabbed the image
    grabOffsetX = event.clientX - rect.left;
    grabOffsetY = event.clientY - rect.top;
    
    console.log(`USER GRAB: offset=(${grabOffsetX.toFixed(2)}, ${grabOffsetY.toFixed(2)}), relative=(${(grabOffsetX / rect.width * 100).toFixed(1)}%, ${(grabOffsetY / rect.height * 100).toFixed(1)}%)`);
    
    // Record which image is being dragged and initial position
    draggedImageIndex = index;
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

  function handleDrag(event: MouseEvent) {
    if (draggedImageIndex === null) return;
    
    // Get the image element
    const imageElement = document.querySelector(`.collage-image-button:nth-child(${draggedImageIndex + 1})`);
    if (!imageElement) return;
    
    // Get the image rect
    const imgRect = imageElement.getBoundingClientRect();
    
    // Log current position relative to image
    const currentRelX = event.clientX - imgRect.left;
    const currentRelY = event.clientY - imgRect.top;
    
    // Calculate drift from original grab point
    const driftX = currentRelX - grabOffsetX;
    const driftY = currentRelY - grabOffsetY;
    
    // Log drift occasionally
    if (Math.random() < 0.05) {
      console.log(`USER DRIFT: (${driftX.toFixed(2)}px, ${driftY.toFixed(2)}px), current=(${currentRelX.toFixed(2)}, ${currentRelY.toFixed(2)}), expected=(${grabOffsetX.toFixed(2)}, ${grabOffsetY.toFixed(2)})`);
    }
    
    // Calculate desired image position to maintain grab point
    const desiredImageLeft = event.clientX - grabOffsetX;
    const desiredImageTop = event.clientY - grabOffsetY;
    
    // Get current image position and dimensions
    const currentRect = imageElement.getBoundingClientRect();
    
    // Calculate the delta in pixels
    const deltaLeft = desiredImageLeft - currentRect.left;
    const deltaTop = desiredImageTop - currentRect.top;
    
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
    
    // Convert to percentage (right/bottom are inverse of left/top)
    const deltaRightPercent = -(deltaLeft / containerWidth) * 100;
    const deltaBottomPercent = -(deltaTop / containerHeight) * 100;
    
    // Get original image data
    const originalImage = collageImages[draggedImageIndex];
    
    // Calculate new image position
    const newRight = originalImage.right + deltaRightPercent;
    const newBottom = originalImage.bottom + deltaBottomPercent;
    
    // Apply constraints
    let constrainedRight, constrainedBottom;
    
    if (isMobile) {
      // For mobile, constrain to container boundaries
      const imageWidthPercent = (originalImage.width / containerWidth) * 100;
      const imageHeightPercent = (originalImage.height / containerHeight) * 100;
      
      constrainedRight = Math.max(
        0,
        Math.min(100 - imageWidthPercent, newRight)
      );
      constrainedBottom = Math.max(
        0,
        Math.min(100 - imageHeightPercent, newBottom)
      );
    } else {
      // For desktop, use the viewport margin
      const viewportMargin = 3;
      const imageWidthPercent = (originalImage.width / window.innerWidth) * 100;
      
      constrainedRight = Math.max(
        viewportMargin,
        Math.min(100 - viewportMargin - imageWidthPercent, newRight)
      );
      constrainedBottom = Math.max(0, Math.min(100, newBottom));
    }
    
    // Log if constraints are applied (which could cause drift)
    if (constrainedRight !== newRight || constrainedBottom !== newBottom) {
      console.log(`USER CONSTRAINT: right=${newRight.toFixed(2)} -> ${constrainedRight.toFixed(2)}, bottom=${newBottom.toFixed(2)} -> ${constrainedBottom.toFixed(2)}`);
      
      // For user dragging, we don't need to adjust the cursor position as it follows the mouse exactly
    }
    
    // Update the image position
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
    
    // After image is updated, check final position and drift
    requestAnimationFrame(() => {
      const finalRect = imageElement.getBoundingClientRect();
      const finalRelX = event.clientX - finalRect.left;
      const finalRelY = event.clientY - finalRect.top;
      const finalDriftX = finalRelX - grabOffsetX;
      const finalDriftY = finalRelY - grabOffsetY;
      
      if (Math.abs(finalDriftX) > 1 || Math.abs(finalDriftY) > 1) {
        console.log(`USER FINAL DRIFT: (${finalDriftX.toFixed(2)}px, ${finalDriftY.toFixed(2)}px) after constraints`);
      }
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
    // Find a cursor that's dragging this image
    const draggingCursor = fakeCursors.find(cursor => cursor.isDragging && cursor.targetImage === imageIndex);
    
    if (draggingCursor) {
      // Log cursor and image relationship for highlight debugging
      console.log(`HIGHLIGHT: Image ${imageIndex} being dragged by ${draggingCursor.name}, cursor location: (${draggingCursor.x.toFixed(0)}, ${draggingCursor.y.toFixed(0)})`);
      
      // Return a more visible border style with the cursor's color
      return `
        box-shadow: 0 0 0 4px ${draggingCursor.color}, 0 0 0 6px rgba(255,255,255,0.8);
        border-radius: 4px;
        outline: 2px dashed ${draggingCursor.color};
        outline-offset: 2px;
      `;
    } else if (imageLocks[imageIndex]) {
      // Someone else is dragging it - log who
      console.log(`HIGHLIGHT CHECK: Image ${imageIndex} locked by "${imageLocks[imageIndex]}" but no matching cursor found`);
    }
    
    return '';
  }
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