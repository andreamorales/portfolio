<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { goto } from '$app/navigation';
  import { ArrowRight } from 'lucide-svelte';
  import { Label } from '$lib/components/ui/input';
  import { duration, delay, distance, stagger } from '$lib/styles/animation-constants';

  let mounted = false;
  let visibleCards: number[] = [];
  let sectionContainer: HTMLElement;
  let sectionInView = false;
  let hasAnimated = false;

  // Split titles into words and letters
  function splitTitle(title: string) {
    return title.split(' ').map(word => ({
      chars: word.split('').map(char => ({
        char,
        isSpace: false
      })),
      isLastWord: false
    }));
  }

  const features = [
    {
      label: 'Novelty Scoring',
      platformType: 'Valuation' as const,
      title: 'Score Data Novelt',
      titleLetters: splitTitle('Measure Data Impact'),
      description: 'Discover which parts of your data matter are most surprising to AI models. Compare models and identify your most valuable assets.',
      path: '/Platform/NoveltyScoring'
    },
    {
      label: 'Tiny Evals',
      platformType: 'Evals' as const,
      title: 'Evaluate Data Potential',
      titleLetters: splitTitle('Evaluate Data Potential'),
      description: 'Test how data would improve fine-tuning and RAG systems before investing resources. Identify the most effective content, no matter how subjective the eval.',
      path: '/Platform/TinyEvals'
    }
  ];

  const showCards = () => {
    if (hasAnimated) return;
    
    // Get section position relative to viewport
    const rect = sectionContainer.getBoundingClientRect();
    
    // Calculate how far the section is through the viewport (0 = at bottom, 1 = at top)
    const progress = rect.bottom / window.innerHeight;
    
    // Start showing cards when section is 20% into view, complete by 60% into view
    const scrollProgress = Math.max(0, Math.min(1, (progress - 0.4) / 0.4));
    
    // Show cards based on scroll progress
    const cardsToShow = Math.floor(scrollProgress * features.length);
    if (cardsToShow > 0) {
      visibleCards = Array.from({ length: cardsToShow }, (_, i) => i);
      if (cardsToShow === features.length) {
        hasAnimated = true; // Mark as animated once all cards are shown
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
            showCards(); // Initial check
          } else if (!hasAnimated) {
            visibleCards = []; // Only hide if we haven't animated yet
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
    showCards();
  }
</script>

<div class="feature-cards-grid" bind:this={sectionContainer}>
  {#if mounted}
    {#each features as feature, i}
      {#if visibleCards.includes(i)}
        <a
          href={feature.path}
          class="feature-card hover-scale width-100"
          class:progressive={feature.platformType === 'Evals'}
          class:valuation={feature.platformType === 'Valuation'}
          on:click|preventDefault={() => goto(feature.path)}
          in:fly={{ 
            y: distance.lg,
            x: i % 2 === 0 ? -distance.sm : distance.sm,
            duration: duration.normal,
            delay: i * stagger.normal,
            easing: quintOut 
          }}
        >
          <div 
            class="card-content flex-column gap-small"
            in:fade={{
              duration: duration.slow,
              delay: (i * stagger.normal) + delay.normal
            }}
          >
            <Label 
              text={feature.label} 
              variant="platform" 
              platformType={feature.platformType} 
            />
            <h2>
              {#each feature.titleLetters as word, wordIndex}
                <span 
                  class="word"
                  in:fly={{
                    y: distance.sm,
                    duration: duration.normal,
                    delay: (i * stagger.normal) + (wordIndex * stagger.tight) + delay.slow,
                    easing: quintOut
                  }}
                >
                  {#each word.chars as { char }, charIndex}
                    <span 
                      class="gradient-letter"
                      in:fly={{
                        y: distance.sm,
                        duration: duration.fast,
                        delay: (i * stagger.normal) + (wordIndex * stagger.tight) + (charIndex * 25) + delay.slow,
                        easing: quintOut
                      }}
                    >{char}</span>
                  {/each}
                </span>
                {#if wordIndex < feature.titleLetters.length - 1}
                  <span class="gradient-letter">&nbsp;</span>
                {/if}
              {/each}
            </h2>
            <p
              in:fly={{
                y: distance.sm,
                duration: duration.normal,
                delay: (i * stagger.normal) + delay.slow + 200,
                easing: quintOut
              }}
            >{feature.description}</p>
            <div 
              class="button-container"
              in:fly={{
                x: distance.md,
                duration: duration.normal,
                delay: (i * stagger.normal) + delay.slow + 300,
                easing: quintOut
              }}
            >
              <button class="button-primary">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </a>
      {/if}
    {/each}
  {/if}
</div>

<style>
  .feature-cards-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2rem;
    width: 100%;
    position: relative;
    padding-top: 3rem;
    padding-bottom: 3rem;
    overflow: visible;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
  }

  .feature-card {
    background-color: color-mix(in srgb, var(--bg-color) 95%, transparent);
    border: 1px solid color-mix(in srgb, var(--text-color) 20%, transparent);
    border-radius: 24px;
    padding: 2rem;
    min-height: 20rem;
    display: flex;
    flex-direction: column;
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, filter 0.3s ease;
    position: relative;
    z-index: 1;
    overflow: visible;
    isolation: isolate;
    filter: var(--card-filter);
    box-sizing: border-box;
  }

  /* Add theme-specific shadow colors */
  :global(.dark) .feature-card {
    --card-filter: drop-shadow(0 0 30px color-mix(in srgb, var(--purple-mid) 2%, transparent));
  }

  :global(.light) .feature-card {
    --card-filter: drop-shadow(0 0 30px color-mix(in srgb, var(--purple-darker) 8%, transparent));
  }

  .feature-card.progressive:hover {
    border-color: var(--cyan-mid);
    background-color: color-mix(in srgb, var(--cyan-darkest) 5%, transparent);
    --card-filter: drop-shadow(0 0 40px color-mix(in srgb, var(--cyan-mid) 10%, transparent));
  }

  .feature-card.valuation:hover {
    border-color: var(--pink-mid);
    background-color: color-mix(in srgb, var(--pink-darkest) 5%, transparent);
    --card-filter: drop-shadow(0 0 40px color-mix(in srgb, var(--pink-mid) 10%, transparent));
  }

  h2 {
    font-size: 3.5rem;
    margin: 0;
    padding: 0;
    line-height: 1.2;
    font-family: var(--font-family-display);
    display: flex;
    flex-wrap: wrap;
  }

  .word {
    white-space: nowrap;
  }

  .gradient-letter {
    font-size: 3.5rem;
    background: var(--text-gradient);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
  }

  p {
    font-size: 1rem;
    color: var(--text-color-secondary);
    margin: 0;
    line-height: 1.6;
  }

  .card-content {
    align-items: flex-start;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .button-container {
    margin-top: auto;
    padding-top: 1rem;
  }

  .feature-card:hover .button-primary {
    transform: translateX(4px);
  }

  @media (max-width: 992px) {
    .feature-cards-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1.5rem;
      padding-bottom: 4rem;
    }

    .feature-card {
      padding: 1.75rem;
      min-height: 10rem;
    }

    h2 {
      font-size: 3rem;
    }

    .gradient-letter {
      font-size: 3rem;
    }
  }

  @media (max-width: 768px) {
    .feature-cards-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
      padding-bottom: 3rem;
    }

    .feature-card {
      padding: 1.5rem;
      width: 100%;
      min-height: 400px;
    }

    h2 {
      font-size: 2.5rem;
    }

    .gradient-letter {
      font-size: 2.5rem;
    }
  }
</style> 