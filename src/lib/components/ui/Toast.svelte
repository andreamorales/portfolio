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
    transition:fade
    on:click={handleToastClick}
  >
    {message}
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    top: var(--spacing-lg);
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--text-color);
    color: var(--bg-color);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius);
    font-family: var(--font-family);
    font-size: var(--font-size-sm);
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    cursor: pointer; /* Show clickable cursor */
  }
  
  @media (max-width: 768px) {
    .toast {
      position: fixed;
      top: calc(env(safe-area-inset-top, 0px) + 20px);
      width: calc(100% - var(--spacing-lg));
      max-width: none;
      text-align: center;
      z-index: 9999;
      margin-top: 40px;
    }
  }
</style> 