<script lang="ts">
  import { Spinner } from 'flowbite-svelte';

  export let size = 8;
  export let color:
    | 'primary'
    | 'blue'
    | 'gray'
    | 'green'
    | 'red'
    | 'yellow'
    | 'pink'
    | 'purple'
    | 'white'
    | 'custom'
    | undefined = 'green';
</script>

<Spinner {size} {color} bg="blue" />
