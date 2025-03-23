<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { 
    ChevronsLeft, 
    ChevronsRight,
    HardDrive,
    Search
  } from 'lucide-svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Divider } from '$lib/components/ui/layout';
  
  export let collapsed = true;
  
  const dispatch = createEventDispatcher();
  
  function toggleCollapse() {
    collapsed = !collapsed;
    dispatch('collapse', { collapsed });
  }
  
  function navigateTo(path: string) {
    goto(path);
  }
  
  // Add search functionality
  let searchQuery = '';
  let searchResults: Array<typeof menuItems[0] | typeof bottomMenuItems[0]> = [];
  let showNoResults = false;
  
  function handleSearch() {
    if (!searchQuery.trim()) {
      searchResults = [];
      showNoResults = false;
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const visibleItems = menuItems.filter(item => item.visible);
    
    // Search through visible menu items and bottom menu items
    const topResults = visibleItems.filter(item => 
      item.label.toLowerCase().includes(query)
    );
    
    const bottomResults = bottomMenuItems.filter(item => 
      item.label.toLowerCase().includes(query)
    );
    
    searchResults = [...topResults, ...bottomResults];
    showNoResults = searchResults.length === 0;
  }
  
  $: if (searchQuery !== undefined) {
    handleSearch();
  }
  
  const menuItems = [
    { label: 'Home', path: '/', active: false, visible: false },
    { label: 'Scoring', path: '/Scoring', active: false, visible: true },
    { label: 'Tiny Evals', path: '/TinyEvals', active: false, visible: true },
    { label: 'Moshpit', path: '/Moshpit', active: false, visible: true },
    { label: 'Interpretability Analytics', path: '/InterpretabilityAnalytics', active: false, visible: false },
    { label: 'Crawlers', path: '/Crawlers', active: false, visible: false },
    { label: 'API', path: '/API', active: false, visible: false }
  ];
  
  const bottomMenuItems = [
    { label: 'API Page Customization', path: '/APICustomization', active: false },
    { label: 'Settings', path: '/Settings', active: false },
    { label: 'Help', path: '/Help', active: false },
    { label: 'Organization', path: '/Organization', active: false },
    { label: 'User', path: '/YourProfile', active: false }
  ];
  
  // Update active state based on current path
  $: {
    const currentPath = $page.url.pathname;
    menuItems.forEach(item => {
      item.active = currentPath.includes(item.path) && item.path !== '/';
    });
    bottomMenuItems.forEach(item => {
      item.active = currentPath.includes(item.path);
    });
  }
</script>

<div class="dashboard-menu flex-column-left gap-small width-100" class:collapsed>
  {#if !collapsed}
    <div class="menu-header flex-row space-between width-100">
      <div class="logo-container">
        <svg width="24" height="24" viewBox="0 0 694 1001" fill="var(--text-color)" xmlns="http://www.w3.org/2000/svg">
          <path d="M691.003 900.342L440.371 649.71L267.279 474.267L335.419 406.127C391.811 349.735 391.811 260.447 335.419 204.055C315.839 184.474 291.559 171.159 266.496 165.677L381.63 50.5428L334.636 3.54932L47.9758 289.426L12.7307 324.671L166.243 478.184L15.8636 628.563L17.4301 630.129L167.809 780.508L3.33203 944.985L55.8081 997.462L220.285 832.984L288.426 901.125C344.818 957.517 434.106 957.517 490.498 901.125C510.078 881.544 523.393 857.264 528.876 832.201L644.01 947.335L691.003 900.342ZM218.719 425.707L112.983 319.972L181.124 251.832C210.887 222.069 257.097 222.069 286.859 251.832C316.622 281.594 316.622 327.804 286.859 357.567L218.719 425.707ZM112.2 628.563L214.803 525.96L321.321 627.779L216.369 732.732L112.2 628.563ZM336.203 853.348L268.062 785.208L373.797 679.472L441.938 747.613C471.7 777.375 471.7 823.586 441.938 853.348C412.175 883.111 365.965 883.111 336.203 853.348Z" fill="var(--text-color)" stroke="var(--text-color)" stroke-width="4" stroke-miterlimit="10"/>
        </svg>
      </div>
      <button class="collapse-button" on:click={toggleCollapse}>
        <ChevronsLeft size={16} />
      </button>
    </div>
    
    <div class="search-container width-100 menu-item-animate">
      <div class="search-input">
        <div class="search-icon">
          <Search size={14} />
        </div>
        <input 
          type="text" 
          placeholder="Search" 
          bind:value={searchQuery}
        />
      </div>
    </div>
    
    <!-- Show search results when there's a search query -->
    {#if searchQuery && searchResults.length > 0}
      <div class="search-results menu-item-animate" style="--delay: 0.02s">
        {#each searchResults as result}
          <div 
            class="menu-item search-result" 
            class:active={result.active}
            class:highlighted={true}
            on:click={() => {
              navigateTo(result.path);
              searchQuery = '';
            }}
          >
            <span class="menu-label">{result.label}</span>
          </div>
        {/each}
      </div>
    {:else if showNoResults}
      <div class="no-results menu-item-animate">
        No results found
      </div>
    {:else}
      <!-- Top menu items -->
      <div class="menu-section width-100 menu-item-animate" style="--delay: 0.05s">
        {#each menuItems as item, index}
          {#if item.visible}
            <div 
              class="menu-item" 
              class:active={item.active}
              on:click={() => navigateTo(item.path)}
            >
              <span class="menu-label">{item.label}</span>
            </div>
          {/if}
        {/each}
      </div>
      
      <!-- First divider - after API -->
      <div class="menu-item-animate" style="--delay: 0.1s; width: 100%;">
        <Divider opacity={0.3} />
      </div>
      
      <!-- Middle menu items -->
      <div class="menu-section menu-item-animate" style="--delay: 0.15s">
        <!-- API Page Customization -->
        <div 
          class="menu-item" 
          class:active={bottomMenuItems[0].active}
          on:click={() => navigateTo(bottomMenuItems[0].path)}
        >
          <span class="menu-label">{bottomMenuItems[0].label}</span>
        </div>
        
        <!-- Settings -->
        <div 
          class="menu-item" 
          class:active={bottomMenuItems[1].active}
          on:click={() => navigateTo(bottomMenuItems[1].path)}
        >
          <span class="menu-label">{bottomMenuItems[1].label}</span>
        </div>
      </div>
      
      <!-- Second divider - after Settings -->
      <div class="menu-item-animate" style="--delay: 0.2s; width: 100%;">
        <Divider opacity={0.3} />
      </div>
      
      <!-- Bottom menu items -->
      <div class="menu-section width-100 menu-item-animate" style="--delay: 0.25s">
        <!-- Help -->
        <div 
          class="menu-item" 
          class:active={bottomMenuItems[2].active}
          on:click={() => navigateTo(bottomMenuItems[2].path)}
        >
          <span class="menu-label">{bottomMenuItems[2].label}</span>
        </div>
        
        <!-- Organization -->
        <div 
          class="menu-item" 
          class:active={bottomMenuItems[3].active}
          on:click={() => navigateTo(bottomMenuItems[3].path)}
        >
          <span class="menu-label">{bottomMenuItems[3].label}</span>
        </div>
        
        <!-- User -->
        <div 
          class="menu-item" 
          class:active={bottomMenuItems[4].active}
          on:click={() => navigateTo(bottomMenuItems[4].path)}
        >
          <span class="menu-label">{bottomMenuItems[4].label}</span>
        </div>

        <div class="menu-footer width-100">
          <button class="button-primary width-100" on:click={() => navigateTo('/Scoring')}>
            <HardDrive size={16} />
            <span>Evaluate New Data</span>
          </button>
        </div>
      </div>
    {/if}
  {:else}
    <!-- Collapsed menu with specific order: chevron, logo, database icon -->
    <div class="collapsed-menu">
      <button class="collapse-button" on:click={toggleCollapse}>
        <ChevronsRight size={16} />
      </button>
      
      <div class="collapsed-logo">
        <svg width="24" height="24" viewBox="0 0 694 1001" fill="var(--text-color)" xmlns="http://www.w3.org/2000/svg">
          <path d="M691.003 900.342L440.371 649.71L267.279 474.267L335.419 406.127C391.811 349.735 391.811 260.447 335.419 204.055C315.839 184.474 291.559 171.159 266.496 165.677L381.63 50.5428L334.636 3.54932L47.9758 289.426L12.7307 324.671L166.243 478.184L15.8636 628.563L17.4301 630.129L167.809 780.508L3.33203 944.985L55.8081 997.462L220.285 832.984L288.426 901.125C344.818 957.517 434.106 957.517 490.498 901.125C510.078 881.544 523.393 857.264 528.876 832.201L644.01 947.335L691.003 900.342ZM218.719 425.707L112.983 319.972L181.124 251.832C210.887 222.069 257.097 222.069 286.859 251.832C316.622 281.594 316.622 327.804 286.859 357.567L218.719 425.707ZM112.2 628.563L214.803 525.96L321.321 627.779L216.369 732.732L112.2 628.563ZM336.203 853.348L268.062 785.208L373.797 679.472L441.938 747.613C471.7 777.375 471.7 823.586 441.938 853.348C412.175 883.111 365.965 883.111 336.203 853.348Z" fill="var(--text-color)" stroke="var(--text-color)" stroke-width="4" stroke-miterlimit="10"/>
        </svg>
      </div>
      
      <button class="button-icon collapsed-icon">
        <HardDrive size={16} />
      </button>
    </div>
  {/if}
</div>

<style>
  .dashboard-menu {
    display: flex;
    flex-direction: column;
    background-color: color-mix(in srgb, var(--grey-darker) 1%, transparent);
    color: var(--text-color);
    width: 260px;
    border: 0.5px solid color-mix(in srgb, var(--text-color) 30%, transparent);
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    z-index: 10;
    padding: 1rem;
    height: fit-content;
    transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                padding 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    
    /* Reduce box-shadow intensity */
    box-shadow: 0 0 25px 2px rgba(155, 77, 214, 0.05);
  }
  
  /* Tone down the pseudo-element for glow effect */
  .dashboard-menu::before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    background: radial-gradient(circle at center, rgba(155, 77, 214, 0.03), transparent 70%);
    z-index: -1;
    border-radius: 20px;
    pointer-events: none;
  }
  
  /* Theme-specific glow colors with reduced intensity */
  :global(.dark) .dashboard-menu {
    box-shadow: 0 0 25px 2px rgba(155, 77, 214, 0.05);
  }
  
  :global(.dark) .dashboard-menu::before {
    background: radial-gradient(circle at center, rgba(155, 77, 214, 0.03), transparent 70%);
  }
  
  :global(.light) .dashboard-menu {
    box-shadow: 0 0 25px 2px rgba(95, 28, 150, 0.08);
  }
  
  :global(.light) .dashboard-menu::before {
    background: radial-gradient(circle at center, rgba(95, 28, 150, 0.05), transparent 70%);
  }
  
  /* Tone down animation for box-shadow */
  @keyframes pulse-shadow {
    0% {
      box-shadow: 0 0 25px 2px rgba(155, 77, 214, 0.05);
    }
    50% {
      box-shadow: 0 0 30px 3px rgba(155, 77, 214, 0.08);
    }
    100% {
      box-shadow: 0 0 25px 2px rgba(155, 77, 214, 0.05);
    }
  }
  
  .dashboard-menu:not(.collapsed) {
    animation: pulse-shadow 6s ease-in-out infinite;
  }
  
  .dashboard-menu.collapsed {
    width: 60px;
    padding: 0.25rem 0.25rem;
    display: flex;
    align-items: center;
  }
  
  .menu-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: fit-content;
    border-bottom: 1px solid rgba(var(--text-color-rgb), 0.1);
    transition: opacity 0.3s ease;
  }
  
  .logo-container {
    display: flex;
    align-items: center;
  }
  
  .collapse-button {
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s ease, background-color 0.2s ease;
  }
  
  .collapse-button:hover {
    opacity: 1;
    background-color: rgba(var(--text-color-rgb), 0.1);
  }
  
  /* Collapsed menu styles */
  .collapsed-menu {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    width: 100%;
    min-height: 150px;
    opacity: 0;
    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  
  .collapsed-button {
    margin-bottom: 0;
  }
  
  .collapsed-logo {
    display: flex;
    justify-content: center;
    margin-bottom: 0;
    opacity: 0;
    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
  }
  
  .collapsed-icon {
    margin-top: 0;
    opacity: 0;
    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
  }
  
  /* Animation for menu items */
  .menu-item-animate {
    opacity: 0;
    transform: translateY(10px);
    animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: var(--delay, 0s);
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  button {
    margin-bottom: 0;
  }
  
  .search-container {
    display: flex;
    align-items: center;
    padding: 8px 0;
  }
  
  .search-input {
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    border: 1px solid color-mix(in srgb, var(--text-color) 20%, transparent);
    border-radius: var(--border-radius);
    background: var(--clear);
    padding: 8px 12px;
  }
  
  .search-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-color);
    opacity: 0.5;
    margin-right: 8px;
    position: static;
    transform: none;
  }
  
  /* Using global input styles */
  .search-input input {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--text-color);
    font-size: small;
    padding: 4px 0;
    outline: none;
    width: 100%;
    height: 24px;
  }
  
  .search-input input::placeholder {
    color: var(--text-color);
    opacity: 0.6;
  }
  
  .menu-section {
    display: flex;
    flex-direction: column;
    flex-grow: 0;
  }
  
  .menu-item {
    display: flex;
    align-items: center;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
    margin-bottom: 6px;
    transition: background-color 0.2s ease;
  }
  
  .menu-item:hover {
    background-color: rgba(var(--text-color-rgb), 0.1);
  }
  
  .menu-item.active {
    background-color: var(--grey-mid);
    color: var(--text-color);
    font-weight: 500;
  }
  
  .menu-label {
    font-size: small;
    white-space: nowrap;
  }
  
  .menu-footer {
    border-top: 1px solid rgba(var(--text-color-rgb), 0.1);
    margin-top: 1.5rem;
    margin-bottom: 0;
    padding: 0;
    width: 100%;
  }
  
  /* Using global button-primary styles */
  .button-primary {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    font-size: small;
  }
  
  .button-primary span {
    margin-left: 8px;
  }
  
  .button-icon {
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
  }
  
  .button-icon:hover {
    background-color: rgba(var(--text-color-rgb), 0.1);
  }

  .search-results {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .search-result {
    background-color: rgba(var(--text-color-rgb), 0.05);
  }
  
  .highlighted {
    border-left: 2px solid var(--primary);
    padding-left: 8px;
  }

  .no-results {
    padding: 8px 10px;
    color: var(--text-color);
    opacity: 0.6;
    font-size: small;
    text-align: center;
  }
</style> 