<script lang="ts">
  import { goto } from '$app/navigation';
  import { createEventDispatcher } from 'svelte';
  import { Drawer } from '$lib/components/ui/dialog';
  import { logoSvg, userIconSvg } from '$lib/icons';

  const dispatch = createEventDispatcher();
  export let newUpload: () => void = () => dispatch(1);
  export let images: any = [];

  const goToProfile = () => {
    goto('/YourProfile', {});
  };

  function goToProtect() {
    newUpload();
    goto('/Scoring', {});
  }
</script>

<div class="desktop flex width-100">
  {#if images.length > 0}
    <Drawer {images} isMobile={false} />
  {/if}
  <a href="/Scoring" on:click|preventDefault={goToProtect} style="color: var(--text-color);">
    {@html logoSvg}
  </a>
  <button class="button-clear" on:click={goToProfile} style="color: var(--text-color);">
    {@html userIconSvg}
  </button>
</div>

<div class="mobile width-100 gap-medium">
  <Drawer {images} isMobile={true} />
  <button class="button-clear" on:click={goToProtect} style="color: var(--text-color);">
    {@html logoSvg}
  </button>
  <button class="button-clear" on:click={goToProfile} style="color: var(--text-color);">
    {@html userIconSvg}
  </button>
</div>

<style>
  .mobile {
    position: fixed;
    bottom: 0;
    padding: 24px;
    height: 6em;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    background-image: linear-gradient(#5a00ee00, #5a00ee98);
    z-index: 70;
  }

  .desktop {
    display: none;
  }

  button.button-clear {
    margin: 0;
    padding: 0;
    height: auto;
  }

  @media (min-width: 768px) {
    .desktop {
      display: flex;
      justify-content: space-between;
      flex-direction: row;
      align-items: center;
      padding: 16px;
      border-bottom: 0.5px solid var(--text-color);
    }

    .mobile {
      display: none;
    }
  }
</style>
