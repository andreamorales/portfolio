<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import ContactForm from '$lib/components/ContactForm.svelte';
  import Label from '$lib/components/ui/input/Label.svelte';
  import colibri from '$lib/images/colibri.png';
  
  // Import all collage images
  import beetle from '$lib/images/beetle.png';
  import dahlia from '$lib/images/dahlia.png';
  import knight from '$lib/images/knight.png';
  import orchid from '$lib/images/orchid.png';
  import owl from '$lib/images/owl.png';
  import parrots from '$lib/images/parrots.png';
  import rock from '$lib/images/rock.png';
  import snake from '$lib/images/snake.png';
  import woman from '$lib/images/woman.png';

  // Import company logos as strings
  import MongoDB from '$lib/images/MongoDB.svg?raw';
  import Consensys from '$lib/images/Consensys.svg?raw';
  import panto from '$lib/images/panto_horizontal.svg?raw';
  import Roblox from '$lib/images/Roblox.svg?raw';

  // Import additional images for large screens
  import flowers from '$lib/images/flowers.png';
  import bobo from '$lib/images/bobo.png';

  // Import Lucide pointer icon
  import { Pointer } from 'lucide-svelte';

  // Portfolio items
  let portfolioItems = [
    { 
      title: 'MongoDB: Realm Schema', 
      tags: ['UX/UI'],
      expanded: false
    },
    { 
      title: 'Ducky: Full Product', 
      tags: ['UX/UI', 'FRONTEND DEV'],
      expanded: false
    },
    { 
      title: 'FireHydrant: Design System', 
      tags: ['UX/UI'],
      expanded: false
    },
    { 
      title: 'Roblox: Creator Hub', 
      tags: ['UX/UI'],
      expanded: false
    },
    { 
      title: 'Panto: Full Product', 
      tags: ['UX/UI', 'FRONTEND DEV'],
      expanded: false
    },
    { 
      title: 'La Güila Toys: Full Product', 
      tags: ['TOY DESIGN'],
      expanded: false
    },
    { 
      title: 'Torch: Full Product', 
      tags: ['GAME DESIGN'],
      expanded: false
    }
  ];

  function toggleExpand(index: number) {
    portfolioItems[index].expanded = !portfolioItems[index].expanded;
    portfolioItems = portfolioItems; // Trigger reactivity
  }

  // Collage image placement
  type ImageData = {
    src: string;
    alt: string;
    width: number;
    height: number;
    right: number;
    bottom: number;
    rotation: number;
    zIndex: number;
    aspectRatio: string;
    flexShrink?: number;
    scale?: number; // Add scale property
    delay?: number; // Add delay property for staggered animation
    contentOffsets?: { top: number; right: number; bottom: number; left: number };
  };

  let collageImages: ImageData[] = [];
  let imagesReady = false;
  let visibleImages: number[] = [];

  // Add a variable to track if user has interacted with collage
  let hasInteractedWithCollage = false;

  // Define the dimensions for all images with content-aware offsets
  // Each image has contentOffsets that define where the actual visible content is
  // relative to the rectangular bounds (percentages of width/height)
  const imageDimensions = [
    { 
      src: knight, 
      alt: "Knight", 
      width: 352.8, 
      height: 616.8, 
      zIndex: 6, 
      aspectRatio: "294.05/513.99",
      // Knight has content mostly in the center
      contentOffsets: { top: 5, right: 20, bottom: 5, left: 20 }
    },
    { 
      src: woman, 
      alt: "Woman", 
      width: 418.731, 
      height: 580.458, 
      zIndex: 12, 
      aspectRatio: "418.73/580.46",
      // Woman figure content is roughly centered
      contentOffsets: { top: 10, right: 15, bottom: 5, left: 15 }
    },
    { 
      src: parrots, 
      alt: "Parrots", 
      width: 179.135, 
      height: 267.576, 
      zIndex: 9, 
      aspectRatio: "179.13/267.58",
      // Parrots have significant content area
      contentOffsets: { top: 10, right: 10, bottom: 10, left: 10 }
    },
    { 
      src: owl, 
      alt: "Owl", 
      width: 340, 
      height: 473.4, 
      zIndex: 8, 
      aspectRatio: "425.05/591.76",
      // Owl has content mostly in center-left
      contentOffsets: { top: 15, right: 30, bottom: 15, left: 10 }
    },
    { 
      src: beetle, 
      alt: "Beetle", 
      width: 273.841, 
      height: 134.3, 
      zIndex: 1, 
      aspectRatio: "273.84/134.30",
      // Beetle has concentrated content
      contentOffsets: { top: 20, right: 20, bottom: 20, left: 20 }
    },
    { 
      src: dahlia, 
      alt: "Dahlia", 
      width: 436.519, 
      height: 539.77, 
      zIndex: 3, 
      aspectRatio: "436.52/539.77",
      // Dahlia has content mostly in the center
      contentOffsets: { top: 10, right: 15, bottom: 10, left: 15 }
    },
    { 
      src: snake, 
      alt: "Snake", 
      width: 399.94, 
      height: 574.71, 
      zIndex: 11, 
      aspectRatio: "399.94/574.71",
      // Snake has content in center-right
      contentOffsets: { top: 15, right: 10, bottom: 15, left: 25 }
    },
    { 
      src: rock, 
      alt: "Rock", 
      width: 206.375, 
      height: 227.453, 
      zIndex: 10, 
      aspectRatio: "206.38/227.45", 
      flexShrink: 0,
      // Rock has dense content
      contentOffsets: { top: 15, right: 15, bottom: 15, left: 15 }
    },
    { 
      src: orchid, 
      alt: "Orchid", 
      width: 359.332, 
      height: 415.029, 
      zIndex: 7, 
      aspectRatio: "359.33/415.03", 
      flexShrink: 0, 
      rotation: -15,
      // Orchid has content mostly in center-top
      contentOffsets: { top: 5, right: 15, bottom: 25, left: 15 }
    }
  ];

  // Add the large screen images to the dimensions array
  const largeScreenImages = [
    { 
      src: flowers, 
      alt: "Flowers", 
      width: 400, 
      height: 500, 
      zIndex: 2, 
      aspectRatio: "400/500",
      contentOffsets: { top: 10, right: 10, bottom: 10, left: 10 }
    },
    { 
      src: bobo, 
      alt: "Bobo", 
      width: 300, 
      height: 400, 
      zIndex: 4, 
      aspectRatio: "300/400",
      contentOffsets: { top: 10, right: 10, bottom: 10, left: 10 }
    }
  ];

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

  // Add type for resize timer
  let resizeTimer: number;

  onMount(() => {
    // Define event handlers for both mouse and touch
    const handleResize = () => {
      // Debounce the resize event
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        collageImages = generateRandomPositions();
      }, 250); // Wait 250ms after resize ends before updating
    };

    // Handle touch move events for dragging
    const handleTouchMove = (event: TouchEvent) => {
      if (draggedImageIndex === null) return;
      
      // Prevent default to stop scrolling while dragging
      event.preventDefault();
      
      const touch = event.touches[0];
      
      // Calculate the movement delta (inversed for right/bottom positioning)
      const deltaX = dragStartX - touch.clientX;
      const deltaY = dragStartY - touch.clientY;
      
      // Check if we're in mobile view
      const isMobile = window.innerWidth <= 768;
      
      // Get container dimensions for mobile view
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
      
      // Convert pixel movement to percentage of container
      const deltaRightPercent = (deltaX / containerWidth) * 100;
      const deltaBottomPercent = (deltaY / containerHeight) * 100;
      
      // Update the image position (make a new array to trigger reactivity)
      collageImages = collageImages.map((img, i) => {
        if (i === draggedImageIndex) {
          // Calculate new position
          const newRight = initialRight + deltaRightPercent;
          const newBottom = initialBottom + deltaBottomPercent;
          
          if (isMobile) {
            // For mobile, constrain to container boundaries
            const imageWidthPercent = (img.width / containerWidth) * 100;
            const imageHeightPercent = (img.height / containerHeight) * 100;
            
            return {
              ...img,
              right: Math.max(
                0,
                Math.min(100 - imageWidthPercent, newRight)
              ),
              bottom: Math.max(
                0,
                Math.min(100 - imageHeightPercent, newBottom)
              )
            };
          } else {
            // For desktop, use the existing viewport margin logic
            const viewportMargin = 3;
            const imageWidthPercent = (img.width / window.innerWidth) * 100;
            
            return {
              ...img,
              right: Math.max(
                viewportMargin,
                Math.min(100 - viewportMargin - imageWidthPercent, newRight)
              ),
              bottom: Math.max(0, Math.min(100, newBottom))
            };
          }
        }
        return img;
      });
    };

    // Handle touch end events
    const handleTouchEnd = () => {
      // Remove dragging class from body
      document.body.classList.remove('dragging');
      draggedImageIndex = null;
    };

    (async () => {
      try {
        // First preload all images
        await preloadImages();
        
        // Then generate positions and start animation sequence
        collageImages = generateRandomPositions();
        
        // Add resize and touch event handlers
        window.addEventListener('resize', handleResize);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
        
        // Start introducing images one by one with a faster speed
        setTimeout(() => {
          imagesReady = true;
          
          // Add images one by one with faster staggered timing
          collageImages.forEach((img, index) => {
            setTimeout(() => {
              visibleImages = [...visibleImages, index];
            }, 150 + index * 180);
          });
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
    };
  });

  // Dragging functionality
  let draggedImageIndex: number | null = null;
  let dragStartX: number;
  let dragStartY: number;
  let initialRight: number;
  let initialBottom: number;

  function startDrag(event: MouseEvent, index: number) {
    // Prevent default behavior and propagation
    event.preventDefault();
    event.stopPropagation();
    
    // Record which image is being dragged and initial position
    draggedImageIndex = index;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    initialRight = collageImages[index].right;
    initialBottom = collageImages[index].bottom;
    
    // Add dragging class to body to ensure cursor stays as grabbing
    document.body.classList.add('dragging');
    
    // Add event listeners for move and end
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', endDrag);
  }

  function handleDrag(event: MouseEvent) {
    if (draggedImageIndex === null) return;
    
    // Calculate the movement delta (inversed for right/bottom positioning)
    const deltaX = dragStartX - event.clientX;
    const deltaY = dragStartY - event.clientY;
    
    // Check if we're in mobile view
    const isMobile = window.innerWidth <= 768;
    
    // Get container dimensions for mobile view
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
    
    // Convert pixel movement to percentage of container
    const deltaRightPercent = (deltaX / containerWidth) * 100;
    const deltaBottomPercent = (deltaY / containerHeight) * 100;
    
    // Update the image position (make a new array to trigger reactivity)
    collageImages = collageImages.map((img, i) => {
      if (i === draggedImageIndex) {
        // Calculate new position
        const newRight = initialRight + deltaRightPercent;
        const newBottom = initialBottom + deltaBottomPercent;
        
        if (isMobile) {
          // For mobile, constrain to container boundaries
          const imageWidthPercent = (img.width / containerWidth) * 100;
          const imageHeightPercent = (img.height / containerHeight) * 100;
          
          return {
            ...img,
            right: Math.max(
              0,
              Math.min(100 - imageWidthPercent, newRight)
            ),
            bottom: Math.max(
              0,
              Math.min(100 - imageHeightPercent, newBottom)
            )
          };
        } else {
          // For desktop, use the existing viewport margin logic
          const viewportMargin = 3;
          const imageWidthPercent = (img.width / window.innerWidth) * 100;
          
          return {
            ...img,
            right: Math.max(
              viewportMargin,
              Math.min(100 - viewportMargin - imageWidthPercent, newRight)
            ),
            bottom: Math.max(0, Math.min(100, newBottom))
          };
        }
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

  // Remove unused contact form reference and scroll functionality
  function scrollToContact() {
    console.log('Toggle contact form triggered');
    toggleContactForm();
  }

  // Show/hide contact form with a toggle
  let showContactForm = false;

  // Function to toggle contact form visibility
  function toggleContactForm() {
    console.log('Toggle contact form triggered');
    showContactForm = !showContactForm;
    if (showContactForm) {
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scrolling when modal is closed
      document.body.style.overflow = 'auto';
    }
  }
</script>

<svelte:head>
  <title>Andy Morales | Product Designer</title>
  <meta name="description" content="Andy Morales - Product designer for creative tools." />
</svelte:head>

<div class="landing-page">
  <main class="container flex-column-left">
    <div class="header flex-column-left gap-large">
      <div class="title-container">
        <h1 class="title">Andy<br>Morales</h1>
        <div class="colibri-container">
          <img src={colibri} alt="Colibri" class="colibri-image">
        </div>
      </div>
      <div class="flex-column-left gap-small">
        <div class="description">
          I lead the design of creative and technical products.
        </div>
        <div class="company-logos">
          {@html Consensys}
          {@html MongoDB}
          {@html Roblox}
          {@html panto}
        </div>
      </div>

      <div class="cta">
        <button class="button-secondary" on:click={toggleContactForm}>Get in touch</button>
      </div>
    </div>

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
          <Pointer size={36} />
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
                // Prevent default to stop scrolling
                e.preventDefault();
                
                // Mark that user has interacted with collage
                hasInteractedWithCollage = true;
                
                // Handle touch as drag start
                const touch = e.touches[0];
                draggedImageIndex = i;
                dragStartX = touch.clientX;
                dragStartY = touch.clientY;
                initialRight = collageImages[i].right;
                initialBottom = collageImages[i].bottom;
                
                // Add dragging class
                document.body.classList.add('dragging');
                
                bringToFront(i);
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

    <div class="portfolio-list">
      {#each portfolioItems as item, index}
        <div class="portfolio-item flex-column-left gap-medium">
          <button 
            class="portfolio-header flex-row gap-medium" 
            on:click={() => toggleExpand(index)} 
            on:keydown={(e) => e.key === 'Enter' && toggleExpand(index)}
            aria-expanded={item.expanded}
            aria-controls={`portfolio-content-${index}`}
          >
            <h2>{item.title}</h2>
            <div class="tags flex-row gap-small">
              {#each item.tags as tag}
                <Label 
                  text={tag} 
                  variant="semisolid" 
                  color="default" 
                />
              {/each}
            </div>
          </button>
          {#if item.expanded}
            <div id="portfolio-content-${index}" class="portfolio-content">
              <!-- Content will be added later -->
              <p>Portfolio details will expand here.</p>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </main>
</div>

<!-- Modal contact form that appears over everything when toggled -->
{#if showContactForm}
  <div class="contact-modal" transition:fade={{ duration: 300 }}>
    <div class="contact-modal-content">
      <button class="close-button" on:click={toggleContactForm}>&times;</button>
      <ContactForm />
    </div>
  </div>
{/if}

<style>
  .landing-page {
    min-height: 100vh;
    background-color: var(--bg-color);
    color: var(--text-color);
    padding: 5.5rem;
  }

  .container {
    max-width: 100%;
    margin: 0;
    padding: 0;
    position: relative;
    z-index: 2;
    gap: var(--spacing-xxl);
  }

  .title-container {
    position: relative;
    display: inline-block;
  }

  .colibri-container {
    position: absolute;
    top: 0;
    right: 0;
    width: 276px; /* Original width of the image */
    height: auto;
    transform: translate(31%, -9.5%) scale(0.9);
    transform-origin: top right;
    z-index: 3;
    pointer-events: none;
  }

  .colibri-image {
    width: 100%;
    height: auto;
    display: block;
  }

  .title {
    font-family: var(--font-refract);
    font-size: 128px;
    font-style: normal;
    font-weight: 400;
    line-height: 102px;
    letter-spacing: -1.28px;
    font-feature-settings: 'dlig' on, 'ss01' on;
    position: relative;
    z-index: 2;
  }

  .description {
    font-family: var(--font-recursive);
    font-size: 24px;
    font-style: normal;
    font-weight: 370;
    line-height: 24px;
    letter-spacing: 0.28px;
    font-variation-settings: 'CASL' 0, 'wght' 370;
    position: relative;
    z-index: 2;
    color: var(--text-color);
  }

  .company-logos {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .company-logos :global(svg) {
    height: 24px;
    width: auto;
    color: var(--text-color);
    fill: currentColor;
  }

  /* Specific size adjustments for company logos */
  .company-logos :global(svg:first-child) {
    height: 22px; /* ConsenSys: slightly smaller than default */
  }
  
  .company-logos :global(svg:nth-child(2)) {
    height: 25.2px; /* MongoDB: 5% bigger than default */
  }

  .company-logos :global(svg:nth-child(3)) {
    height: 20px; /* Roblox: smaller than default */
  }

  .company-logos :global(svg:last-child) {
    height: 20px; /* Panto: match Roblox height */
  }

  .portfolio-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    font-family: var(--font-recursive);
    font-variation-settings: 'CASL' 0, 'wght' 400;
    position: relative;
    z-index: 5;
  }

  .portfolio-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    background: transparent;
    border: none;
    width: 100%;
    font-family: var(--font-recursive);
    padding:0;
    margin: 0;
    text-align: left;
    gap: var(--spacing-md);
  }

  .portfolio-header:hover h2 {
    color: var(--interactive-hover);
  }

  .portfolio-header h2 {
    color: #363636;
    font-family: var(--font-recursive);
    font-size: 18px;
    font-style: normal;
    font-weight: 370;
    line-height: 18px; /* 240% */
    letter-spacing: 0.4px;
    text-decoration-line: underline;
    margin: 0;
    transition: color var(--transition);
    font-variation-settings: 'CASL' 0, 'wght' 370;
  }

  .portfolio-item {
    position: relative;
    z-index: 5;
  }

  .portfolio-content {
    padding: 1rem;
    font-family: var(--font-recursive);
    font-weight: 400;
    font-variation-settings: 'CASL' 0, 'wght' 400;
    position: relative;
    z-index: 5;
    background-color: var(--bg-color);
  }

  .portfolio-content p {
    font-size: 16px;
    font-family: var(--font-recursive);
    font-weight: 400;
    font-variation-settings: 'CASL' 0, 'wght' 400;
  }

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
  
  .cta {
    position: relative;
    z-index: 5;
    display: flex;
    justify-content: center;
  }
  
  .button-secondary {
    cursor: pointer;
    position: relative;
    z-index: 5;
    padding: 0.75rem 1.5rem;
    border: 2px solid var(--text-color);
    border-radius: 4px;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
    pointer-events: auto;
    font-family: var(--font-recursive);
    font-variation-settings: 'CASL' 0, 'wght' 600;
  }
  
  .button-secondary:hover {
    background-color: var(--text-color);
    color: var(--bg-color);
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

    /* Contact modal that appears on top of everything */
    .contact-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    pointer-events: auto;
  }

  .contact-modal-content {
    background-color: var(--bg-color);
    padding: 2.5rem;
    border-radius: 0.5rem;
    max-width: 550px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-color);
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.3s;
  }

  .close-button:hover {
    background-color: rgba(0, 0, 0, 0.1);
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

    .container {
      gap: var(--spacing-md);
    }

    .landing-page {
      padding: 2rem;
    }

    .title-container {
      width: auto;
    }

    .title {
      font-size: 72px;
      line-height: 60px;
      letter-spacing: -0.72px;
    }

    .colibri-container {
      transform: translate(17.5%, -3%) scale(0.5);
    }

    .portfolio-header {
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      gap: var(--spacing-md);
    }

    .portfolio-header h2 {
      font-size: 1rem;
      line-height: 1em;
      margin: 0;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .description {
      font-size: 18px;
      line-height: 20px;
      letter-spacing: 0.22px;
    }

    .company-logos :global(svg) {
      height: 18px;
    }

    /* Maintain proportions in mobile */
    .company-logos :global(svg:first-child) {
      height: 16.5px; /* ConsenSys: slightly smaller than mobile default */
    }
    
    .company-logos :global(svg:nth-child(2)) {
      height: 19px; /* MongoDB: 5% bigger than mobile default */
    }

    .company-logos :global(svg:nth-child(3)) {
      height: 15px; /* Roblox: smaller than mobile default */
    }

    .company-logos :global(svg:last-child) {
      height: 15px; /* Panto: match Roblox height */
    }

    .company-logos {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      width: 100%;
      max-width: 200px;
    }
  }

  @media (max-width: 548px) {
    .colibri-container {
      transform: translate(17.5%, -3.1%) scale(0.5);
    }
  }

  /* Add a class for when dragging is active */
  .dragging {
    cursor: grabbing !important;
  }

  :global(body.dragging) {
    cursor: grabbing !important;
  }

  :global(body.dragging *) {
    cursor: grabbing !important;
  }
</style>
