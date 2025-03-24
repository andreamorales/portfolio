<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { ArrowRight, ArrowLeft } from 'svelte-lucide';
  import { duration, delay, distance, stagger } from '$lib/styles/animation-constants';
  import { Label } from '$lib/components/ui/input';

  let currentIndex = 0;
  let mounted = false;
  let visibleSections: number[] = [];
  let sectionContainer: HTMLElement;
  let sectionInView = false;
  let scrollY = 0;
  let hasAnimated = false;

  const narrativePoints = [
    {
      color: "var(--blue-mid)",
      title: "5x",
      subtitle: "faster growth than SaaS",
      description: "AI startups are scaling from $1M to $30M at unprecedented rates, creating a new wave of companies racing to establish market dominance."
    },
    {
      color: "var(--blue-darker)", 
      title: "$75M",
      subtitle: "spent on fine-tuning in 2024",
      description: "These AI companies consider fine-tuning open-weight models with proprietary data as their 'special sauce' and competitive advantage in the market."
    },
    {
      color: "var(--blue-darkest)", 
      title: "257%",
      subtitle: "increase in AI job listings",
      description: "The talent shortage is making it difficult for companies to post-train efficiently, with AI job demand growing 5x faster than overall job listings since 2015."
    },
    {
      color: "var(--blue-light)", 
      title: "Data valuation demand",
      subtitle: "will only continue to grow",
      description: "The future belongs to intuitive post-training tools that make RAG and fine-tuning accessible, especially for subjective evaluations with no easy benchmarks."
    }
  ];

  function nextSlide() {
    currentIndex = (currentIndex + 1) % narrativePoints.length;
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + narrativePoints.length) % narrativePoints.length;
  }

  const showSections = () => {
    if (hasAnimated) return;
    
    // Get section position relative to viewport
    const rect = sectionContainer.getBoundingClientRect();
    
    // Calculate how far the section is through the viewport (0 = at bottom, 1 = at top)
    const progress = rect.bottom / window.innerHeight;
    
    // Start showing sections when section is 20% into view, complete by 60% into view
    const scrollProgress = Math.max(0, Math.min(1, (progress - 0.4) / 0.4));
    
    // Show sections based on scroll progress
    const sectionsToShow = Math.floor(scrollProgress * 2); // We have 2 sections
    if (sectionsToShow > 0) {
      visibleSections = Array.from({ length: sectionsToShow }, (_, i) => i);
      if (sectionsToShow === 2) {
        hasAnimated = true; // Mark as animated once both sections are shown
      }
    }
  };

  onMount(() => {
    mounted = true;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          sectionInView = entry.isIntersecting;
          if (sectionInView) {
            showSections(); // Initial check
          } else if (!hasAnimated) {
            visibleSections = []; // Only hide if we haven't animated yet
          }
        });
      },
      {
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
        rootMargin: '0px 0px -10% 0px'
      }
    );

    if (sectionContainer) {
      observer.observe(sectionContainer);
    }

    return () => {
      observer.disconnect();
    };
  });

  $: if (mounted && sectionInView && sectionContainer) {
    showSections();
  }
</script>

<svelte:window bind:scrollY />

<div class="narrative-section width-100" bind:this={sectionContainer}>
  {#if mounted}
    <div class="flex-row no-flex-wrap gap-large">
      {#if visibleSections.includes(0)}
        <div class="title-section flex-column-top-align gap-medium"
          in:fly={{ 
            x: -distance.lg, 
            duration: duration.normal, 
            delay: delay.normal,
            easing: quintOut 
          }}
        >
          <div 
            class="title-wrapper flex-column-right gap-small"
            in:fade={{
              duration: duration.slow,
              delay: delay.normal * 2
            }}
          >
            <h1
              in:fly={{ 
                y: distance.lg,
                duration: duration.normal,
                delay: delay.normal * 2,
                easing: quintOut 
              }}
            >Why now?</h1>
            <div 
              class="button-group"
              in:fly={{ 
                x: -distance.md,
                duration: duration.normal,
                delay: delay.normal * 3,
                easing: quintOut 
              }}
            >
              <button class="nav-button" on:click={prevSlide} aria-label="Previous slide">
                <ArrowLeft size={24} />
              </button>
              <button class="nav-button" on:click={nextSlide} aria-label="Next slide">
                <ArrowRight size={24} />
              </button>
            </div>
          </div>
        </div>
      {/if}

      {#if visibleSections.includes(1)}
        <div class="info-section flex-grow"
          in:fly={{ 
            x: distance.lg, 
            duration: duration.normal, 
            delay: delay.normal * 2,
            easing: quintOut 
          }}
        >
          <div class="section-shadow"></div>
          <div class="line-top-right" in:fly={{ x: distance.lg, duration: duration.slow, delay: delay.normal * 3 }}></div>
          <div class="line-bottom-right" in:fly={{ y: distance.lg, duration: duration.slow, delay: delay.normal * 3 }}></div>
          
          {#key currentIndex}
            <div 
              class="content" 
              in:fly={{ 
                y: distance.md,
                duration: duration.normal,
                easing: quintOut 
              }}
            >
              <h2
                in:fly={{ 
                  y: distance.md,
                  duration: duration.normal,
                  delay: delay.fast,
                  easing: quintOut 
                }}
              >
                {narrativePoints[currentIndex].title}
              </h2>
              <h3
                in:fly={{ 
                  y: distance.sm,
                  duration: duration.normal,
                  delay: delay.normal,
                  easing: quintOut 
                }}
              >
                {narrativePoints[currentIndex].subtitle}
              </h3>
              <p
                in:fly={{ 
                  y: distance.sm,
                  duration: duration.normal,
                  delay: delay.slow,
                  easing: quintOut 
                }}
              >
                {narrativePoints[currentIndex].description}
              </p>
              {#if narrativePoints[currentIndex].title === "5x"}
                <div 
                  class="reference-link"
                  in:fly={{ 
                    y: distance.sm,
                    duration: duration.normal,
                    delay: delay.slow + 100,
                    easing: quintOut 
                  }}
                >
                  <a 
                    href="https://www.wing.vc/content/ai-growing-faster-than-saas"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="source-link"
                  >
                    <Label text="SOURCE: WING VC" variant="semisolid" />
                  </a>
                </div>
              {/if}
              {#if narrativePoints[currentIndex].title === "$75M"}
                <div 
                  class="reference-link"
                  in:fly={{ 
                    y: distance.sm,
                    duration: duration.normal,
                    delay: delay.slow + 100,
                    easing: quintOut 
                  }}
                >
                  <Label text="SOURCE: PANTO RESEARCH" variant="outline" />
                </div>
              {/if}
              {#if narrativePoints[currentIndex].title === "257%"}
                <div 
                  class="reference-link"
                  in:fly={{ 
                    y: distance.sm,
                    duration: duration.normal,
                    delay: delay.slow + 100,
                    easing: quintOut 
                  }}
                >
                  <a 
                    href="https://bidenwhitehouse.archives.gov/cea/written-materials/2025/01/14/ai-talent-report"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="source-link"
                  >
                    <Label text="SOURCE: WHITE HOUSE" variant="semisolid" />
                  </a>
                </div>
              {/if}
              {#if narrativePoints[currentIndex].title === "4.6x"}
                <div 
                  class="reference-link"
                  in:fly={{ 
                    y: distance.sm,
                    duration: duration.normal,
                    delay: delay.slow + 100,
                    easing: quintOut 
                  }}
                >
                  <a 
                    href="https://www.reddit.com/r/LocalLLaMA/comments/1if43uf/sam_altman_openai_has_been_on_the_wrong_side_of/?rdt=42743"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="source-link"
                  >
                    <Label text="SOURCE: SAM ALTMAN" variant="semisolid" />
                  </a>
                </div>
              {/if}
            </div>
          {/key}

          <div 
            class="progress-bar"
            in:fly={{ 
              y: distance.md,
              duration: duration.normal,
              delay: delay.normal * 4,
              easing: quintOut 
            }}
          >
            {#each narrativePoints as point, i}
              <button 
                class="progress-indicator" 
                class:active={currentIndex === i}
                style="--indicator-color: {point.color}"
                on:click={() => currentIndex = i}
              />
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>

  .narrative-section {
    margin-top: 6rem;
    margin-bottom: 6rem;
  }

  .title-section {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    min-width: 300px;
    position: relative;
    z-index: 2;
  }

  .title-wrapper {
    display: flex;
    align-items: flex-end;
  }

  h1 {
    font-size: 6rem !important;
    line-height: 0.9;
    margin: 0;
    font-family: var(--font-family-display);
    color: var(--text-color);
    text-align: right;
  }

  .button-group {
    display: flex;
    gap: 1rem;
  }

  .nav-button {
    background: transparent;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    opacity: 0.4;
    transition: opacity 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-button:hover {
    opacity: 0.8;
  }

  :global(.nav-button svg) {
    color: var(--text-color);
  }

  :global(.nav-button:first-child:hover),
  :global(.nav-button:last-child:hover) {
    transform: none;
  }

  .info-section {
    border: none;
    padding: 6rem;
    position: relative;
    height: 700px;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
    box-sizing: border-box;
    overflow: visible;
    isolation: isolate;
    z-index: 1;
    background-color: color-mix(in srgb, var(--bg-color) 95%, transparent);
    box-shadow: var(--section-shadow);
  }

  /* Add theme-specific shadow colors */
  :global(.dark) .info-section {
    --section-shadow: 0 0 60px 20px color-mix(in srgb, var(--purple-mid) 2%, transparent);
  }

  :global(.light) .info-section {
    --section-shadow: 0 0 60px 20px color-mix(in srgb, var(--purple-darker) 8%, transparent);
  }

  .section-shadow {
    display: none;
  }

  /* Main box border */
  .info-section::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 0.5px solid var(--text-color);
    opacity: 0.4;
    pointer-events: none;
  }

  /* Top left extending line */
  .info-section::before {
    content: '';
    position: absolute;
    width: 0.5px;
    height: 80px;
    top: 0;
    left: 0;
    transform: translateY(-100%);
    background-color: var(--text-color);
    opacity: 0.4;
    pointer-events: none;
  }

  /* Create two more pseudo-elements for the other lines */
  .info-section .line-top-right,
  .info-section .line-bottom-right {
    content: '';
    position: absolute;
    background-color: var(--text-color);
    opacity: 0.4;
    pointer-events: none;
  }

  /* Top right extending line */
  .info-section .line-top-right {
    width: 80px;
    height: 0.5px;
    top: -0.5px;
    right: 0;
    transform: translateX(100%);
  }

  /* Bottom right extending line */
  .info-section .line-bottom-right {
    width: 0.5px;
    height: 80px;
    bottom: -0.5px;
    right: -0.5px;
    transform: translateY(100%);
  }

  .flex-row {
    width: 100%;
  }

  .content {
    max-width: 100%;
    text-align: left;
    margin: 0 auto;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .content p {
    margin-left: 0;
    margin-right: 0;
    width: 100%;
    max-width: 500px;
  }

  h2 {
    font-size: 6rem;
    margin: 0;
    line-height: 1;
    font-family: var(--font-family-display);
    color: var(--text-color);
  }

  h3 {
    font-size: 2.5rem;
    margin: 1rem 0 0 0;
    color: var(--text-color);
    font-weight: normal;
    width: 100%;
  }

  p {
    font-size: 1rem;
    color: var(--text-color-secondary);
    margin: 2rem 0 0 0;
    line-height: 1.6;
    max-width: 500px;
  }

  .progress-bar {
    position: absolute;
    display: flex;
    left: 0;
    width: 100%;
    bottom: 0;
  }

  .progress-indicator {
    width: 100%;
    height: 8px;
    background-color: var(--blue-darker);
    border: solid 0.5px var(--text-color);
    border-bottom: none;
    border-left: none;
    border-right: none;
    cursor: pointer;
    opacity: 0.3;
    transition: opacity 0.3s ease, background-color 0.3s ease;
    border-radius: 0;
    margin: 0;
    padding: 0;
  }

  .progress-indicator:not(:last-child) {
    border-right: solid 0.5px var(--text-color);
  }

  .progress-indicator.active {
    opacity: 1;
    background-color: var(--blue-mid);
  }

  @media (max-width: 992px) {
    h1 {
      font-size: 4.5rem !important;
    }

    h2 {
      font-size: 4.5rem;
    }

    h3 {
      font-size: 2rem;
    }

    .title-section {
      padding-top: 0;
      min-width: 200px;
    }

    .info-section {
      height: 500px;
      padding: 3rem;
      margin-top: 0;
    }

    .flex-row.no-flex-wrap {
      gap: var(--spacing-medium);
    }

    .narrative-section {
      margin-bottom: 0;
    }
  }

  @media (max-width: 768px) {
    .narrative-section {
      padding: 0;
      margin-top: 0;
      margin-bottom: 0;
    }

    .flex-row.no-flex-wrap {
      flex-wrap: wrap;
      gap: var(--spacing-medium);
    }

    .title-section, .info-section {
      flex: 0 0 100%;
    }

    .title-section {
      align-items: center;
    }

    .title-wrapper {
      align-items: center;
      flex-direction: column;
      gap: 1rem;
    }

    h1 {
      font-size: 3.5rem !important;
      text-align: center;
    }

    h2 {
      font-size: 2.5rem;
    }

    h3 {
      font-size: 1.25rem;
    }

    p {
      font-size: 0.875rem;
    }

    .info-section {
      height: 400px;
      margin-top: 0;
      padding: 2rem;
    }
  }

  .reference-link {
    display: block;
    margin-top: 1rem;
    text-decoration: none;
    opacity: 0.8;
    transition: opacity 0.2s ease;
    width: fit-content;
  }

  .reference-link:hover {
    opacity: 1;
  }

  .source-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }

  :global(.reference-link .label) {
    border-radius: 100px;
    padding: 6px 16px;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
  }

</style> 