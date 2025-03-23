<script>
  export let title = '';
  export let subtitle = '';
</script>

<div class="section-heading">
  <h2>{title}</h2>
  <div class="heading-line"></div>
  {#if subtitle}
    <p class="subtitle">{subtitle}</p>
  {/if}
</div>

<style>
  .section-heading {
    text-align: center;
    margin-bottom: var(--spacing-xl);
    position: relative;
  }
  
  h2 {
    margin-bottom: var(--spacing-xs);
  }
  
  .heading-line {
    height: 4px;
    width: 70px;
    background: var(--primary-gradient);
    margin: 0 auto;
    margin-top: var(--spacing-xs);
    border-radius: var(--border-radius-full);
  }
  
  .subtitle {
    max-width: 600px;
    margin: var(--spacing-md) auto 0;
    color: var(--text-color-light);
  }
</style> 