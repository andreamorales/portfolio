<script lang="ts">
  import { onMount } from 'svelte';
  import type { Cursor } from './types.js';
  import { browser } from '$app/environment';
  import draggingStore, { startDragging, stopDragging } from '../../stores/draggingStore.js';

  export let cursors: Cursor[] = [];
  export let onCursorsUpdate: (cursors: Cursor[]) => void;
  export let collageImages: any[] = [];
  export let imageLocks: Record<number, string> = {};
  export let visibleImages: number[] = [];

  const MAX_CURSORS = 2;
  let lastCursorCreationTime = 0;
  let hasCursorInitialized = false;
  let cursorInitializationDelay = 0;
  let pageVisitStartTime = 0;
  let guaranteedCursorTimer = 0;
  let simulationInterval: number;

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
  ];

  function constrainToWindow(left: number, top: number, width: number, height: number, isMobile: boolean = false) {
    const MIN_MARGIN = 0;
    
    if (isMobile) {
      // For mobile, constrain to the mobile container
      const container = document.querySelector('.mobile-collage');
      if (container) {
        const rect = container.getBoundingClientRect();
        return {
          left: Math.max(MIN_MARGIN, Math.min(rect.width - width - MIN_MARGIN, left)),
          top: Math.max(MIN_MARGIN, Math.min(rect.height - height - MIN_MARGIN, top))
        };
      }
    }
    
    // For desktop, constrain to viewport
    return {
      left: Math.max(MIN_MARGIN, Math.min(window.innerWidth - width - MIN_MARGIN, left)),
      top: Math.max(MIN_MARGIN, Math.min(window.innerHeight - height - MIN_MARGIN, top))
    };
  }

  function createFakeCursor(isStatic = false, isPreexisting = false): Cursor {
    const id = Math.random().toString(36).substr(2, 9);
    const randomUserNumber = Math.floor(100 + Math.random() * 900);
    const name = `User${randomUserNumber}`;
    const color = fakeUserColors[Math.floor(Math.random() * fakeUserColors.length)];
    
    console.log(`Creating new cursor ${name} (static: ${isStatic}, preexisting: ${isPreexisting})`);
    
    const containerWidth = browser ? window.innerWidth : 1200;
    const containerHeight = browser ? window.innerHeight : 800;
    
    const cursorLifespan = isStatic ? 
      (20000 + Math.random() * 20000) : // 20-40 seconds for static cursors
      (30000 + Math.random() * 30000);  // 30-60 seconds for moving cursors

    return {
      id,
      name,
      x: Math.random() * containerWidth,
      y: Math.random() * containerHeight,
      color,
      isDragging: false,
      isMovingToTarget: false,
      targetImage: null,
      targetX: 0,
      targetY: 0,
      destinationX: 100 + Math.random() * (containerWidth - 200),
      destinationY: 100 + Math.random() * (containerHeight - 200),
      delayCount: 0,
      curveOffsetX: (Math.random() * 100) - 50,
      curveOffsetY: (Math.random() * 100) - 50,
      timeFactor: isPreexisting ? Math.random() * 10 : 0,
      randomOffset: { x: 0, y: 0 },
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      originX: 0,
      originY: 0,
      holdDuration: 0,
      grabOffsetX: 0,
      grabOffsetY: 0,
      lastActiveTime: Date.now(),
      isStatic,
      restingPeriod: isPreexisting ? 
        Math.random() * 4000 : 
        Math.random() < 0.8 ? 
          10000 + Math.random() * 10000 : 
          0,
      lifespan: cursorLifespan
    };
  }

  function setupPreexistingCursor(cursor: Cursor): Cursor {
    if (!browser) return cursor;

    const visibleImageIndexes = [...visibleImages];
    const availableIndexes = visibleImageIndexes.filter(index => !imageLocks[index]);
    
    if (availableIndexes.length === 0) {
      cursor.isMovingToTarget = false;
      cursor.isStatic = true;
      return cursor;
    }
    
    const randomImageIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    const isMobile = window.innerWidth <= 768;
    const containerSelector = isMobile ? '.mobile-collage' : '.desktop-collage';
    
    const container = document.querySelector(containerSelector);
    if (!container) {
      cursor.isMovingToTarget = false;
      cursor.isStatic = true;
      return cursor;
    }
    
    const imageElement = container.querySelector(`.collage-image-button:nth-child(${randomImageIndex + 1})`);
    if (!imageElement) {
      cursor.isMovingToTarget = false;
      cursor.isStatic = true;
      return cursor;
    }
    
    const rect = imageElement.getBoundingClientRect();
    
    if (isMobile) {
      cursor.targetImage = randomImageIndex;
      cursor.isMovingToTarget = false;
      cursor.isDragging = true;
      cursor.x = rect.left + rect.width / 2;
      cursor.y = rect.top + rect.height / 2 + window.scrollY;
      cursor.grabOffsetX = rect.width / 2;
      cursor.grabOffsetY = rect.height / 2;
      cursor.isStatic = false;
      
      imageLocks[randomImageIndex] = cursor.id;
      startDragging(randomImageIndex);
      
      const containerRect = container.getBoundingClientRect();
      const margin = 30;
      const currentLeft = collageImages[randomImageIndex].left;
      const currentTop = collageImages[randomImageIndex].top;
      
      // Generate destination at least 100px away
      let destX, destY;
      let distance = 0;
      const safeWidth = containerRect.width - margin * 2 - rect.width;
      const safeHeight = containerRect.height - margin * 2 - rect.height;
      
      do {
        destX = margin + Math.random() * Math.max(safeWidth, 50);
        destY = margin + Math.random() * Math.max(safeHeight, 50);
        const dx = destX - currentLeft;
        const dy = destY - currentTop;
        distance = Math.sqrt(dx*dx + dy*dy);
      } while (distance < 100);
      
      cursor.destinationX = destX;
      cursor.destinationY = destY;
      
      // Move image slightly to start
      if (imageElement instanceof HTMLElement) {
        const dx = destX - currentLeft;
        const dy = destY - currentTop;
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        const newLeft = currentLeft + dirX * 5;
        const newTop = currentTop + dirY * 5;
        
        imageElement.style.left = `${newLeft}px`;
        imageElement.style.top = `${newTop}px`;
        
        collageImages[randomImageIndex] = {
          ...collageImages[randomImageIndex],
          left: newLeft,
          top: newTop
        };
      }
    } else {
      // Desktop behavior - move to target first
      cursor.targetImage = randomImageIndex;
      cursor.targetX = rect.left + rect.width / 2;
      cursor.targetY = rect.top + rect.height / 2 + window.scrollY;
      cursor.grabOffsetX = rect.width / 2;
      cursor.grabOffsetY = rect.height / 2;
      imageLocks[randomImageIndex] = cursor.id;
      cursor.isMovingToTarget = true;
      cursor.isDragging = false;
      cursor.isStatic = false;
    }
    
    return cursor;
  }

  function simulateFakeInteraction() {
    if (!browser) return;

    if (!hasCursorInitialized) {
      if (cursorInitializationDelay === 0) {
        const isMobile = window.innerWidth <= 768;
        
        // Set a variable delay before any cursor activity
        // On mobile, use a shorter delay (15-30 seconds) to make interaction more visible
        cursorInitializationDelay = isMobile ? 
          15000 + Math.random() * 15000 : // 15-30 seconds on mobile
          20000 + Math.random() * 40000;  // 20-60 seconds on desktop
        
        console.log(`Will delay cursor appearance by ${Math.round(cursorInitializationDelay/1000)} seconds`);
        
        // Initialize the page visit timer for the guaranteed cursor appearance
        pageVisitStartTime = Date.now();
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
        console.log('Forcing cursor initialization due to timeout');
        hasCursorInitialized = true;
        initializeCursorSystem(true);
        return;
      }
      
      // Check if regular delay has expired
      if (cursorInitializationDelay <= 0) {
        console.log('Natural cursor initialization');
        hasCursorInitialized = true;
        initializeCursorSystem(false);
      }
      return;
    }

    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      const now = Date.now();
      const timeSinceLastCursor = now - lastCursorCreationTime;
      const mobileMinimumInterval = 30 * 1000;
      const mobileRandomInterval = 60 * 1000;
      
      if (timeSinceLastCursor < mobileMinimumInterval + (Math.random() * mobileRandomInterval)) {
        return;
      }
    }

    if (cursors.length < MAX_CURSORS) {
      const now = Date.now();
      const timeSinceLastCursor = now - lastCursorCreationTime;
      const minTimeBetweenCursors = isMobile ? 3 * 60 * 1000 : 60 * 1000;
      const randomDelayFactor = isMobile ? 5 * 60 * 1000 : 2 * 60 * 1000;
      
      if (timeSinceLastCursor > minTimeBetweenCursors + (Math.random() * randomDelayFactor)) {
        attemptToCreateNewCursor();
      }
    }

    updateCursorPositions();
  }

  function updateCursorPositions() {
    if (!browser) return;

    const isMobile = window.innerWidth <= 768;
    const now = Date.now();
    
    // First, ensure we don't exceed maximum cursors
    const nonHumanCursors = cursors.filter(c => c.id !== "human-user");
    const maxAllowed = isMobile ? 1 : MAX_CURSORS;
    
    if (nonHumanCursors.length > maxAllowed) {
      console.log(`Too many cursors (${nonHumanCursors.length}), removing excess to maintain limit of ${maxAllowed}`);
      
      // Sort by creation time and keep only the newest ones
      const sortedCursors = [...nonHumanCursors].sort((a, b) => b.lastActiveTime - a.lastActiveTime);
      const cursorsToRemove = sortedCursors.slice(maxAllowed);
      
      // Clean up excess cursors
      cursorsToRemove.forEach(cursor => {
        if (cursor.targetImage !== null && imageLocks[cursor.targetImage] === cursor.id) {
          stopDragging(cursor.targetImage);
          delete imageLocks[cursor.targetImage];
        }
      });
      
      // Keep only the allowed number of cursors plus the human cursor
      const humanCursor = cursors.find(c => c.id === "human-user");
      cursors = [...sortedCursors.slice(0, maxAllowed)];
      if (humanCursor) {
        cursors.push(humanCursor);
      }
      
      onCursorsUpdate(cursors);
    }

    // Handle cursor expiration
    const expiredCursors = cursors.filter(cursor => {
      if (cursor.id === "human-user") return false;
      
      if (!isMobile) {
        // If cursor is static and has been static for more than 20 seconds, remove it
        if (cursor.isStatic && (now - cursor.lastActiveTime > 20000)) {
          console.log(`Cursor ${cursor.name} expired due to inactivity`);
          return true;
        }
        // If cursor completed an action (dragged and released an image) over 15 seconds ago, remove it
        if (!cursor.isDragging && !cursor.isMovingToTarget && (now - cursor.lastActiveTime > 15000)) {
          console.log(`Cursor ${cursor.name} expired due to no interaction`);
          return true;
        }
      }
      
      const timeLeft = cursor.lifespan - (now - cursor.lastActiveTime);
      // Start fading out in the last 2 seconds
      if (timeLeft < 2000) {
        const opacity = Math.max(0, timeLeft / 2000);
        const element = document.querySelector(`[data-cursor-id="${cursor.id}"]`);
        if (element instanceof HTMLElement) {
          element.style.opacity = opacity.toString();
        }
      }
      
      return timeLeft <= 0;
    });

    if (expiredCursors.length > 0) {
      expiredCursors.forEach(cursor => {
        if (cursor.targetImage !== null && imageLocks[cursor.targetImage] === cursor.id) {
          stopDragging(cursor.targetImage);
          delete imageLocks[cursor.targetImage];
        }
      });
      
      cursors = cursors.filter(c => !expiredCursors.some(e => e.id === c.id));
      onCursorsUpdate(cursors);
    }

    // Update cursor positions and handle dragging
    cursors = cursors.map(cursor => {
      if (cursor.isStatic || cursor.id === "human-user") return cursor;

      const MOVEMENT_SPEED = isMobile ? 8.0 : 5.0;

      if (cursor.isMovingToTarget && !cursor.isDragging && cursor.targetImage !== null) {
        const dx = cursor.targetX - cursor.x;
        const dy = cursor.targetY - cursor.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
          cursor.isDragging = true;
          cursor.isMovingToTarget = false;
          startDragging(cursor.targetImage);
          
          // Get the image dimensions from collageImages
          const imageData = collageImages[cursor.targetImage];
          if (imageData) {
            const margin = isMobile ? 30 : 50;
            const { left: destX, top: destY } = constrainToWindow(
              margin + Math.random() * (window.innerWidth - margin * 2),
              margin + Math.random() * (window.innerHeight - margin * 2),
              imageData.width,
              imageData.height
            );
            cursor.destinationX = destX;
            cursor.destinationY = destY;
          }
        } else {
          const dirX = dx / distance;
          const dirY = dy / distance;
          cursor.x += dirX * MOVEMENT_SPEED;
          cursor.y += dirY * MOVEMENT_SPEED;
        }
      } else if (cursor.isDragging && cursor.targetImage !== null) {
        const containerSelector = isMobile ? '.mobile-collage' : '.desktop-collage';
        const imageElement = document.querySelector(`${containerSelector} .collage-image-button:nth-child(${cursor.targetImage + 1})`);
        if (!imageElement || !(imageElement instanceof HTMLElement)) {
          cursor.isDragging = false;
          cursor.targetImage = null;
          return cursor;
        }

        const dx = cursor.destinationX - cursor.x;
        const dy = cursor.destinationY - cursor.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
          if (cursor.targetImage !== null) {
            stopDragging(cursor.targetImage);
            delete imageLocks[cursor.targetImage];
            cursor.targetImage = null;
          }
          cursor.isDragging = false;
          cursor.isMovingToTarget = Math.random() > 0.5;
          
          if (cursor.isMovingToTarget) {
            return setupPreexistingCursor(cursor);
          }
        } else {
          const dirX = dx / distance;
          const dirY = dy / distance;
          cursor.x += dirX * MOVEMENT_SPEED;
          cursor.y += dirY * MOVEMENT_SPEED;
          
          // Get container and image dimensions
          const container = document.querySelector(containerSelector);
          const imageRect = imageElement.getBoundingClientRect();
          const containerRect = container ? container.getBoundingClientRect() : null;
          
          // Calculate position relative to container
          let relativeX = cursor.x - cursor.grabOffsetX;
          let relativeY = cursor.y - cursor.grabOffsetY;
          
          if (isMobile && containerRect) {
            // For mobile, adjust position relative to container
            relativeX -= containerRect.left;
            relativeY -= containerRect.top;
          }
          
          // Update image position with constraints
          const { left: constrainedLeft, top: constrainedTop } = constrainToWindow(
            relativeX,
            relativeY,
            imageRect.width,
            imageRect.height,
            isMobile
          );
          
          // Update cursor position if image was constrained
          if (constrainedLeft !== relativeX) {
            cursor.x = constrainedLeft + cursor.grabOffsetX + (isMobile && containerRect ? containerRect.left : 0);
          }
          if (constrainedTop !== relativeY) {
            cursor.y = constrainedTop + cursor.grabOffsetY + (isMobile && containerRect ? containerRect.top : 0);
          }
          
          imageElement.style.left = `${constrainedLeft}px`;
          imageElement.style.top = `${constrainedTop}px`;
          
          if (cursor.targetImage !== null) {
            collageImages[cursor.targetImage] = {
              ...collageImages[cursor.targetImage],
              left: constrainedLeft,
              top: constrainedTop
            };
          }
        }
      }

      cursor.lastActiveTime = now;
      return cursor;
    });

    onCursorsUpdate(cursors);
  }

  function initializeCursorSystem(forceCursor = false) {
    if (!browser) return;

    const isMobile = window.innerWidth <= 768;
    
    // Should we have cursors at app start? 70% chance unless forced
    const shouldHaveCursorsAtStart = forceCursor || Math.random() < 0.7;
    
    if (shouldHaveCursorsAtStart) {
      // Determine how many cursors to start with - 50% chance of 2 cursors at start
      const initialCursorCount = isMobile ? 1 : (Math.random() < 0.5 ? 2 : 1);
      console.log(`Creating ${initialCursorCount} initial visitor${initialCursorCount > 1 ? 's' : ''}`);
      
      // Remove any existing cursors first
      cursors = cursors.filter(c => c.id === "human-user");
      
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
        
        cursors = [...cursors, configuredCursor];
      }
      
      onCursorsUpdate(cursors);
      lastCursorCreationTime = Date.now();
    } else {
      console.log('No cursors at initialization');
    }
  }

  function attemptToCreateNewCursor() {
    if (!browser) return false;

    const isMobile = window.innerWidth <= 768;
    const maxAllowed = isMobile ? 1 : MAX_CURSORS;
    
    // Count non-human cursors
    const nonHumanCursors = cursors.filter(c => c.id !== "human-user");
    
    if (nonHumanCursors.length >= maxAllowed) {
      console.log(`Already at maximum cursors (${maxAllowed}), not creating new one`);
      return false;
    }

    const newCursor = createFakeCursor(false);
    
    if (isMobile) {
      newCursor.isStatic = false;
      newCursor.x = -9999;
      newCursor.y = -9999;
    }
    
    const configuredCursor = setupPreexistingCursor(newCursor);
    if (configuredCursor.targetImage !== null) {
      cursors = [...cursors, configuredCursor];
      lastCursorCreationTime = Date.now();
      onCursorsUpdate(cursors);
      return true;
    }
    
    return false;
  }

  onMount(() => {
    if (!browser) return;

    const isMobile = window.innerWidth <= 768;
    console.log(`CursorSystem mounted (mobile: ${isMobile})`);
    
    // Start the simulation interval which will handle initialization
    simulationInterval = window.setInterval(simulateFakeInteraction, 16);

    return () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  });
</script>

<div class="fake-cursors-overlay">
  {#each cursors as cursor}
    <div 
      class="fake-cursor"
      data-cursor-id={cursor.id}
      style="
        left: {cursor.x}px;
        top: {cursor.y}px;
        --cursor-color: {cursor.color};
        opacity: {cursor.isStatic ? 0.7 : 1};
        pointer-events: none;
        transition: opacity 0.5s ease-out;
      "
    >
      <div class="fake-cursor-dot"></div>
      <div class="fake-cursor-name">{cursor.name}</div>
    </div>
  {/each}
</div>

<style>
  .fake-cursors-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    pointer-events: none;
    z-index: 1000;
  }

  .fake-cursor {
    position: fixed;
    transform: translate(-50%, -50%);
    transition: left 0.1s linear, top 0.1s linear, opacity 0.5s ease-out;
    pointer-events: none;
  }

  .fake-cursor-dot {
    width: 8px;
    height: 8px;
    background-color: var(--cursor-color);
    border-radius: 50%;
    position: relative;
  }

  .fake-cursor-dot::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border: 2px solid var(--cursor-color);
    border-radius: 50%;
    opacity: 0.5;
  }

  .fake-cursor-name {
    position: absolute;
    top: -20px;
    left: 10px;
    background-color: var(--cursor-color);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
  }
</style> 