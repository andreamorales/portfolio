<script lang="ts">
  import { ChevronDown } from 'lucide-svelte';
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import type { ComponentType } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  export let value: string | null;
  export let options: Array<{value: string, label: string}>;
  export let placeholder: string = "Choose an option...";
  export let maxWidth: string | undefined = undefined;
  export let minWidth: string = "140px";
  export let showBatchView: boolean = false;
  export let showActiveDot: boolean = false;
  export let icon: ComponentType | null = null;
  export let iconSize: number = 16;
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export const style: string = "";
  
  let isOpen = false;
  let selectContainer: HTMLElement;
  
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
  
  function handleSelect(option: {value: string, label: string}) {
    const oldValue = value;
    value = option.value;
    isOpen = false;
    console.log('CustomSelect - handleSelect called with option:', option, 'old value:', oldValue, 'new value:', value);
    
    // Always dispatch the change event, even if the value hasn't changed
    // This ensures the parent component is notified
    dispatch('change', { value: option.value, oldValue });
  }

  function truncateMiddle(str: string, maxLength: number = 20) {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    
    const ellipsis = '...';
    const charsToShow = maxLength - ellipsis.length;
    const frontChars = Math.ceil(charsToShow/2);
    const backChars = Math.floor(charsToShow/2);
    
    return str.substr(0, frontChars) + ellipsis + str.substr(str.length - backChars);
  }

  $: displayText = value != null 
    ? truncateMiddle(options.find(opt => opt.value === value)?.label || '') 
    : placeholder;

  function handleClick(event: MouseEvent) {
    event.stopPropagation();
    isOpen = !isOpen;
    console.log('CustomSelect - handleClick, isOpen:', isOpen);
  }

  function handleOptionClick(option: {value: string, label: string}) {
    console.log('CustomSelect - handleOptionClick with option:', option);
    handleSelect(option);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      isOpen = !isOpen;
    } else if (event.key === 'Escape' && isOpen) {
      isOpen = false;
    }
  }

  function handleOptionKeyDown(event: KeyboardEvent, option: {value: string, label: string}) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect(option);
    }
  }

  // Function to determine if text should be light or dark based on background
  function getTextColor(background: string) {
    if (typeof document === 'undefined') {
      return 'var(--text-color)'; // Default for SSR
    }
    
    // Get the background color from CSS variable if it's one
    const computedBg = background.startsWith('var(') 
      ? getComputedStyle(document.documentElement).getPropertyValue(background.slice(4, -1))
      : background;
    
    // Convert hex or rgb to rgb values
    let r, g, b;
    if (computedBg.startsWith('#')) {
      r = parseInt(computedBg.slice(1, 3), 16);
      g = parseInt(computedBg.slice(3, 5), 16);
      b = parseInt(computedBg.slice(5, 7), 16);
    } else if (computedBg.startsWith('rgb')) {
      const matches = computedBg.match(/\d+/g);
      if (!matches) return 'var(--text-color)';
      [r, g, b] = matches.map(Number);
    } else {
      return 'var(--text-color)'; // fallback
    }
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return appropriate text color
    return luminance > 0.5 ? 'var(--inverse-content)' : 'var(--text-color)';
  }

  // Update the computed value to only show dot when enabled and appropriate
  $: showDot = showActiveDot && value != null && !isOpen;

  // Handle clicks outside the component
  function handleClickOutside(event: MouseEvent) {
    if (selectContainer && !selectContainer.contains(event.target as Node) && isOpen) {
      isOpen = false;
    }
  }

  onMount(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('click', handleClickOutside);
    }
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', handleClickOutside);
    }
  });
</script>

<div 
  class="custom-select" 
  bind:this={selectContainer}
  on:click={handleClick}
  on:keydown={handleKeyDown}
  role="combobox"
  aria-expanded={isOpen}
  aria-haspopup="listbox"
  aria-controls="options-list"
  style="max-width: {maxWidth || 'fit-content'}; min-width: {minWidth};"
  tabindex="0"
>
  <div class="select-display" style="padding: {currentSize.padding}; min-height: {currentSize.minHeight};">
    <div class="text-container" style="font-size: {currentSize.fontSize};">
      {#if icon}
        <div class="icon-container">
          <svelte:component this={icon} size={iconSize} />
        </div>
      {/if}
      {#if showDot}
        <span class="active-dot"></span>
      {/if}
      <span class="selected-text" class:placeholder={!value}>
        {value ? displayText : placeholder}
      </span>
    </div>
    <div class="chevron-container">
      <ChevronDown size={16} strokeWidth={1} class="chevron-icon" />
    </div>
  </div>
  
  {#if isOpen}
    <div 
      class="options-list" 
      role="listbox"
      id="options-list"
      aria-label="Select options"
    >
      {#each options as option}
        <div 
          class="option" 
          class:selected={option.value === value && !showBatchView}
          on:click|stopPropagation={() => handleOptionClick(option)}
          on:keydown={(e) => handleOptionKeyDown(e, option)}
          role="option"
          aria-selected={option.value === value}
          tabindex="0"
          title={option.label}
        >
          {truncateMiddle(option.label)}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .custom-select {
    position: relative;
    width: 100%;
    font-size: x-small;
    cursor: pointer;
    font-family: var(--font-family);
  }

  .select-display {
    width: 100%;
    border: 1px solid color-mix(in srgb, var(--text-color) 20%, transparent);
    border-radius: var(--border-radius);
    background: var(--clear);
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .text-container {
    flex: 1;
    min-width: 0;
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

  .option-icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-color);
    opacity: 0.7;
    margin-right: 8px;
    flex-shrink: 0;
  }

  .options-list {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    margin-top: 4px;
    background: color-mix(in srgb, var(--bg-color) 90%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid color-mix(in srgb, var(--text-color) 20%, transparent);
    border-radius: var(--border-radius);
    z-index: 10;
    transform: translateZ(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .option {
    padding: 8px 12px;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-color);
    background: transparent;
    display: flex;
    align-items: center;
  }

  .option:hover {
    background-color: color-mix(in srgb, var(--accent-color) 15%, transparent);
    color: var(--text-color);
  }

  .selected {
    background-color: color-mix(in srgb, var(--accent-color) 25%, transparent);
    color: var(--text-color);
  }

  .selected-text {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .placeholder {
    opacity: 0.6;
    font-style: normal;
    color: var(--text-muted);
  }

  .chevron-container {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
  }

  .options-list::before {
    display: none;
  }

  .active-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    background-color: var(--interactive-active);
    border-radius: 50%;
    flex-shrink: 0;
  }
</style> 