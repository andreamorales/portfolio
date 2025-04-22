<script lang="ts">
  import { onMount } from 'svelte';
  
  // Props
  export let title: string;
  export let description: string;
  export let videoUrl: string;
  export let images: Array<{src: string, alt: string, caption?: string}> = [];
  export let content: Array<{type: 'text' | 'image', value: string, caption?: string}> = [];
  
  // State
  let activeView: 'video' | 'content' = 'content';
  let videoElement: HTMLVideoElement;
  let isVideoLoaded = false;
  
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
  
  onMount(() => {
    // Clean up video on component unmount
    return () => {
      if (videoElement) {
        videoElement.pause();
        videoElement.removeAttribute('src');
        videoElement.load();
      }
    };
  });
</script>

<div class="portfolio-expanded-view">
  <!-- Toggle buttons -->
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
  <div class="content-container">
    <!-- Video View -->
    {#if activeView === 'video'}
      <div class="video-container">
        {#if videoUrl}
          <video 
            bind:this={videoElement}
            on:loadeddata={handleVideoLoaded}
            controls
            preload="auto"
            class:loaded={isVideoLoaded}
          >
            <source src={videoUrl} type="video/mp4">
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
      <div class="content-view">
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
                <img src={block.value} alt={block.caption || 'Project image'} />
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
                <img src={image.src} alt={image.alt} />
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

<style>
  .portfolio-expanded-view {
    width: 100%;
    height: 100%;
    position: relative;
    display: grid;
    grid-template-rows: auto 1fr;
    gap: var(--spacing-lg);
    overflow: hidden;
  }
  .view-toggle {
    display: flex;
    gap: 0;
    margin-bottom: var(--spacing-md);
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
  
  .content-container {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .video-container {
    position: relative;
    width: 100%;
    max-width: 100%;
    aspect-ratio: 16 / 9;
    background-color: rgba(0, 0, 0, 0.03);
    border-radius: var(--border-radius);
    overflow: hidden;
    align-self: flex-start;
  }
  
  video {
    width: 100%;
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
  }
  
  .project-description {
    font-family: var(--font-family);
    font-size: var(--font-size-base);
    line-height: 1.6;
    font-variation-settings: 'CASL' 0, 'wght' 370;
    max-width: 70ch;
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
    max-width: 70ch;
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
  
  @media (max-width: 768px) {
    .project-description,
    .text-block {
      font-size: 15px;
    }
    
    .image-gallery {
      grid-template-columns: 1fr;
    }
  }

  .project-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .detail-section {
    margin-bottom: var(--spacing-xl);
  }

  .detail-section h3 {
    font-size: var(--font-size-lg);
    font-weight: 600;
    font-variation-settings: 'CASL' 0, 'wght' 580;
    margin-bottom: var(--spacing-md);
    color: var(--text-color);
  }

  .detail-section p {
    font-size: var(--font-size-base);
    color: var(--muted-text);
    line-height: 1.6;
    margin-bottom: var(--spacing-md);
  }

  .technologies {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-sm);
  }

  .tech-tag {
    background-color: var(--bg-color-alt);
    color: var(--text-color);
    padding: var(--spacing-xxs) var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-sm);
    font-variation-settings: 'CASL' 0, 'wght' 450;
  }

  .header-section {
    margin-bottom: var(--spacing-lg);
  }

  .header-section h2 {
    font-size: var(--font-size-xl);
    font-weight: 700;
    font-variation-settings: 'CASL' 0, 'wght' 650;
    margin-bottom: var(--spacing-xs);
    color: var(--text-color);
  }

  .header-section .subtitle {
    font-size: var(--font-size-base);
    color: var(--muted-text);
    margin-bottom: var(--spacing-md);
  }

  .project-links {
    display: flex;
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);
  }

  .project-link {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--text-color);
    text-decoration: none;
    font-size: var(--font-size-sm);
    font-variation-settings: 'CASL' 0, 'wght' 500;
    transition: color var(--transition-fast) ease;
  }

  .project-link:hover {
    color: var(--cursor-indigo);
  }

  .project-link svg {
    width: 16px;
    height: 16px;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-md);
  }

  .tag {
    background-color: var(--bg-color-alt);
    color: var(--muted-text);
    font-size: var(--font-size-xs);
    padding: var(--spacing-xxs) var(--spacing-xs);
    border-radius: var(--border-radius-sm);
  }

  .details-section {
    margin-bottom: var(--spacing-lg);
  }

  .details-section h3 {
    font-size: var(--font-size-md);
    margin-bottom: var(--spacing-xs);
    font-weight: 500;
  }

  .details-section p {
    color: var(--muted-text);
    font-size: var(--font-size-sm);
    line-height: 1.6;
    margin-bottom: var(--spacing-sm);
  }

  .grid-item {
    border-radius: var(--border-radius);
    overflow: hidden;
    transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  }

  .grid-item:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow);
  }

  .link-button {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    background-color: var(--bg-color-alt);
    color: var(--text-color);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius);
    text-decoration: none;
    transition: background-color var(--transition-fast);
    font-size: var(--font-size-sm);
    margin-right: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
  }

  .link-button:hover {
    background-color: var(--grey-light);
  }

  .link-button svg {
    width: 16px;
    height: 16px;
  }
</style> 