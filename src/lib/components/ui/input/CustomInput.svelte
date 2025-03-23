<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { ComponentType } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  export let value: string = '';
  export let type: 'text' | 'password' | 'email' | 'number' | 'tel' = 'text';
  export let placeholder: string = '';
  export let name: string = '';
  export let id: string = '';
  export let required: boolean = false;
  export let disabled: boolean = false;
  export let autocomplete: string = '';
  export let maxWidth: string | undefined = undefined;
  export let minWidth: string = '140px';
  export let icon: ComponentType | null = null;
  export let iconSize: number = 16;
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let style: string = '';
  export let fullWidth: boolean = true;
  
  // Size configurations
  const sizeConfig = {
    small: {
      padding: '4px 10px',
      minHeight: '28px',
      fontSize: 'x-small'
    },
    medium: {
      padding: '6px 12px',
      minHeight: '36px',
      fontSize: 'small'
    },
    large: {
      padding: '8px 16px',
      minHeight: '44px',
      fontSize: 'medium'
    }
  };

  $: currentSize = sizeConfig[size];
  
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    dispatch('input', { value });
  }
  
  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    dispatch('change', { value });
  }
  
  function handleFocus() {
    dispatch('focus');
  }
  
  function handleBlur() {
    dispatch('blur');
  }
</script>

<div 
  class="custom-input-wrapper"
  class:full-width={fullWidth}
  style="max-width: {maxWidth || (fullWidth ? '100%' : 'fit-content')}; min-width: {minWidth}; {style}"
>
  <div class="input-container" style="padding: {currentSize.padding}; min-height: {currentSize.minHeight};">
    {#if icon}
      <div class="icon-container">
        <svelte:component this={icon} size={iconSize} />
      </div>
    {/if}
    
    {#if type === 'text'}
      <input
        type="text"
        {name}
        {id}
        {placeholder}
        {required}
        {disabled}
        {autocomplete}
        bind:value
        on:input={handleInput}
        on:change={handleChange}
        on:focus={handleFocus}
        on:blur={handleBlur}
        style="font-size: {currentSize.fontSize};"
      />
    {:else if type === 'password'}
      <input
        type="password"
        {name}
        {id}
        {placeholder}
        {required}
        {disabled}
        {autocomplete}
        bind:value
        on:input={handleInput}
        on:change={handleChange}
        on:focus={handleFocus}
        on:blur={handleBlur}
        style="font-size: {currentSize.fontSize};"
      />
    {:else if type === 'email'}
      <input
        type="email"
        {name}
        {id}
        {placeholder}
        {required}
        {disabled}
        {autocomplete}
        bind:value
        on:input={handleInput}
        on:change={handleChange}
        on:focus={handleFocus}
        on:blur={handleBlur}
        style="font-size: {currentSize.fontSize};"
      />
    {:else if type === 'number'}
      <input
        type="number"
        {name}
        {id}
        {placeholder}
        {required}
        {disabled}
        {autocomplete}
        bind:value
        on:input={handleInput}
        on:change={handleChange}
        on:focus={handleFocus}
        on:blur={handleBlur}
        style="font-size: {currentSize.fontSize};"
      />
    {:else if type === 'tel'}
      <input
        type="tel"
        {name}
        {id}
        {placeholder}
        {required}
        {disabled}
        {autocomplete}
        bind:value
        on:input={handleInput}
        on:change={handleChange}
        on:focus={handleFocus}
        on:blur={handleBlur}
        style="font-size: {currentSize.fontSize};"
      />
    {/if}
  </div>
</div>

<style>
  .custom-input-wrapper {
    position: relative;
    font-family: var(--font-family);
  }

  .full-width {
    width: 100%;
  }

  .input-container {
    width: 100%;
    border: 1px solid color-mix(in srgb, var(--text-color) 20%, transparent);
    border-radius: var(--border-radius);
    background: var(--clear);
    color: var(--text-color);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-color);
    opacity: 0.7;
    flex-shrink: 0;
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-color);
    width: 100%;
    font-family: var(--font-family);
  }

  input::placeholder {
    color: var(--text-muted);
    opacity: 0.6;
  }

  input:focus {
    outline: none;
  }

  .input-container:focus-within {
    border-color: color-mix(in srgb, var(--accent-color) 60%, transparent);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-color) 30%, transparent);
  }

  input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .input-container:has(input:disabled) {
    opacity: 0.8;
    background: color-mix(in srgb, var(--bg-color) 95%, var(--text-color) 5%);
  }
</style> 