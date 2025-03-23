<script>
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  // Split the text into words for animation
  const title = "Hi, I'm Andy";
  const subtitle = "Frontend Developer & UI Designer";
  
  let mounted = false;
  
  onMount(() => {
    mounted = true;
  });
</script>

{#if mounted}
  <section class="hero-section width-100 flex-column-center">
    <div class="container">
      <div class="hero-content flex-column-center">
        <h1 in:fly={{ y: -20, duration: 800, delay: 200, easing: quintOut }}>
          <span class="gradient-text">{title}</span>
        </h1>
        
        <div class="subtitle" in:fly={{ y: 20, duration: 800, delay: 400, easing: quintOut }}>
          <p>{subtitle}</p>
        </div>
        
        <div class="hero-cta" in:fly={{ y: 30, duration: 800, delay: 600, easing: quintOut }}>
          <a href="#projects" class="button button-primary">View My Work</a>
          <a href="#contact" class="button button-secondary">Get In Touch</a>
        </div>
      </div>
    </div>
  </section>
{/if}

<style>
  .hero-section {
    min-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl) 0;
  }

  .hero-content {
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
    gap: var(--spacing-lg);
  }

  h1 {
    font-size: 4rem;
    margin-bottom: var(--spacing-sm);
    line-height: 1.1;
  }

  .gradient-text {
    background: var(--text-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle p {
    font-size: var(--font-size-2xl);
    margin-bottom: var(--spacing-lg);
    color: var(--text-color-light);
  }

  .hero-cta {
    display: flex;
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 3rem;
    }
    
    .subtitle p {
      font-size: var(--font-size-xl);
    }
    
    .hero-cta {
      flex-direction: column;
      width: 100%;
    }
    
    .hero-cta a {
      width: 100%;
    }
  }
</style> 