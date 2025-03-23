<!-- MetricCard.svelte -->
<script lang="ts">
  import { HelpCircle } from 'lucide-svelte';
  import Tooltip from '$lib/components/ui/feedback/Tooltip.svelte';
  
  export let title: string = '';
  export let value: string | number = '';
  export let comparison: string = '';
  export let className: string = '';
  export let indicatorType: 'neutral' | 'success' | 'error' = 'neutral';
  export let tooltip: string = '';
  export let placement: 'top' | 'bottom' | 'left' | 'right' = 'top';
  export let showIndicator: boolean = true;
  export let fillHeight: boolean = false;
</script>

<div class="metric-card-wrapper width-100 {className}" class:fill-height={fillHeight}>
  <div class="metric-card flex-column-left width-100 gap-small">
    <div class="flex-column gap-extra-extra-small width-100">
      {#if title}
        <h3>
          {title}
          {#if tooltip}
            <Tooltip text={tooltip} {placement}>
              <HelpCircle size={16} class="help-icon" />
            </Tooltip>
          {/if}
        </h3>
      {/if}
      {#if value}
        <div class="metric-value width-100">{value}</div>
        {#if showIndicator}
        <div class="flex-column gap-extra-small width-100">
          <div class="indicator {indicatorType}"></div>
          {#if comparison}
            <div class="metric-description {indicatorType}">{comparison}</div>
          {/if}
        </div>
      {/if}
      {/if}
    </div>
    <slot />
  </div>
</div>

<style>
  .metric-card-wrapper {
    background-color: color-mix(in srgb, var(--grey-mid) 3%, transparent);
    border: 1px solid color-mix(in srgb, var(--text-color) 8%, transparent);
    border-radius: 8px;
    width: 100%;
    margin: 0;
    display: flex;
  }
  
  .fill-height {
    height: 100%;
  }
  
  .indicator {
    width: 100%;
    height: 4px;
  }

  .indicator.neutral {
    background-color: color-mix(in srgb, var(--text-color) 20%, transparent);
  }

  .indicator.success {
    background-color: color-mix(in srgb, var(--green-mid) 20%, transparent);
  }

  .indicator.error {
    background-color: color-mix(in srgb, var(--red-mid) 20%, transparent);
  }
  
  .metric-card {
    padding: 40px;
    text-align: left;
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .metric-card > :global(*:last-child) {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .metric-card h3 {
    margin: 0 0 12px 0;
    font-size: var(--font-size-base);
    color: var(--text-color);
    margin: 0;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .metric-value {
    font-size: var(--font-size-3xl);
    font-weight: bold;
    margin: 8px 0;
    color: var(--text-color);
  }

  .metric-description {
    font-size: var(--font-size-small);
    color: var(--text-muted);
  }

  .metric-description.success {
    color: var(--green-mid);
  }

  .metric-description.error {
    color: var(--red-mid);
  }

  .metric-description.neutral {
    color: var(--text-muted);
  }

  :global(.help-icon) {
    color: var(--text-muted);
  }
</style> 