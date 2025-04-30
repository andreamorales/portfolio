<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import Label from '$lib/components/ui/input/Label.svelte';
  import colibri from '$lib/images/colibri.png';
  import ImageCollage from '$lib/components/ImageCollage.svelte';
  
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

  // Import Lucide pointer icon
  import { Pointer } from 'lucide-svelte';

  // Import the new PortfolioExpandedView component
  import PortfolioExpandedView from '$lib/components/portfolio/PortfolioExpandedView.svelte';

  // Import QuickNav component
  import QuickNav from '$lib/components/portfolio/QuickNav.svelte';

  // Import the new Toast component
  import Toast from '$lib/components/ui/Toast.svelte';
  
  // Portfolio items
  let portfolioItems = [
    { 
      title: 'MongoDB: Realm Schema', 
      tags: ['UX/UI'],
      expanded: false,
      description: "Reimagined MongoDB's Realm Schema designer with a focus on enhancing developer experience through intuitive UI and streamlined workflows.",
      videoUrl: "/videos/mongodb-realm-demo.mp4",
      images: [
        { src: "/images/portfolio/mongodb/preview1.jpg", alt: "Realm Schema Designer", caption: "Main interface showing relationship mapping" },
        { src: "/images/portfolio/mongodb/preview2.jpg", alt: "Schema details", caption: "Field type configuration with validation settings" }
      ],
      content: [
        { type: "text", value: "The MongoDB Realm Schema project involved redesigning the database schema interface to make it more intuitive for developers. I focused on streamlining the workflow for creating data models and relationships." },
        { type: "image", value: "/images/portfolio/mongodb/detail1.jpg", caption: "Early wireframe explorations of the interface" },
        { type: "text", value: "A key challenge was balancing technical functionality with visual clarity. The final design introduced a visual relationship map that dynamically updates as schemas evolve." }
      ],
      // New project details
      year: "2022",
      role: "Lead Designer",
      projectLength: "6 month project",
      metrics: [
        "25% increase in dev productivity",
        "98% user satisfaction score",
        "12% decrease in support tickets"
      ]
    },
    { 
      title: 'Ducky: Full Product', 
      tags: ['UX/UI', 'FRONTEND'],
      expanded: false,
      description: "Ducky is a productivity application helping teams manage projects efficiently through customizable workflows and real-time collaboration.",
      videoUrl: "/videos/ducky-product-demo.mp4",
      images: [
        { src: "/images/portfolio/ducky/preview1.jpg", alt: "Ducky Dashboard", caption: "Team dashboard showing active projects" },
        { src: "/images/portfolio/ducky/preview2.jpg", alt: "Task Management", caption: "Drag-and-drop task management interface" }
      ],
      content: [
        { type: "text", value: "Ducky was designed to solve common project management pain points by combining the visual clarity of kanban with the structured approach of traditional PM tools." },
        { type: "image", value: "/images/portfolio/ducky/detail1.jpg", caption: "User journey map highlighting key touchpoints" },
        { type: "text", value: "I led both design and frontend development, implementing the UI with React and handling real-time updates via WebSockets. The design system was built to accommodate future scaling with consistent components." }
      ],
      // New project details
      year: "2021",
      role: "Lead Designer & Frontend Dev",
      projectLength: "3 month project",
      metrics: [
        "25% increase in sales",
        "2% decrease in UX problems",
        "Another metric"
      ]
    },
    { 
      title: 'FireHydrant: Design System', 
      tags: ['UX/UI'],
      expanded: false,
      description: "Created a comprehensive design system for FireHydrant's incident management platform, increasing design consistency and development efficiency.",
      videoUrl: "/videos/firehydrant-design-system.mp4",
      images: [
        { src: "/images/portfolio/firehydrant/preview1.jpg", alt: "Component Library", caption: "Core component library overview" },
        { src: "/images/portfolio/firehydrant/preview2.jpg", alt: "Design Tokens", caption: "Color system and design tokens" }
      ],
      content: [
        { type: "text", value: "The FireHydrant design system project addressed inconsistencies across their incident management platform by establishing a unified component library and design guidelines." },
        { type: "image", value: "/images/portfolio/firehydrant/detail1.jpg", caption: "Before and after comparison showing UI improvements" },
        { type: "text", value: "The system included comprehensive documentation, Figma component libraries, and coded components that reduced development time by 40% for new features." }
      ],
      // New project details
      year: "2020",
      role: "Design Systems Architect",
      projectLength: "9 month project",
      metrics: [
        "40% reduction in dev time",
        "85% component adoption rate",
        "22% faster onboarding"
      ]
    },
    { 
      title: 'Roblox: Creator Hub', 
      tags: ['UX/UI'],
      expanded: false,
      description: "Redesigned Roblox's Creator Hub to empower developers with better analytics, community engagement tools, and monetization options.",
      videoUrl: "/videos/roblox-creator-hub.mp4",
      images: [
        { src: "/images/portfolio/roblox/preview1.jpg", alt: "Analytics Dashboard", caption: "Game performance analytics" },
        { src: "/images/portfolio/roblox/preview2.jpg", alt: "Asset Management", caption: "Creator asset management interface" }
      ],
      content: [
        { type: "text", value: "The Roblox Creator Hub redesign focused on giving developers deeper insights into their games and better tools to engage with their communities." },
        { type: "image", value: "/images/portfolio/roblox/detail1.jpg", caption: "User testing session analyzing key painpoints" },
        { type: "text", value: "Through extensive user research with Roblox developers, we identified key pain points and opportunities. The new design centralizes the most-used features while providing powerful new tools for monetization and community management." }
      ],
      // New project details
      year: "2021",
      role: "Senior Product Designer",
      projectLength: "4 month project",
      metrics: [
        "17% increase in creator retention",
        "42% more time in analytics tools",
        "4.8/5 average user satisfaction"
      ]
    },
    { 
      title: 'Panto: Full Product', 
      tags: ['UX/UI', 'FRONTEND'],
      expanded: false,
      description: "Panto is a design collaboration platform that bridges the gap between designers and developers with automated handoff and version control.",
      videoUrl: "/videos/panto-demo.mp4",
      images: [
        { src: "/images/portfolio/panto/preview1.jpg", alt: "Design Interface", caption: "Main collaborative design interface" },
        { src: "/images/portfolio/panto/preview2.jpg", alt: "Code Generation", caption: "Automated code generation from designs" }
      ],
      content: [
        { type: "text", value: "Panto was built to solve the designer-developer handoff problem by creating a collaborative environment where designs automatically generate usable code components." },
        { type: "image", value: "/images/portfolio/panto/detail1.jpg", caption: "System architecture diagram" },
        { type: "text", value: "I was responsible for the full product lifecycle, from initial concept through design, development and launch. The platform uses a component-based approach that maintains design fidelity while producing clean, maintainable code." }
      ],
      // New project details
      year: "2023",
      role: "Design Lead & Frontend Engineer",
      projectLength: "8 month project",
      metrics: [
        "68% reduction in handoff issues", 
        "3.1x faster implementation time",
        "86% component reuse rate" 
      ]
    },
    { 
      title: 'La Güila Toys: Full Product', 
      tags: ['TOY DESIGN'],
      expanded: false,
      description: "La Güila Toys is a line of educational toys designed to help children learn about ecology and sustainability through play.",
      videoUrl: "/videos/laguila-product-showcase.mp4",
      images: [
        { src: "/images/portfolio/laguila/preview1.jpg", alt: "Toy Collection", caption: "Complete product line overview" },
        { src: "/images/portfolio/laguila/preview2.jpg", alt: "Packaging Design", caption: "Sustainable packaging design" }
      ],
      content: [
        { type: "text", value: "La Güila Toys focuses on eco-friendly materials and designs that teach environmental concepts in an engaging way. Each toy is made from sustainable materials and designed to spark curiosity about the natural world." },
        { type: "image", value: "/images/portfolio/laguila/detail1.jpg", caption: "Initial sketches and prototypes" },
        { type: "text", value: "The design process involved extensive research into sustainable materials, child development principles, and creating engaging ways to introduce complex ecological concepts through play." }
      ],
      // New project details
      year: "2019",
      role: "Product Designer",
      projectLength: "12 month project",
      metrics: [
        "95% recycled materials used",
        "12,500+ units sold in year one",
        "Featured in 3 major design awards"
      ]
    },
    { 
      title: 'Torch: Full Product', 
      tags: ['GAME DESIGN'],
      expanded: false,
      description: "Torch is a narrative-driven adventure game that explores themes of light and darkness in both gameplay mechanics and storytelling.",
      videoUrl: "/videos/torch-gameplay.mp4",
      images: [
        { src: "/images/portfolio/torch/preview1.jpg", alt: "Game Environment", caption: "In-game environment showcasing lighting effects" },
        { src: "/images/portfolio/torch/preview2.jpg", alt: "Character Design", caption: "Main character concept art and modeling" }
      ],
      content: [
        { type: "text", value: "Torch was designed as an immersive experience where light serves as both a gameplay mechanic and narrative device. Players use their torch to navigate dark environments, solve puzzles, and interact with the world." },
        { type: "image", value: "/images/portfolio/torch/detail1.jpg", caption: "Light mechanic prototype testing" },
        { type: "text", value: "I served as lead game designer, developing the core mechanics, narrative structure, and visual direction. The game uses dynamic lighting as its central interaction model, creating both challenge and atmosphere." }
      ],
      // New project details
      year: "2022",
      role: "Lead Game Designer",
      projectLength: "18 month project",
      metrics: [
        "92% positive player reviews",
        "Average 4.2hr play session length",
        "Featured by IGN & GameSpot"
      ]
    }
  ];

  // Track which portfolio items are expanded
  let expandedItems: Array<{id: number, title: string, thumbnail?: string}> = [];
  
  // Create an array of all portfolio items for QuickNav
  $: allNavigationItems = portfolioItems.map((item, index) => {
    const thumbnail = item.images && item.images.length > 0 
      ? item.images[0].src 
      : undefined;
    
    return {
      id: index,
      title: item.title,
      thumbnail,
      expanded: item.expanded
    };
  });

  // Function to toggle expansion of portfolio items
  function toggleExpand(index: number, fromQuickNav: boolean = false) {
    // Create a copy of the portfolio items array
    const updatedPortfolioItems = [...portfolioItems];
    
    if (fromQuickNav && updatedPortfolioItems[index].expanded) {
      // If it's already expanded and we're clicking from QuickNav,
      // just scroll to it without toggling
      scrollToItem(index);
      return;
    }
    
    // Toggle the expanded state
    updatedPortfolioItems[index].expanded = !updatedPortfolioItems[index].expanded;
    
    // Update the portfolioItems array to trigger reactivity
    portfolioItems = updatedPortfolioItems;
    
    // Update the list of expanded items for QuickNav
    if (updatedPortfolioItems[index].expanded) {
      // Add to expanded items
      const thumbnail = updatedPortfolioItems[index].images && updatedPortfolioItems[index].images.length > 0 
        ? updatedPortfolioItems[index].images[0].src 
        : undefined;
        
      expandedItems = [...expandedItems, {
        id: index,
        title: updatedPortfolioItems[index].title,
        thumbnail
      }];
      
      scrollToItem(index);
    } else {
      // Remove from expanded items
      expandedItems = expandedItems.filter(item => item.id !== index);
    }
  }

  // Helper function to scroll to an item
  function scrollToItem(index: number) {
    setTimeout(() => {
      const element = document.getElementById(`portfolio-content-${index}`);
      if (element) {
        // Get the element's position
        const elementRect = element.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        // Add offset to show the title (adjust this value as needed)
        const offset = 100;
        const scrollToY = absoluteElementTop - offset;
        
        // Scroll with offset
        window.scrollTo({
          top: scrollToY,
          behavior: 'smooth'
        });
      }
    }, 100);
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

  // Add image lock tracking to collage images
  let imageLocks: Record<number, string> = {}; // Map of image index to cursor ID

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
      height: 340, // Reduced height to match visible content
      zIndex: 8, 
      aspectRatio: "1/1", // Corrected aspect ratio to be more square
      // Owl is more compact than the transparent areas suggest
      contentOffsets: { top: 5, right: 10, bottom: 5, left: 5 }
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
      height: 460, // Reduced height to match visible content
      zIndex: 11, 
      aspectRatio: "400/460", // Adjusted aspect ratio to better match visible content
      // Snake has content in center-right, but with less empty space
      contentOffsets: { top: 5, right: 5, bottom: 15, left: 10 }
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
    // { 
    //   src: flowers, 
    //   alt: "Flowers", 
    //   width: 400, 
    //   height: 500, 
    //   zIndex: 2, 
    //   aspectRatio: "400/500",
    //   contentOffsets: { top: 10, right: 10, bottom: 10, left: 10 }
    // },
    // { 
    //   src: bobo, 
    //   alt: "Bobo", 
    //   width: 300, 
    //   height: 400, 
    //   zIndex: 4, 
    //   aspectRatio: "300/400",
    //   contentOffsets: { top: 10, right: 10, bottom: 10, left: 10 }
    // }
  ];

  // Function to generate random positions but ensure desktop images are on right side
  function generateRandomPositions() {
    // Calculate a scale factor based on viewport width
    const viewportWidth = window.innerWidth;
    let scaleFactor = 1;
    const isMobile = viewportWidth <= 768;
    
    // Determine which images to use based on screen size
    let imagesToUse = [...imageDimensions];
    
    // Add additional images for large screens
    if (viewportWidth > 1920) {
      imagesToUse = [...imageDimensions, ...largeScreenImages];
      scaleFactor = viewportWidth / 1920; // Scale up proportionally for large screens
    } else if (viewportWidth < 768) {
      // Mobile layout logic (unchanged)
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
      
      // Define viewport margin for mobile
      const mobileMargin = 3;
      
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
        
        // Check if this is one of our special images for custom positioning
        const isOwl = img.alt === 'Owl' || (typeof img.alt === 'string' && img.alt.includes('owl'));
        const isSnake = img.alt === 'Snake' || (typeof img.alt === 'string' && img.alt.includes('snake'));
        
        // Force special images to specific positions on mobile
        if (isOwl) {
          // Position owl lower in the container to ensure it's fully visible
          return {
            ...img,
            right: 40, // Position from right (percentage)
            bottom: 70, // INCREASED bottom value to position the owl lower on screen
            rotation: Math.random() * 10 - 5, // Slight random rotation
            zIndex: sortedBySize.length - i // Stack from back to front
          };
        }
        
        // Special positioning for snake
        if (isSnake) {
          // Position snake on the right side, ensuring it's fully visible
          return {
            ...img,
            right: 70, // Position further right (percentage)
            bottom: 50, // Position in the middle vertically
            rotation: Math.random() * 8 - 4, // Slight random rotation
            zIndex: sortedBySize.length - i // Stack from back to front
          };
        }
        
        // For all other images, use normal positioning
        // Calculate final position ensuring images stay within bounds and respect margins
        const mobileTopMargin = mobileMargin; // Standard margin for non-owl images
        
        const right = Math.min(usableWidth - mobileMargin, Math.max(mobileMargin, baseRight + randomRight));
        const bottom = Math.min(usableHeight - mobileMargin, Math.max(mobileTopMargin + imageHeightPercent, baseBottom + randomBottom));
        
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
    
    // FIXED POSITIONING FOR DESKTOP: Force images to stay on right side
    // Define the area bounds with proper margin constraints
    const viewportMargin = 3;  // Same margin value used in drag handlers
    
    // FIXED: Use right side positioning only - restrict positioning to right 45% of screen
    const rightSideStart = 55; // Starting at 55% from left edge (right side only)
    const rightMin = viewportMargin;   // minimum distance from right edge
    const rightMax = 40;  // maximum distance from right edge (Ensure images stay in the right 40% zone)
    const bottomMin = viewportMargin;  // minimum distance from bottom edge (controls top margin)
    const bottomMax = 80; // maximum distance from bottom edge
    
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
      
      // FIXED: Ensure the spiral center is on the right side
      // Custom angle with different patterns per image for more unique positions
      const spiralIndex = index;
      const baseAngle = spiralIndex * 0.75; // Basic spiral pattern
      
      // Add irregularity to the spiral - make it less mathematically perfect
      const angleVariation = (spiralIndex % 3) * 0.2; // Changes angle pattern every 3 images
      const angle = baseAngle + angleVariation + (Math.random() * 0.3);
      
      // Radius that varies based on image properties, not just index
      const sizeBasedOffset = (imgData.width / 100) * 0.5; // Larger images get more space
      const radius = 5 + (spiralIndex * 2.8) + sizeBasedOffset;
      
      // FIXED: Center point of spiral is firmly on right side of the screen
      // Move center point to the right side of the screen
      const centerRight = rightMin + (areaWidth / 2);
      const centerBottom = bottomMin + (areaHeight / 2);
      
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
      
      // Calculate image height percentage
      const imageHeightPercent = (imgData.height / window.innerHeight) * 100;
      
      // Special handling for certain images - force them to positions where they're fully visible
      const isOwl = imgData.alt === "Owl";
      const isSnake = imgData.alt === "Snake";
      
      // Force the owl to a specific position rather than relying on calculations
      if (isOwl) {
        // FIXED: Position owl firmly on the right side of the screen
        return {
          ...imgData,
          right: 20, // Position from right edge (percentage) - closer to right edge
          bottom: 60, // Distance from bottom (percentage)
          rotation: Math.random() * 8 - 4, // Slight random rotation between -4 and 4 degrees
          aspectRatio: imgData.aspectRatio
        };
      }
      
      // Special positioning for the snake
      if (isSnake) {
        // FIXED: Position snake more firmly on the right side
        return {
          ...imgData,
          right: 30, // Position closer to right edge (percentage)
          bottom: 40, // Position in the middle vertically
          rotation: Math.random() * 8 - 4, // Slight random rotation
          aspectRatio: imgData.aspectRatio
        };
      }
      
      // FIXED: Force all images to stay on the right side by restricting the 'right' value
      // Keep right values higher (which places images more to the right)
      return {
        ...imgData,
        right: Math.max(rightMin + 5, Math.min(rightMax - 5, right + extraOffsetRight)),
        bottom: Math.max(bottomMin + imageHeightPercent, Math.min(bottomMax, bottom + extraOffsetBottom)),
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
            const mobileMargin = 3; // Define margin for mobile
            
            return {
              ...img,
              right: Math.max(
                mobileMargin,
                Math.min(100 - mobileMargin - imageWidthPercent, newRight)
              ),
              bottom: Math.max(
                mobileMargin + imageHeightPercent,  // Add image height to prevent going above top margin
                Math.min(100 - mobileMargin - imageHeightPercent, newBottom)
              )
            };
          } else {
            // For desktop, use the existing viewport margin logic
            const viewportMargin = 3;
            const imageWidthPercent = (img.width / window.innerWidth) * 100;
            const imageHeightPercent = (img.height / window.innerHeight) * 100;
            
            return {
              ...img,
              right: Math.max(
                viewportMargin,
                Math.min(100 - viewportMargin - imageWidthPercent, newRight)
              ),
              bottom: Math.max(
                viewportMargin + imageHeightPercent,  // Add image height to prevent going above top margin
                Math.min(100 - viewportMargin, newBottom)  // Add bottom margin constraint
              )
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
      
      // Release the lock on this image
      if (draggedImageIndex !== null) {
        delete imageLocks[draggedImageIndex];
      }
      
      draggedImageIndex = null;
    };

    // Add resize and touch event handlers
    window.addEventListener('resize', handleResize);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    
    (async () => {
      try {
        // First preload all images
        await preloadImages();
        
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
          
          document.querySelector(':root')?.classList.add('mounted');
          
          // Add a class to the body when javascript is available
          document.body.classList.add('js-enabled');
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
    
    // Check if this image is already being dragged by a cursor
    if (imageLocks[index]) {
      // Image is locked, can't drag it
      return;
    }
    
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
          const mobileMargin = 3; // Define margin for mobile
          
          return {
            ...img,
            right: Math.max(
              mobileMargin,
              Math.min(100 - mobileMargin - imageWidthPercent, newRight)
            ),
            bottom: Math.max(
              mobileMargin + imageHeightPercent,  // Add image height to prevent going above top margin
              Math.min(100 - mobileMargin - imageHeightPercent, newBottom)
            )
          };
        } else {
          // For desktop, use the existing viewport margin logic
          const viewportMargin = 3;
          const imageWidthPercent = (img.width / window.innerWidth) * 100;
          const imageHeightPercent = (img.height / window.innerHeight) * 100;
          
          return {
            ...img,
            right: Math.max(
              viewportMargin,
              Math.min(100 - viewportMargin - imageWidthPercent, newRight)
            ),
            bottom: Math.max(
              viewportMargin + imageHeightPercent,  // Add image height to prevent going above top margin
              Math.min(100 - viewportMargin, newBottom)  // Add bottom margin constraint
            )
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

  // Add toast state
  let showToast = false;
  let toastMessage = '';
  
  // Keep the showContactForm variable for backward compatibility
  let showContactForm = false;
  
  // Replace the contact form toggle with the copy email function
  function copyEmailToClipboard() {
    const email = 'andreamoralescoto@gmail.com';
    
    // Use the clipboard API to copy the email
    navigator.clipboard.writeText(email)
      .then(() => {
        // Show success toast
        toastMessage = 'Email copied!';
        showToast = true;
      })
      .catch(err => {
        // Show error toast if copying failed
        console.error('Failed to copy email: ', err);
        toastMessage = 'Failed to copy email';
        showToast = true;
      });
  }
  
  // Legacy function for backward compatibility - now copies email instead
  function toggleContactForm() {
    // Just call our new function instead
    copyEmailToClipboard();
    
    // Toggle showContactForm for compatibility but don't actually show the form
    showContactForm = false;
  }

  // Add fake cursor state with new properties
  let fakeCursors: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    color: string;
    isDragging: boolean;
    isMovingToTarget: boolean;
    targetImage: number | null;
    targetX: number;
    targetY: number;
    destinationX: number;
    destinationY: number;
    delayCount: number;
    lastVelocity?: number;
    dragStartTime?: number;
    curveOffsetX: number;
    curveOffsetY: number;
    timeFactor: number;
    randomOffset: { x: number; y: number };
    offsetX: number;
    offsetY: number;
    rotation: number;
    originX: number;
    originY: number;
    holdDuration: number;
  }> = [];

  // Handler for updating fakeCursors from the component
  function updateFakeCursors(cursors: any[]) {
    fakeCursors = cursors;
  }

  // Add fake user colors
  const fakeUserColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 'var(--cursor-yellow)', '#D4A5A5', '#9B59B6', '#3498DB'
  ];

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
      holdDuration: 0
    };
  }

  // Initialize with one cursor
  onMount(() => {
    // Create initial cursor
    fakeCursors = [createFakeCursor()];
  });

  // Function to get debug border style for images being moved by cursors
  function getDebugBorderStyle(imageIndex: number, cursors: Array<any>): string {
    // Find a cursor that's dragging this image
    const draggingCursor = cursors.find(cursor => cursor.isDragging && cursor.targetImage === imageIndex);
    
    if (draggingCursor) {
      // Return a visible border style with the cursor's color
      return `
        box-shadow: 0 0 0 4px ${draggingCursor.color}, 0 0 0 6px rgba(255,255,255,0.5);
        border-radius: 2px;
      `;
    }
    
    return '';
  }

  let mounted = false;

  onMount(() => {
    // Small delay to ensure everything is ready
    setTimeout(() => {
      mounted = true;
    }, 0);
  });
</script>

<svelte:head>
  <title>Andy Morales | Product Designer</title>
  <meta name="description" content="Andy Morales - Product designer for creative tools." />
</svelte:head>

<!-- Add the toast component at the top level of the template -->
<Toast message={toastMessage} bind:visible={showToast} />

<div class="landing-page">
  <main class="container flex-column-left">
    {#if mounted}
      <div class="header flex-column-left gap-large">
        <div class="title-container" in:fade={{ duration: 600, delay: 200 }}>
          <h1 class="title">Andy<br>Morales</h1>
          <div class="colibri-container">
            <img src={colibri} alt="Colibri" class="colibri-image">
          </div>
        </div>
        <div class="flex-column-left gap-small" in:fade={{ duration: 600, delay: 400 }}>
          <div class="description">
            I lead the design of creative and technical products.
          </div>
          <div class="company-logos">
            <span in:fade={{ duration: 400, delay: 600 }}>
              {@html Consensys}
            </span>
            <span in:fade={{ duration: 400, delay: 750 }}>
              {@html MongoDB}
            </span>
            <span in:fade={{ duration: 400, delay: 900 }}>
              {@html Roblox}
            </span>
            <span in:fade={{ duration: 400, delay: 1050 }}>
              {@html panto}
            </span>
          </div>
        </div>

        <div class="cta" in:fade={{ duration: 600, delay: 1200 }}>
          <button class="button-secondary" on:click={toggleContactForm}>Get in touch</button>
        </div>
      </div>

      <!-- Replace the desktop and mobile collage sections with our new component -->
      <ImageCollage 
        {imageDimensions}
        {largeScreenImages}
        {fakeCursors}
        onFakeCursorsUpdate={updateFakeCursors}
      >
        <svelte:fragment slot="drag-hint">
          <Pointer size={36} />
        </svelte:fragment>
      </ImageCollage>

      <div class="portfolio-list" in:fade={{ duration: 600, delay: 1400 }}>
        {#each portfolioItems as item, index (item.title)}
          {#if mounted}
            <div class="portfolio-item" in:fade={{ duration: 300, delay: 1400 + (index * 150) }}>
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
                <div 
                  id={`portfolio-content-${index}`} 
                  class="portfolio-content"
                  transition:fade={{ duration: 300 }}
                >
                  <PortfolioExpandedView
                    title={item.title}
                    description={item.description}
                    videoUrl={item.videoUrl}
                    images={item.images}
                    content={item.content}
                    year={item.year}
                    role={item.role}
                    projectLength={item.projectLength}
                    metrics={item.metrics}
                    heroImage={item.title.includes('MongoDB') ? '/images/portfolio/mongodb/hero.jpg' : 
                              item.title.includes('Roblox') ? '/images/portfolio/roblox/hero.png' :
                              item.title.includes('FireHydrant') ? '/images/portfolio/firehydrant/hero.png' : ''}
                  />
                </div>
              {/if}
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  </main>
</div>

<!-- Keep this for compatibility but make it not render anything -->
{#if showContactForm}
  <!-- Empty block, doesn't render anything -->
{/if}

<!-- Add QuickNav component at the end of the template -->
<QuickNav 
  items={allNavigationItems} 
  hasExpandedItem={expandedItems.length > 0} 
  onExpandItem={toggleExpand}
/>

<style>
  .landing-page {
    min-height: 100vh;
    background-color: var(--bg-color);
    color: var(--text-color);
    padding: 4.5rem;
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
  }

  .company-logos span {
    display: flex;
    align-items: center;
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
    height: 15px; /* Roblox: smaller than mobile default */
  }

  .company-logos :global(svg:last-child) {
    height: 20px; /* Panto: full size */
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
    background-color: transparent;
    border: none;
    width: 100%;
    font-family: var(--font-recursive);
    padding: var(--spacing-xs) var(--spacing-sm) var(--spacing-xs) 0;
    margin: 0;
    text-align: left;
    gap: var(--spacing-md);
    border-radius: 4px;
  }

  .portfolio-header:hover h2 {
    opacity: 0.8;
  }

  .portfolio-header h2 {
    color: #363636;
    font-family: var(--font-recursive);
    font-size: 18px;
    font-style: normal;
    font-weight: 370;
    line-height: 18px;
    letter-spacing: 0.4px;
    text-decoration-line: underline;
    margin: 0;
    transition: opacity var(--transition);
    font-variation-settings: 'CASL' 0, 'wght' 370;
    background-color: var(--bg-color);
    padding: var(--spacing-xxs) var(--spacing-xs);
    border-radius: 2px;
  }

  .portfolio-item {
    position: relative;
    z-index: 5;
  }

  .portfolio-content {
    font-family: var(--font-recursive);
    font-weight: 400;
    font-variation-settings: 'CASL' 0, 'wght' 400;
    position: relative;
    z-index: 5;
    background-color: var(--bg-color);
    border: 1px solid var(--grey-darker);
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }
  
  /* Ensure the PortfolioExpandedView has consistent width in both views */
  .portfolio-content > :global(*) {
    width: 100%;
    max-width: 100%;
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

  @media (max-width: 768px) {
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
</style>
