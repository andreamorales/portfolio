<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  
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
  
  // Clean up timer on component destruction
  onDestroy(() => {
    if (timer) clearTimeout(timer);
  });
</script>

<div class="toast" class:visible>
  <span>{message}</span>
</div>

<style>
  .toast {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-100px);
    background-color: var(--black);
    color: white;
    padding: 12px 20px;
    border-radius: var(--border-radius);
    font-family: var(--font-family);
    font-size: var(--font-size-sm);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    opacity: 0;
    transition: transform 0.3s ease, opacity 0.3s ease;
    text-align: center;
    min-width: 200px;
    max-width: 80%;
  }
  
  .toast.visible {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    .toast {
      width: 90%;
      max-width: 90%;
    }
  }
</style> 