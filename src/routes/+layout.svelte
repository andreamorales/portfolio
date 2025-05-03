<script lang="ts">
  import { onMount } from 'svelte';
  import '../lib/styles/global.css';
  
  // Only use light theme
  let theme = 'light-theme';

  onMount(() => {
    // Always set light theme
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', 'light-theme');
      document.documentElement.className = 'light-theme';
    }
  });
</script>

<svelte:head>
  <link rel="icon" href="/favicon.png" type="image/svg+xml">
  <meta property="og:title" content="Andrea Morales - Product Design Leader">
  <meta property="og:description" content="Produce Designer focused on creative and technical tools.">
  <meta property="og:image" content="/images/og-preview.png">
  <meta property="og:url" content="https://www.andreamoralescoto.com">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
</svelte:head>

<div class="app-container">
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

  .app-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
  }
</style> 