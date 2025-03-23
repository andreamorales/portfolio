<script lang="ts">
  export let text = '';
  export let placement: 'top' | 'bottom' | 'left' | 'right' = 'top';
</script>

<div class="tooltip-wrapper">
  <slot />
  <div class="tooltip" class:top={placement === 'top'} class:bottom={placement === 'bottom'} class:left={placement === 'left'} class:right={placement === 'right'}>
    <div class="tooltip-content">
      {text}
    </div>
  </div>
</div>

<style>
  .tooltip-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .tooltip {
    visibility: hidden;
    opacity: 0;
    position: absolute;
    z-index: 1;
    transition: opacity 0.2s;
  }

  /* Positioning for different placements */
  .tooltip.top {
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
  }

  .tooltip.bottom {
    top: 125%;
    left: 50%;
    transform: translateX(-50%);
  }

  .tooltip.left {
    right: 125%;
    top: 50%;
    transform: translateY(-50%);
  }

  .tooltip.right {
    left: 125%;
    top: 50%;
    transform: translateY(-50%);
  }

  .tooltip-content {
    background-color: var(--inverse-bg-light);
    color: var(--text-color);
    text-align: left;
    border-radius: 6px;
    padding: 6px 8px;
    font-family: 'Recursive Variable';
    font-size: 10px;
    white-space: pre-line;
    line-height: 1.4;
    width: fit-content;
    min-width: 35ch;
    max-width: fit-content;
    position: relative;
  }

  /* Carets for different placements */
  .tooltip-content::after {
    content: '';
    position: absolute;
    border-width: 4px;
    border-style: solid;
  }

  .top .tooltip-content::after {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-color: var(--inverse-bg-light) transparent transparent transparent;
  }

  .bottom .tooltip-content::after {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-color: transparent transparent var(--inverse-bg-light) transparent;
  }

  .left .tooltip-content::after {
    top: 50%;
    left: 100%;
    transform: translateY(-50%);
    border-color: transparent transparent transparent var(--inverse-bg-light);
  }

  .right .tooltip-content::after {
    top: 50%;
    right: 100%;
    transform: translateY(-50%);
    border-color: transparent var(--inverse-bg-light) transparent transparent;
  }

  .tooltip-wrapper:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
</style>
