<script lang="ts">
  import { onMount } from 'svelte';
  import ContactForm from '$lib/components/ContactForm.svelte';
  import Label from '$lib/components/ui/input/Label.svelte';
  import LucideDemo from '$lib/components/LucideDemo.svelte';

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
</script>

<svelte:head>
  <title>Andy Morales | Product Designer</title>
  <meta name="description" content="Andy Morales - Product Designer specializing in technical products." />
</svelte:head>

<div class="landing-page">
  <main class="container">
    <div class="header">
      <h1 class="title">Andy<br>Morales</h1>
      <div class="description">
        <p>I lead the design of technical products.</p>
        <p>Fmr at MongoDB, Roblox, ConsenSys, Panto.</p>
      </div>
      <div class="cta">
        <a href="#contact" class="contact-button">Get in touch</a>
      </div>
    </div>

    <LucideDemo />

    <div class="portfolio-list">
      {#each portfolioItems as item, index}
        <div class="portfolio-item">
          <button 
            class="portfolio-header" 
            on:click={() => toggleExpand(index)} 
            on:keydown={(e) => e.key === 'Enter' && toggleExpand(index)}
            aria-expanded={item.expanded}
            aria-controls={`portfolio-content-${index}`}
          >
            <h2>{item.title}</h2>
            <div class="tags">
              {#each item.tags as tag}
                <Label text={tag} variant="semisolid" />
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

<ContactForm />

<style>
  .landing-page {
    min-height: 100vh;
    background-color: var(--bg-color);
    color: var(--text-color);
    padding: 2rem;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .header {
    margin-bottom: 4rem;
  }

  .title {
    font-family: Refract;
    font-size: 128px;
    font-style: normal;
    font-weight: 400;
    line-height: 102px; /* 79.688% */
    letter-spacing: -1.28px;
    font-feature-settings: 'dlig' on, 'ss01' on;
    margin-bottom: 1.5rem;
  }

  .description {
    font-family: 'Recursive Variable';
    font-variation-settings: 'MONO' 0, 'CASL' 0, 'slnt' 0, 'CRSV' 0.5;
    font-size: clamp(1.25rem, 3vw, 1.5rem);
    line-height: 1.4;
    margin-bottom: 2rem;
    font-weight: 400;
  }

  .contact-button {
    display: inline-block;
    background: var(--button-bg-color);
    color: var(--button-text-color);
    padding: var(--button-padding);
    border: 1px solid var(--text-color);
    border-radius: var(--border-radius);
    font-family: 'Recursive Variable';
    font-size: var(--font-size-base);
    cursor: pointer;
    text-decoration: none;
    transition: all var(--transition);
    text-transform: var(--button-text-transform);
  }

  .contact-button:hover {
    background: var(--text-color);
    color: var(--bg-color);
    transform: translateY(-2px);
  }

  .portfolio-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    font-family: 'Recursive Variable';
  }

  .portfolio-item {
    border-top: 1px solid var(--border-color);
    padding-top: 1rem;
  }

  .portfolio-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 0.5rem 0;
    background: transparent;
    border: none;
    width: 100%;
    text-align: left;
    font-family: 'Recursive Variable';
    color: var(--text-color);
  }

  .portfolio-header:hover h2 {
    color: var(--interactive-hover);
  }

  .portfolio-header h2 {
    font-size: 1.25rem;
    font-weight: 500;
    margin: 0;
    transition: color var(--transition);
    font-family: 'Recursive Variable';
  }

  .tags {
    display: flex;
    gap: 0.5rem;
  }

  .portfolio-content {
    padding: 1rem 0;
    font-family: 'Recursive Variable';
    font-weight: 400;
  }

  @media (min-width: 768px) {
    .portfolio-header {
      padding: 1rem 0;
    }

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
</style> 