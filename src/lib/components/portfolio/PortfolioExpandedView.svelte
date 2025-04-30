<script lang="ts">
  import { onMount } from 'svelte';
  
  // Props
  export const title: string = '';
  export let description: string;
  export let videoUrl: string;
  export let images: Array<{src: string, alt: string, caption?: string}> = [];
  export let content: Array<{type: string, value: string, caption?: string}> = [];
  // Add hero image prop
  export let heroImage: string = '';
  
  // New project details props
  export let year: string = '';
  export let role: string = '';
  export let projectLength: string = '';
  export let metrics: Array<string> = [];
  
  // Computed prop for featured image
  $: featuredImage = heroImage || (images.length > 0 ? images[0].src : '');
  
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
        videoElement.play().catch(err => {
          console.error('Error playing video:', err);
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
        <div class="details-label">Project Length</div>
        <div class="details-value">{projectLength}</div>
      </div>
    </div>
    <div class="details-row metrics-row">
      {#each metrics as metric, i}
        <div class="details-cell">
          <div class="details-label">Impact</div>
          <div class="details-value">{metric}</div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Featured hero image -->
  {#if featuredImage}
    <div class="hero-image-container">
      <img src={featuredImage} alt={title} class="hero-image" />
    </div>
  {/if}

  <!-- Toggle buttons - now below the grid -->
  <div class="view-toggle">
    <button
      class="button-secondary {activeView === 'content' ? 'active-toggle' : ''}"
      on:click={() => toggleView('content')}
    >
      <span class="toggle-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      </span>
      <span>Text & Images</span>
    </button>
    <button
      class="button-secondary {activeView === 'video' ? 'active-toggle' : ''}"
      on:click={() => toggleView('video')}
    >
      <span class="toggle-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
          <line x1="7" y1="2" x2="7" y2="22"></line>
          <line x1="17" y1="2" x2="17" y2="22"></line>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <line x1="2" y1="7" x2="7" y2="7"></line>
          <line x1="2" y1="17" x2="7" y2="17"></line>
          <line x1="17" y1="17" x2="22" y2="17"></line>
          <line x1="17" y1="7" x2="22" y2="7"></line>
        </svg>
      </span>
      <span>Video</span>
    </button>
  </div>
  
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
        <!-- Project description -->
        <div class="project-description">
          <p>{description}</p>
        </div>
        
        <!-- Content blocks (text and images) -->
        <div class="content-blocks">
          {#each content as block}
            {#if block.type === 'text'}
              <div class="text-block">
                <p>{block.value}</p>
              </div>
            {:else if block.type === 'image'}
              <div class="image-block">
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
            {/if}
          {/each}
        </div>
        
        <!-- Image gallery -->
        {#if images.length > 0}
          <div class="image-gallery">
            {#each images as image}
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
    gap: var(--spacing-lg);
    overflow: hidden;
    margin: 0 auto;
    padding: 0;
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
  
  .view-toggle {
    display: flex;
    gap: 0;
    margin-bottom: var(--spacing-md);
    justify-content: center;
  }
  
  .toggle-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    margin-right: 4px;
  }
  
  :global(.view-toggle .button-secondary) {
    padding: var(--spacing-xs) var(--spacing-sm);
    box-shadow: 4px 4px 0px 0px var(--grey-mid);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    white-space: nowrap;
    border-radius: 4px;
  }
  
  :global(.view-toggle .button-secondary:first-child) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right-width: 1px;
  }
  
  :global(.view-toggle .button-secondary:last-child) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  
  :global(.view-toggle .active-toggle) {
    background-color: var(--black);
    color: white;
    border-color: var(--black);
  }
  
  :global(.view-toggle .button-secondary:hover) {
    /* Remove hover effects by explicitly setting the same properties */
    background-color: inherit;
    color: inherit;
    transform: none;
  }
  
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
    padding: 0 1.5rem;
  }
  
  .project-description {
    font-family: var(--font-family);
    font-size: var(--font-size-base);
    line-height: 1.6;
    font-variation-settings: 'CASL' 0, 'wght' 370;
    width: 100%;
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
  }
  
  .image-block img {
    width: 100%;
    border-radius: var(--border-radius);
    object-fit: cover;
  }
  
  .image-caption {
    font-family: var(--font-family);
    font-size: var(--font-size-sm);
    font-variation-settings: 'CASL' 0, 'wght' 340;
    color: var(--muted-text);
    margin-top: var(--spacing-xs);
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
    border-radius: var(--border-radius);
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
    border-radius: var(--border-radius);
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
    .project-description,
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
    font-size: var(--font-size-sm);
    color: var(--muted-text);
    font-variation-settings: 'CASL' 0, 'wght' 400;
  }
  
  .details-value {
    font-size: var(--font-size-base);
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
    border-radius: var(--border-radius);
    overflow: hidden;
  }
  
  .image-button:focus {
    outline: 2px solid var(--cursor-indigo);
    outline-offset: 2px;
  }
  
  /* Hero image styling */
  .hero-image-container {
    width: 100%;
    padding: var(--spacing-lg);
    overflow: hidden;
  }
  
  .hero-image {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
  }

  /* Add padding to specific content areas instead */
  .project-description,
  .content-blocks,
  .image-gallery,
  .video-container {
    padding: 0 1.5rem;
  }
</style> 