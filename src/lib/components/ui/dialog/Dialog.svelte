<script lang="ts">
  import { createDialog, melt } from '@melt-ui/svelte';
  import { fade } from 'svelte/transition';

  const {
    elements: { overlay, content, portalled },
    states: { open },
  } = createDialog({
    role: 'alertdialog',
    defaultOpen: true,
  });
</script>

{#if $open}
  <div class="" use:melt={$portalled}>
    <div use:melt={$overlay} class="fixed inset-0 z-50 bg-black/50" />
    <div
      class="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[90vw]
            max-w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-yellow
            p-4 pb-6 shadow-lg"
      transition:fade={{
        duration: 500,
      }}
      use:melt={$content}
    >
      <slot />
    </div>
  </div>
{/if}
