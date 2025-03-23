<script lang="ts" context="module">
  import { Toast } from 'flowbite-svelte';
  import {
    CheckCircleSolid,
    ExclamationCircleSolid,
    CloseCircleSolid,
  } from 'flowbite-svelte-icons';
  import { createToaster, melt } from '@melt-ui/svelte';
  import { flip } from 'svelte/animate';
  import { fly, blur } from 'svelte/transition';

  export let text = 'Toast message';

  export type ToastData = {
    title?: string;
    description: string;
    color: string;
  };

  const {
    elements: { content, title, description, close },
    helpers,
    states: { toasts },
    actions: { portal },
  } = createToaster<ToastData>();

  export let addToast = helpers.addToast;
</script>

<div class="fixed top-0 z-50 top" use:portal>
  <div class="container">
    {#each $toasts as { id, data } (id)}
      <div
        class="toast"
        use:melt={$content(id)}
        animate:flip={{ duration: 4500 }}
        in:fly={{ duration: 150, x: '100%' }}
        out:fly={{ duration: 150, x: '100%' }}
      >
        <Toast transition={blur} color="none" params={{ amount: 50 }}>
          <CheckCircleSolid
            slot="icon"
            class="w-6 h-6 text-primary-500 bg-primary-100 dark:bg-primary-800 dark:text-primary-200"
          />
          {data.description}
        </Toast>
        <div use:melt={$description(id)}>
          {data.description}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .top {
    display: flex;
    flex-direction: column;
    width: 100vw;
    align-items: center;
    align-content: center;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    align-content: center;
  }

  .toast {
    background-color: var(--purple);
    margin: 0.5em;
    border-radius: 8px;
    padding: 16px;
    font-size: small;
    color: var(--white);
    font-weight: 500;
  }
</style>
