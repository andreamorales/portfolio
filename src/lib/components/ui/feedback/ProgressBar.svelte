<script lang="ts">
  import { Progressbar } from 'flowbite-svelte';

  export let progress = 0;
</script>

<Progressbar {progress} size="h-4" labelInside />
