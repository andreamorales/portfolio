<script lang="ts">
  import { onMount } from 'svelte';
  import '../lib/styles/global.css';
  
  let theme = 'light-theme';

  function toggleTheme() {
    theme = theme === 'light-theme' ? 'dark-theme' : 'light-theme';
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      document.documentElement.className = theme;
    }
  }

  onMount(() => {
    // Check for saved theme preference or default to light mode
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      
      if (savedTheme) {
        theme = savedTheme;
      } else {
        // Always default to light theme
        theme = 'light-theme';
      }
      
      document.documentElement.className = theme;
    }
  });
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
</svelte:head>

<div class="app-container">
  <div class="theme-toggle-container">
    <button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle theme">
      {#if theme === 'dark-theme'}
        <span>☀️</span>
      {:else}
        <span>🌙</span>
      {/if}
    </button>
  </div>

  <main class="app-main">
    <slot />
  </main>
</div>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    position: relative;
  }

  .theme-toggle-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 100;
  }

  .theme-toggle {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    font-size: 1.25rem;
    border-radius: 50%;
    transition: all var(--transition-fast) ease;
    opacity: 0.7;
  }

  .theme-toggle:hover {
    opacity: 1;
    transform: scale(1.1);
  }

  .app-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
  }
</style> 