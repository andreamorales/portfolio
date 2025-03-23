<script>
  import { blur } from 'svelte/transition';
  import { checkCheckIcon } from '$lib/icons';
  export let imageProtected = false;
  export let text = '';
</script>

<div
  class={`title flex-row gap-2 items-center ${imageProtected ? 'opacity-100' : 'opacity-50'}`}
  transition:blur={{
    opacity: 50,
    duration: 500,
    delay: 500,
    amount: 1,
  }}
>
  <img src={checkCheckIcon} alt="Icon depicting two green check marks" />
  <p class="text-xs md:text-[14px]">{text}</p>
</div>
