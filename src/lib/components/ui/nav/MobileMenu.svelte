<script lang="ts">
  import { fade, fly, slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { 
    Code2, 
    BarChart2, 
    Shield, 
    Database,
    Users,
    Briefcase,
    X,
    ChevronDown,
    Scale
  } from 'lucide-svelte';
  
  export let isOpen = false;
  export let onClose: () => void;

  // Track which sections are expanded
  let expandedSections: Record<string, boolean> = {
    'platform': false,
    'company': false
  };

  function toggleSection(sectionId: string) {
    expandedSections[sectionId] = !expandedSections[sectionId];
  }

  const sections = {
    platform: {
      title: 'Platform',
      forSellers: [
        { 
          title: 'Data Novelty Scoring', 
          path: '/Platform/NoveltyScoring', 
          icon: BarChart2,
          description: 'Measure how unique the data you own is to AI models',
          visible: true
        },
        { 
          title: 'Tiny Subjective Evaluations', 
          path: '/Platform/TinyEvals', 
          icon: Scale,
          description: 'Test potential fine-tuning data against your subjective evals',
          visible: true
        },
        { 
          title: 'Crawler block', 
          path: '/Platform/RobotsBlock', 
          icon: Shield,
          description: 'Block unauthorized data access',
          visible: false
        }
      ],
      forBuyers: [
        { 
          title: 'Interpretability Analytics', 
          path: '/Platform/InterpretabilityAnalytics', 
          icon: Database,
          description: 'See how AI interprets your data',
          visible: false
        },
        { 
          title: 'White-label API', 
          path: '/Platform/WhiteLabel', 
          icon: Code2,
          description: 'Launch your API in minutes',
          visible: false
        }
      ]
    },
    company: {
      title: 'Company',
      items: [
        { 
          title: 'Team', 
          path: '/Company/Team', 
          icon: Users,
          description: 'Ex-MongoDB and F5 builders',
          visible: true
        },
        { 
          title: 'Careers', 
          path: '/Company/Careers', 
          icon: Briefcase,
          description: 'Help us make AI truly data-driven.',
          visible: true
        }
      ]
    }
  };

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      onClose();
    }
  }
</script>

{#if isOpen}
  <div 
    class="mobile-menu-overlay" 
    class:open={isOpen}
    on:click={onClose}
    on:keydown={handleKeyDown}
    role="button"
    tabindex="0"
    aria-label="Close mobile menu"
    transition:fade={{ duration: 200 }}>
  </div>
  <div 
    class="mobile-menu-container"
    transition:fly={{ x: 300, duration: 300, easing: quintOut }}>
    <div 
      class="mobile-menu-inner"
      role="dialog"
      aria-modal="true">
      <div class="mobile-menu">
        <div class="menu-header">
          <button class="close-button" on:click={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        
        <nav 
          class:open={isOpen}
          aria-label="Mobile navigation">
          
          <!-- Platform Section -->
          <div class="section" role="group" aria-label="Platform">
            <button 
              class="section-header" 
              on:click={() => toggleSection('platform')}
              aria-expanded={expandedSections['platform']}
              aria-controls="platform-content">
              <span class="section-title">Platform</span>
              <span class="chevron" class:expanded={expandedSections['platform']}>
                <ChevronDown size={16} />
              </span>
            </button>
            
            {#if expandedSections['platform']}
              <div 
                id="platform-content" 
                class="section-content"
                transition:slide={{ duration: 200 }}>
                
                <div class="subsection">
                  {#each [...sections.platform.forSellers, ...sections.platform.forBuyers] as item}
                    {#if item.visible}
                      <a href={item.path} 
                        on:click={onClose}
                        class="menu-item"
                        role="menuitem"
                        aria-label={`${item.title}: ${item.description}`}>
                        <div class="icon" aria-hidden="true">
                          <svelte:component this={item.icon} size={20} />
                        </div>
                        <div class="content">
                          <div class="title">{item.title}</div>
                          <div class="description">{item.description}</div>
                        </div>
                      </a>
                    {/if}
                  {/each}
                </div>
              </div>
            {/if}
          </div>

          <!-- Company Section -->
          <div class="section" role="group" aria-label="Company">
            <button 
              class="section-header" 
              on:click={() => toggleSection('company')}
              aria-expanded={expandedSections['company']}
              aria-controls="company-content">
              <span class="section-title">Company</span>
              <span class="chevron" class:expanded={expandedSections['company']}>
                <ChevronDown size={16} />
              </span>
            </button>
            
            {#if expandedSections['company']}
              <div 
                id="company-content" 
                class="section-content"
                transition:slide={{ duration: 200 }}>
                {#each sections.company.items as item}
                  {#if item.visible}
                    <a href={item.path} 
                      on:click={onClose}
                      class="menu-item"
                      role="menuitem"
                      aria-label={`${item.title}: ${item.description}`}>
                      <div class="icon" aria-hidden="true">
                        <svelte:component this={item.icon} size={20} />
                      </div>
                      <div class="content">
                        <div class="title">{item.title}</div>
                        <div class="description">{item.description}</div>
                      </div>
                    </a>
                  {/if}
                {/each}
              </div>
            {/if}
          </div>

          <!-- Standalone Links -->
          <a href="/Changelog" 
            on:click={onClose}
            class="standalone-link"
            role="menuitem"
            aria-label="Changelog">Changelog</a>
          <a href="/Pricing" 
            on:click={onClose}
            class="standalone-link"
            role="menuitem"
            aria-label="Pricing">Pricing</a>
          
          <div class="footer-links">
            <button class="button-secondary" 
                  on:click={() => { onClose(); window.location.href = '/login'; }}
                  role="menuitem"
                  aria-label="Log in">
              Log in
            </button>
          </div>
        </nav>
      </div>
    </div>
  </div>
{/if}

<style>
  .mobile-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 1000;
    display: none;
    border: none;
    margin: 0;
    padding: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
    outline: none;
    appearance: none;
  }

  .mobile-menu-overlay.open {
    display: block;
  }

  .mobile-menu-container {
    position: fixed;
    top: 0;
    right: 0;
    height: 100%;
    width: 80%;
    max-width: 300px;
    z-index: 1001;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
  }

  .mobile-menu-inner {
    height: 100%;
    width: 100%;
    overflow-y: auto;
    padding: 1rem;
    background-color: var(--bg-color);
  }

  .mobile-menu {
    position: relative;
    height: 100%;
    width: 100%;
    background: var(--bg-color);
    padding: 1.5rem;
    box-shadow: -5px 0 25px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .menu-header {
    margin-bottom: 2rem;
    text-align: right;
  }

  .close-button {
    background: transparent;
    border: none;
    color: var(--text-color);
    opacity: 0.6;
    padding: 0;
    margin: 0;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  .close-button:hover {
    opacity: 0.8;
  }

  nav {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .section {
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: transparent;
    border: none;
    padding: 1.25rem 0;
    cursor: pointer;
    width: 100%;
    text-align: left;
    color: var(--text-color);
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 500;
  }

  .chevron {
    transition: transform 0.2s ease;
  }

  .chevron.expanded {
    transform: rotate(180deg);
  }

  .section-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-left: 0.5rem;
    padding-bottom: 1.25rem;
  }

  .subsection {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  h3 {
    font-size: 0.75rem;
    color: var(--text-color);
    opacity: 0.6;
    font-weight: 500;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  a {
    color: var(--text-color);
    text-decoration: none;
    font-size: 1rem;
    padding: 0.5rem;
    opacity: 0.9;
    transition: opacity 0.2s ease;
    border-radius: 8px;
  }

  a:hover {
    opacity: 1;
    background-color: var(--bg-color-secondary);
  }

  .standalone-link {
    font-size: 1.125rem;
    font-weight: 500;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0;
    padding: 1.25rem 0;
  }

  .menu-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background-color: color-mix(in srgb, var(--grey-darker) 20%, transparent);
    padding: 0;
    flex-shrink: 0;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .title {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .description {
    font-size: 0.75rem;
    opacity: 0.6;
    line-height: 1.4;
  }

  .footer-links {
    margin-top: auto;
    padding-top: 1.25rem;
  }

  button.button-secondary {
    margin-top: 0;
    width: 100%;
  }

  /* Icon background colors */
  /* Data Novelty Scoring - Pink */
  a[href="/Platform/NoveltyScoring"] .icon {
    background-color: var(--pink-darker);
  }

  /* Tiny Subjective Evaluations - Cyan */
  a[href="/Platform/TinyEvals"] .icon {
    background-color: var(--cyan-darker);
  }

  /* Light mode versions */
  :global(.light) a[href="/Platform/NoveltyScoring"] .icon {
    background-color: var(--pink-darker);
  }

  :global(.light) a[href="/Platform/TinyEvals"] .icon {
    background-color: var(--cyan-darker);
  }
</style> 