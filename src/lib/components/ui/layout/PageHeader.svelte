<script lang="ts">
  import { Label } from '$lib/components/ui/input';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  export let title: string;
  export let description: string = '';
  export let label: string;

  // Split title into words and letters
  $: letters = title.split(' ').map(word => ({
    chars: word.split('').map(char => ({
      char,
      isSpace: false
    })),
    isLastWord: false
  }));
</script>

<div class="page-header gap-extra-small">
  <div transition:fly={{ y: 20, duration: 800, delay: 0, easing: quintOut }}>
    <Label text={label} />
  </div>
  <div class="header-content flex-column gap-small">
    <h1 transition:fly={{ y: 20, duration: 800, delay: 100, easing: quintOut }}>
      {#each letters as word, wordIndex}
        <span class="word">
          {#each word.chars as { char }, charIndex}
            <span class="gradient-letter">{char}</span>
          {/each}
        </span>
        {#if wordIndex < letters.length - 1}
          <span class="gradient-letter">&nbsp;</span>
        {/if}
      {/each}
    </h1>
    {#if description}
      <p class="description" transition:fly={{ y: 20, duration: 800, delay: 200, easing: quintOut }}>{description}</p>
    {/if}
  </div>
</div>

<style>
  h1 {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    line-height: 1.2;
    margin: 0;
    padding: 0;
    width: min(800px, 100%);
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

  @media (max-width: 768px) {
    h1 {
      width: 100%;
    }
    
    .gradient-letter {
      font-size: 2.5rem;
    }
  }

  /* Add this to ensure the gradient works in Firefox */
  @-moz-document url-prefix() {
    .gradient-letter {
      color: var(--text-color);
      background: none;
      -webkit-text-fill-color: initial;
      text-fill-color: initial;
    }
  }

  .page-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: var(--gap-large);
  }

  .header-content {
    align-items: center;
  }

  .description {
    font-size: 1.2rem;
    color: var(--text-color-secondary);
    max-width: min(1000px, 100%);
    text-align: center;
    margin: 0;
  }
</style> 