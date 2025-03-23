<script lang="ts">
  import { Gallery } from 'flowbite-svelte';
  import ImagePreview from './ImagePreview.svelte';
  import { goto } from '$app/navigation';
  import { getImageUrl } from '$lib/services';

  export let images: any[];
</script>

<Gallery class="gap-4" items={images} let:item>
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div
    on:click={() => goto(getImageUrl(item))}
    class="flex-column-center h-auto max-w-full cursor-pointer"
  >
    <ImagePreview imageData={item.data} maxSize={200} />
    <div class="text-[xx-small] text-white">{item.name}</div>
  </div>
</Gallery>
