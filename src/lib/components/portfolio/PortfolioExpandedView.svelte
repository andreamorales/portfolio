<script lang="ts">
  import { onMount } from 'svelte';
  
  // Props
  export const title: string = '';
  export let description: string;
  export let videoUrl: string;
  export let images: Array<{src: string, alt: string, caption?: string}> = [];
  export let content: Array<{type: string, value: string, caption?: string, layout?: string, sideImage?: {value: string, caption?: string}}> = [];
  // Remove heroImage prop since we'll use images array
  export let year: string = '';
  export let role: string = '';
  export let link: string = '';
  export let metrics: Array<string> = [];
  export let team: Array<{role: string, name: string, relationship: string}> = [];
  
  // Initialize the featuredImage variable
  let featuredImage: string = '';
  
  // Computed prop for featured image - use first image from images array
  $: {
    if (images && images.length > 0) {
      featuredImage = images[0].src;
    } else {
      featuredImage = '';
    }
  }
  
  // State
  let activeView: 'video' | 'content' = 'content';
  let videoElement: HTMLVideoElement;
  let isVideoLoaded = false;
  // Add state for image zoom
  let zoomedImage: {src: string, alt: string, caption?: string} | null = null;
  
  // Function to switch between views
  function toggleView(view: 'video' | 'content') {
    // If switching to video, play it
    if (view === 'video' && activeView !== 'video' && videoElement) {
      setTimeout(() => {
        videoElement.play().catch(() => {
          // Error handling if needed
        });
      }, 10);
    }
    
    // If switching away from video, pause it
    if (activeView === 'video' && view !== 'video' && videoElement) {
      videoElement.pause();
    }
    
    activeView = view;
  }
  
  // Handle video loaded
  function handleVideoLoaded() {
    isVideoLoaded = true;
  }
  
  // Function to open zoomed image
  function openZoomImage(img: {src: string, alt: string, caption?: string}) {
    zoomedImage = img;
  }
  
  // Function to close zoomed image
  function closeZoomImage() {
    zoomedImage = null;
  }
  
  // Handle escape key to close image
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && zoomedImage) {
      closeZoomImage();
    }
  }
  
  // Add a function to handle image error
  function handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement && imgElement.src.endsWith('.png')) {
      const newSrc = imgElement.src.replace('.png', '.jpg');
      imgElement.src = newSrc;
    }
  }
  
  onMount(() => {
    // Add keydown listener
    window.addEventListener('keydown', handleKeydown);
    
    // Clean up video on component unmount
    return () => {
      if (videoElement) {
        videoElement.pause();
        videoElement.removeAttribute('src');
        videoElement.load();
      }
      // Remove keydown listener
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<div class="portfolio-expanded-view flex-column">
  <!-- Project details grid -->
  <div class="project-details-grid">
    <div class="details-row">
      <div class="details-cell">
        <div class="details-label">Year</div>
        <div class="details-value">{year}</div>
      </div>
      <div class="details-cell">
        <div class="details-label">Role</div>
        <div class="details-value">{role}</div>
      </div>
      <div class="details-cell">
        <div class="details-label">Link</div>
        <div class="details-value">
          {#if link === "Discontinued"}
            <span class="discontinued-text">Discontinued</span>
          {:else if link}
            <a href={link} target="_blank" rel="noopener noreferrer" class="project-link">
              View Project
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          {:else}
            <span class="muted-text">Not Available</span>
          {/if}
        </div>
      </div>
    </div>
    <div class="details-row metrics-row">
      {#each metrics.slice(0, 2) as metric}
        <div class="details-cell">
          <div class="details-label">Impact</div>
          <div class="details-value">{metric}</div>
        </div>
      {/each}
      <div class="details-cell">
        <div class="details-label">Team</div>
        <div class="details-value team-list">
          {#if team && team.length > 0}
            {#each team as member}
              <div class="team-member">
                <span class="role">{member.role}:</span>
                <span class="name">{member.name}</span>
                <span class="relationship">({member.relationship})</span>
              </div>
            {/each}
          {:else}
            <span class="muted-text">Solo project</span>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Description now between grid and hero -->
  <div class="hero-description-container">
    <div class="hero-description">
      {#each description.split('. ') as line}
        <span class="highlight-line">{line}{line.endsWith('.') ? '' : '.'} </span>
      {/each}
    </div>
  </div>

  <!-- Featured hero image -->
  {#if featuredImage}
    <div class="hero-image-container">
      <button 
        class="image-button"
        on:click={() => openZoomImage({src: featuredImage, alt: title})}
        on:keydown={(e) => e.key === 'Enter' && openZoomImage({src: featuredImage, alt: title})}
        aria-label="Zoom hero image"
      >
        <img 
          src={featuredImage} 
          alt={title} 
          class="hero-image clickable-image" 
          on:error={handleImageError}
        />
      </button>
    </div>
  {/if}

  <!-- Content sections -->
  <div class="content-container flex-column">
    <!-- Video View -->
    {#if activeView === 'video'}
      <div class="video-container width-100">
        {#if videoUrl}
          <video 
            bind:this={videoElement}
            on:loadeddata={handleVideoLoaded}
            controls
            preload="auto"
            class:loaded={isVideoLoaded}
          >
            <source src={videoUrl} type="video/mp4">
            <track kind="captions" src="" label="English" srclang="en" default>
            Your browser doesn't support video playback.
          </video>
          
          {#if !isVideoLoaded}
            <div class="video-loading">
              <span class="loading-spinner"></span>
              <span>Loading video...</span>
            </div>
          {/if}
        {:else}
          <div class="video-unavailable">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="23" y1="1" x2="1" y2="23"></line>
              <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56"></path>
            </svg>
            <p>Video unavailable for this project</p>
          </div>
        {/if}
      </div>
    {:else}
      <!-- Text & Images View -->
      <div class="content-view width-100">
        <!-- Content blocks (text and images) -->
        <div class="content-blocks">
          {#each content as block}
            {#if block.type === 'text'}
              <div class="text-block">
                <p>{block.value}</p>
              </div>
            {:else if block.type === 'image'}
              <div class="image-block {block.layout === 'side-by-side' ? 'side-by-side' : ''}">
                {#if block.layout === 'side-by-side'}
                  <div class="image-pair">
                    <div class="image-container">
                      <button 
                        class="image-button"
                        on:click={() => openZoomImage({src: block.value, alt: block.caption || 'Project image', caption: block.caption})}
                        on:keydown={(e) => e.key === 'Enter' && openZoomImage({src: block.value, alt: block.caption || 'Project image', caption: block.caption})}
                        aria-label="Zoom image"
                      >
                        <img 
                          src={block.value} 
                          alt={block.caption || 'Project image'} 
                          class="clickable-image"
                        />
                      </button>
                      {#if block.caption}
                        <p class="image-caption">{block.caption}</p>
                      {/if}
                    </div>
                    {#if block.sideImage}
                      <div class="image-container">
                        <button 
                          class="image-button"
                          on:click={() => openZoomImage({src: block.sideImage.value, alt: block.sideImage.caption || 'Project image', caption: block.sideImage.caption})}
                          on:keydown={(e) => e.key === 'Enter' && openZoomImage({src: block.sideImage.value, alt: block.sideImage.caption || 'Project image', caption: block.sideImage.caption})}
                          aria-label="Zoom image"
                        >
                          <img 
                            src={block.sideImage.value} 
                            alt={block.sideImage.caption || 'Project image'} 
                            class="clickable-image"
                          />
                        </button>
                        {#if block.sideImage.caption}
                          <p class="image-caption">{block.sideImage.caption}</p>
                        {/if}
                      </div>
                    {/if}
                  </div>
                {:else}
                  <button 
                    class="image-button"
                    on:click={() => openZoomImage({src: block.value, alt: block.caption || 'Project image', caption: block.caption})}
                    on:keydown={(e) => e.key === 'Enter' && openZoomImage({src: block.value, alt: block.caption || 'Project image', caption: block.caption})}
                    aria-label="Zoom image"
                  >
                    <img 
                      src={block.value} 
                      alt={block.caption || 'Project image'} 
                      class="clickable-image"
                    />
                  </button>
                  {#if block.caption}
                    <p class="image-caption">{block.caption}</p>
                  {/if}
                {/if}
              </div>
            {/if}
          {/each}
        </div>
        
        <!-- Image gallery - only show unused images -->
        {#if images.length > 0}
          {@const usedImages = new Set([
            featuredImage, 
            ...content
              .filter(block => block.type === 'image')
              .map(block => block.value)
          ])}
          {@const unusedImages = images.filter(img => !usedImages.has(img.src))}
          {#if unusedImages.length > 0}
            <div class="image-gallery">
              {#each unusedImages as image}
                <div class="gallery-item">
                  <button 
                    class="image-button"
                    on:click={() => openZoomImage(image)}
                    on:keydown={(e) => e.key === 'Enter' && openZoomImage(image)}
                    aria-label="Zoom image"
                  >
                    <img 
                      src={image.src} 
                      alt={image.alt}
                      class="clickable-image"
                    />
                  </button>
                  {#if image.caption}
                    <p class="image-caption">{image.caption}</p>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        {/if}
      </div>
    {/if}
  </div>
</div>

<!-- Image zoom overlay -->
{#if zoomedImage}
  <div class="image-zoom-overlay-wrapper">
    <!-- Use button as the overlay background since it needs click events -->
    <button 
      class="image-zoom-overlay-background"
      on:click={closeZoomImage}
      aria-label="Close image preview"
    ></button>
    <div 
      class="image-zoom-container"
      role="dialog" 
      aria-modal="true"
      aria-label="Image zoom view"
      tabindex="-1"
    >
      <button class="close-button" on:click={closeZoomImage}>×</button>
      <img src={zoomedImage.src} alt={zoomedImage.alt} />
      {#if zoomedImage.caption}
        <p class="image-caption">{zoomedImage.caption}</p>
      {/if}
    </div>
  </div>
{/if}

<style>
  .portfolio-expanded-view {
    width: 800px;
    max-width: 800px;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
    overflow: hidden;
    margin: 0 auto;
    padding: 0;
    border-top: 16px solid var(--text-color);
  }
  
  .content-container {
    width: 800px;
    max-width: 800px;
    display: flex;
    flex-direction: column;
  }
  
  /* Force video and content views to have identical width */
  .video-container, .content-view {
    width: 800px;
    min-width: 800px;
    box-sizing: border-box;
    flex: 1;
    flex-grow: 1;
  }
  
  /* If inside .portfolio-content, apply more specific style */
  :global(.portfolio-content) .video-container,
  :global(.portfolio-content) .content-view {
    width: 800px;
    min-width: 800px;
  }
  
  .video-container {
    position: relative;
    aspect-ratio: 16 / 9;
    background-color: rgba(0, 0, 0, 0.03);
    border-radius: var(--border-radius);
    overflow: hidden;
    padding: 0 1.5rem;
  }
  
  /* .view-toggle {
    display: flex;
    gap: 0;
    justify-content: center;
  }
  
  .toggle-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    margin-right: 4px;
  } */
  
  video {
    width: 100%;
    min-width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  video.loaded {
    opacity: 1;
  }
  
  .video-loading, .video-unavailable {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    color: var(--text-color);
  }
  
  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--grey-lighter);
    border-top-color: var(--cursor-indigo);
    border-radius: var(--border-radius-full);
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .content-view {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
    padding-top: 0;
    padding-bottom: var(--spacing-lg);
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
  }
  
  .content-blocks {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
  }
  
  .text-block {
    font-family: var(--font-family);
    font-size: var(--font-size-base);
    line-height: 1.6;
    font-variation-settings: 'CASL' 0, 'wght' 370;
    width: 100%;
  }
  
  .image-block {
    margin: var(--spacing-md) 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .image-block .image-button {
    width: 100%;
    max-width: 800px;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    display: block;
    position: relative;
  }
  
  .image-block .image-button img {
    width: 100%;
    max-height: 70vh;
    object-fit: contain;
    display: block;
    border-radius: var(--border-radius-sm);
    transform: translateZ(0);
    will-change: transform;
  }
  
  .image-caption {
    font-family: var(--font-family);
    font-size: var(--font-size-sm);
    font-variation-settings: 'CASL' 0, 'wght' 340;
    color: var(--muted-text);
    margin-top: var(--spacing-xs);
    text-align: center;
    max-width: 65ch;
  }
  
  .image-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }
  
  .gallery-item {
    display: flex;
    flex-direction: column;
  }
  
  .gallery-item img {
    width: 100%;
    height: auto;
    border-radius: var(--border-radius-sm);
    aspect-ratio: 16 / 9;
    object-fit: cover;
  }
  
  /* Clickable image styling */
  .clickable-image {
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  
  .clickable-image:hover {
    transform: scale(1.02);
  }
  
  /* Image zoom overlay styling */
  .image-zoom-overlay-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl);
    box-sizing: border-box;
  }
  
  .image-zoom-overlay-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
  }
  
  .image-zoom-container {
    position: relative;
    max-width: 90%;
    max-height: 90%;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1001;
  }
  
  .image-zoom-container img {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: var(--border-radius-sm);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
  
  .image-zoom-container .image-caption {
    color: white;
    max-width: 700px;
    text-align: center;
    margin-top: var(--spacing-md);
  }
  
  .close-button {
    position: absolute;
    top: -40px;
    right: -40px;
    width: 40px;
    height: 40px;
    background-color: transparent;
    border: none;
    color: white;
    font-size: 32px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
  }
  
  @media (max-width: 768px) {
    .text-block {
      font-size: 15px;
    }
    
    .image-gallery {
      grid-template-columns: 1fr;
    }
    
    .portfolio-expanded-view, 
    .content-container, 
    .video-container, 
    .content-view,
    :global(.portfolio-content) .video-container,
    :global(.portfolio-content) .content-view {
      width: 100%;
      min-width: 100%;
      max-width: 100%;
    }
    
    .close-button {
      top: -30px;
      right: 0;
    }
  }
  
  /* Add direct styling to the video container */
  .content-container > .video-container {
    width: 100%; 
    min-width: 100%;
  }
  
  /* Project details grid */
  .project-details-grid {
    width: 100%;
    background-color: transparent;
    font-family: var(--font-family);
  }
  
  .details-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border-bottom: 1px solid var(--black);
  }
  
  .details-cell {
    display: flex;
    flex-direction: column;
    padding: var(--spacing-sm);
    border-right: 1px solid var(--black);
  }

  .details-cell:last-child {
    border-right: none;
  }
  
  .details-label {
    font-size: var(--font-size-xxs);
    color: var(--muted-text);
    font-variation-settings: 'CASL' 0, 'wght' 400;
  }
  
  .details-value {
    font-size: var(--font-size-sm);
    color: var(--text-color);
    font-variation-settings: 'CASL' 0, 'wght' 500;
    word-wrap: break-word;
  }

  /* Make sure the grid is responsive */
  @media (max-width: 600px) {
    .details-row {
      grid-template-columns: 1fr;
    }
    
    .details-cell:not(:last-child) {
      border-right: none;
      border-bottom: 1px solid var(--black);
    }
  }
  
  .image-button {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    display: block;
    width: 100%;
    overflow: visible;
  }
  
  .image-button:focus {
    outline: 2px solid var(--cursor-indigo);
    outline-offset: 2px;
  }
  
  .image-block .image-button {
    border-radius: var(--border-radius-sm);
  }
  
  .image-block img {
    width: 100%;
    max-height: 70vh;
    border-radius: var(--border-radius-sm);
    object-fit: contain;
  }
  
  /* Hero image styling */
  .hero-image-container {
    width: 100%;
    overflow: hidden;
  }
  
  .hero-image-container .image-button {
    width: 100%;
    border: none;
    padding: 0;
    margin: 0;
    background: none;
    cursor: pointer;
    display: block;
  }
  
  /* Hero image */
  .hero-image {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
  }

  /* Add padding to specific content areas instead */
  .content-blocks,
  .image-gallery,
  .video-container {
    padding: 0 1.5rem;
  }

  .project-link {
    color: var(--text-color);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xxs);
    transition: color var(--transition);
  }

  .project-link:hover {
    color: var(--cursor-indigo);
  }

  .muted-text {
    color: var(--muted-text);
    font-style: italic;
  }

  .discontinued-text {
    color: var(--muted-text);
    font-style: italic;
    font-variation-settings: 'CASL' 0, 'wght' 400;
  }

  /* Hero description styling */
  .hero-description-container {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .hero-description {
    width: 100%;
    max-width: 65ch;
    padding: 0 1.5rem;
    font-family: var(--font-family);
    font-size: var(--font-size-lg);
    line-height: 1.3;
    font-variation-settings: 'CASL' 0, 'wght' 400;
    color: var(--text-color);
    text-align: left;
  }

  .highlight-line {
    display: inline;
    line-height: 1.3;
    padding: 0 0.4em;
    background-repeat: no-repeat;
    background-image: 
      linear-gradient(var(--random-angle), rgba(93, 103, 233, 0.15), rgba(93, 103, 233, 0.18)),
      linear-gradient(calc(var(--random-angle) - 0.5deg), rgba(93, 103, 233, 0.12), rgba(93, 103, 233, 0.15));
    background-position: 
      0 62%,
      0 66%;
    background-size: 
      100% 0.5em,
      98% 0.45em;
    -webkit-mask-image: 
      radial-gradient(7px at 92% 65%, transparent 92%, #000 100%),
      radial-gradient(3px at 88% 63%, transparent 93%, #000 100%),
      radial-gradient(5px at 82% 67%, transparent 91%, #000 100%),
      radial-gradient(4px at 75% 64%, transparent 94%, #000 100%),
      radial-gradient(6px at 68% 66%, transparent 92%, #000 100%),
      radial-gradient(3px at 60% 63%, transparent 93%, #000 100%),
      radial-gradient(7px at 52% 67%, transparent 91%, #000 100%),
      radial-gradient(4px at 45% 64%, transparent 94%, #000 100%),
      radial-gradient(5px at 38% 66%, transparent 92%, #000 100%),
      radial-gradient(3px at 30% 63%, transparent 93%, #000 100%),
      radial-gradient(6px at 22% 67%, transparent 91%, #000 100%),
      radial-gradient(4px at 15% 64%, transparent 94%, #000 100%),
      radial-gradient(7px at 8% 66%, transparent 92%, #000 100%),
      radial-gradient(3px at 2% 63%, transparent 93%, #000 100%),
      linear-gradient(#000 0 0);
    mask-image: 
      radial-gradient(7px at 92% 65%, transparent 92%, #000 100%),
      radial-gradient(3px at 88% 63%, transparent 93%, #000 100%),
      radial-gradient(5px at 82% 67%, transparent 91%, #000 100%),
      radial-gradient(4px at 75% 64%, transparent 94%, #000 100%),
      radial-gradient(6px at 68% 66%, transparent 92%, #000 100%),
      radial-gradient(3px at 60% 63%, transparent 93%, #000 100%),
      radial-gradient(7px at 52% 67%, transparent 91%, #000 100%),
      radial-gradient(4px at 45% 64%, transparent 94%, #000 100%),
      radial-gradient(5px at 38% 66%, transparent 92%, #000 100%),
      radial-gradient(3px at 30% 63%, transparent 93%, #000 100%),
      radial-gradient(6px at 22% 67%, transparent 91%, #000 100%),
      radial-gradient(4px at 15% 64%, transparent 94%, #000 100%),
      radial-gradient(7px at 8% 66%, transparent 92%, #000 100%),
      radial-gradient(3px at 2% 63%, transparent 93%, #000 100%),
      linear-gradient(#000 0 0);
  }

  .highlight-line:nth-child(3n + 1) {
    --random-angle: 2.5deg;
    background-size: 
      100% 0.52em,
      97% 0.48em;
    -webkit-mask-image: 
      radial-gradient(8px at 95% 64%, transparent 91%, #000 100%),
      radial-gradient(4px at 90% 66%, transparent 93%, #000 100%),
      radial-gradient(6px at 85% 63%, transparent 92%, #000 100%),
      radial-gradient(3px at 78% 67%, transparent 94%, #000 100%),
      radial-gradient(7px at 70% 64%, transparent 91%, #000 100%),
      radial-gradient(4px at 62% 66%, transparent 93%, #000 100%),
      radial-gradient(6px at 55% 63%, transparent 92%, #000 100%),
      radial-gradient(3px at 48% 67%, transparent 94%, #000 100%),
      radial-gradient(8px at 40% 64%, transparent 91%, #000 100%),
      radial-gradient(4px at 32% 66%, transparent 93%, #000 100%),
      radial-gradient(6px at 25% 63%, transparent 92%, #000 100%),
      radial-gradient(3px at 18% 67%, transparent 94%, #000 100%),
      radial-gradient(7px at 10% 64%, transparent 91%, #000 100%),
      radial-gradient(4px at 5% 66%, transparent 93%, #000 100%),
      linear-gradient(#000 0 0);
    mask-image: 
      radial-gradient(8px at 95% 64%, transparent 91%, #000 100%),
      radial-gradient(4px at 90% 66%, transparent 93%, #000 100%),
      radial-gradient(6px at 85% 63%, transparent 92%, #000 100%),
      radial-gradient(3px at 78% 67%, transparent 94%, #000 100%),
      radial-gradient(7px at 70% 64%, transparent 91%, #000 100%),
      radial-gradient(4px at 62% 66%, transparent 93%, #000 100%),
      radial-gradient(6px at 55% 63%, transparent 92%, #000 100%),
      radial-gradient(3px at 48% 67%, transparent 94%, #000 100%),
      radial-gradient(8px at 40% 64%, transparent 91%, #000 100%),
      radial-gradient(4px at 32% 66%, transparent 93%, #000 100%),
      radial-gradient(6px at 25% 63%, transparent 92%, #000 100%),
      radial-gradient(3px at 18% 67%, transparent 94%, #000 100%),
      radial-gradient(7px at 10% 64%, transparent 91%, #000 100%),
      radial-gradient(4px at 5% 66%, transparent 93%, #000 100%),
      linear-gradient(#000 0 0);
  }

  .highlight-line:nth-child(3n + 2) {
    --random-angle: -1.5deg;
    background-size: 
      99% 0.48em,
      100% 0.5em;
    -webkit-mask-image: 
      radial-gradient(7px at 98% 65%, transparent 92%, #000 100%),
      radial-gradient(4px at 92% 63%, transparent 93%, #000 100%),
      radial-gradient(6px at 85% 67%, transparent 91%, #000 100%),
      radial-gradient(3px at 77% 64%, transparent 94%, #000 100%),
      radial-gradient(8px at 68% 66%, transparent 92%, #000 100%),
      radial-gradient(4px at 60% 63%, transparent 93%, #000 100%),
      radial-gradient(6px at 52% 67%, transparent 91%, #000 100%),
      radial-gradient(3px at 45% 64%, transparent 94%, #000 100%),
      radial-gradient(7px at 38% 66%, transparent 92%, #000 100%),
      radial-gradient(4px at 30% 63%, transparent 93%, #000 100%),
      radial-gradient(6px at 22% 67%, transparent 91%, #000 100%),
      radial-gradient(3px at 15% 64%, transparent 94%, #000 100%),
      radial-gradient(8px at 8% 66%, transparent 92%, #000 100%),
      radial-gradient(4px at 2% 63%, transparent 93%, #000 100%),
      linear-gradient(#000 0 0);
    mask-image: 
      radial-gradient(7px at 98% 65%, transparent 92%, #000 100%),
      radial-gradient(4px at 92% 63%, transparent 93%, #000 100%),
      radial-gradient(6px at 85% 67%, transparent 91%, #000 100%),
      radial-gradient(3px at 77% 64%, transparent 94%, #000 100%),
      radial-gradient(8px at 68% 66%, transparent 92%, #000 100%),
      radial-gradient(4px at 60% 63%, transparent 93%, #000 100%),
      radial-gradient(6px at 52% 67%, transparent 91%, #000 100%),
      radial-gradient(3px at 45% 64%, transparent 94%, #000 100%),
      radial-gradient(7px at 38% 66%, transparent 92%, #000 100%),
      radial-gradient(4px at 30% 63%, transparent 93%, #000 100%),
      radial-gradient(6px at 22% 67%, transparent 91%, #000 100%),
      radial-gradient(3px at 15% 64%, transparent 94%, #000 100%),
      radial-gradient(8px at 8% 66%, transparent 92%, #000 100%),
      radial-gradient(4px at 2% 63%, transparent 93%, #000 100%),
      linear-gradient(#000 0 0);
  }

  .highlight-line:nth-child(3n + 3) {
    --random-angle: 1.8deg;
    background-size: 
      98% 0.5em,
      100% 0.45em;
    -webkit-mask-image: 
      radial-gradient(8px at 96% 66%, transparent 91%, #000 100%),
      radial-gradient(4px at 88% 63%, transparent 93%, #000 100%),
      radial-gradient(6px at 80% 67%, transparent 92%, #000 100%),
      radial-gradient(3px at 72% 64%, transparent 94%, #000 100%),
      radial-gradient(7px at 64% 66%, transparent 91%, #000 100%),
      radial-gradient(4px at 56% 63%, transparent 93%, #000 100%),
      radial-gradient(6px at 48% 67%, transparent 92%, #000 100%),
      radial-gradient(3px at 40% 64%, transparent 94%, #000 100%),
      radial-gradient(8px at 32% 66%, transparent 91%, #000 100%),
      radial-gradient(4px at 24% 63%, transparent 93%, #000 100%),
      radial-gradient(6px at 16% 67%, transparent 92%, #000 100%),
      radial-gradient(3px at 8% 64%, transparent 94%, #000 100%),
      radial-gradient(7px at 2% 66%, transparent 91%, #000 100%),
      linear-gradient(#000 0 0);
    mask-image: 
      radial-gradient(8px at 96% 66%, transparent 91%, #000 100%),
      radial-gradient(4px at 88% 63%, transparent 93%, #000 100%),
      radial-gradient(6px at 80% 67%, transparent 92%, #000 100%),
      radial-gradient(3px at 72% 64%, transparent 94%, #000 100%),
      radial-gradient(7px at 64% 66%, transparent 91%, #000 100%),
      radial-gradient(4px at 56% 63%, transparent 93%, #000 100%),
      radial-gradient(6px at 48% 67%, transparent 92%, #000 100%),
      radial-gradient(3px at 40% 64%, transparent 94%, #000 100%),
      radial-gradient(8px at 32% 66%, transparent 91%, #000 100%),
      radial-gradient(4px at 24% 63%, transparent 93%, #000 100%),
      radial-gradient(6px at 16% 67%, transparent 92%, #000 100%),
      radial-gradient(3px at 8% 64%, transparent 94%, #000 100%),
      radial-gradient(7px at 2% 66%, transparent 91%, #000 100%),
      linear-gradient(#000 0 0);
  }

  @media (max-width: 768px) {
    .hero-description-container {
      padding: var(--spacing-md) 0;
    }

    .hero-description {
      font-size: var(--font-size-base);
    }
  }

  .team-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xxs);
  }

  .team-member {
    font-size: var(--font-size-xs);
    line-height: 1.4;
    padding-left: 0;
    position: relative;
  }

  /* Only add bullets when there's more than one team member */
  .team-list:has(.team-member:nth-child(2)) .team-member {
    padding-left: var(--spacing-sm);
  }

  .team-list:has(.team-member:nth-child(2)) .team-member::before {
    content: "•";
    position: absolute;
    left: 0;
    color: var(--text-color);
  }

  .role {
    color: var(--muted-text);
  }

  .name {
    color: var(--text-color);
  }

  .relationship {
    color: var(--muted-text);
    font-style: italic;
  }

  .image-pair {
    display: flex;
    gap: var(--spacing-md);
    width: 100%;
    justify-content: center;
  }

  .side-by-side .image-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .side-by-side .image-button {
    width: 100%;
  }

  .side-by-side .image-button img {
    width: 100%;
    height: auto;
    object-fit: cover;
  }
</style> 