<script lang="ts">
  import { onMount } from 'svelte';
  import { goto, preloadData } from '$app/navigation';
  import { page } from '$app/stores';
  import { 
    Code2, 
    BarChart2, 
    Shield, 
    Database,
    Users,
    Briefcase,
    BookOpen,
    Scale
  } from 'lucide-svelte';

  type SectionItem = {
    title: string;
    path: string;
    icon?: any;
    description?: string;
    visible?: boolean;
  };

  type PlatformSection = {
    title: string;
    forSellers: SectionItem[];
    forBuyers: SectionItem[];
  };

  type CompanySection = {
    title: string;
    items: SectionItem[];
  };

  type SimpleSection = {
    title: string;
    path: string;
  };

  type Sections = {
    platform: PlatformSection;
    company: CompanySection;
    changelog: SimpleSection;
    pricing: SimpleSection;
  };

  let activeDropdown: keyof Sections | null = null;

  const sections: Sections = {
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
          title: 'Crawler Blocking', 
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
        },
        // { title: 'Blog', path: '/Company/Blog', icon: BookOpen }
      ]
    },
    changelog: {
      title: 'Changelog',
      path: '/Changelog'
    },
    pricing: {
      title: 'Pricing',
      path: '/Pricing'
    }
  };

  function handleMouseEnter(key: string) {
    const sectionKey = key as keyof Sections;
    activeDropdown = sectionKey;
  }

  function handleMouseLeave(event: MouseEvent) {
    const target = event.relatedTarget as HTMLElement;
    const navItem = (event.currentTarget as HTMLElement).closest('.nav-item');
    const dropdown = navItem?.querySelector('.dropdown-wrapper');
    
    if (dropdown?.contains(target) || target?.closest('.dropdown-wrapper')) {
      return;
    }
    
    activeDropdown = null;
  }

  async function navigateTo(path: string) {
    activeDropdown = null;
    try {
      await preloadData(path);
      await goto(path, { replaceState: false });
    } catch (error) {
      // Fallback to regular navigation if preload fails
      window.location.href = path;
    }
  }

  // Handle initial page load and browser navigation
  onMount(() => {
    // Subscribe to page changes
    const unsubscribe = page.subscribe(() => {
      // Reset dropdown state on page change
      activeDropdown = null;
    });

    return () => {
      unsubscribe();
    };
  });
</script>

<nav class="nav-links gap-medium" aria-label="Main navigation">
  {#each Object.entries(sections) as [key, section]}
    <div
      class="nav-item"
      class:has-dropdown={'path' in section === false}
      on:mouseenter={() => handleMouseEnter(key)}
      on:mouseleave={handleMouseLeave}
      role="navigation"
    >
      {#if 'path' in section}
        <button on:click={() => navigateTo(section.path)}>
          {section.title}
        </button>
      {:else}
        <button>{section.title}</button>
        {#if activeDropdown === key}
          <div class="menu">
            {#if activeDropdown === 'platform'}
              <div class="section gap-medium">
                <div class="item platform-menu gap-small">
                  {#each [...sections.platform.forSellers, ...sections.platform.forBuyers] as item}
                    {#if item.visible}
                      <a href={item.path} on:click|preventDefault={() => navigateTo(item.path)}>
                        <div class="icon border-travel">
                          <svelte:component this={item.icon} size={20} />
                        </div>
                        <div class="link-content">
                          <div class="link">{item.title}</div>
                          <div class="description">{item.description}</div>
                        </div>
                      </a>
                    {/if}
                  {/each}
                </div>
              </div>
            {:else if activeDropdown === 'company'}
              <div class="section gap-medium">
                <div class="item company-menu gap-small">
                  {#each sections.company.items as item}
                    {#if item.visible}
                      <a href={item.path} on:click|preventDefault={() => navigateTo(item.path)}>
                        <div class="icon border-travel">
                          <svelte:component this={item.icon} size={20} />
                        </div>
                        <div class="link-content">
                          <div class="link">{item.title}</div>
                          <div class="description">{item.description}</div>
                        </div>
                      </a>
                    {/if}
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {/if}
      {/if}
    </div>
  {/each}
</nav>

<style>
  .nav-links {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1000;
  }

  .nav-item {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .nav-item.has-dropdown {
    padding-bottom: 24px;
    margin-bottom: -24px;
  }

  button {
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    font-size: 1rem;
    line-height: 1.5;
  }

  .section {
    display: flex;
    flex-direction: row;
    width: fit-content;
    gap: 1rem;
  }

  .item {
    display: flex;
    flex-direction: column;
    width: 280px;
  }

  .company-menu {
    width: 280px;
  }

  h3 {
    font-size: 0.75rem;
    color: var(--text-color);
    opacity: 0.6;
    font-weight: 500;
    margin-bottom: 0.5rem;
    position: relative;
    width: 100%;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  h3::after {
    display: none;
  }

  @keyframes growLine {
    from {
      opacity: 0;
    }
    to {
      opacity: 0;
    }
  }

  a {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 0.75rem;
    color: var(--text-color);
    text-decoration: none;
    border-radius: 8px;
    transition: background-color 0.2s ease;
    padding: 0.5rem;
  }

  a:hover {
    background-color: var(--bg-color-secondary);
  }

  a:hover .icon {
    position: relative;
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 50px;
    width: 50px;
    height: 50px;
    border-radius: 8px;
    background-color: var(--grey-darker);
    padding: 0;
    flex-shrink: 0;
  }

  .icon:global(.border-travel)::before {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  a:hover .icon:global(.border-travel)::before {
    opacity: 1;
  }

  /* Platform menu icons */
  /* Data Novelty Scoring - Pink */
  .platform-menu a[href="/Platform/NoveltyScoring"] .icon {
    background-color: var(--pink-darker);
  }

  /* Tiny Subjective Evaluations - Cyan */
  .platform-menu a[href="/Platform/TinyEvals"] .icon {
    background-color: var(--cyan-darker);
  }

  /* Robots.txt block */
  .platform-menu a[href="/Platform/RobotsBlock"] .icon {
    background-color: color-mix(in srgb, var(--orange-darkest) 20%, transparent);
  }

  /* White-label API */
  .platform-menu a[href="/Platform/WhiteLabel"] .icon {
    background-color: color-mix(in srgb, var(--purple-darkest) 20%, transparent);
  }

  /* Interpretability Analytics */
  .platform-menu a[href="/Platform/InterpretabilityAnalytics"] .icon {
    background-color: color-mix(in srgb, var(--green-darkest) 20%, transparent);
  }

  /* Light mode versions */
  :global(.light) .platform-menu a[href="/Platform/NoveltyScoring"] .icon {
    background-color: var(--pink-darker);
  }

  :global(.light) .platform-menu a[href="/Platform/TinyEvals"] .icon {
    background-color: var(--cyan-darker);
  }

  /* Company menu icons - keeping them grey */
  .item:not(.platform-menu) .icon {
    background-color: color-mix(in srgb, var(--grey-darker) 20%, transparent);
  }

  .icon :global(svg) {
    stroke: var(--text-color);
    stroke-width: 1.5;
    transition: all 0.3s ease;
  }

  /* Light mode */
  :global(.light) .platform-menu a[href="/Platform/WhiteLabel"] .icon {
    background-color: color-mix(in srgb, var(--purple-darker) 20%, transparent);
  }

  :global(.light) .platform-menu a[href="/Platform/RobotsBlock"] .icon {
    background-color: color-mix(in srgb, var(--orange-darker) 20%, transparent);
  }

  :global(.light) .platform-menu a[href="/Platform/InterpretabilityAnalytics"] .icon {
    background-color: color-mix(in srgb, var(--green-darker) 20%, transparent);
  }

  /* Company menu icons in light mode - keeping them grey */
  :global(.light) .item:not(.platform-menu) .icon {
    background-color: color-mix(in srgb, var(--grey-lighter) 20%, transparent);
  }

  .link-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding-top: 0;
    margin-top: -0.25rem;
  }

  .link {
    font-size: 0.875rem;
    white-space: nowrap;
    font-weight: 500;
    padding-top: 0;
  }

  .description {
    font-size: 0.75rem;
    white-space: normal;
    color: var(--text-color);
    opacity: 0.6;
    font-weight: 300;
    max-width: 200px;
    line-height: 1.4;
  }

  .menu {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--bg-color);
    border: 0.5px solid color-mix(in srgb, var(--text-color) 40%, transparent);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: fit-content;
  }

  /* Platform menu is narrow like company menu */
  .nav-item:has(.platform-menu) .menu {
    min-width: 300px;
  }

  /* Company menu is narrow */
  .nav-item:has(.company-menu) .menu {
    min-width: 200px;
  }
</style>
