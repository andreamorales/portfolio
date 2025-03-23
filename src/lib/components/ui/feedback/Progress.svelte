<script lang="ts">
  import { createProgress, melt } from '@melt-ui/svelte';
  import { writable } from 'svelte/store';
  import alertIcon from '$lib/icons/alert.svg';

  export let progressValue: number;

  const value = writable(progressValue);

  const {
    elements: { root },
    options: { max },
  } = createProgress({
    value,
    max: 100,
  });
</script>

<div class="flex-col">
  <div
    use:melt={$root}
    class="flex items-center ml-10 relative h-3 w-[150px] overflow-hidden rounded-[99999px] bg-black/40"
  >
    <div
      class="h-full w-full bg-[#4D3800] transition-transform duration-[660ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
      style={`transform: translateX(-${100 - (100 * ($value ?? 0)) / ($max ?? 1)}%)`}
    />
  </div>

  <div class="flex items-center mt-2">
    <img src={alertIcon} alt="Alert icon" class="w-8 h-8" />

    <slot />
  </div>
</div>
