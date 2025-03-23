<script lang="ts">
  /**
   * GridColumn component
   * 
   * A column container for the grid layout system.
   * Supports different width configurations: full, half, third, two-thirds.
   * 
   * Props:
   * - width: The width of the column (full, half, third, two-thirds)
   */
  
  // Width options: full, half, third, two-thirds
  export let width: 'full' | 'half' | 'third' | 'two-thirds' = 'full';
</script>

<div class="grid-column column-{width}">
  <slot />
</div>

<style>
  .grid-column {
    display: flex;
    flex-direction: column;
  }
  
  /* Column width variations */
  .column-full {
    flex: 0 0 100%;
  }
  
  .column-half {
    flex: 0 0 calc(50% - var(--spacing-extra-small) / 2);
  }
  
  .column-third {
    flex: 0 0 calc(33.333% - var(--spacing-extra-small) * 2/3);
  }
  
  .column-two-thirds {
    flex: 0 0 calc(66.667% - var(--spacing-extra-small) / 3);
  }
  
  /* Responsive styles */
  @media (max-width: 768px) {
    .column-half,
    .column-third,
    .column-two-thirds {
      flex: 0 0 100%;
    }
  }
</style> 