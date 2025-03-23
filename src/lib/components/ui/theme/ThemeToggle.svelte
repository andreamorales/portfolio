<script lang="ts">
    import { theme } from '$lib/stores/theme';
    import { Sun, Moon } from 'lucide-svelte';
    import { page } from '$app/stores';
  
    export let showOnHome = false;
  
    const toggleTheme = () => {
      theme.update(current => current === 'light' ? 'dark' : 'light');
    };

    $: isHomePage = $page.url.pathname === '/';
    $: shouldShow = !isHomePage || showOnHome;
</script>
  
{#if shouldShow}
  <button class="button-clear theme-toggle" on:click={toggleTheme}>
    {#if $theme === 'light'}
      <Moon size={24} />
    {:else}
      <Sun size={24} />
    {/if}
  </button>
{/if}
  
<style>
    .theme-toggle {
      padding: 0.75em;
      cursor: pointer;
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 1000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      width: auto;
      height: auto;
      transition: transform 0.2s ease;
    }
  
    .theme-toggle:hover {
      transform: scale(1.1);
    }
</style> 