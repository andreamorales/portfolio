<script lang="ts">
  export let variant: "default" | "ghost" | "outlined" = "default";
  export let position: number;
  export let showVerticalConnector = false;
  export const showHorizontalConnector = false;
  export let style: string = '';
  export let showTopLeftConnector = false;
  export let showTopRightConnector = false;
  import CardConnector from './CardConnector.svelte';
</script>

<div class="card {variant}" data-position={position} {style}>
  <div class="card-content">
    {#if position !== undefined}
      <!-- Remove or comment out any direct text rendering -->
    {/if}
    <slot></slot>
  </div>

  {#if variant === 'default'}
    {#if showVerticalConnector}
      <CardConnector position="vertical" />
    {/if}
  {/if}

  {#if showTopLeftConnector}
    <svg class="connector top-left" width="26" height="33" viewBox="0 0 26 33">
      <path 
        d="M25.469 16.0109C13.2403 16.0109 12.4292 26.7273 12.4292 32.0296L0.832092 16.1794C10.9154 16.1794 12.3157 6.87751 12.3157 0.824654L25.469 16.0109Z" 
        fill="var(--inverse-bg)"
      />
    </svg>
  {/if}

  {#if showTopRightConnector}
    <svg class="connector top-right" width="26" height="33" viewBox="0 0 26 33">
      <path 
        d="M25.469 16.0109C13.2403 16.0109 12.4292 26.7273 12.4292 32.0296L0.832092 16.1794C10.9154 16.1794 12.3157 6.87751 12.3157 0.824654L25.469 16.0109Z" 
        fill="var(--inverse-bg)"
      />
    </svg>
  {/if}

  {#if variant === 'outlined' && position === 2}
    <svg class="connector-path" width="120" height="120" viewBox="0 0 120 120">
      <path 
        d="M0 60 L60 60 L60 0 Q60 60 0 60 Z"
        fill="var(--inverse-bg)"
      />
    </svg>
  {/if}

  {#if variant === 'outlined' && position === 1}
    <svg class="connector-path right" width="120" height="120" viewBox="0 0 120 120">
      <path 
        d="M120 60 L60 60 L60 0 Q60 60 120 60 Z"
        fill="var(--inverse-bg)"
      />
    </svg>
  {/if}
</div>

<style>
  .card {
    display: flex;
    width: 100%;  /* Changed from fixed width */
    max-width: 480px;  /* Added max-width instead */
    height: 360px;
    padding: 12px;
    text-align: center;
    position: relative;
    font-family: var(--font-family);
  }

  /* Allow full width for position 3 */
  .card[data-position="3"] {
    max-width: none;  /* Override max-width for position 3 */
  }

  .card-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 16px 40px;  /* Simplified, consistent padding */
    box-sizing: border-box;  /* Added to include padding in width calculation */
  }

  .card.default {
    background-color: var(--inverse-bg);
    color: var(--inverse-content);
    padding: 0px;
  }

  .card.default[data-position="2"] {
    border-radius: 210px 0 210px 0;
  }

  .card.default[data-position="1"] {
    border-radius: 0 210px 0 210px;
    margin-left: 0;
  }

  .card.default :global(*) {
    color: var(--inverse-content);
  }

  .card.default :global(h1),
  .card.default :global(h2),
  .card.default :global(h3),
  .card.default :global(h4),
  .card.default :global(h5),
  .card.default :global(h6) {
    font-family: var(--font-family);
    font-weight: 600;
    font-size: 20px;
    margin: 0;
  }

  .card.ghost {
    background-color: transparent;
    color: var(--text-color);
    border: none;
    padding-bottom: 40px;
    padding-right: 0px;
    padding-left: 0px;
    padding-top: 0px;
  }

  .card.ghost :global(*) {
    color: var(--text-color);
  }

  .card.default[data-position="3"] {
    border-radius: 0 0 210px 210px;
  }

  .connector.top-left {
    position: absolute;
    top: -16px;
    left: -14px;
    transform: rotate(90deg);
  }

  .connector.top-right {
    position: absolute;
    top: -16px;
    right: -14px;
    transform: rotate(0deg);
  }

  .card.outlined {
    background-color: var(--inverse-bg);
    color: var(--inverse-content);
    padding: 0px;
    overflow: visible;
  }

  .card.outlined[data-position="2"] {
    border-radius: 210px 0 0px 0;
    position: relative;
  }

  .card.outlined[data-position="2"]::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 120px;
    height: 120px;
    background: var(--inverse-bg);
    clip-path: polygon(0 100%, 100% 100%, 100% 0);  /* Creates a triangle */
    transform: translate(-50%, 50%) rotate(45deg);  /* Rotates to create diagonal connection */
  }

  .card.outlined[data-position="1"] {
    border-radius: 0 210px 0 0px;
    margin-left: 0;
  }

  .card.outlined[data-position="3"] {
    border-radius: 0 0 210px 210px;
  }

  .card.outlined :global(*) {
    color: var(--inverse-content);
  }

  .card.outlined :global(h1),
  .card.outlined :global(h2),
  .card.outlined :global(h3),
  .card.outlined :global(h4),
  .card.outlined :global(h5),
  .card.outlined :global(h6) {
    font-family: var(--font-family);
    font-weight: 600;
    font-size: 20px;
    margin: 0;
  }

  .connector-path {
    position: absolute;
    bottom: 0;
    left: 0;
    transform: translate(-50%, 50%);
    z-index: 1;
  }

  .connector-path.right {
    left: auto;
    right: 0;
    transform: translate(50%, 50%);
  }

  .metric-header {
    height: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 12px;
    box-sizing: border-box;
    position: relative;
    z-index: 2;
  }

  :global(.metric-score) {
    font-family: var(--font-family-display);
    font-size: 24px;
    font-weight: normal;
    margin: 0;
    line-height: 1;
  }

  :global(.metric-title) {
    font-family: var(--font-family);
    font-weight: 600;
    font-size: 20px;
    margin: 0;
    line-height: 1;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card[data-position="1"] > .card-content :global(.metric-header) {
    padding-right: 80px;
    padding-left: 12px;
  }

  .card[data-position="2"] > .card-content :global(.metric-header) {
    padding-left: 80px;
    padding-right: 12px;
  }

  .card[data-position="1"] > .card-content :global(.metric-content) {
    padding-right: 80px;
    padding-left: 12px;
  }

  .card[data-position="2"] > .card-content :global(.metric-content) {
    padding-left: 80px;
    padding-right: 12px;
  }
</style> 