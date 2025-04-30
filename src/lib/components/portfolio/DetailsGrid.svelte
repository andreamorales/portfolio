<script lang="ts">
  // Props for the top row
  export let year: string;
  export let role: string;
  export let projectLength: string;

  // Props for the metrics row (array of strings)
  export let metrics: string[] = [];
</script>

<div class="details-grid">
  <div class="details-row">
    <div class="details-cell">
      <div class="details-label">Year</div>
      <div class="details-value">{year}</div>
    </div>
    <div class="details-cell">
      <div class="details-label">Role</div>
      <div class="details-value">{role}</div>
    </div>
    <div class="details-cell">
      <div class="details-label">Project Length</div>
      <div class="details-value">{projectLength}</div>
    </div>
  </div>
  <div class="details-row">
    {#each metrics as metric}
      <div class="details-cell">
        <div class="details-label">Impact</div>
        <div class="details-value">{metric}</div>
      </div>
    {/each}
  </div>
</div>

<style>
  .details-grid {
    width: 100%;
    background-color: transparent;
    font-family: var(--font-family);
    border-top: 1px solid var(--black);
  }
  
  .details-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border-bottom: 1px solid var(--black);
  }
  
  .details-cell {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    border-right: 1px solid var(--black);
  }

  .details-cell:last-child {
    border-right: none;
  }
  
  .details-label {
    font-size: var(--font-size-sm);
    color: var(--muted-text);
    font-variation-settings: 'CASL' 0, 'wght' 400;
  }
  
  .details-value {
    font-size: var(--font-size-base);
    color: var(--text-color);
    font-variation-settings: 'CASL' 0, 'wght' 500;
    word-wrap: break-word;
  }

  /* Make sure the grid is responsive */
  @media (max-width: 600px) {
    .details-row {
      grid-template-columns: 1fr;
    }
    
    .details-cell {
      border-right: none;
      border-bottom: 1px solid var(--black);
    }
    
    .details-cell:last-child {
      border-bottom: none;
    }
  }
</style> 