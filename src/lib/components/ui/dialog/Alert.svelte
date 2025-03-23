<script lang="ts">
  import { createDialog, createProgress, melt } from '@melt-ui/svelte';
  import { fade } from 'svelte/transition';
  import { writable } from 'svelte/store';
  import alertIcon from '$lib/icons/alert.svg';
  import { alertDetailsByType } from '$lib/utils';

  export let details = alertDetailsByType.imageProcessing;
  export let progress = 0;

  const {
    elements: { overlay, content, portalled },
    states: { open },
  } = createDialog({
    role: 'alertdialog',
    defaultOpen: true,
  });

  let root: any;
  let max: any;

  const progressValue = writable(progress);

  if (details.progress) {
    const { elements, options } = createProgress({
      value: progressValue,
      max: 100,
    });

    ({ root } = elements);
    ({ max } = options);
  }
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
      {#if root}
        <div
          use:melt={$root}
          class="flex items-center ml-10 relative h-3 w-[150px] overflow-hidden rounded-[99999px] bg-black/40"
        >
          <div
            class="h-full w-full bg-[#4D3800] transition-transform duration-[660ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
            style={`transform: translateX(-${100 - (100 * (progress ?? 0)) / ($max ?? 1)}%)`}
          />
        </div>
      {/if}

      <div class="flex items-center mt-2">
        <img src={alertIcon} alt="Alert icon" class="w-8 h-8" />
        <div class="flex-col text-[#191919] text-sm ml-2">
          <div class="text-base font-bold">{details.title}</div>
          <div>
            {details.subTitle}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
