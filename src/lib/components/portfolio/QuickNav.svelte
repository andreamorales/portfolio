<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  // Props - all portfolio items
  export let items: Array<{
    id: number;
    title: string;
    thumbnail?: string;
    expanded?: boolean;
  }> = [];
  
  // Prop to determine if any item is expanded
  export let hasExpandedItem: boolean = false;
  
  // For backward compatibility
  export const expandedItems: Array<{
    id: number;
    title: string;
    thumbnail?: string;
  }> = [];
  
  // State for collapsed/expanded view
  let isCollapsed = false;
  let isMobile = false;
  let activeItemId: number | null = null;
  
  // Update collapsed state based on mobile
  $: {
    if (browser && isMobile && !hasExpandedItem) {
      isCollapsed = true;
    }
  }
  
  // Sort items by ID to match portfolio order
  $: sortedItems = [...items].sort((a, b) => a.id - b.id);
  
  // Function to check which item is in view
  function updateActiveItem() {
    if (!browser) return;
    
    const scrollPosition = window.scrollY + window.innerHeight / 2; // Use middle of viewport
    
    // Find all portfolio items
    const portfolioItems = sortedItems.map(item => {
      const element = document.getElementById(`portfolio-content-${item.id}`);
      if (!element) return null;
      
      const rect = element.getBoundingClientRect();
      const absoluteTop = rect.top + window.scrollY;
      const absoluteBottom = absoluteTop + rect.height;
      
      return {
        id: item.id,
        top: absoluteTop,
        bottom: absoluteBottom
      };
    }).filter(item => item !== null);
    
    // Find the item that contains the current scroll position
    const activeItem = portfolioItems.find(item => 
      item && scrollPosition >= item.top && scrollPosition <= item.bottom
    );
    
    activeItemId = activeItem ? activeItem.id : null;
  }

  // Function to toggle collapsed state
  function toggleCollapse() {
    isCollapsed = !isCollapsed;
  }

  // Touch swipe functionality
  let touchStartX = 0;
  let touchEndX = 0;
  
  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX;
  }
  
  function handleTouchMove(e: TouchEvent) {
    touchEndX = e.touches[0].clientX;
  }
  
  function handleTouchEnd() {
    // Calculate swipe distance
    const swipeDistance = touchStartX - touchEndX;
    
    // If swipe distance is significant enough (more than 50px)
    if (Math.abs(swipeDistance) > 50) {
      // Swipe left (positive value) -> expand
      // Swipe right (negative value) -> collapse
      isCollapsed = swipeDistance < 0;
    }
    
    // Reset values
    touchStartX = 0;
    touchEndX = 0;
  }
  
  // Function to split title at colon
  function splitTitle(title: string) {
    const parts = title.split(':');
    if (parts.length > 1) {
      return {
        main: parts[0].trim(),
        descriptor: parts.slice(1).join(':').trim()
      };
    }
    return {
      main: title,
      descriptor: ''
    };
  }
  
  // Add function to expand item
  export let onExpandItem: (id: number, fromQuickNav?: boolean) => void;
  
  // Function to scroll to a specific portfolio item and expand it
  function scrollToAndExpandItem(id: number) {
    // Call onExpandItem with fromQuickNav=true
    onExpandItem(id, true);
  }

  function updateMobileState() {
    if (browser) {
      isMobile = window.innerWidth <= 768;
    }
  }

  onMount(() => {
    updateMobileState();
    window.addEventListener('resize', updateMobileState);
    window.addEventListener('scroll', updateActiveItem);
    
    // Initial check for active item
    updateActiveItem();
    
    return () => {
      window.removeEventListener('resize', updateMobileState);
      window.removeEventListener('scroll', updateActiveItem);
    };
  });
</script>

{#if hasExpandedItem || isMobile}
  <div 
    class="quick-nav {isCollapsed ? 'collapsed' : ''}"
    on:touchstart={handleTouchStart}
    on:touchmove={handleTouchMove}
    on:touchend={handleTouchEnd}
  >
    <div class="nav-header">
      <span>{isMobile ? 'Portfolio' : 'Jump to'}</span>
      <button 
        class="button-clear collapse-toggle" 
        on:click={toggleCollapse} 
        aria-label="{isCollapsed ? 'Expand' : 'Collapse'} navigation"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          {#if isCollapsed}
            <!-- Expand icon (chevron-up) -->
            <polyline points="18 15 12 9 6 15"></polyline>
          {:else}
            <!-- Collapse icon (chevron-down) -->
            <polyline points="6 9 12 15 18 9"></polyline>
          {/if}
        </svg>
      </button>
    </div>
    <div class="previews-container">
      {#each sortedItems as item}
        {@const titleParts = splitTitle(item.title)}
        <button 
          class="preview-item {activeItemId === item.id ? 'active' : ''}" 
          on:click={() => scrollToAndExpandItem(item.id)}
          aria-label="Jump to {item.title}"
        >
          <div class="preview-title">
            <div class="title-main">{titleParts.main}</div>
            {#if titleParts.descriptor}
              <div class="title-descriptor">{titleParts.descriptor}</div>
            {/if}
          </div>
          <div class="preview-thumbnail">
            {#if item.thumbnail}
              <img src={item.thumbnail} alt={item.title} />
            {:else}
              <div class="thumbnail-placeholder">
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
              </div>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </div>
{/if}

<style>
  .quick-nav {
    position: fixed;
    bottom: var(--spacing-lg);
    right: var(--spacing-lg);
    max-height: 70%;
    background-color: var(--bg-color);
    border: 1px solid var(--grey-darker);
    border-radius: 4px;
    box-shadow: 4px 4px 0px 0px var(--grey-mid);
    padding: 0;
    z-index: var(--z-50);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: transform var(--transition-normal) var(--easing-standard), 
                opacity var(--transition-normal) var(--easing-standard);
  }
  
  /* Collapsed state */
  .quick-nav.collapsed .previews-container {
    height: 0;
    padding-top: 0;
    padding-bottom: 0;
    overflow: hidden;
  }
  
  .nav-header {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--text-color);
    border-bottom: 1px solid var(--grey-light);
    background-color: var(--grey-lighter);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .collapse-toggle {
    width: var(--spacing-xl);
    height: var(--spacing-xl);
    min-height: auto;
    padding: 0;
    color: var(--grey-dark);
    transition: color var(--transition-fast) var(--easing-standard), 
                transform var(--transition-fast) var(--easing-standard);
  }
  
  .collapse-toggle:hover {
    color: var(--text-color);
    transform: scale(1.1);
  }
  
  .previews-container {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    max-height: calc(70vh - 45px);
    scrollbar-width: thin;
    scrollbar-color: var(--grey-light) transparent;
    padding: 0;
    transition: height var(--transition-normal) var(--easing-standard), 
                padding var(--transition-normal) var(--easing-standard);
  }
  
  .previews-container::-webkit-scrollbar {
    width: var(--spacing-xxs);
  }
  
  .previews-container::-webkit-scrollbar-thumb {
    background-color: var(--grey-light);
    border-radius: var(--border-radius);
  }
  
  .preview-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: var(--spacing-xs) var(--spacing-md);
    margin: 0;
    border-radius: 0;
    min-height: auto;
    height: auto;
    transition: all var(--transition-fast) var(--easing-standard);
    outline: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }
  
  .preview-item.active {
    background-color: var(--text-color);
  }
  
  .preview-item.active .title-main,
  .preview-item.active .title-descriptor {
    color: var(--bg-color);
  }
  
  .preview-item.active .thumbnail-placeholder {
    color: var(--bg-color);
  }
  
  .preview-item:hover {
    background-color: var(--text-color);
    transform: none;
  }
  
  .preview-item:hover .title-main,
  .preview-item:hover .title-descriptor {
    color: var(--bg-color);
  }
  
  .preview-item:hover .thumbnail-placeholder {
    color: var(--bg-color);
  }
  
  .preview-item:focus {
    outline: none;
    box-shadow: none;
  }
  
  .preview-item:focus-visible {
    outline: none;
    box-shadow: none;
  }
  
  .preview-item:active {
    background-color: var(--text-color);
  }
  
  .preview-item:active .title-main,
  .preview-item:active .title-descriptor {
    color: var(--bg-color);
  }
  
  .preview-thumbnail {
    width: 70px;
    height: 55px;
    flex-shrink: 0;
    border-radius: 4px;
    overflow: hidden;
    background-color: var(--grey-lighter);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--grey-light);
    margin-right: var(--spacing-md);
  }
  
  .preview-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .thumbnail-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--grey-mid);
  }
  
  .preview-title {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    flex: 1;
    margin-right: var(--spacing-xs);
    overflow: hidden;
    padding-left: var(--spacing-md);
  }
  
  .title-main {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    text-align: left;
  }
  
  .title-descriptor {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-normal);
    color: var(--muted-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    text-align: left;
  }
  
  /* Mobile styles */
  @media (max-width: 768px) {
    .quick-nav {
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      max-width: 100%;
      border-radius: 0;
      max-height: 80%;
      display: flex;
      flex-direction: column;
      align-items: center;
      border: none;
      background-color: transparent;
    }
    
    .nav-header {
      width: 200px;
      border-radius: 4px 4px 0 0;
      box-shadow: none;
      z-index: 10;
      position: relative;
      border: 1px solid var(--grey-darker);
    }
    
    .quick-nav.collapsed {
      width: 100%;
    }
    
    .quick-nav.collapsed .nav-header {
      width: 200px;
    }
    
    .previews-container {
      flex-direction: row;
      padding: 0;
      overflow-y: hidden;
      overflow-x: auto;
      gap: 0;
      flex-wrap: nowrap;
      width: 100%;
      background-color: var(--bg-color);
      border: 1px solid var(--grey-darker);
      margin-top: -1px;
    }
    
    .preview-item {
      width: 130px;
      margin: 0;
      flex-shrink: 0;
      flex-direction: column;
      justify-content: flex-start;
      gap: var(--spacing-xxs);
      border-radius: 0;
      padding: var(--spacing-xs);
    }
    
    .preview-title {
      padding-left: 0;
      margin-right: 0;
      text-align: center;
      width: 100%;
    }
    
    .preview-thumbnail {
      width: 100%;
      height: 80px;
      margin-bottom: var(--spacing-xxs);
      margin-right: 0;
    }
    
    .title-main, .title-descriptor {
      text-align: center;
    }
  }
</style> 