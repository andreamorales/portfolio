<script lang="ts">
  import chevronDown from '$lib/icons/chevronDown.svg';
  import { createEventDispatcher } from 'svelte';

  export let options: { label: string; text: string }[];
  export let id: string;
  export let value: string;

  const dispatch = createEventDispatcher();

  function handleChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    value = select.value;
    dispatch('change', value);
  }
</script>

<div class="select-wrapper">
  <select class="select" {id} {value} on:change={handleChange}>
    {#each options as option}
      <option value={option.label}>{option.text}</option>
    {/each}
  </select>
  <img class="chevron-down" src={chevronDown} alt="chevron-down" />
</div>

<style>
  .select-wrapper {
    position: relative;
  }

  .select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-color: color-mix(in srgb, var(--bg-color) 95%, transparent);
    border: 1px solid color-mix(in srgb, var(--text-color) 20%, transparent);
    color: var(--text-color);
    border-radius: 8px;
    padding: 0.5rem;
    width: 100%;
    font-size: 1rem;
    cursor: pointer;
  }

  .select:focus {
    outline: none;
    border-color: var(--text-color);
  }

  .select option {
    background-color: var(--bg-color);
    color: var(--text-color);
  }

  :global(.light) .select {
    background-color: var(--bg-color);
    border-color: color-mix(in srgb, var(--text-color) 20%, transparent);
  }

  :global(.light) .select option {
    background-color: var(--bg-color);
  }

  .chevron-down {
    position: absolute;
    top: 50%;
    right: 0.5em;
    transform: translateY(-50%);
    width: 0.85em;
    height: 0.85em;
    pointer-events: none;
    filter: brightness(0) saturate(100%) invert(1);
    opacity: 0.8;
  }

  :global(.light) .chevron-down {
    filter: brightness(0) saturate(100%);
  }
</style>
