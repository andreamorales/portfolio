<script lang="ts">
  /**
   * GridLayout component
   * 
   * A flexible grid system that allows for different column configurations per row.
   * 
   * Usage:
   * <GridLayout>
   *   <GridRow>
   *     <GridColumn width="two-thirds">Content 1</GridColumn>
   *     <GridColumn width="third">Content 2</GridColumn>
   *   </GridRow>
   *   <GridRow>
   *     <GridColumn width="half">Content 3</GridColumn>
   *     <GridColumn width="half">Content 4</GridColumn>
   *   </GridRow>
   *   <GridRow>
   *     <GridColumn width="full">Content 5</GridColumn>
   *   </GridRow>
   * </GridLayout>
   */
</script>

<div class="grid-layout">
  <slot />
</div>

<style>
  .grid-layout {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: var(--spacing-extra-small);
    height: 100%;
  }
</style> 