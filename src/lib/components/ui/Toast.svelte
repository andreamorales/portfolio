<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  
  export let message: string;
  export let duration: number = 3000; // Duration in milliseconds
  export let visible: boolean = false;
  
  let timer: ReturnType<typeof setTimeout>;
  
  // Watch for visibility changes
  $: if (visible) {
    // Clear any existing timer
    if (timer) clearTimeout(timer);
    
    // Set new timer
    timer = setTimeout(() => {
      visible = false;
    }, duration);
  }
  
  // Handle toast click for email fallback
  function handleToastClick() {
    // If message contains email, make it clickable
    if (message.includes('andreamoralescoto@gmail.com')) {
      window.location.href = 'mailto:andreamoralescoto@gmail.com';
    }
  }
  
  // Clean up timer on component destruction
  onDestroy(() => {
    if (timer) clearTimeout(timer);
  });
</script>

{#if visible}
  <div 
    class="toast"
    transition:fade={{ duration: 200 }}
    on:click={() => {
      handleToastClick();
      visible = false;
    }}
    on:keydown={(e) => {
      if (e.key === 'Enter' || e.key === 'Space') {
        handleToastClick();
        visible = false;
      }
    }}
    role="alert"
  >
    {message}
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    top: var(--spacing-xl);
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--text-color);
    color: var(--bg-color);
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--border-radius);
    font-size: var(--font-size-sm);
    font-family: var(--font-recursive);
    font-variation-settings: 'CASL' 0, 'wght' 400;
    z-index: 9999;
    cursor: pointer;
    pointer-events: auto;
  }
</style> 