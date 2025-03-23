<script lang="ts">
  import { createDialog, melt } from '@melt-ui/svelte';
  import { fade, fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { galleryIcon, tabIcon } from '$lib/icons';
  import { Gallery } from '$lib/components/ui/media';

  export let isMobile: boolean = false;

  export let images: any[] = [];

  const {
    elements: { trigger, overlay, content, title, portalled },
    states: { open },
  } = createDialog({
    forceVisible: true,
    preventScroll: false,
  });

  onMount(() => {
    // console.log(`images:`, images);
  });
</script>

{#if isMobile}
  <div use:melt={$trigger} class={'cursor-pointer bg-transparent'}>
    <img src={galleryIcon} alt="Gallery" />
  </div>

  {#if $open}
    <div class="" use:melt={$portalled}>
      <div
        use:melt={$overlay}
        class="fixed inset-0 z-50 bg-black/50"
        transition:fade={{ duration: 150 }}
      />
      <div
        use:melt={$content}
        class="border-top-1 border-bottom-0 border-left-0 focus:border-1 focus:border-bottom-0 fixed left-0
              bottom-0 z-50 h-[75vh] w-[100vw] overflow-y-scroll
              bg-black focus:outline-none focus:ring-1 focus:ring-[#06c8f2] p-8"
        transition:fly={{
          y: 350,
          duration: 300,
          opacity: 1,
        }}
      >
        <!-- DRAWER OPEN -->
        <div class="flex-column-center">
          <div class="title">
            <h2 use:melt={$title}>Gallery</h2>
            <hr class="solid" />
          </div>
        </div>

        <Gallery {images} />
      </div>
    </div>
  {/if}
{:else if $open}
  <div class="" use:melt={$portalled}>
    <div
      use:melt={$overlay}
      class="fixed inset-0 z-50 bg-black/50"
      transition:fade={{ duration: 150 }}
    />
    <div
      use:melt={$content}
      class="border-1 fixed left-[1px] top-[10vh] z-50 h-[75vh] max-w-[250px] overflow-y-scroll rounded-r-md bg-black p-6 focus:outline-none focus:ring-1 focus:ring-[#06c8f2]"
      transition:fly={{
        x: -350,
        duration: 300,
        opacity: 1,
      }}
    >
      <!-- DRAWER OPEN -->
      <div class="flex-column-center mb-4">
        <div class="title">
          <h2 use:melt={$title}>Gallery</h2>
          <hr class="solid" />
        </div>
      </div>

      <Gallery {images} />
    </div>
  </div>
{:else}
  <!-- DRAWER CLOSED -->
  <div
    use:melt={$trigger}
    class={'fixed left-[25px] top-[35vh] cursor-pointer bg-transparent'}
  >
    <img src={tabIcon} alt="" />
  </div>
{/if}

<style>
  .title {
    width: fit-content;
  }

  h2 {
    width: 100%;
    text-align: center;
    font-size: large;
    margin-bottom: 0;
  }

  hr.solid {
    border-top: 3px solid var(--lightblue);
  }

  ::-webkit-scrollbar {
    width: 2px;
  }

  ::-webkit-scrollbar-thumb {
    width: 2px;
    background-color: var(--lightblue);
  }

  ::-webkit-scrollbar-track {
    background-color: transparent;
  }

  ::-webkit-scrollbar-corner {
    background-color: transparent;
  }
</style>
