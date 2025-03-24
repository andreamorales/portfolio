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
    delay?: number; // Add delay property for staggered animation
    contentOffsets?: { top: number; right: number; bottom: number; left: number };
  };

  let collageImages: ImageData[] = [];
  let imagesReady = false; // Flag to control when images start appearing
  
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

  // Generate positions for images with better randomization
  function generateRandomPositions() {
    // First, calculate area for each image and sort by size (largest to smallest)
    const sizedImages = imageDimensions.map(img => ({
      ...img,
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
    const rightMax = 50;  // maximum distance from right edge
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

  let visibleImages: number[] = [];

  // Single onMount with fast animation timing
  onMount(() => {
    collageImages = generateRandomPositions();
    
    // Start introducing images one by one with a faster speed
    setTimeout(() => {
      imagesReady = true;
      
      // Add images one by one with faster staggered timing
      collageImages.forEach((img, index) => {
        setTimeout(() => {
          visibleImages = [...visibleImages, index];
        }, 150 + index * 180); // Very fast sequence - only 180ms between images
      });
    }, 200);
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
    
    // Add event listeners for move and end
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', endDrag);
  }

  function handleDrag(event: MouseEvent) {
    if (draggedImageIndex === null) return;
    
    // Calculate the movement delta (inversed for right/bottom positioning)
    const deltaX = dragStartX - event.clientX;
    const deltaY = dragStartY - event.clientY;
    
    // Calculate window dimensions for percentage conversion
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Convert pixel movement to percentage of viewport
    const deltaRightPercent = (deltaX / windowWidth) * 100;
    const deltaBottomPercent = (deltaY / windowHeight) * 100;
    
    // Update the image position (make a new array to trigger reactivity)
    collageImages = collageImages.map((img, i) => {
      if (i === draggedImageIndex) {
        return {
          ...img,
          right: Math.max(0, Math.min(100, initialRight + deltaRightPercent)),
          bottom: Math.max(0, Math.min(100, initialBottom + deltaBottomPercent))
        };
      }
      return img;
    });
  }

  function endDrag() {
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

  // Reference to the contact form section
  let contactFormRef: HTMLElement;

  // Function to scroll to contact form with debug logging
  function scrollToContact() {
    console.log('Scroll to contact triggered');
    
    // Direct implementation using a simple ID-based approach
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      console.log('Contact section found by ID, scrolling...');
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (contactFormRef) {
      console.log('Using ref instead, scrolling...');
      contactFormRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.error('Contact section not found');
    }
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
  <meta name="description" content="Andy Morales - Product Designer specializing in technical products." />
</svelte:head>

<div class="landing-page">
  <main class="container flex-column-left gap-xxl">
    <div class="header flex-column-left gap-large">
        <h1 class="title">Andy<br>Morales</h1>
        <div class="description">
          I lead the design of technical products.
          <br>Fmr at MongoDB, Roblox, ConsenSys, Panto.
        </div>
        <div class="colibri-container">
          <img src={colibri} alt="Colibri" class="colibri-image">
        </div>

      <div class="cta">
        <button class="button-secondary" on:click={toggleContactForm}>Get in touch</button>
      </div>
    </div>

    <!-- Simple collage with randomly placed images that fade in one by one, back to front -->
    <div class="collage">
      {#if collageImages.length > 0 && imagesReady}
        {#each collageImages as img, i}
          {#if visibleImages.includes(i)}
            <img 
              src={img.src} 
              alt={img.alt} 
              class="collage-image" 
              in:fade={{ duration: 400 }}
              on:mousedown={(e) => {
                startDrag(e, i);
                bringToFront(i);
              }}
              style="
                width: {img.width}px;
                height: {img.height}px;
                right: {img.right}%; 
                bottom: {img.bottom}%; 
                transform: rotate({img.rotation}deg);
                z-index: {img.zIndex};
                {img.flexShrink !== undefined ? `flex-shrink: ${img.flexShrink};` : ''}
                {img.aspectRatio ? `aspect-ratio: ${img.aspectRatio};` : ''}
              "
            >
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
  }

  .colibri-container {
    position: absolute;
    top: -28.25%;
    right: -0.5%;
    transform: scale(0.5);
    z-index: 2;
  }

  .title {
    font-family: Refract;
    font-size: 128px;
    font-style: normal;
    font-weight: 400;
    line-height: 102px; /* 79.688% */
    letter-spacing: -1.28px;
    font-feature-settings: 'dlig' on, 'ss01' on;
    position: relative;
    z-index: 2;
  }

  .description {
    font-family: Recursive;
    font-size: 24px;
    font-style: normal;
    font-weight: 370;
    line-height: 24px;
    letter-spacing: 0.28px;
    font-variation-settings: 'CASL' 0;
    position: relative;
    z-index: 2;
  }

  .portfolio-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    font-family: 'Recursive', sans-serif;
    font-variation-settings: 'CASL' 0;
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
    font-family: 'Recursive', sans-serif;
    padding-left: 0;
    padding-bottom: 0;
    margin-bottom: 0;
  }

  .portfolio-header:hover h2 {
    color: var(--interactive-hover);
  }

  .portfolio-header h2 {
    color: #363636;
    font-family: 'Recursive', sans-serif;
    font-size: 18px;
    font-style: normal;
    font-weight: 370;
    line-height: 18px; /* 240% */
    letter-spacing: 0.4px;
    text-decoration-line: underline;
    margin: 0;
    transition: color var(--transition);
    font-variation-settings: 'CASL' 0;
  }

  .portfolio-item {
    position: relative;
    z-index: 5;
  }

  .portfolio-content {
    padding: 1rem;
    font-family: 'Recursive', sans-serif;
    font-weight: 400;
    position: relative;
    z-index: 5;
    background-color: var(--bg-color);
  }

  .portfolio-content p {
    font-size: 16px;
    font-family: 'Recursive', sans-serif;
    font-weight: 400;
  }

  .collage {
    position: fixed;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    overflow: visible;
    pointer-events: none;
  }

  .collage-image {
    position: absolute;
    object-fit: contain;
    transition: transform 0.7s ease;
    filter: opacity(1);
    cursor: grab;
    user-select: none;
    pointer-events: auto;
  }
  
  .collage-image:active {
    cursor: grabbing;
    transition: none; /* Disable transition during drag for smoother movement */
  }
  
  /* Contact section styling */
  .contact-section {
    scroll-margin-top: 2rem;
    min-height: 50vh;
    padding-top: 4rem;
    margin-top: 4rem;
    position: relative;
    z-index: 10; /* Ensure it's above the collage */
    display: block; /* Ensure it's displayed */
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

  @media (max-width: 768px) {
    .portfolio-header h2 {
      font-size: 1.5rem;
    }
  }

  /* Make site responsive on small screens */
  @media (max-width: 576px) {
    .title {
      font-size: 72px;
      line-height: 60px;
    }
    
    .description {
      font-size: 1rem;
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
</style> 