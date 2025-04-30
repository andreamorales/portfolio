<script lang="ts">
  // Props
  export let title: string;
  export let description: string;
  export let tags: string[] = [];
  export let videoUrl: string = '';
  export let images: Array<{src: string, alt: string, caption?: string}> = [];
  export let content: Array<{type: 'text' | 'image', value: string, caption?: string}> = [];
  export let previewImage: string;
  export let githubUrl: string = '';
  export let liveUrl: string = '';
  export let expanded: boolean = false;
  // Add new props for DetailsGrid
  export let year: string = '';
  export let role: string = '';
  export let projectLength: string = '';
  export let metrics: string[] = [];

  // Local imports
  import PortfolioExpandedView from './PortfolioExpandedView.svelte';
  import DetailsGrid from './DetailsGrid.svelte';
</script>

<div class="portfolio-item {expanded ? 'expanded' : ''}">
  {#if expanded}
    <div class="expanded-content">
        <PortfolioExpandedView
          title={title}
          description={description}
          videoUrl={videoUrl}
          images={images}
          content={content}
        />
    </div>
  {:else}
    <div class="portfolio-content">
      <div class="preview-container">
        <img src={previewImage} alt={title} class="preview-image" />
      </div>
      <div class="portfolio-info">
        <h3>{title}</h3>
        <p>{description}</p>
        
        {#if tags.length > 0}
          <div class="tags">
            {#each tags as tag}
              <span class="tag">{tag}</span>
            {/each}
          </div>
        {/if}
        
        <div class="portfolio-links">
          {#if githubUrl}
            <a href={githubUrl} target="_blank" rel="noopener noreferrer" class="portfolio-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              <span>GitHub</span>
            </a>
          {/if}
          
          {#if liveUrl}
            <a href={liveUrl} target="_blank" rel="noopener noreferrer" class="portfolio-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              <span>Live Demo</span>
            </a>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Keep all existing styles exactly as they are */
  .portfolio-item {
    width: 100%;
    margin-bottom: var(--spacing-xl);
    transition: all 0.3s ease;
  }

  .expanded-content {
    margin-top: var(--spacing-lg);
  }

  .portfolio-item .portfolio-content {
    background-color: var(--background-color);
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 4px 4px 0px 0px var(--grey-mid);
    border: 1px solid var(--grey-light);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    padding: 0;
  }

  /* Make sure expanded state also has no padding */
  .portfolio-item.expanded .portfolio-content {
    padding: 0;
  }

  .portfolio-item:not(.expanded) .portfolio-content:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px 0px var(--grey-mid);
  }

  .preview-container {
    width: 100%;
    height: 240px;
    overflow: hidden;
    position: relative;
  }

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .portfolio-item:not(.expanded) .portfolio-content:hover .preview-image {
    transform: scale(1.05);
  }

  .portfolio-info {
    padding: var(--spacing-lg);
  }

  .portfolio-info h3 {
    font-family: var(--font-family);
    font-size: var(--font-size-xl);
    font-variation-settings: 'CASL' 0, 'wght' 450;
    margin: 0;
    margin-bottom: var(--spacing-sm);
  }

  .portfolio-info p {
    font-family: var(--font-family);
    font-size: var(--font-size-base);
    line-height: 1.6;
    font-variation-settings: 'CASL' 0, 'wght' 370;
    margin: 0;
    margin-bottom: var(--spacing-md);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-md);
  }

  .tag {
    background-color: var(--background-color-alt);
    color: var(--text-color);
    font-size: var(--font-size-xs);
    padding: 4px 8px;
    border-radius: var(--border-radius);
    font-variation-settings: 'CASL' 0, 'wght' 350;
  }

  .portfolio-links {
    display: flex;
    gap: var(--spacing-md);
  }

  .portfolio-link {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--text-color);
    text-decoration: none;
    font-size: var(--font-size-sm);
    font-variation-settings: 'CASL' 0, 'wght' 400;
    transition: color 0.2s ease;
  }

  .portfolio-link:hover {
    color: var(--cursor-indigo);
  }

  .portfolio-item.expanded {
    grid-column: 1 / -1;
  }

  @media (max-width: 768px) {
    .preview-container {
      height: 180px;
    }
    
    .portfolio-info {
      padding: var(--spacing-md);
    }
    
    .portfolio-info h3 {
      font-size: var(--font-size-lg);
    }
  }
</style> 