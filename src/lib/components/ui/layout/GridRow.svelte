<script lang="ts">
  /**
   * GridRow component
   * 
   * A row container for the grid layout system.
   * Each row can contain multiple columns with different width configurations.
   * 
   * Props:
   * - alignTop: Whether the row should align items at the top (default: false)
   */
  
  // Whether the row should align items at the top
  export let alignTop: boolean = false;
</script>

<div class="grid-row" class:align-top={alignTop}>
  <slot />
</div>

<style>
  .grid-row {
    display: flex;
    width: 100%;
    gap: var(--spacing-extra-small);
  }
  
  .align-top {
    align-items: flex-start;
  }
  
  /* Responsive styles */
  @media (max-width: 768px) {
    .grid-row {
      flex-direction: column;
    }
  }
</style> 