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
  <button 
    class="toast"
    on:click={() => visible = false}
    on:keydown={(e) => {
      if (e.key === 'Enter' || e.key === 'Space') {
        visible = false;
      }
    }}
    type="button"
    aria-label="Close notification"
  >
    {message}
  </button>
{/if}

<style>
  .toast {
    position: fixed;
    bottom: var(--spacing-xl);
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--text-color);
    color: var(--bg-color);
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--border-radius);
    font-size: var(--font-size-sm);
    font-family: var(--font-recursive);
    font-variation-settings: 'CASL' 0, 'wght' 400;
    z-index: var(--z-100);
    animation: slideUp 0.3s var(--easing-standard);
    cursor: pointer;
    border: none;
  }
  
  @keyframes slideUp {
    from {
      transform: translate(-50%, 100%);
      opacity: 0;
    }
    to {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }
</style> 