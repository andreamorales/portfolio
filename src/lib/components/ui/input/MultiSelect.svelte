<script lang="ts">
  import { ChevronDown, X, Check, Search } from 'svelte-lucide';
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import type { ComponentType } from 'svelte';
  import { Label } from '$lib/components/ui/input';
  
  const dispatch = createEventDispatcher();
  
  export let values: string[] = [];
  export let options: Array<{value: string, label: string}>;
  export let placeholder: string = "Choose options...";
  export let maxWidth: string | undefined = undefined;
  export let minWidth: string = "140px";
  export let icon: ComponentType | null = null;
  export let iconSize: number = 16;
  export const labelVariant: 'outline' | 'solid' | 'semisolid' = 'semisolid';
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let summaryLabel: string = "Many Options";
  export let maxDisplayed: number = 3;
  export const style: string = "";
  
  let isOpen = false;
  let searchQuery = "";
  let selectContainer: HTMLElement;
  
  // Size configurations
  const sizeConfig = {
    small: {
      padding: '4px 10px',
      minHeight: '28px',
      fontSize: 'x-small',
      labelHeight: '16px',
      labelFontSize: '8px',
      labelPadding: '1px 4px'
    },
    medium: {
      padding: '6px 10px',
      minHeight: '32px',
      fontSize: 'small',
      labelHeight: '20px',
      labelFontSize: '9px',
      labelPadding: '1px 5px'
    },
    large: {
      padding: '8px 12px',
      minHeight: '36px',
      fontSize: 'medium',
      labelHeight: '24px',
      labelFontSize: '10px',
      labelPadding: '2px 6px'
    }
  };

  $: currentSize = sizeConfig[size];
  $: console.log('MultiSelect size:', size, 'min-height:', currentSize.minHeight);
  
  // Determine if we should show a summary label
  $: showSummary = values.length > maxDisplayed;
  $: displayedValues = showSummary ? values.slice(0, 0) : values;
  $: summaryText = `${summaryLabel} (${values.length})`;
  
  // Filter options based on search query
  $: filteredOptions = searchQuery 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;
  
  function handleSelect(option: {value: string, label: string}) {
    // Toggle selection
    if (values.includes(option.value)) {
      values = values.filter(v => v !== option.value);
    } else {
      values = [...values, option.value];
    }
    dispatch('change', { values });
  }

  function removeValue(valueToRemove: string, event: MouseEvent) {
    event.stopPropagation(); // Prevent opening the dropdown when removing a value
    values = values.filter(v => v !== valueToRemove);
    dispatch('change', { values });
  }

  function getOptionLabel(value: string): string {
    return options.find(opt => opt.value === value)?.label || '';
  }

  function handleClick(event: MouseEvent) {
    event.stopPropagation();
    isOpen = !isOpen;
  }

  function handleOptionClick(option: {value: string, label: string}) {
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
  
  function handleSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    searchQuery = target.value;
    event.stopPropagation();
  }
  
  function handleSearchKeyDown(event: KeyboardEvent) {
    // Prevent dropdown from closing when typing in search box
    event.stopPropagation();
  }

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
  class="multi-select" 
  bind:this={selectContainer}
  role="combobox"
  aria-expanded={isOpen}
  aria-haspopup="listbox"
  aria-controls="options-list"
  style="max-width: {maxWidth || 'fit-content'}; min-width: {minWidth};"
>
  <div 
    class="select-display"
    style="padding: {currentSize.padding}; min-height: {currentSize.minHeight};"
    on:click={handleClick}
    on:keydown={handleKeyDown}
    tabindex="0"
    role="button"
    aria-label="Toggle options dropdown"
  >
    <div class="text-container" style="font-size: {currentSize.fontSize};">
      {#if icon}
        <div class="icon-container">
          <svelte:component this={icon} size={iconSize} />
        </div>
      {/if}
      
      {#if values.length > 0}
        <div class="selected-values">
          {#if showSummary}
            <div class="selected-value">
              <div class={`custom-label custom-label-${size} summary-label`}>
                <span class="label-text">{summaryText}</span>
                <button 
                  type="button"
                  class="remove-value" 
                  style="margin-top: -1px;"
                  on:click={(e) => {
                    e.stopPropagation();
                    values = [];
                    dispatch('change', { values });
                  }}
                  aria-label="Clear all selections"
                >
                  <X size={size === 'small' ? 10 : (size === 'medium' ? 12 : 14)} />
                </button>
              </div>
            </div>
          {:else}
            {#each values as value}
              <div class="selected-value">
                <div class={`custom-label custom-label-${size}`}>
                  <span class="label-text">{getOptionLabel(value)}</span>
                  <button 
                    type="button"
                    class="remove-value" 
                    style="margin-top: -1px;"
                    on:click={(e) => removeValue(value, e)}
                    aria-label="Remove {getOptionLabel(value)}"
                  >
                    <X size={size === 'small' ? 10 : (size === 'medium' ? 12 : 14)} />
                  </button>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      {:else}
        <span class="selected-text placeholder">
          {placeholder}
        </span>
      {/if}
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
      <div 
        class="search-container" 
        on:click|stopPropagation
        role="search"
      >
        <div class="search-icon">
          <Search size={14} />
        </div>
        <input 
          type="text" 
          class="search-input"
          placeholder="Search options..."
          value={searchQuery}
          on:input={handleSearchInput}
          on:keydown={handleSearchKeyDown}
          aria-label="Search options"
        />
        {#if searchQuery}
          <button 
            type="button"
            class="clear-search" 
            on:click|stopPropagation={() => searchQuery = ""}
            aria-label="Clear search"
          >
            <X size={12} />
          </button>
        {/if}
      </div>
      
      {#if filteredOptions.length === 0}
        <div class="no-results">No matching options</div>
      {:else}
        {#each filteredOptions as option}
          <div 
            class="option" 
            class:selected={values.includes(option.value)}
            on:click|stopPropagation={() => handleOptionClick(option)}
            on:keydown={(e) => handleOptionKeyDown(e, option)}
            role="option"
            aria-selected={values.includes(option.value)}
            tabindex="0"
            title={option.label}
          >
            <div class="option-check">
              {#if values.includes(option.value)}
                <Check size={14} strokeWidth={2} />
              {/if}
            </div>
            <span class="option-label">{option.label}</span>
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  .multi-select {
    position: relative;
    width: 100%;
    font-size: x-small;
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
    cursor: pointer;
  }

  .text-container {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .selected-values {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    flex: 1;
    padding: 2px 0;
  }

  .selected-value {
    display: flex;
    align-items: center;
  }

  .custom-label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    border-radius: 12px;
    font-weight: 500;
    background-color: color-mix(in srgb, var(--text-color) 15%, transparent);
    color: var(--text-color);
    width: fit-content;
    white-space: nowrap;
    box-sizing: border-box;
    position: relative;
    line-height: 1;
  }

  .summary-label {
    background-color: color-mix(in srgb, var(--accent-color) 15%, transparent);
  }

  /* Small size */
  .custom-label-small {
    font-size: xx-small;
    padding: 1px 4px;
    height: 16px;
  }

  /* Medium size */
  .custom-label-medium {
    font-size: xx-small;
    padding: 2px 5px;
    height: 20px;
  }

  /* Large size */
  .custom-label-large {
    font-size: x-small;
    padding: 2px 6px;
    height: 24px;
  }

  .label-text {
    color: var(--text-color);
    line-height: 1;
  }

  .remove-value {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--text-color);
    opacity: 0.7;
    cursor: pointer;
    padding: 0;
    transition: all 0.2s ease;
    line-height: 1;
    height: 12px;
    width: 12px;
    margin: 0;
  }

  .remove-value:hover {
    opacity: 1;
  }

  .icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-color);
    opacity: 0.7;
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
    max-height: 300px;
    overflow-y: auto;
  }
  
  .search-container {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid color-mix(in srgb, var(--text-color) 10%, transparent);
    position: sticky;
    top: 0;
    background: inherit;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 1;
  }
  
  .search-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-color);
    opacity: 0.5;
    margin-right: 8px;
  }
  
  .search-input {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--text-color);
    font-size: small;
    padding: 4px 0;
    outline: none;
    width: 100%;
    height: 24px;
  }
  
  .search-input::placeholder {
    color: var(--text-color);
    opacity: 0.6;
  }
  
  .clear-search {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--text-color);
    opacity: 0.5;
    cursor: pointer;
    padding: 0;
    margin-left: 8px;
  }
  
  .clear-search:hover {
    opacity: 0.8;
  }
  
  .no-results {
    padding: 12px;
    text-align: center;
    color: var(--text-color);
    opacity: 0.6;
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
    cursor: pointer;
  }

  .option:hover {
    background-color: color-mix(in srgb, var(--accent-color) 15%, transparent);
    color: var(--text-color);
  }

  .selected {
    background-color: color-mix(in srgb, var(--accent-color) 10%, transparent);
  }

  .option-check {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    margin-right: 8px;
    color: var(--text-color);
    flex-shrink: 0;
  }

  .option-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .selected-text {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .placeholder {
    opacity: 0.6;
  }

  .chevron-container {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
  }

  .no-options {
    padding: 12px;
    text-align: center;
    color: var(--text-color);
    opacity: 0.6;
    font-style: italic;
  }
</style> 
