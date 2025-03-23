<script lang="ts">
  import { Label } from '$lib/components/ui/input';
  import type { ChangelogEntry } from '$lib/data/changelog';

  export let entry: ChangelogEntry;
  
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'long',
      day: 'numeric', 
      year: 'numeric'
    }).format(date);
  }

  function mapCategoryToLabelType(category: ChangelogEntry['category']): 'Valuation' | 'Evals' {
    const mapping = {
      'Novelty Scoring': 'Valuation',
      'Tiny Evals': 'Evals'
    } as const;
    return mapping[category];
  }
</script>

<div class="changelog-entry">
  <div class="timeline-dot"></div>
  <div class="entry-content">
    <div class="left-column">
      <Label variant="platform" platformType={mapCategoryToLabelType(entry.category)} />
      <div class="date-chip">{formatDate(entry.date)}</div>
    </div>
    <div class="right-column flex gap-small">
      <span class="entry-id">#{entry.id}</span>
      <div class="entry-text flex-column-left gap-extra-small">
        <h2>{entry.title}</h2>
        <p class="description">{entry.description}</p>
      </div>
    </div>
  </div>
</div>

<style>

  .entry-text {
    justify-content: flex-start;
  }

  .changelog-entry {
    width: 100%;
    position: relative;
  }

  .timeline-dot {
    position: absolute;
    left: calc(150px + 1.5rem - 6px);
    top: 0.65rem;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: var(--text-color);
    opacity: 0.2;
    transition: opacity 0.2s ease;
    z-index: 1;
  }

  .changelog-entry:hover .timeline-dot {
    opacity: 0.4;
    box-shadow: 0 0 12px rgba(var(--text-color-rgb), 0.3);
  }

  .changelog-entry:hover .timeline-dot::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 1px solid currentColor;
    transform: translate(-50%, -50%);
    animation: pulseOutline 2s ease-out infinite;
  }

  .entry-content {
    display: flex;
    gap: 3rem;
    padding-top: 0;
    transition: transform 0.2s ease;
  }

  .left-column {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 150px;
    flex-shrink: 0;
    align-items: flex-end;
  }

  .right-column {
    flex: 1;
  }


  :global(.time .icon) {
    color: var(--text-color-secondary);
    opacity: 0.5;
  }

  .date-chip {
    color: var(--text-color);
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.875rem;
    width: fit-content;
    font-weight: 300;
  }

  h2 {
    font-size: 1.5rem;
    margin: 0;
    font-weight: 400;
    font-family: var(--font-family);
    text-align: left;
  }


  .entry-id { 
    font-family: monospace;
    color: var(--text-color-secondary);
    font-size: 0.75rem;
    font-weight: 300;
    line-height: 2.5;
  }

  .description {
    color: var(--text-color);
    margin: 0;
    text-align: left;
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    .entry-content {
      flex-direction: column;
      gap: 1.5rem;
      padding-left: 3rem;
    }

    .timeline-dot {
      left: 1rem;
      width: 10px;
      height: 10px;
      transform: translateX(-50%);
    }

    .left-column {
      width: 100%;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 1rem;
    }
  }

  @media (max-width: 480px) {
    .entry-content {
      padding-left: 2.5rem;
    }

    .timeline-dot {
      left: 1.5rem;
      width: 8px;
      height: 8px;
    }
  }
</style> 