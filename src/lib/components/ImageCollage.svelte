<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import draggingStore, { startDragging, stopDragging } from '../stores/draggingStore.js';
  
  // IMPORTANT: The fake cursors now use absolute positioning (position:absolute) in the parent component.
  // This means cursor positions should be document-relative and SHOULD add window.scrollY
  // to their positions to maintain proper document positioning.
  
  // Import images from props instead of directly
  export let imageDimensions: any[] = [];
  export let largeScreenImages: any[] = [];
  export let fakeCursors: any[] = [];
  
  // Type definition for collage images
  interface CollageImage {
    src: string;
    alt: string;
    width: number;
    height: number;
    left: number;
    top: number;
    zIndex: number;
    rotation: number;
    scale: number;
    area?: number;
    isSpecialImage?: boolean;
    specialImageType?: string;
    positioned?: boolean; // Flag to indicate if this image has already been positioned
    processed?: boolean; // Flag to indicate if this image has been processed
  }
  
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
  
  // Basic constants and variables
  const viewportMargin = 1;  // Reduced from 3 to allow images closer to edge
  let isMobile: boolean; // Will be set in onMount
  let rightMin: number; // Will be set in onMount
  let rightMax: number; // Will be set in onMount
  let bottomMin: number; // Will be set in onMount
  let bottomMax: number; // Will be set in onMount
  let highlightIndexTimeout: number;
  let draggableItem: HTMLElement;
  let isDragging = false;
  let isPointerDown = false;
  let startX: number, startY: number, startLeft: number, startTop: number;
  let previousTouch: Touch | null = null;
  let resizeTimer: number;
  let previousHighlightIndex = -1;
  let highlightIndex = -1;
  let dragTimeout: number;
  let visibleTouchControls = false;
  let collageContainer: HTMLElement;
  let simulationInterval: number;
  
  // Dragging functionality
  let draggedImageIndex: number | null = null;
  let dragStartX: number;
  let dragStartY: number;
  let initialRight: number;
  let initialBottom: number;
  
  // Define consistent margin for all images globally
  const CONSISTENT_MARGIN = 10; // 10% margin from all edges (percentage of container)
  
  // Define a fixed margin in pixels instead of percentages
  const MARGIN_PX = 20; // Reduced from 50px to 20px for all edges
  const BOTTOM_MARGIN_PX = 20; // Reduced from 50px to 20px
  
  // Define constants for cursor system
  const MAX_CURSORS = 5; // Maximum number of bot cursors allowed at once
  
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
    // But with a lower probability than before (10% instead of 30%)
    if (isPreexisting && Math.random() < 0.1) {
      // Determine if we should start by dragging an image
      // We'll set the proper targets after the cursor is created
      initialState = {
        isDragging: false, // Will be set to true after target acquisition
        isMovingToTarget: true, // Start by moving toward an image
        targetImage: null // Will be set later
      };
    }
    
    const containerWidth = browser ? window.innerWidth : 1200;
    const containerHeight = browser ? window.innerHeight : 800;
    
    // Adjust lifespans based on cursor type - SHORTER LIFESPANS FOR DESKTOP
    // Static cursors live 20-40 seconds, moving cursors live 30-60 seconds
    const cursorLifespan = isStatic ? 
                         (20000 + Math.random() * 20000) : // 20-40 seconds for static cursors (was 30-60)
                         (30000 + Math.random() * 30000);  // 30-60 seconds for moving cursors (was 60-120)
    
    return {
      id,
      x: Math.random() * containerWidth,
      y: Math.random() * containerHeight,
      color,
      name,
      isDragging: initialState.isDragging,
      isMovingToTarget: initialState.isMovingToTarget,
      targetImage: initialState.targetImage,
      targetX: 0,
      targetY: 0,
      destinationX: 100 + Math.random() * (containerWidth - 200),
      destinationY: 100 + Math.random() * (containerHeight - 200),
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
      isStatic: isStatic || (!isPreexisting && Math.random() < 0.8), // Make new cursors mostly static
      // Set a shorter initial resting period (10-20 seconds) for most cursors
      restingPeriod: isPreexisting ? 
        Math.random() * 4000 : // Short rest for preexisting cursors
        Math.random() < 0.8 ? 
          10000 + Math.random() * 10000 : // 10-20 seconds for most new cursors (was 20-30)
          0, // No rest for some new cursors
      isPreexisting: isPreexisting, // Used to identify cursors that were "already there"
      lifespan: cursorLifespan // Updated cursor lifespan
    };
  }
  
  // Initialize preexisting cursors with proper image targets
  function setupPreexistingCursor(cursor: any) {
    // Get all visible images that are not currently locked
    const visibleImageIndexes = [...visibleImages];
    const availableIndexes = visibleImageIndexes.filter(index => !imageLocks[index]);
    
    if (availableIndexes.length === 0) {
      console.log(`No available images for cursor ${cursor.name} to target - making static`);
      // No images available, make cursor static
      cursor.isMovingToTarget = false;
      cursor.isStatic = true;
      return cursor;
    }
    
    // Choose a random image from the available ones
    const randomImageIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    
    // Use the mobile or desktop container appropriately for mobile cursors
    const isMobile = window.innerWidth <= 768;
    const containerSelector = isMobile ? '.mobile-collage' : '.desktop-collage';
    
    // Get the image element
    const imageElement = document.querySelector(`${containerSelector} .collage-image-button:nth-child(${randomImageIndex + 1})`);
    if (!imageElement) {
      console.log(`Cannot find image element ${randomImageIndex} in ${containerSelector} - making cursor static`);
      // Image element not found, make cursor static
      cursor.isMovingToTarget = false;
      cursor.isStatic = true;
      return cursor;
    }
    
    // Get image position (viewport coordinates)
    const rect = imageElement.getBoundingClientRect();
    
    // Set target to image center (adding scroll offset for absolute positioning)
    cursor.targetImage = randomImageIndex;
    cursor.targetX = rect.left + rect.width / 2;
    cursor.targetY = rect.top + rect.height / 2 + window.scrollY;
    
    // Lock this image for the cursor
    imageLocks[randomImageIndex] = cursor.id;
    
    // Mark that cursor is moving to target
    cursor.isMovingToTarget = true;
    cursor.isDragging = false;
    cursor.isStatic = false;
    
    console.log(`Cursor ${cursor.name} targeting image ${randomImageIndex} in ${containerSelector}`);
    
    return cursor;
  }

  // Function to simulate fake cursor interactions
  function simulateFakeInteraction() {
    // Check if cursor system is initialized
    if (!hasCursorInitialized) {
      // If we haven't set the initialization delay yet, set it now
      if (cursorInitializationDelay === 0) {
        // Check if we're on mobile
        const isMobile = window.innerWidth <= 768;
        
        // Set a variable delay before any cursor activity
        // On mobile, use a shorter delay (15-30 seconds) to make interaction more visible
        cursorInitializationDelay = isMobile ? 
          15000 + Math.random() * 15000 : // 15-30 seconds on mobile
          20000 + Math.random() * 40000;  // 20-60 seconds on desktop
        
        console.log(`Will delay cursor appearance by ${Math.round(cursorInitializationDelay/1000)} seconds`);
        
        // Initialize the page visit timer for the guaranteed cursor appearance
        pageVisitStartTime = Date.now();
        // Set timer to ensure a cursor appears quickly on mobile
        guaranteedCursorTimer = isMobile ? 30000 : 60000; // 30 sec on mobile, 1 min on desktop
        
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
    
    // Check if we're on mobile - adjust cursor activity for better visibility
    const isMobile = window.innerWidth <= 768;
    
    // On mobile, make cursor activity more frequent than desktop but still reasonable
    if (isMobile) {
      // For mobile, make cursor appearances more frequent but not overwhelming
      const now = Date.now();
      const timeSinceLastCursor = now - lastCursorCreationTime;
      
      // Attempt to create new cursors every 30-90 seconds on mobile
      const mobileMinimumInterval = 30 * 1000; // 30 seconds
      const mobileRandomInterval = 60 * 1000; // Up to 1 additional minute
      
      if (timeSinceLastCursor < mobileMinimumInterval + (Math.random() * mobileRandomInterval)) {
        // Not enough time has passed on mobile, skip this update
        return;
      }
    }
    
    // Update the guaranteed cursor timer if there are no cursors present
    if (fakeCursors.length === 0) {
      guaranteedCursorTimer -= 16; // Count down the timer
      
      if (guaranteedCursorTimer <= 0) {
        // Force a cursor to appear
        guaranteedCursorTimer = 60000; // Reset timer
        console.log('Forcing cursor to appear');
        
        // Create a cursor using our new function
        attemptToCreateNewCursor();
        return;
      }
    }
    
    // Check if we need to create a new cursor
    if (fakeCursors.length < MAX_CURSORS) {
      const now = Date.now();
      const timeSinceLastCursor = now - lastCursorCreationTime;
      const minTimeBetweenCursors = isMobile ? 3 * 60 * 1000 : 60 * 1000; // 3 min on mobile, 1 min on desktop
      const randomDelayFactor = isMobile ? 5 * 60 * 1000 : 2 * 60 * 1000; // Up to additional 5 min on mobile, 2 min on desktop
      
      // Create cursor with appropriate timing
      if (timeSinceLastCursor > minTimeBetweenCursors + (Math.random() * randomDelayFactor)) {
        // Create a new cursor using our new function
        attemptToCreateNewCursor();
      }
    }
    
    // Update cursor positions
    updateCursorPositions();
  }

  // Function to initialize the cursor system with variety
  function initializeCursorSystem(forceCursor = false) {
    console.log("Initializing cursor system");
    
    // Check if we're on mobile
    const isMobile = window.innerWidth <= 768;
    
    // If on mobile, we'll create cursors but keep them hidden until they interact
    // with an image (handled in updateCursorPositions)
    
    // Should we have cursors at app start?
    const shouldHaveCursorsAtStart = forceCursor || Math.random() < 0.7; // 70% chance
    
    if (shouldHaveCursorsAtStart) {
      // Determine how many cursors to start with - 50% chance of 2 cursors at start (increased from 20%)
      const initialCursorCount = isMobile ? 1 : (Math.random() < 0.5 ? 2 : 1);
      console.log(`Creating ${initialCursorCount} initial visitor${initialCursorCount > 1 ? 's' : ''}`);
      
      // Create the initial cursor(s)
      for (let i = 0; i < initialCursorCount; i++) {
        // Reduced chance to create a static cursor on desktop from 80% to 50%
        const shouldBeStatic = isMobile || Math.random() < 0.5;
        
        // Create a preexisting cursor (appears to already be using the site)
        const newCursor = createFakeCursor(shouldBeStatic, true);
        
        // If we're on mobile, move the cursor off-screen until it drags something
        if (isMobile) {
          newCursor.x = -9999;
          newCursor.y = -9999;
        }
        
        // Only set up the cursor for dragging if it's not static
        const configuredCursor = shouldBeStatic ? 
          newCursor : // Static cursors don't need drag setup
          setupPreexistingCursor(newCursor); // Only set up non-static cursors
        
        // For static cursors, add a shorter resting period (5-15 seconds)
        if (shouldBeStatic) {
          configuredCursor.restingPeriod = 5000 + Math.random() * 10000;
        }
        
        // Add to cursor array
        fakeCursors = [...fakeCursors, configuredCursor];
        
        // Set a slightly shorter lifespan for initial cursors (20-60 seconds)
        configuredCursor.lifespan = 20000 + Math.random() * 40000;
      }
      
      // Update the parent with new cursor state
      onFakeCursorsUpdate(fakeCursors);
      
      // Mark that we've created cursors
      initialStaticCursorCreated = true;
      
      // Set the last creation time to now to ensure we wait before creating additional cursors
      lastCursorCreationTime = Date.now();
    }
  }

  // Add type for resize timer
  // ... existing code ...
  
  // Generate positions for images with better randomization
  function generateRandomPositions() {
    // Calculate a scale factor based on viewport width
    const viewportWidth = browser ? window.innerWidth : 1200;
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
      let containerWidth = viewportWidth;
      let containerHeight = browser ? window.innerHeight : 800;
      
      if (browser) {
      const container = document.querySelector('.mobile-collage');
        if (container) {
          const rect = container.getBoundingClientRect();
          containerWidth = rect.width;
          containerHeight = rect.height;
        }
      }
      
      // For mobile, create a layout that maximizes playground space usage while keeping images fully visible
      return sortedBySize.map((img, i) => {
        // Use much more of the container space 
        const leftMin = containerWidth * 0.4; // Use more horizontal space (was 0.55)
        const leftMax = containerWidth - img.width - MARGIN_PX;
        const topMin = 0; // Use full height
        const topMax = containerHeight - img.height - MARGIN_PX;
        
        // Distribution factor: 0 for largest image, 1 for smallest
        const distributionFactor = i / (sortedBySize.length - 1 || 1);
        
        // Generate position with better spread
        let left, top;
        
        // Use quadrant-based positioning for better distribution
        if (Math.random() < 0.7) {
          // 70% chance to place in specific sections
          // Divide container into a 3x3 grid and place in one of the cells
          const cellX = Math.floor(Math.random() * 3); // 0, 1, or 2
          const cellY = Math.floor(Math.random() * 3); // 0, 1, or 2
          
          // Calculate base position within the cell
          const cellWidth = (leftMax - leftMin) / 3;
          const cellHeight = (topMax - topMin) / 3;
          
          // Calculate position within cell with randomness
          left = leftMin + (cellX * cellWidth) + (Math.random() * cellWidth * 0.8);
          top = topMin + (cellY * cellHeight) + (Math.random() * cellHeight * 0.8);
        } else {
          // 30% chance for circular distribution around center
          const angle = Math.random() * Math.PI * 2;
          
          // Create a distance factor that increases with smaller images
          const baseDistanceFactor = 0.3 + (distributionFactor * 0.6);
          const randomBoost = Math.random() * 0.4;
          const distanceFromCenter = Math.min(0.95, baseDistanceFactor + randomBoost);
          
          // Calculate the center point of the usable area
          const centerX = leftMin + (leftMax - leftMin) * 0.5;
          const centerY = topMin + (topMax - topMin) * 0.5;
          
          // Calculate spread distances
          const spreadX = (leftMax - leftMin) * 0.5 * distanceFromCenter;
          const spreadY = (topMax - topMin) * 0.5 * distanceFromCenter;
          
          // Calculate position with radial distribution
          left = centerX + Math.cos(angle) * spreadX;
          top = centerY + Math.sin(angle) * spreadY;
        }
        
        // Ensure images stay within bounds
        left = Math.max(leftMin, Math.min(leftMax, left));
        top = Math.max(topMin, Math.min(topMax, top));
        
        // Add rotation with more variation
        const rotation = (Math.random() * 50) - 25; // -25 to +25 degrees
        
        return {
          ...img,
          left,
          top,
          rotation,
          // Z-index based on size: largest in back (1), smallest in front (N)
          zIndex: i + 1
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
    
    // Define the available area for desktop positioning
    const containerWidth = browser ? window.innerWidth : 1200;
    const containerHeight = browser ? window.innerHeight : 800;
    
    // Position the images in the lower right quadrant of the screen with much more spread
    return sortedBySize.map((img, index) => {
      // Use more of the screen space - use full height and wider horizontal space
      const leftMin = containerWidth * 0.4; // Use more horizontal space
      const leftMax = containerWidth * 0.98 - img.width; // Nearly full width
      const topMin = containerHeight * 0.02; // Start from almost top of screen
      const topMax = containerHeight * 0.98 - img.height; // Nearly full height
      
      // Create a true collage effect with proper layering but much more spread
      // Calculate distribution factor based on image size rank (0-1 range)
      const distributionFactor = index / (sortedBySize.length - 1 || 1);
      
      // Generate random angle for positioning with vertical bias
      let angle;
      
      // Bias positioning toward top and bottom regions to increase vertical spread
      if (Math.random() < 0.6) {
        // 60% chance to bias toward top or bottom
        if (Math.random() < 0.5) {
          // Upper half - angles between 30° and 150° (π/6 to 5π/6)
          angle = (Math.PI / 6) + (Math.random() * 2 * Math.PI / 3);
        } else {
          // Lower half - angles between 210° and 330° (7π/6 to 11π/6)
          angle = (7 * Math.PI / 6) + (Math.random() * 2 * Math.PI / 3);
        }
      } else {
        // 40% chance for completely random angle
        angle = Math.random() * Math.PI * 2;
      }
      
      // Dramatically increase the distance factor for more spread
      // Make larger images still somewhat centered but much more spread out
      const baseDistanceFactor = 0.4 + (distributionFactor * 0.6); // Range from 0.4-1.0
      
      // Add extra vertical spread (stretch the y-axis distribution)
      const verticalStretchFactor = 1.5; // Increase vertical spread by 50%
      
      // Add some randomness to further prevent clustering
      const randomSpreadBoost = Math.random() * 0.4; // Random boost between 0-0.4
      const distanceFromCenter = Math.min(0.98, baseDistanceFactor + randomSpreadBoost); // Cap at 0.98
      
      // Calculate usable area dimensions
      const usableWidth = leftMax - leftMin;
      const usableHeight = topMax - topMin;
      
      // Calculate the center point (use central positioning)
      const centerX = leftMin + (usableWidth * 0.5); // Center horizontally
      const centerY = topMin + (usableHeight * 0.5); // Center vertically
      
      // Calculate spread distances based on available space
      const spreadX = usableWidth * 0.5 * distanceFromCenter;
      const spreadY = usableHeight * 0.5 * distanceFromCenter * verticalStretchFactor; // Extra vertical spread
      
      // Calculate position with much more spread from center
      let left = centerX + Math.cos(angle) * spreadX;
      let top = centerY + Math.sin(angle) * spreadY;
      
      // Ensure images stay within bounds
      left = Math.max(leftMin, Math.min(leftMax, left));
      top = Math.max(topMin, Math.min(topMax, top));
      
      // No rotation
      const rotation = 0; // Zero degrees - perfectly straight
      
      return {
        ...img,
        left,
        top,
        rotation,
        zIndex: index + 1
      };
    });
  }

  // Function to handle drag events
  function handleDrag(event: MouseEvent) {
    if (draggedImageIndex === null) return;
    
    // Get the container's position to adjust for its offset
    const container = document.querySelector('.desktop-collage') as HTMLElement;
    const containerRect = container ? container.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    const containerLeft = containerRect.left;
    const containerTop = containerRect.top;
    
    // Calculate the new position based on mouse movement and initial grab offset
    // Adjust for the container's position
    const desiredImageLeft = event.clientX - grabOffsetX - containerLeft;
    const desiredImageTop = event.clientY - grabOffsetY - containerTop;
    
    // Apply uniform minimum margin to all images regardless of size
    const MIN_MARGIN = 0; // Allow images to go to edges

    // Get the current image data
    const imageData = collageImages[draggedImageIndex];
    if (!imageData) return;
    
    // Get image dimensions
    const imageWidth = imageData.width;
    const imageHeight = imageData.height;

    // Get the container dimensions
    const containerWidth = container ? containerRect.width : window.innerWidth;
    const containerHeight = container ? containerRect.height : window.innerHeight;
    
    // Special constraint for the owl to ensure at least its face is visible
    const isOwl = imageData.alt === 'Owl' || (typeof imageData.alt === 'string' && imageData.alt.includes('owl'));
    const isSnake = imageData.alt === 'Snake' || (typeof imageData.alt === 'string' && imageData.alt.includes('snake'));
    const minTop = (isOwl || isSnake) ? -imageHeight * 0.1 : MIN_MARGIN; // Only allow 10% to go off-screen for snake & owl images
    
    // For the owl specifically, adjust the grab offset to be centered on visible content
    let adjustedNewLeft = desiredImageLeft;
    let adjustedNewTop = desiredImageTop;
    
    if (isOwl || isSnake) {
      // No adjustment needed for left/right as we fixed the dimensions
      // Just ensure the owl stays with the cursor
      adjustedNewLeft = desiredImageLeft;
      adjustedNewTop = desiredImageTop;
    }
    
    // Clamp the position to keep image fully within viewport
    // Account for image dimensions to prevent overflow on right and bottom edges
    const left = Math.max(
      MIN_MARGIN,
      Math.min(containerWidth - imageWidth - MIN_MARGIN, adjustedNewLeft)
    );
    const top = Math.max(
      minTop, // Use the more lenient top constraint for owl
      Math.min(containerHeight - imageHeight - MIN_MARGIN, adjustedNewTop)
    );

    // Debug logging for the owl image
    if (isOwl || isSnake) {
      console.log(`Moving Owl to: ${left}, ${top}`);
      console.log(`Owl dimensions - Width: ${imageWidth}, Height: ${imageHeight}`);
      console.log(`Min/Max - Left: ${MIN_MARGIN} to ${containerWidth - imageWidth - MIN_MARGIN}, Top: ${minTop} to ${containerHeight - imageHeight - MIN_MARGIN}`);
    }
    
    // Get the image element
    const imageElement = document.querySelector(`.collage-image-button:nth-child(${draggedImageIndex + 1})`) as HTMLElement;
    if (!imageElement) return;
    
    // Update the image position
    imageElement.style.left = `${left}px`;
    imageElement.style.top = `${top}px`;
    
    // Make the image slightly larger when dragging for better visual feedback
    // For owl, use slightly larger scale for better grabbability
    const scaleFactor = 1; // Set to 1 to remove scaling effect
    imageElement.style.transform = `rotate(${imageData.rotation}deg) scale(${scaleFactor})`;
    
    // Update the image data in our array
    collageImages[draggedImageIndex] = {
      ...imageData,
      left,
      top
    };
    
    // If it's the human cursor, update its position
    // CRITICAL FIX: If the image is constrained by the window boundary,
    // don't use event.clientX/Y, but calculate cursor position from the constrained image position
    const humanCursorIndex = fakeCursors.findIndex(c => c.id === "human-user");
    if (humanCursorIndex !== -1) {
      // Check if the image position was constrained (hit a boundary)
      const wasConstrained = left !== desiredImageLeft || top !== desiredImageTop;
      
      if (wasConstrained) {
        // Image hit boundary - adjust cursor position to match image's constrained position
        // This keeps the cursor exactly at the same spot on the image when boundaries are hit
        const adjustedCursorX = left + grabOffsetX + containerLeft;
        const adjustedCursorY = top + grabOffsetY + containerTop;
        
        // Override the mouse position with our constrained position
        fakeCursors[humanCursorIndex] = {
          ...fakeCursors[humanCursorIndex],
          x: adjustedCursorX,
          y: adjustedCursorY + window.scrollY
        };
        
        // IMPORTANT: Reposition the physical cursor to match the image constraint
        // This critical step makes the cursor and image move as a single unit
        if (typeof document.dispatchEvent === 'function') {
          const cursorPos = fakeCursors[humanCursorIndex];
          
          // Force the browser cursor to the constrained position
          if (cursorPos && typeof MouseEvent === 'function') {
            try {
              document.body.style.cursor = 'none'; // Hide cursor temporarily during teleport
              setTimeout(() => {
                document.body.style.cursor = ''; // Restore cursor
              }, 50);
            } catch (e) {
              console.log("Could not adjust cursor style", e);
            }
          }
        }
      } else {
        // No constraint, cursor position matches the event
        fakeCursors[humanCursorIndex] = {
          ...fakeCursors[humanCursorIndex],
          x: event.clientX,
          y: event.clientY + window.scrollY
        };
      }
      
      // Notify parent component of cursor change
      onFakeCursorsUpdate(fakeCursors);
    }
  }

  // Function to handle touch start events (mobile)
  function handleTouchStart(event: TouchEvent, index: number) {
    // Prevent default behavior 
    event.preventDefault();
    
    // Check if this image is already being dragged by a cursor
    if (imageLocks[index]) {
      // Image is locked, can't drag it
      console.log(`Image ${index} is currently being moved by another cursor`);
      
      // IMPORTANT: Force release all bot cursor locks when human interacts
      // This ensures human interactions take priority
      const keys = Object.keys(imageLocks);
      keys.forEach((key: string) => {
        const lockId = imageLocks[parseInt(key, 10)];
        if (lockId !== "human-user") {
          // Release all bot cursor locks
          console.log(`Releasing bot cursor lock on image ${key} to prioritize human interaction`);
          delete imageLocks[parseInt(key, 10)];
          stopDragging(parseInt(key, 10));
          
          // Also update any cursor that might be holding this image
          fakeCursors = fakeCursors.map(cursor => {
            if (cursor.targetImage === parseInt(key, 10)) {
              cursor.isDragging = false;
              cursor.targetImage = null;
              // Make it find something else to interact with
              cursor.isMovingToTarget = true;
              console.log(`Cursor ${cursor.name} forced to release image ${key}`);
            }
            return cursor;
          });
        }
      });
      
      // Now try to acquire the lock again
      imageLocks[index] = "human-user";
    } else {
      // Lock this image for human user
      imageLocks[index] = "human-user";
    }
    
    // Get the image element and its rect
    const imageElement = document.querySelector(`.mobile-collage .collage-image-button:nth-child(${index + 1})`);
    if (!imageElement) return;
    
    const rect = imageElement.getBoundingClientRect();
    
    // Get the first touch
    const touch = event.touches[0];
    
    // Get the image data to check if it's a special image
    const imageData = collageImages[index];
    const isSpecialImage = imageData && (
      (imageData.alt === 'Owl' || (typeof imageData.alt === 'string' && imageData.alt.includes('owl'))) ||
      (imageData.alt === 'Snake' || (typeof imageData.alt === 'string' && imageData.alt.includes('snake')))
    );
    
    // Calculate grab offset from touch position within the image
    grabOffsetX = touch.clientX - rect.left;
    grabOffsetY = touch.clientY - rect.top;
    
    // Record which image is being dragged
    draggedImageIndex = index;
    
    // Add dragging class to body to ensure cursor stays as grabbing
    document.body.classList.add('dragging');
    
    // Bring this image to front
    bringToFront(index);
    
    // Log debugging info
    console.log(`Human touching image ${index} at position: ${touch.clientX}, ${touch.clientY}`);
    console.log(`Image locks after human touch: ${JSON.stringify(imageLocks)}`);
  }
  
  // Function to handle touch move events (mobile drag)
  function handleTouchMove(event: TouchEvent) {
    if (draggedImageIndex === null) return;
    
    // Prevent scrolling while dragging
    event.preventDefault();
    
    // Get the first touch point
    const touch = event.touches[0];
    if (!touch) return;
    
    // Get the container's position to adjust for its offset
    const container = document.querySelector('.mobile-collage') as HTMLElement;
    const containerRect = container ? container.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    const containerLeft = containerRect.left;
    const containerTop = containerRect.top;
    
    // Calculate the new position based on touch movement and initial grab offset
    // Correctly adjust for the container's offset
    const desiredImageLeft = touch.clientX - grabOffsetX - containerLeft;
    const desiredImageTop = touch.clientY - grabOffsetY - containerTop;
    
    // Apply uniform minimum margin to all images regardless of size
    const MIN_MARGIN = 0; // Allow images to go to edges
    
    // Get the current image data
    const imageData = collageImages[draggedImageIndex];
    if (!imageData) return;
    
    // Get image dimensions
    const imageWidth = imageData.width;
    const imageHeight = imageData.height;
    
    // Get the container dimensions
    const containerWidth = container ? containerRect.width : window.innerWidth;
    const containerHeight = container ? containerRect.height : window.innerHeight;
    
    // Check if this is the owl image
    const isOwl = imageData.alt === 'Owl' || (typeof imageData.alt === 'string' && imageData.alt.includes('owl'));
    const isSnake = imageData.alt === 'Snake' || (typeof imageData.alt === 'string' && imageData.alt.includes('snake'));
    const minTop = (isOwl || isSnake) ? -imageHeight * 0.1 : MIN_MARGIN; // Only allow 10% to go off-screen for snake & owl images
    
    // For the owl specifically, adjust to center on visible content - Retain adjustments
    let adjustedNewLeft = desiredImageLeft;
    let adjustedNewTop = desiredImageTop;
    
    if (isOwl || isSnake) {
      // No adjustment needed as we fixed the dimensions
      adjustedNewLeft = desiredImageLeft;
      adjustedNewTop = desiredImageTop;
    }
    
    // Clamp the position to keep image fully within viewport
    // Account for image dimensions to prevent overflow on right and bottom edges
    const left = Math.max(
      MIN_MARGIN,
      Math.min(containerWidth - imageWidth - MIN_MARGIN, adjustedNewLeft)
    );
    const top = Math.max(
      minTop, // Use the more lenient top constraint for owl
      Math.min(containerHeight - imageHeight - MIN_MARGIN, adjustedNewTop)
    );
    
    // Debug logging for the owl image
    if (isOwl || isSnake) {
      console.log(`Moving Owl to: ${left}, ${top} (Touch)`);
      console.log(`Owl dimensions - Width: ${imageWidth}, Height: ${imageHeight}`);
      console.log(`Min/Max - Left: ${MIN_MARGIN} to ${containerWidth - imageWidth - MIN_MARGIN}, Top: ${minTop} to ${containerHeight - imageHeight - MIN_MARGIN}`);
    }
    
    // Get the image element
    const imageElement = document.querySelector(`.collage-image-button:nth-child(${draggedImageIndex + 1})`) as HTMLElement;
    if (!imageElement) return;
    
    // Update the image position
    imageElement.style.left = `${left}px`;
    imageElement.style.top = `${top}px`;
    
    // Make the image slightly larger when dragging for better visual feedback
    // For owl, use slightly larger scale for better grabbability
    const scaleFactor = 1; // Set to 1 to remove scaling effect
    imageElement.style.transform = `rotate(${imageData.rotation}deg) scale(${scaleFactor})`;
    
    // Update the image data in our array
    collageImages[draggedImageIndex] = {
      ...imageData,
      left,
      top
    };
    
    // If it's the human cursor, update its position
    const humanCursorIndex = fakeCursors.findIndex(c => c.id === "human-user");
    if (humanCursorIndex !== -1) {
      // Check if the image position was constrained (hit a boundary)
      const wasConstrained = left !== desiredImageLeft || top !== desiredImageTop;
      
      if (wasConstrained) {
        // Image hit boundary - adjust cursor position to match image's constrained position
        // This keeps the cursor exactly at the same spot on the image when boundaries are hit
        const adjustedCursorX = left + grabOffsetX + containerLeft;
        const adjustedCursorY = top + grabOffsetY + containerTop;
        
        // Override the touch position with our constrained position
        fakeCursors[humanCursorIndex] = {
          ...fakeCursors[humanCursorIndex],
          x: adjustedCursorX,
          y: adjustedCursorY + window.scrollY
        };
      } else {
        // No constraint, cursor position matches the touch
        fakeCursors[humanCursorIndex] = {
          ...fakeCursors[humanCursorIndex],
          x: touch.clientX,
          y: touch.clientY + window.scrollY
        };
      }
      
      // Notify parent component of cursor change
      onFakeCursorsUpdate(fakeCursors);
    }
  }

  // Update cursor position calculation to account for scroll
  function updateCursorPositions() {
    // On mobile devices, only show cursors that are actively dragging
    const isMobile = window.innerWidth <= 768;
    
    // First, check for cursors that have exceeded their lifespan and should be removed
    const now = Date.now();
    
    // IMPROVED LIFECYCLE: Check for inactive cursors that should be expired
    // Modify the expiration criteria to be more aggressive on desktop
    const expiredCursors = fakeCursors.filter(cursor => {
      if (cursor.id === "human-user") return false; // Never expire the human cursor
      
      // On desktop, expire cursor either if it has exceeded lifespan or it's static and inactive
      if (!isMobile) {
        // If cursor is static and has been static for more than 20 seconds, remove it
        if (cursor.isStatic && (now - cursor.lastActiveTime > 20000)) {
          return true;
        }
        
        // If cursor completed an action (dragged and released an image) over 15 seconds ago, remove it
        if (!cursor.isDragging && !cursor.isMovingToTarget && 
            (now - cursor.lastActiveTime > 15000)) {
          return true;
        }
        
        // If cursor has exceeded its total lifespan
        if ((now - cursor.lastActiveTime) > cursor.lifespan) {
          return true;
        }
      } else {
        // On mobile, just use the standard lifespan check
        return (now - cursor.lastActiveTime) > cursor.lifespan;
      }
      
      return false; // Keep the cursor
    });
    
    // Remove any expired cursors
    if (expiredCursors.length > 0) {
      // Log which cursors are being removed
      expiredCursors.forEach(cursor => {
        console.log(`Removing expired cursor ${cursor.name} (lifetime: ${Math.round((now - cursor.lastActiveTime)/1000)}s)`);
        
        // Release any image the cursor might be holding
        if (cursor.targetImage !== null && imageLocks[cursor.targetImage] === cursor.id) {
          stopDragging(cursor.targetImage);
          delete imageLocks[cursor.targetImage];
        }
      });
      
      // Filter out the expired cursors
      fakeCursors = fakeCursors.filter(cursor => {
        if (cursor.id === "human-user") return true; // Always keep human cursor
        
        // On desktop, use more aggressive expiration criteria
        if (!isMobile) {
          // Keep cursor if it's not in the expired list
          return !expiredCursors.some(expiredCursor => expiredCursor.id === cursor.id);
        } else {
          // On mobile, just use the standard lifespan check
          return (now - cursor.lastActiveTime) <= cursor.lifespan;
        }
      });
      
      // Notify parent component of cursor change
      onFakeCursorsUpdate(fakeCursors);
    }
    
    // Ensure we enforce MAX_CURSORS by removing oldest cursors if we exceed the limit
    if (fakeCursors.length > MAX_CURSORS) {
      console.log(`Too many cursors (${fakeCursors.length}), removing oldest to maintain limit of ${MAX_CURSORS}`);
      
      // Sort cursors by creation time (lastActiveTime) to find oldest
      const cursorsToKeep = [...fakeCursors]
        .filter(c => c.id !== "human-user") // Exclude human cursor from sorting
        .sort((a, b) => b.lastActiveTime - a.lastActiveTime) // Sort newest to oldest
        .slice(0, MAX_CURSORS - 1); // Keep newest cursors up to MAX_CURSORS-1
      
      // Add human cursor back if it exists
      const humanCursor = fakeCursors.find(c => c.id === "human-user");
      if (humanCursor) {
        cursorsToKeep.push(humanCursor);
      }
      
      // Update fakeCursors with the cursors we're keeping
      fakeCursors = cursorsToKeep;
      
      // Notify parent component of cursor change
      onFakeCursorsUpdate(fakeCursors);
    }
    
    // Special handling for mobile: ensure at least one cursor is always dragging something
    if (isMobile) {
      const draggingCursors = fakeCursors.filter(c => c.isDragging && c.id !== "human-user");
      
      // If no cursors are dragging but we have available images, create a new mobile cursor
      if (draggingCursors.length === 0 && visibleImages.length > 0) {
        const now = Date.now();
        const timeSinceLastCursor = now - lastCursorCreationTime;
        
        // Create a new cursor if it's been at least 10 seconds
        if (timeSinceLastCursor > 10000) {
          console.log("No dragging cursors on mobile - creating a new one");
          createMobileCursor();
        }
      }
      
      // CRITICAL FIX FOR MOBILE: Ensure cursors are always visible on mobile
      // when they're dragging, by moving them to the foreground
      fakeCursors.forEach(cursor => {
        if (cursor.isDragging && cursor.targetImage !== null) {
          const imageElement = document.querySelector(`.mobile-collage .collage-image-button:nth-child(${cursor.targetImage + 1})`);
          if (imageElement instanceof HTMLElement) {
            // Ensure the dragged image has a high z-index
            const currentZIndex = parseInt(imageElement.style.zIndex || '0', 10);
            if (currentZIndex < 1000) {
              imageElement.style.zIndex = '1000';
              
              // Also update in our data model
              collageImages[cursor.targetImage] = {
                ...collageImages[cursor.targetImage],
                zIndex: 1000
              };
            }
          }
        }
      });
    }
    
    // For each cursor, update its position based on its state
    fakeCursors = fakeCursors.map(cursor => {
      // On mobile, hide cursors that aren't dragging images
      if (isMobile && !cursor.isDragging) {
        // Move cursor off-screen when not dragging on mobile
        return {
          ...cursor,
          x: -9999,
          y: -9999
        };
      }
      
      // Skip static cursors completely
      if (cursor.isStatic) {
        return cursor;
      }
      
      // If cursor is in a resting period, decrement it and skip movement
      if (cursor.restingPeriod > 0) {
        cursor.restingPeriod -= 16; // Assuming 16ms per frame (60fps)
        return cursor;
      }
      
      // Update the lastActiveTime for moving cursors to keep track of when they're active
      if (!cursor.isStatic && (cursor.isDragging || cursor.isMovingToTarget)) {
        cursor.lastActiveTime = now;
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
      // Use appropriate speeds based on device type
      const mobileDevice = window.innerWidth <= 768;
      const MOVEMENT_SPEED = mobileDevice ? 8.0 : 5.0; // Faster speed on mobile for better visibility
      
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
        
        // Move toward target at CONSISTENT speed
        const dirX = dx / distance;
        const dirY = dy / distance;
        cursor.x += dirX * MOVEMENT_SPEED;
        cursor.y += dirY * MOVEMENT_SPEED;
      }
      // CASE 2: Dragging an image
      else if (cursor.isDragging && cursor.targetImage !== null) {
        // Double-verify the cursor still owns this image lock
        if (imageLocks[cursor.targetImage] !== cursor.id) {
          console.log(`Cursor ${cursor.name} lost control of image ${cursor.targetImage} - stopping drag`);
          
          // Make cursor go back to static or moving to a new image rather than wandering
          if (Math.random() < 0.5) {
            // Go static
            cursor.isDragging = false;
            cursor.targetImage = null;
            cursor.isStatic = true;
            return cursor;
          } else {
            // Find a new target image
            cursor.isDragging = false;
            cursor.targetImage = null;
            cursor.isMovingToTarget = true;
            return setupPreexistingCursor(cursor);
          }
        }
        
        // Get the image element - try both mobile and desktop containers
        const imageSelector = `.collage-image-button:nth-child(${cursor.targetImage + 1})`;
        let imageElement = document.querySelector(isMobile ? `.mobile-collage ${imageSelector}` : `.desktop-collage ${imageSelector}`);
        
        // Fallback if not found in the expected container
        if (!imageElement) {
          imageElement = document.querySelector(imageSelector);
        }
        
        // IMPROVEMENT: Try an alternative selector if the first one fails
        let imageFound = !!imageElement;
        let alternativeImageElement = null;
        
        if (!imageElement) {
          // Try by z-index
          const targetZIndex = collageImages[cursor.targetImage]?.zIndex;
          if (targetZIndex) {
            alternativeImageElement = document.querySelector(isMobile ? 
              `.mobile-collage .collage-image-button[style*="z-index: ${targetZIndex}"]` : 
              `.desktop-collage .collage-image-button[style*="z-index: ${targetZIndex}"]`);
            if (alternativeImageElement) {
              imageFound = true;
            }
          }
          
          // If still not found, try by array index
          if (!alternativeImageElement) {
            const allImageButtons = document.querySelectorAll(isMobile ? 
              '.mobile-collage .collage-image-button' : 
              '.desktop-collage .collage-image-button');
            const imageArray = Array.from(allImageButtons);
            if (cursor.targetImage < imageArray.length) {
              alternativeImageElement = imageArray[cursor.targetImage];
              if (alternativeImageElement) {
                imageFound = true;
              }
            }
          }
        }
        
        // Use the original or alternative element
        const activeElement = imageElement || alternativeImageElement;
        
        // Image element not found, release the image
        if (!imageFound || !activeElement) {
          // Image element not found, release the image
          if (cursor.targetImage !== null) {
            delete imageLocks[cursor.targetImage];
            stopDragging(cursor.targetImage);
            cursor.targetImage = null;
          }
          cursor.isDragging = false;
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
              
              // Set a resting period (5-10 seconds) after dropping the image
              cursor.restingPeriod = 5000 + Math.random() * 5000; // Reduced from 8-12 seconds
              
              // Update activity timestamp
              cursor.lastActiveTime = Date.now();
              
              // IMPORTANT: On desktop, give the cursor a very short remaining lifespan
              // so it disappears shortly after dropping an image
              if (!isMobile) {
                cursor.lifespan = 8000 + Math.random() * 7000; // 8-15 seconds before disappearing
              }
              
              console.log(`Cursor ${cursor.name} dropped the image and will disappear in ${Math.round(cursor.lifespan/1000)} seconds`);
            }
            
            cursor.isMovingToTarget = false;
            
            // Choose a new static state with high probability, otherwise target a new image
            if (Math.random() < 0.7) {
              cursor.isStatic = true;
            } else {
              cursor.isMovingToTarget = true;
              return setupPreexistingCursor(cursor);
            }
            
            // Return immediately to apply the cursor state change
            return cursor;
          } else {
            // Just set a new destination to continue dragging
            const horizontalMargin = 50; // Smaller margin for mobile
            const verticalMargin = 50;
            cursor.destinationX = horizontalMargin + Math.random() * (window.innerWidth - horizontalMargin * 2);
            cursor.destinationY = verticalMargin + Math.random() * (window.innerHeight - verticalMargin * 2);
            
            // Update activity timestamp
            cursor.lastActiveTime = Date.now();
            
            // IMPORTANT: On desktop, moving a cursor should reset its lifespan clock
            if (!isMobile) {
              cursor.lastActiveTime = Date.now();
            }
            
            return cursor;
          }
        }
        
        // Get current image center position
        // NOTE: getBoundingClientRect() returns viewport-relative coordinates, so we need to
        // add window.scrollY for absolute positioning of cursors
        const imgRect = activeElement.getBoundingClientRect();
        
        // Calculate direction to destination
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        // FIXING CURSOR-IMAGE SYNC ISSUE:
        // 1. First move the cursor
        // 2. THEN update the image based on the cursor's new position
        
        // Move the cursor toward the destination - at consistent speed
        cursor.x += dirX * MOVEMENT_SPEED;
        cursor.y += dirY * MOVEMENT_SPEED;
        
        // CRITICAL FIX: Update the image position based on cursor movement
        // Get the current image data
        const imageData = collageImages[cursor.targetImage];
        if (!imageData) return cursor;
        
        // Set grab offset if not already set - this records where on the image the cursor grabbed
        if (!cursor.grabOffsetX || !cursor.grabOffsetY) {
          // Calculate the offset from the cursor to the top-left corner of the image
          // This makes sure we grab the image exactly where the cursor is positioned
          cursor.grabOffsetX = cursor.x - imageData.left;
          cursor.grabOffsetY = cursor.y - imageData.top;
          
          // Ensure grab offset is within image bounds
          cursor.grabOffsetX = Math.max(0, Math.min(imgRect.width, cursor.grabOffsetX));
          cursor.grabOffsetY = Math.max(0, Math.min(imgRect.height, cursor.grabOffsetY));
          
          console.log(`Cursor ${cursor.name} grabbed image at offset: ${cursor.grabOffsetX.toFixed(1)}, ${cursor.grabOffsetY.toFixed(1)}`);
        }
        
        // IMPROVED SYNC: Calculate new position based on cursor's exact current position
        const newLeft = cursor.x - cursor.grabOffsetX;
        const newTop = cursor.y - cursor.grabOffsetY;
        
        // Get container for constraints - ensure we get the correct container (mobile vs desktop)
        const containerSelector = isMobile ? '.mobile-collage' : '.desktop-collage';
        const container = document.querySelector(containerSelector);
        const containerRect = container ? container.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        
        // Apply constraints to keep within bounds
        const constrainedLeft = Math.max(
          0,
          Math.min(containerRect.width - imgRect.width, newLeft)
        );
        const constrainedTop = Math.max(
          0,
          Math.min(containerRect.height - imgRect.height, newTop)
        );
        
        // DETECTION OF BOUNDARY COLLISION: Check if we're hitting any boundaries
        const isTouchingLeftBoundary = constrainedLeft <= 0;
        const isTouchingRightBoundary = constrainedLeft >= (containerRect.width - imgRect.width);
        const isTouchingTopBoundary = constrainedTop <= 0;
        const isTouchingBottomBoundary = constrainedTop >= (containerRect.height - imgRect.height);
        const isAtBoundary = isTouchingLeftBoundary || isTouchingRightBoundary || isTouchingTopBoundary || isTouchingBottomBoundary;
        
        // If we're at a boundary for 10 consecutive frames, set a new destination
        if (!cursor.boundaryCount) cursor.boundaryCount = 0;
        
        if (isAtBoundary) {
          cursor.boundaryCount++;
          
          // If we've been at a boundary for too long, choose a new destination
          if (cursor.boundaryCount > 10) {
            console.log(`Cursor ${cursor.name} stuck at boundary with image ${cursor.targetImage} - setting new destination`);
            
            // Choose a sensible destination AWAY from the boundary
            const margin = 50;
            const safeWidth = Math.max(containerRect.width - 2*margin - imgRect.width, 100);
            const safeHeight = Math.max(containerRect.height - 2*margin - imgRect.height, 100);
            
            // Ensure destination is away from the current boundary
            let newX = margin + Math.random() * safeWidth;
            let newY = margin + Math.random() * safeHeight;
            
            // If hitting left boundary, ensure destination is to the right
            if (isTouchingLeftBoundary) {
              newX = containerRect.width / 3 + Math.random() * (containerRect.width / 2);
            }
            // If hitting right boundary, ensure destination is to the left
            if (isTouchingRightBoundary) {
              newX = margin + Math.random() * (containerRect.width / 2);
            }
            // If hitting top boundary, ensure destination is to the bottom
            if (isTouchingTopBoundary) {
              newY = containerRect.height / 3 + Math.random() * (containerRect.height / 2);
            }
            // If hitting bottom boundary, ensure destination is to the top
            if (isTouchingBottomBoundary) {
              newY = margin + Math.random() * (containerRect.height / 2);
            }
            
            cursor.destinationX = newX;
            cursor.destinationY = newY;
            cursor.boundaryCount = 0;
            
            console.log(`New destination set to ${newX.toFixed(1)}, ${newY.toFixed(1)}`);
          }
        } else {
          // Reset boundary count if we're not at a boundary
          cursor.boundaryCount = 0;
        }
        
        // IMPROVED SYNC: If the image position was constrained, update the cursor position too
        // This ensures the cursor and image remain perfectly in sync at boundaries
        if (constrainedLeft !== newLeft) {
          cursor.x = constrainedLeft + cursor.grabOffsetX;
        }
        if (constrainedTop !== newTop) {
          cursor.y = constrainedTop + cursor.grabOffsetY;
        }
        
        // Update the collageImages array directly
        collageImages[cursor.targetImage] = {
          ...collageImages[cursor.targetImage],
          left: constrainedLeft,
          top: constrainedTop
        };
        
        // Only log position changes if they're actually changing
        const hasMovedSignificantly = 
          Math.abs(imageData.left - constrainedLeft) > 0.1 || 
          Math.abs(imageData.top - constrainedTop) > 0.1;
          
        // Update the element's position directly
        if (activeElement instanceof HTMLElement) {
          if (hasMovedSignificantly) {
            console.log(`Moving image ${cursor.targetImage} to position: left=${constrainedLeft.toFixed(1)}, top=${constrainedTop.toFixed(1)} (Mobile: ${isMobile})`);
          }
          activeElement.style.left = `${constrainedLeft}px`;
          activeElement.style.top = `${constrainedTop}px`;
        }
        
        return cursor;
      }
      // CASE 3: Not moving to target or dragging - should never happen now, but handle gracefully
      // by making the cursor move toward an image or become static
      else {
        console.log(`Cursor ${cursor.name} is in invalid state - fixing`);
        
        // Reset to a valid state - either static or moving to target
        if (Math.random() < 0.5) {
          // Go static
          cursor.isDragging = false;
          cursor.targetImage = null;
          cursor.isMovingToTarget = false;
          cursor.isStatic = true;
          
          return cursor;
        } else {
          // Find a new target image
          cursor.isDragging = false;
          cursor.targetImage = null;
          cursor.isMovingToTarget = true;
          
          return setupPreexistingCursor(cursor);
        }
      }
      
      // Calculate velocity for debugging
      const velocity = Math.sqrt(Math.pow(cursor.x - prevX, 2) + Math.pow(cursor.y - prevY, 2));
      
      // Log significant velocity changes (but not state transition jumps)
      if (cursor.lastVelocity && 
          Math.abs(velocity - cursor.lastVelocity) > 0.1 &&
          !(cursor.isMovingToTarget && cursor.lastVelocity < 0.1)) { // Ignore initial grab
        console.log(`Cursor ${cursor.name} velocity: ${velocity.toFixed(2)} (state: ${cursor.isDragging ? 'dragging' : cursor.isMovingToTarget ? 'moving-to-image' : 'static'})`);
      }
      
      cursor.lastVelocity = velocity;
      return cursor;
    });
    
    // Check if we need to create a new cursor on mobile if none are dragging
    if (isMobile) {
      const nonHumanCursors = fakeCursors.filter(c => c.id !== "human-user");
      const draggingCursors = nonHumanCursors.filter(c => c.isDragging);
      
      if (nonHumanCursors.length === 0 || (draggingCursors.length === 0 && visibleImages.length > 0)) {
        // No cursors or no dragging cursors but images are available
        const now = Date.now();
        const timeSinceLastCursor = now - lastCursorCreationTime;
        
        // Only create a new cursor if it's been at least 10 seconds since the last one
        if (timeSinceLastCursor > 10000) {
          console.log("Mobile needs more active cursors - creating a new one");
          
          // Use our specialized mobile cursor function instead of the general one
          createMobileCursor();
        }
      }
    }
    
    // Update parent component with new cursor states
    onFakeCursorsUpdate(fakeCursors);
    
    // Check if we need to create a new cursor (for desktop)
    if (fakeCursors.length < MAX_CURSORS && !isMobile) {
      const now = Date.now();
      const timeSinceLastCursor = now - lastCursorCreationTime;
      const minTimeBetweenCursors = 60 * 1000; // 1 min on desktop
      const randomDelayFactor = 2 * 60 * 1000; // Up to additional 2 min on desktop
      
      // Create cursor with appropriate timing
      if (timeSinceLastCursor > minTimeBetweenCursors + (Math.random() * randomDelayFactor)) {
        // Create a new cursor using our new function
        attemptToCreateNewCursor();
      }
    }
  }
  
  // Add scroll event listener
  onMount(() => {
    if (!browser) return; // Skip if not in browser environment
    
    // Initialize viewport-dependent variables
    isMobile = window.innerWidth <= 768;
    
    // Use consistent margin for all boundaries
    rightMin = 0;
    rightMax = 100;
    bottomMin = 0;
    bottomMax = 100;
    
    // Run a force cleanup to ensure no stale state
    if (typeof diagnoseHighlightIssues === 'function') {
      diagnoseHighlightIssues();
    }
    
    // Define event handlers for both mouse and touch
    const handleResize = () => {
      // Update viewport variables on resize
      isMobile = window.innerWidth <= 768;
      
      // Use the same consistent margin regardless of viewport
      rightMin = 0;
      rightMax = 100;
      bottomMin = 0;
      bottomMax = 100;
      
      // Debounce the resize event
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        collageImages = generateRandomPositions();
      }, 250); // Wait 250ms after resize ends before updating
    };
    
    // Add a scroll handler to ensure cursors maintain position relative to document when page scrolls
    const handleScroll = () => {
      // When page scrolls, we need to update any active cursor to maintain its position
      // relative to the document, not the viewport
      fakeCursors = fakeCursors.map(cursor => ({
        ...cursor
      }));
      onFakeCursorsUpdate(fakeCursors);
    };
    
    // Handle touch dragging by converting to mouse events
    const handleTouchMove = (event: TouchEvent) => {
      if (draggedImageIndex === null) return;
      
      // Prevent default to stop scrolling
      event.preventDefault();
      
      // Get the first touch
      const touch = event.touches[0];
      
      // Create a mouse-like event
      const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: function() { event.preventDefault(); }
      };
      
      // Use the existing handleDrag function with our touch data
      // @ts-ignore - treating touch as mouse event
      handleDrag(mouseEvent);
    };

    // Add resize and touch event handlers
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    // IMPORTANT: Do NOT use the handleTouchMove function here - it causes dual processing
    // Let the touchstart handler on each image handle the touch events directly
    // window.addEventListener('touchmove', handleTouchMove, { passive: false });
    
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
        
        // Start introducing images one by one with staggered timing
        setTimeout(() => {
          imagesReady = true;
          
          // Add images one by one with staggered timing
          collageImages.forEach((img, index) => {
            setTimeout(() => {
              // Add index to visibleImages array to keep track of which images are displayed
              visibleImages = [...visibleImages, index];
            }, 150 + index * 180);
          });
          
          // Set the cursor creation time - note we don't initialize cursors yet
          // cursors will be initialized after the cursorInitializationDelay expires
          lastCursorCreationTime = Date.now();
          
          // EXPLICITLY POSITION SPECIAL IMAGES ON THE SCREEN
          // This is a direct fix for images with initial position issues
          setTimeout(() => {
            // Find special images in the collage
            const owlIndex = collageImages.findIndex(img => 
              img.alt === 'Owl' || (typeof img.alt === 'string' && img.alt.includes('owl'))
            );
            
            const snakeIndex = collageImages.findIndex(img => 
              img.alt === 'Snake' || (typeof img.alt === 'string' && img.alt.includes('snake'))
            );
            
            // Position the owl if found
            if (owlIndex !== -1) {
              // Get the owl element
              const owlElement = document.querySelector(`.collage-image-button:nth-child(${owlIndex + 1})`) as HTMLElement;
              if (owlElement) {
                // Force the owl to a lower position
                const owlData = collageImages[owlIndex];
                
                // Set different positions based on screen size
                if (window.innerWidth <= 768) {
                  // Mobile view - position owl in the container
                  const container = document.querySelector('.mobile-collage');
                  if (container) {
                    const containerRect = container.getBoundingClientRect();
                    // Position owl in the bottom part of the mobile container
                    const newTop = containerRect.height - owlData.height - 50;
                    const newLeft = containerRect.width / 2 - owlData.width / 2;
                    
                    // Update the owl's position
                    owlElement.style.top = `${newTop}px`;
                    owlElement.style.left = `${newLeft}px`;
                    
                    // Update data structure
                    collageImages = collageImages.map((img, i) => {
                      if (i === owlIndex) {
                        return {
                          ...img,
                          top: newTop,
                          left: newLeft
                        };
                      }
                      return img;
                    });
                    
                    console.log(`Explicitly positioned owl in mobile view at top: ${newTop}px, left: ${newLeft}px`);
                  }
                } else {
                  // Desktop view
                  const containerHeight = window.innerHeight;
                  // Position owl in the bottom quarter of the screen
                  const newTop = containerHeight - owlData.height - 150;
                  
                  // Update the owl's position directly in the DOM
                  owlElement.style.top = `${newTop}px`;
                  
                  // Update our data structure as well
    collageImages = collageImages.map((img, i) => {
                    if (i === owlIndex) {
        return {
          ...img,
                        top: newTop
        };
      }
      return img;
    });
                  
                  console.log(`Explicitly positioned owl in desktop view at top: ${newTop}px`);
                }
              }
            }
          }, 1000); // Increased delay to 1 second to ensure images have loaded
          
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
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      clearTimeout(resizeTimer);
      if (simulationInterval) clearInterval(simulationInterval);
      if (lockCleanupInterval) clearInterval(lockCleanupInterval);
      
      // Clean up any remaining active drags in the store
      draggingStore.update(state => ({ activeDrags: {} }));
    };
  });

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
    // Only show highlight when cursor is physically on the image
    const lockOwnerId = imageLocks[imageIndex];
    if (!lockOwnerId || lockOwnerId === "human-user") {
      return '';
    }
    
    const cursor = fakeCursors.find(c => c.id === lockOwnerId);
    if (!cursor) {
      return '';
    }
    
    // Always show highlight if cursor is dragging this image
    if (cursor.isDragging && cursor.targetImage === imageIndex) {
      return `
        box-shadow: 0 0 0 4px ${cursor.color}, 0 0 0 6px rgba(255,255,255,0.8);
        border-radius: var(--border-radius-md);
        outline: 2px dashed ${cursor.color};
        outline-offset: 2px;
      `;
    }
    
    // Get image element
    const imageElement = document.querySelector(`.collage-image-button:nth-child(${imageIndex + 1})`);
    if (!imageElement) {
      return '';
    }
    
    // Get cursor and image positions
    const imgRect = imageElement.getBoundingClientRect();
    const cursorX = cursor.x;
    // For document-relative position, we need to remove scrollY to compare with getBoundingClientRect
    const cursorY = cursor.y - window.scrollY;
    
    // Check if cursor is INSIDE the image bounds
    if (cursorX >= imgRect.left && 
        cursorX <= imgRect.right && 
        cursorY >= imgRect.top && 
        cursorY <= imgRect.bottom) {
    return `
      box-shadow: 0 0 0 4px ${cursor.color}, 0 0 0 6px rgba(255,255,255,0.8);
      border-radius: var(--border-radius-md);
      outline: 2px dashed ${cursor.color};
      outline-offset: 2px;
    `;
    }
    
    return '';
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

  // Add the startDrag function that's referenced but not defined
  function startDrag(event: MouseEvent, index: number) {
    // Prevent default behavior and propagation
    event.preventDefault();
    event.stopPropagation();
    
    // Get the image data
    const imageData = collageImages[index];
    
    // REMOVE special image drag prevention - allow all images to be dragged
    
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
    
    // For mobile view, adjust for container's position
    let offsetX = 0;
    let offsetY = 0;
    
    if (window.innerWidth <= 768) {
      // Only apply offset adjustment on mobile
      const container = document.querySelector('.mobile-collage');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        offsetX = containerRect.left;
        offsetY = containerRect.top;
      }
    }
    
    // Check if it's the owl or snake 
    const isOwl = imageData && (imageData.alt === 'Owl' || (typeof imageData.alt === 'string' && imageData.alt.includes('owl')));
    const isSnake = imageData && (imageData.alt === 'Snake' || (typeof imageData.alt === 'string' && imageData.alt.includes('snake')));
    
    // Calculate grab offset from click position within the image
    // Adjust for container offset on mobile
    grabOffsetX = event.clientX - rect.left;
    grabOffsetY = event.clientY - rect.top;
    
    // Record which image is being dragged
    draggedImageIndex = index;
    
    // Lock this image for human user
    imageLocks[index] = "human-user";
    
    // Add dragging class to body to ensure cursor stays as grabbing
    document.body.classList.add('dragging');
    
    // Log debugging info for owl
    if (isOwl || isSnake) {
      console.log(`Starting to drag Owl at mouse position: ${event.clientX}, ${event.clientY}`);
      console.log(`Owl rect: left=${rect.left}, top=${rect.top}, width=${rect.width}, height=${rect.height}`);
      console.log(`Grab offset: x=${grabOffsetX}, y=${grabOffsetY}`);
    }
    
    // Add event listeners for move and end
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', endDrag);
  }

  // For desktop collage, spread images across the available area
  const baseImages = imageDimensions || [];
  
  // Add browser detection at the top of the script
  const browser = typeof window !== 'undefined';
  
  // Create the main collage images with random positions
  let initialCollageImages = baseImages.map((img, index) => {
    // Set width/height based on original dimensions but scale down
    const aspectRatio = img.width / img.height;
    const width = aspectRatio >= 1 ? getRandomSize(15, 35) : getRandomSize(15, 25);
    const height = aspectRatio >= 1 ? width / aspectRatio : width * aspectRatio;
    
    // Generate position using absolute pixel positions within bounds
    const containerWidth = browser ? window.innerWidth : 1200; // Fallback for SSR
    const containerHeight = browser ? window.innerHeight : 800; // Fallback for SSR
    
    // Calculate the area for z-index sorting later
    const area = width * height;
    
    // Define the available area for positioning - use more of the screen
    const leftMin = containerWidth * 0.4; // Use more horizontal space (was 0.55)
    const leftMax = containerWidth * 0.98 - width; // Nearly full width
    const topMin = containerHeight * 0.2; // Start higher (was 0.35)
    const topMax = containerHeight * 0.98 - height; // Nearly full height
    
    // Use grid-based positioning for better spread
    // Divide the available space into a grid and position each image in a cell
    const gridSize = Math.ceil(Math.sqrt(baseImages.length * 1.5)); // More cells than images
    
    // Determine which grid cell to use (with some randomness)
    const cellX = Math.floor(Math.random() * gridSize);
    const cellY = Math.floor(Math.random() * gridSize);
    
    // Calculate cell dimensions
    const cellWidth = (leftMax - leftMin) / gridSize;
    const cellHeight = (topMax - topMin) / gridSize;
    
    // Calculate base position within the cell (with randomness)
    const cellLeft = leftMin + (cellX * cellWidth);
    const cellTop = topMin + (cellY * cellHeight);
    
    // Add randomness within the cell (80% of cell size)
    const left = cellLeft + (Math.random() * cellWidth * 0.8);
    const top = cellTop + (Math.random() * cellHeight * 0.8);
    
    // No rotation
    const rotation = 0;
    
    return {
      src: img.src,
      alt: img.alt,
      width,
      height,
      left,
      top,
      zIndex: 1, // Temporary - will be reassigned after sorting
      rotation,
      scale: 1,
      area // Store area for sorting
    };
  });
  
  // Sort collage images by area (largest first) for proper z-index layering
  initialCollageImages = initialCollageImages.sort((a, b) => b.area - a.area);
  
  // Now reassign z-indexes based on sorted order (largest = back, smallest = front)
  initialCollageImages = initialCollageImages.map((img, index) => ({
    ...img,
    zIndex: index + 1 // Largest has zIndex 1 (back), smallest has highest zIndex (front)
  }));
  
  // Initialize collage images with our generated positions
  collageImages = initialCollageImages;

  // Helper functions for image generation
  function getRandomSize(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
  
  function getRandomRotation(min: number = -4, max: number = 4): number {
    // Always return 0 for no rotation
    return 0;
  }

  // Add preloadImages function near the other helper functions
  // Function to preload images to avoid flickering
  async function preloadImages() {
    const promises = collageImages.map(img => {
      return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(true);
        image.onerror = () => {
          console.error(`Failed to load image: ${img.src}`);
          resolve(false);
        };
        image.src = img.src;
      });
    });
    return Promise.all(promises);
  }

  interface CursorState {
    id: string;
    x: number;
    y: number;
    color: string;
    imageLockedIndex: number | null;
    grabOffsetX: number;
    grabOffsetY: number;
    isDragging: boolean;
    isMovingToTarget: boolean;
    targetImage: number | null;
    [key: string]: any; // Allow additional properties
  }

  function updateFakeCursorLockedImage(cursor: CursorState, deltaTime: number) {
    const lockedIndex = cursor.imageLockedIndex;
    if (lockedIndex === null || lockedIndex >= collageImages.length) return;

    // Get the image data
    const imageData = collageImages[lockedIndex];
    if (!imageData) return;

    // Get image dimensions
    const imageWidth = imageData.width;
    const imageHeight = imageData.height;

    // Get current position of cursor and image
    const { x, y } = cursor;
    let { left, top } = imageData;

    // Calculate new position based on cursor movement
    const newLeft = x - cursor.grabOffsetX;
    const newTop = y - cursor.grabOffsetY;

    // Get the container element
    const container = document.querySelector('.mobile-collage') || document.querySelector('.desktop-collage');
    const containerRect = container ? container.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    
    // Get container dimensions for constraints
    const containerWidth = container ? containerRect.width : window.innerWidth;
    const containerHeight = container ? containerRect.height : window.innerHeight;
    const containerLeft = containerRect.left;
    const containerTop = containerRect.top;

    // Apply the same MIN_MARGIN as used in handleDrag and handleTouchMove
    const MIN_MARGIN = 0;
    
    // Check if this is the owl image
    const isOwl = imageData.alt === 'Owl' || (typeof imageData.alt === 'string' && imageData.alt.includes('owl'));
    const isSnake = imageData.alt === 'Snake' || (typeof imageData.alt === 'string' && imageData.alt.includes('snake'));
    const minTop = (isOwl || isSnake) ? -imageHeight * 0.1 : MIN_MARGIN; // Only allow 10% to go off-screen for snake & owl images

    // Clamp the position to keep image fully within viewport
    // Account for image dimensions to prevent overflow on right and bottom edges
    const clampedLeft = Math.max(
      MIN_MARGIN,
      Math.min(containerWidth - imageWidth - MIN_MARGIN, newLeft)
    );
    const clampedTop = Math.max(
      minTop, 
      Math.min(containerHeight - imageHeight - MIN_MARGIN, newTop)
    );

    // Update the image element's position
    const imageElement = document.querySelector(`.collage-image-button:nth-child(${lockedIndex + 1})`) as HTMLElement;
    if (imageElement) {
      imageElement.style.left = `${clampedLeft}px`;
      imageElement.style.top = `${clampedTop}px`;
      imageElement.style.transform = `rotate(${imageData.rotation}deg) scale(1)`;
    }

    // Update the image data
    collageImages[lockedIndex] = {
      ...imageData,
      left: clampedLeft,
      top: clampedTop
    };
  }

  // Function to create images for mobile
  function createImagesForMobile(images: CollageImage[], containerWidth: number, containerHeight: number) {
    const copyImages = [...images];
    // Sort images by area (largest to smallest)
    copyImages.sort((a, b) => {
      const areaA = a.width * a.height;
      const areaB = b.width * b.height;
      return areaB - areaA;
    });

    // Assign z-indexes, with largest images having lowest z-index
    let nextZIndex = 1;
    copyImages.forEach(image => {
      image.zIndex = nextZIndex++;
    });

    const viewportMargin = 40;
    const rightMin = viewportMargin;
    const rightMax = containerWidth - viewportMargin;
    // Increase vertical spread by expanding top and bottom limits
    const bottomMin = viewportMargin;
    const bottomMax = containerHeight - viewportMargin;

    copyImages.forEach((image, index) => {
      // Scale image for mobile
      const MAX_WIDTH = containerWidth * 0.65;
      const MAX_HEIGHT = containerHeight * 0.5;
      const aspectRatio = image.width / image.height;

      let newWidth, newHeight;
      if (image.width > MAX_WIDTH || image.height > MAX_HEIGHT) {
        if (aspectRatio > 1) {
          // Landscape
          newWidth = MAX_WIDTH;
          newHeight = newWidth / aspectRatio;
        } else {
          // Portrait
          newHeight = MAX_HEIGHT;
          newWidth = newHeight * aspectRatio;
        }
      } else {
        newWidth = image.width;
        newHeight = image.height;
      }

      image.width = newWidth;
      image.height = newHeight;

      // Constrain image position to be within visible area
      // Use more of the vertical space for distribution
      image.left = Math.floor(
        rightMin + (rightMax - rightMin - image.width) * Math.random()
      );
      // Enhanced vertical distribution with more bias toward edges
      // Increase variance between images vertically
      const verticalPosition = Math.random();
      let topPosition;
      
      if (verticalPosition < 0.4) {
        // Top 40% - position closer to top
        topPosition = bottomMin + (bottomMax * 0.4 - bottomMin) * Math.random();
      } else if (verticalPosition > 0.6) {
        // Bottom 40% - position closer to bottom
        topPosition = bottomMax * 0.6 + (bottomMax * 0.4) * Math.random();
      } else {
        // Middle 20% - more centered
        topPosition = bottomMax * 0.4 + (bottomMax * 0.2) * Math.random();
      }
      
      image.top = Math.floor(topPosition);

      // Add slight rotation
      image.rotation = Math.floor(Math.random() * 10 - 5);
      
      // Add slight scale variation for interest
      image.scale = 0.9 + Math.random() * 0.2;
    });

    return copyImages;
  }

  function getInitialCollageImagePositions() {
    if (!document) return;
    
    // Create a set of static positions for large screens
    const container = document.querySelector('.collage-image-container');
    if (!container) return [];

    const containerWidth = container.getBoundingClientRect().width;
    const containerHeight = container.getBoundingClientRect().height;

    // Get the viewport width and height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Create a copy of images so we don't modify originals from props
    const copyImages = [...imageDimensions];

    const viewportMargin = 40;
    const rightMin = viewportMargin;
    const rightMax = containerWidth - viewportMargin;
    // Increase vertical spread by expanding top and bottom limits
    const bottomMin = viewportMargin;
    const bottomMax = containerHeight - viewportMargin;

    copyImages.forEach((image, index) => {
      // Scale image for desktop
      const MAX_WIDTH = containerWidth * 0.5;
      const MAX_HEIGHT = containerHeight * 0.5;
      const aspectRatio = image.width / image.height;

      let newWidth, newHeight;
      if (image.width > MAX_WIDTH || image.height > MAX_HEIGHT) {
        if (aspectRatio > 1) {
          // Landscape
          newWidth = MAX_WIDTH;
          newHeight = newWidth / aspectRatio;
        } else {
          // Portrait
          newHeight = MAX_HEIGHT;
          newWidth = newHeight * aspectRatio;
        }
      } else {
        newWidth = image.width;
        newHeight = image.height;
      }

      image.width = newWidth;
      image.height = newHeight;

      // Constrain image position to be within visible area
      // Use a better distribution technique for more interesting layout
      image.left = Math.floor(
        rightMin + (rightMax - rightMin - image.width) * Math.random()
      );
      
      // Enhanced vertical distribution with more spread
      // Divide the screen into 5 vertical zones and distribute more evenly
      const zone = Math.floor(Math.random() * 5); // 0-4
      const zoneHeight = (bottomMax - bottomMin) / 5;
      const zoneStart = bottomMin + (zone * zoneHeight);
      
      // Add variance within the zone (0.7-1.0 of zone height)
      const zoneOffset = zoneHeight * (0.7 + Math.random() * 0.3);
      
      image.top = Math.floor(zoneStart + zoneOffset);

      // No rotation
      image.rotation = 0;
      
      // Add slight scale variation
      image.scale = 0.8 + Math.random() * 0.4;
    });

    return copyImages;
  }

  // Add this to the script section at the top, outside any functions
  // Hard-coded identification constants for special images
  const KNIGHT_IDENTIFIERS = ['knight', 'armor', 'warrior', 'helmet'];
  const WOMAN_IDENTIFIERS = ['woman', 'lady', 'female', 'girl'];
  
  // Helper function to identify special images more robustly
  function identifySpecialImage(img: CollageImage): 'knight' | 'woman' | null {
    // Check alt text
    if (img.alt) {
      const altLower = img.alt.toLowerCase();
      if (KNIGHT_IDENTIFIERS.some(id => altLower.includes(id))) return 'knight';
      if (WOMAN_IDENTIFIERS.some(id => altLower.includes(id))) return 'woman';
    }
    
    // Check src path
    if (img.src) {
      const srcLower = img.src.toLowerCase();
      if (KNIGHT_IDENTIFIERS.some(id => srcLower.includes(id))) return 'knight';
      if (WOMAN_IDENTIFIERS.some(id => srcLower.includes(id))) return 'woman';
    }
    
    return null;
  }

  function createResizedImagesOnFirstLoad(images: CollageImage[]): CollageImage[] {
    if (!document) return [];
    
    // Create a set of static positions for large screens
    const container = document.querySelector('.collage-image-container');
    if (!container) return [];

    const containerWidth = container.getBoundingClientRect().width;
    const containerHeight = container.getBoundingClientRect().height;

    // Create a copy of images so we don't modify originals
    const copyImages = [...images];
    
    // Precompute areas for sorting
    copyImages.forEach(image => {
      image.area = image.width * image.height;
    });
    
    // Find the knight and woman images for special treatment
    const womanIndex = copyImages.findIndex(img => 
      (img.alt?.toLowerCase().includes('woman') || 
       img.alt?.toLowerCase().includes('lady') ||
       img.src?.toLowerCase().includes('woman') ||
       img.src?.toLowerCase().includes('lady'))
    );
    
    const knightIndex = copyImages.findIndex(img => 
      (img.alt?.toLowerCase().includes('knight') || 
       img.alt?.toLowerCase().includes('armor') ||
       img.src?.toLowerCase().includes('knight') ||
       img.src?.toLowerCase().includes('armor'))
    );
    
    // FORCE position and z-index for woman
    if (womanIndex >= 0) {
      const womanImage = copyImages[womanIndex];
      
      // Ensure the woman image is a reasonable size
      const maxWomanWidth = containerWidth * 0.25;
      const aspectRatio = womanImage.width / womanImage.height;
      
      // Resize if needed
      if (womanImage.width > maxWomanWidth) {
        womanImage.width = maxWomanWidth;
        womanImage.height = maxWomanWidth / aspectRatio;
      }
      
      // Place in top-left, far from knight
      womanImage.left = containerWidth * 0.03;
      womanImage.top = containerHeight * 0.03;
      womanImage.zIndex = 2000; // Super high z-index
      womanImage.rotation = 0;
      
      // Mark as processed
      womanImage.processed = true;
    }
    
    // FORCE position and z-index for knight
    if (knightIndex >= 0) {
      const knightImage = copyImages[knightIndex];
      
      // Ensure the knight image is a reasonable size
      const maxKnightWidth = containerWidth * 0.25;
      const aspectRatio = knightImage.width / knightImage.height;
      
      // Resize if needed
      if (knightImage.width > maxKnightWidth) {
        knightImage.width = maxKnightWidth;
        knightImage.height = maxKnightWidth / aspectRatio;
      }
      
      // Place in bottom-right, far from woman
      knightImage.left = containerWidth - knightImage.width - containerWidth * 0.03;
      knightImage.top = containerHeight - knightImage.height - containerHeight * 0.03;
      knightImage.zIndex = 1999; // Very high but below woman
      knightImage.rotation = 0;
      
      // Mark as processed
      knightImage.processed = true;
    }
    
    // Sort images by area (largest to smallest)
    copyImages.sort((a, b) => {
      return b.area! - a.area!;
    });
    
    // Define usable area with margins
    const margin = 40;
    
    // Define areas to place images in (left, center, right)
    const areaWidth = (containerWidth - margin * 2) / 3;
    const areas = [
      { x: margin, y: margin, width: areaWidth, height: containerHeight - margin * 2 },
      { x: margin + areaWidth, y: margin, width: areaWidth, height: containerHeight - margin * 2 },
      { x: margin + areaWidth * 2, y: margin, width: areaWidth, height: containerHeight - margin * 2 }
    ];
    
    // Define maximum dimensions
    const MAX_WIDTH = containerWidth * 0.4;
    const MAX_HEIGHT = containerHeight * 0.4;
    
    // Break images down by size group
    const totalImages = copyImages.length;
    const largeImageCount = Math.ceil(totalImages * 0.3); // Top 30% are large
    const mediumImageCount = Math.ceil(totalImages * 0.3); // Next 30% are medium
    
    // Keep track of placed images for overlap tracking
    interface PlacedImage {
      id: string | number;
      left: number;
      top: number;
      right: number;
      bottom: number;
      zIndex: number;
      size: 'large' | 'medium' | 'small';
      hasOverlap: boolean;
      isOverlapping?: boolean;
      isSpecialImage?: boolean;
      specialImageType?: string;
      maxOverlaps?: number; // Maximum number of images that can overlap with this one
    }
    
    const placedImages: PlacedImage[] = [];
    // Track how many overlaps each base image has
    const placementTracker: Record<string | number, number> = {};
    
    // Process all images, processed or not
    const finalImages = copyImages.map((image, index) => {
      // If it's already processed (woman or knight), just return it without changes
      if (image.processed) {
        return image;
      }
      
      // For non-special images, perform regular positioning logic
      // All your existing logic for non-special images stays here
      
      // Determine image size category
      let sizeCategory: 'large' | 'medium' | 'small';
      if (index < largeImageCount) {
        sizeCategory = 'large';
      } else if (index < largeImageCount + mediumImageCount) {
        sizeCategory = 'medium';
      } else {
        sizeCategory = 'small';
      }
      
      // Choose which area to place this image in (distribute evenly)
      const area = areas[index % areas.length];
      
      // Scale image appropriately
      const aspectRatio = image.width / image.height;
      
      let newWidth, newHeight;
      if (aspectRatio > 1) {
        // Landscape
        newWidth = Math.min(MAX_WIDTH, image.width);
        newHeight = newWidth / aspectRatio;
      } else {
        // Portrait
        newHeight = Math.min(MAX_HEIGHT, image.height);
        newWidth = newHeight * aspectRatio;
      }
      
      // Just continue with your existing positioning logic for regular images
      // Include image width/height setting, positioning, and z-index
      
      // Return the processed image
      return image;
    });
    
    // Return the processed array
    return finalImages;
  }

  // Add a reactive statement in the script to enforce z-index whenever collageImages changes
  $: {
    // Ensure special images always have top z-index after any changes
    if (collageImages) {
      collageImages.forEach(img => {
        if (img.isSpecialImage) {
          if (img.specialImageType === 'woman') {
            img.zIndex = 1000;
          } else if (img.specialImageType === 'knight') {
            img.zIndex = 999;
          }
        }
      });
    }
  }

  // Helper function to process image selection for cursor dragging
  function proceedWithImageSelection(
    imageElement: Element, 
    cursor: { 
      targetImage: number | null; 
      id: string; 
      name: string; 
      isMovingToTarget: boolean; 
      isDragging: boolean; 
      targetX: number; 
      targetY: number;
      x: number;
      y: number;
      grabOffsetX?: number;
      grabOffsetY?: number;
      destinationX?: number;
      destinationY?: number;
      boundaryCount?: number;
    }, 
    randomImageIndex: number
  ) {
    // First, ensure we release any existing image this cursor might be targeting
    if (cursor.targetImage !== null && cursor.targetImage !== randomImageIndex) {
      if (imageLocks[cursor.targetImage] === cursor.id) {
        delete imageLocks[cursor.targetImage];
        stopDragging(cursor.targetImage);
        console.log(`Cursor ${cursor.name} releasing previous target ${cursor.targetImage} before grabbing ${randomImageIndex}`);
      }
    }
    
    // Check if the image is already locked by someone else
    if (imageLocks[randomImageIndex] && imageLocks[randomImageIndex] !== cursor.id) {
      console.log(`Image ${randomImageIndex} is already locked by ${imageLocks[randomImageIndex]}, cursor ${cursor.name} can't grab it`);
      return cursor; // Return without modifying the cursor further
    }
    
    // Get the image data
    const imageData = collageImages[randomImageIndex];
    if (!imageData) {
      console.log(`Image data not found for index ${randomImageIndex}`);
      return cursor;  // Safety check
    }
    
    // Get the element rect for precise grab offset calculation
    const rect = imageElement.getBoundingClientRect();
    
    // Position the cursor near the center of the image
    cursor.x = rect.left + rect.width / 2;
    cursor.y = rect.top + rect.height / 2 + window.scrollY;
    
    // Calculate grab offset
    cursor.grabOffsetX = rect.width / 2; // Grab in the middle of the image
    cursor.grabOffsetY = rect.height / 2;
    
    // Initialize boundary counter
    cursor.boundaryCount = 0;
    
    console.log(`Cursor ${cursor.name} grabbing image ${randomImageIndex} at center`);
    
    // Skip the isMovingToTarget phase - go DIRECTLY to dragging
    cursor.isMovingToTarget = false;
    cursor.isDragging = true;
    cursor.targetImage = randomImageIndex;
    
    // Lock this image immediately
    imageLocks[randomImageIndex] = cursor.id;
    
    // Register in drag store
    startDragging(randomImageIndex);
    
    // Set a destination to move to
    const isMobile = window.innerWidth <= 768;
    const containerSelector = isMobile ? '.mobile-collage' : '.desktop-collage';
    const container = document.querySelector(containerSelector);
    const containerRect = container ? container.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
    
    // IMPROVED: Use container dimensions with sensible margins for setting destination
    const SAFE_MARGIN = isMobile ? 30 : 80;
    
    // Calculate safe area for destination to avoid boundary issues
    const minX = SAFE_MARGIN;
    const maxX = Math.max(containerRect.width - SAFE_MARGIN - rect.width, minX + 100);
    const minY = SAFE_MARGIN;
    const maxY = Math.max(containerRect.height - SAFE_MARGIN - rect.height, minY + 100);
    
    // Set destination within safe boundaries
    cursor.destinationX = minX + Math.random() * (maxX - minX);
    cursor.destinationY = minY + Math.random() * (maxY - minY);
    
    console.log(`Cursor ${cursor.name} moving image ${randomImageIndex} to destination: ${cursor.destinationX.toFixed(1)}, ${cursor.destinationY.toFixed(1)}`);
    
    return cursor;
  }

  // ... existing code ...
  
  // Function to ensure bots on mobile start by dragging
  function decideCursorBehaviorStrategy() {
    const isMobile = window.innerWidth <= 768;
    
    console.log(`Deciding cursor behavior - isMobile: ${isMobile}`);
    
    // Make desktop cursors more active by reducing static probability
    return {
      shouldTargetImage: true,      // Always target an image, on both mobile and desktop
      shouldStartStatic: isMobile ? false : Math.random() < 0.4,  // Reduced from 70% to 40% chance on desktop
      shouldStartDragging: isMobile ? true : Math.random() < 0.7, // Increased from 50% to 70% on desktop
      movementSpeed: isMobile ? 8.0 : 5.0                        // Faster on mobile
    };
  }
  
  // Function to attempt to create a new cursor with appropriate behavior
  function attemptToCreateNewCursor() {
    // Skip creating cursors if none are becoming active
    if (fakeCursors.length >= MAX_CURSORS) {
      return false;
    }
    
    // Create a new cursor
    const cursorBehavior = decideCursorBehaviorStrategy();
    const isMobile = window.innerWidth <= 768;
    
    console.log(`Attempting to create new cursor - mobile: ${isMobile}`);
    
    // Create cursor with appropriate behavior - static or targeting
    const newCursor = createFakeCursor(cursorBehavior.shouldStartStatic);
    
    // If static, just add it
    if (cursorBehavior.shouldStartStatic && !isMobile) {
      console.log(`Created static cursor`);
      fakeCursors = [...fakeCursors, newCursor];
      lastCursorCreationTime = Date.now();
      onFakeCursorsUpdate(fakeCursors);
      
      // Even static cursors should eventually become active
      // Set a timer to make static cursors active after a delay
      setTimeout(() => {
        // Find this cursor in the array if it still exists
        const cursorIndex = fakeCursors.findIndex(c => c.id === newCursor.id);
        if (cursorIndex !== -1 && fakeCursors[cursorIndex].isStatic) {
          console.log(`Static cursor ${newCursor.name} becoming active`);
          // Change state to moving to target
          fakeCursors[cursorIndex].isStatic = false;
          fakeCursors[cursorIndex].isMovingToTarget = true;
          fakeCursors[cursorIndex].lastActiveTime = Date.now(); // Reset lifespan timer
          
          // Setup to target an image
          fakeCursors[cursorIndex] = setupPreexistingCursor(fakeCursors[cursorIndex]);
          
          // Update parent
          onFakeCursorsUpdate(fakeCursors);
        }
      }, 15000 + Math.random() * 15000); // Activate after 15-30 seconds
      
      return true;
    }
    
    // On mobile, never create static cursors
    if (isMobile && cursorBehavior.shouldStartStatic) {
      // Override to make it non-static on mobile
      newCursor.isStatic = false;
    }
    
    // Not static, so make it target an image (for both mobile and desktop)
    newCursor.isMovingToTarget = true;
    
    // Get available images
    const visibleImageIndexes = [...visibleImages];
    const availableIndexes = visibleImageIndexes.filter(index => !imageLocks[index]);
    
    console.log(`${availableIndexes.length} available images for cursor to target`);
    
    // If no images available, don't create the cursor
    if (availableIndexes.length === 0) {
      console.log("No images available for cursor to target - skipping cursor creation");
      return false;
    }
    
    // Select a container based on mobile status
    const containerSelector = isMobile ? '.mobile-collage' : '.desktop-collage';
    
    // Choose a random available image
    const randomIndex = Math.floor(Math.random() * availableIndexes.length);
    const targetIndex = availableIndexes[randomIndex];
    
    // Get the image element
    const imageElement = document.querySelector(`${containerSelector} .collage-image-button:nth-child(${targetIndex + 1})`);
    
    if (!imageElement) {
      console.log(`Failed to find image element ${targetIndex} in ${containerSelector}`);
      return false;
    }
    
    // If on mobile, go straight to dragging (skip the moving to target phase)
    if (isMobile) {
      // Set up for immediate dragging
      proceedWithImageSelection(imageElement, newCursor, targetIndex);
      
      // Add the cursor
      fakeCursors = [...fakeCursors, newCursor];
      lastCursorCreationTime = Date.now();
      
      console.log(`Created mobile cursor ${newCursor.name} dragging image ${targetIndex}`);
      
      // Notify parent
      onFakeCursorsUpdate(fakeCursors);
      return true;
    }
    
    // For desktop, use normal setup
    const configuredCursor = setupPreexistingCursor(newCursor);
    
    // Add the cursor only if it successfully targeted an image
    if (configuredCursor.targetImage !== null) {
      fakeCursors = [...fakeCursors, configuredCursor];
      console.log(`Created cursor targeting image ${configuredCursor.targetImage}`);
    } else {
      console.log("Failed to set up cursor with target image - skipping");
      return false;
    }
    
    // Update last creation time
    lastCursorCreationTime = Date.now();
    
    // Notify parent component of cursor change
    onFakeCursorsUpdate(fakeCursors);
    
    return true;
  }
  
  // Initialize the cursor system at the start
  onMount(() => {
    if (!browser) return; // Skip if not in browser environment
    
    // Check if we're on mobile
    const isMobile = window.innerWidth <= 768;
    
    // On mobile, initialize the cursor system immediately
    if (isMobile) {
      console.log("Mobile detected - initializing cursor system immediately");
      hasCursorInitialized = true;
      cursorInitializationDelay = 0;
      
      // CRITICAL FIX FOR MOBILE: Wait for images to be fully loaded and visible
      // before attempting to create cursors and move images
      setTimeout(() => {
        // Verify images are visible first
        const mobileImages = document.querySelectorAll('.mobile-collage .collage-image-button');
        console.log(`Mobile collage has ${mobileImages.length} images visible`);
        
        if (mobileImages.length > 0) {
          createMobileCursor();
        } else {
          // Wait a bit longer and try again
          setTimeout(() => {
            const retryImages = document.querySelectorAll('.mobile-collage .collage-image-button');
            console.log(`Retry: Mobile collage has ${retryImages.length} images visible`);
            if (retryImages.length > 0) {
              createMobileCursor();
            } else {
              console.log("WARNING: Could not find mobile images after retry");
            }
          }, 3000);
        }
      }, 4000); // Wait a bit longer for images to load
    } else {
      // On desktop, use the regular initialization process
      console.log("Desktop detected - using standard cursor initialization");
    }
  });
  
  // Add a dedicated function for creating mobile cursors
  function createMobileCursor() {
    console.log("Creating specialized mobile cursor");
    
    // FIXED: Limit to one cursor on mobile
    if (fakeCursors.filter(c => c.id !== "human-user").length > 0) {
      console.log("Already have mobile cursors - not creating more");
      return false;
    }
    
    // Create a non-static cursor for mobile
    const newCursor = createFakeCursor(false); // Not static
    newCursor.isStatic = false;
    
    // Get visible images
    const visibleImageIndexes = [...visibleImages];
    
    // Get images that aren't locked
    const availableIndexes = visibleImageIndexes.filter(index => !imageLocks[index]);
    
    if (availableIndexes.length === 0) {
      console.log("No available images for mobile cursor - aborting");
      return false;
    }
    
    // Choose a random available image
    const targetIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    
    // Find the image element in the mobile container
    const imageElement = document.querySelector(`.mobile-collage .collage-image-button:nth-child(${targetIndex + 1})`);
    if (!imageElement) {
      console.log(`Cannot find mobile image element ${targetIndex} - aborting`);
      return false;
    }
    
    // Get image position
    const rect = imageElement.getBoundingClientRect();
    
    // Position cursor at image
    newCursor.x = rect.left + rect.width / 2;
    newCursor.y = rect.top + rect.height / 2 + window.scrollY;
    
    // Set up cursor for dragging
    newCursor.isDragging = true;
    newCursor.isMovingToTarget = false;
    newCursor.targetImage = targetIndex;
    newCursor.grabOffsetX = rect.width / 2;
    newCursor.grabOffsetY = rect.height / 2;
    
    // Lock this image
    imageLocks[targetIndex] = newCursor.id;
    
    // Register in drag store
    startDragging(targetIndex);
    
    // Set destination
    const container = document.querySelector('.mobile-collage');
    const containerRect = container ? container.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
    
    const margin = 30;
    const safeWidth = containerRect.width - margin * 2 - rect.width;
    const safeHeight = containerRect.height - margin * 2 - rect.height;
    
    // FIXED: Get current position and ensure destination is far enough
    const currentLeft = collageImages[targetIndex].left;
    const currentTop = collageImages[targetIndex].top;
    
    // Generate destination at least 100px away from current position
    let destX, destY;
    let distance = 0;
    do {
      destX = margin + Math.random() * Math.max(safeWidth, 50);
      destY = margin + Math.random() * Math.max(safeHeight, 50);
      const dx = destX - currentLeft;
      const dy = destY - currentTop;
      distance = Math.sqrt(dx*dx + dy*dy);
    } while (distance < 100);
    
    newCursor.destinationX = destX;
    newCursor.destinationY = destY;
    
    console.log(`Mobile cursor ${newCursor.name} will drag image ${targetIndex} to ${destX.toFixed(0)},${destY.toFixed(0)}`);
    
    // FIXED: Move the image a little bit to kick-start the movement
    if (imageElement instanceof HTMLElement) {
      const dx = destX - currentLeft;
      const dy = destY - currentTop;
      const dirX = dx / distance;
      const dirY = dy / distance;
      
      // Move 5px in the direction of the destination
      const newLeft = currentLeft + dirX * 5;
      const newTop = currentTop + dirY * 5;
      
      // Update DOM element
      imageElement.style.left = `${newLeft}px`;
      imageElement.style.top = `${newTop}px`;
      
      // Update data model
      collageImages[targetIndex] = {
        ...collageImages[targetIndex],
        left: newLeft,
        top: newTop
      };
      
      console.log(`Initial movement: Image ${targetIndex} moved to ${newLeft.toFixed(1)}, ${newTop.toFixed(1)}`);
    }
    
    // Add the cursor
    fakeCursors = [...fakeCursors, newCursor];
    lastCursorCreationTime = Date.now();
    
    // Notify parent
    onFakeCursorsUpdate(fakeCursors);
    
    return true;
  }

  // Fix for the targetImage type assignment
  onMount(() => {
    if (!browser) return; // Skip if not in browser environment
    
    // Check if we're on mobile
    const isMobile = window.innerWidth <= 768;
    
    // On mobile, initialize the cursor system immediately
    if (isMobile) {
      console.log("Mobile detected - initializing cursor system immediately");
      hasCursorInitialized = true;
      cursorInitializationDelay = 0;
      
      // CRITICAL FIX FOR MOBILE: Wait for images to be fully loaded and visible
      // before attempting to create cursors and move images
      setTimeout(() => {
        // Verify images are visible first
        const mobileImages = document.querySelectorAll('.mobile-collage .collage-image-button');
        console.log(`Mobile collage has ${mobileImages.length} images visible`);
        
        if (mobileImages.length > 0) {
          createMobileCursor();
        } else {
          // Wait a bit longer and try again
          setTimeout(() => {
            const retryImages = document.querySelectorAll('.mobile-collage .collage-image-button');
            console.log(`Retry: Mobile collage has ${retryImages.length} images visible`);
            if (retryImages.length > 0) {
              createMobileCursor();
            } else {
              console.log("WARNING: Could not find mobile images after retry");
            }
          }, 3000);
        }
      }, 4000); // Wait a bit longer for images to load
    } else {
      // On desktop, use the regular initialization process
      console.log("Desktop detected - using standard cursor initialization");
    }
  });

  // Update the check for creating new cursors on mobile to use our specialized function

  // Override onMount to initialize mobile cursors properly
  onMount(() => {
    // Initialize cursor system after a delay to ensure images have loaded
    if (browser) {
      setTimeout(() => {
        // Create some initial mobile cursors for mobile view
        createMobileCursor();
      }, 2000);
    }
  });
</script>

<div class="desktop-collage" bind:this={collageContainer}>
  {#if collageImages.length > 0 && imagesReady}
    {#each collageImages as img, i}
      {#if visibleImages.includes(i)}
        <button 
          class="collage-image-button"
          on:mousedown={(e) => {
            // Mark that user has interacted with collage
            hasInteractedWithCollage = true;
            
            // Remove prevention of dragging knight/woman
            
            startDrag(e, i);
            bringToFront(i);
          }}
          style="
            position: absolute;
            left: {img.left}px; 
            top: {img.top}px; 
            transform: rotate({img.rotation}deg);
            z-index: {(img.alt?.toLowerCase().includes('woman') || img.alt?.toLowerCase().includes('lady')) ? 2000 : 
                     (img.alt?.toLowerCase().includes('knight') || img.alt?.toLowerCase().includes('armor')) ? 1999 : 
                     img.zIndex};
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
            
            // Remove prevention of dragging knight/woman
            
            startDrag(e, i);
            bringToFront(i);
          }}
          on:touchstart={(e) => {
            // Mark that user has interacted with collage
            hasInteractedWithCollage = true;
            
            // Prevent default behavior to prevent scrolling
            e.preventDefault();
            
            // Remove prevention of dragging knight/woman
            
            // Handle touch start event directly
            handleTouchStart(e, i);
            
            // Add touch move event listener directly to the element
            // This ensures touch events are captured correctly
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', (endEvent) => {
              // Clean up the event listeners when touch ends
              document.removeEventListener('touchmove', handleTouchMove);
              
              // Call endDrag to clean up the dragging state
              endDrag();
            }, { once: true });
          }}
          style="
            position: absolute;
            left: {img.left}px; 
            top: {img.top}px; 
            transform: rotate({img.rotation}deg) scale({img.scale || 1});
            z-index: {(img.alt?.toLowerCase().includes('woman') || img.alt?.toLowerCase().includes('lady')) ? 2000 : 
                     (img.alt?.toLowerCase().includes('knight') || img.alt?.toLowerCase().includes('armor')) ? 1999 : 
                     img.zIndex};
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
    /* Add position constraints */
    position: relative;
    left: 0;
    transform: none;
    /* Use padding instead of margins for inner spacing */
    padding: 10px;
    box-sizing: border-box;
  }

  /* Fix mobile collage display on mobile devices */
  @media (max-width: 768px) {
    .mobile-collage {
      display: block;
      width: 100%;
      height: 60vh;
    }
    
    .desktop-collage {
      display: none;
    }
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
    -webkit-tap-highlight-color: transparent; /* Prevent grey highlight on iOS/Android */
    touch-action: none; /* Ensure touchmove events fire for dragging */
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