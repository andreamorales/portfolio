<script lang="ts">
  export let src: string;
  export let alt: string = "";
  export let width: string = "auto";
  export let height: string = "auto";
  export let raw: boolean = false;
</script>

<div class="themed-svg-wrapper">
  {#if raw}
    {@html src}
  {:else}
    <img {src} {alt} {width} {height} />
  {/if}
</div>

<style>
  .themed-svg-wrapper {
    width: 100%;
    height: 100%;
  }

  .themed-svg-wrapper :global(svg) {
    width: 100%;
    height: auto;
    /* Apply theme variables to SVG elements */
    --svg-bg-color: var(--bg-color);
    --svg-text-color: var(--text-color);
    --svg-accent-color: var(--accent-color);
    --svg-grey-light: var(--grey-light);
    --svg-grey-darker: var(--grey-darker);
    --svg-grey-mid: var(--grey-mid);
    --svg-green-light: var(--green-light);
  }

  /* Background and borders */
  .themed-svg-wrapper :global(svg rect[fill="#252022"]) {
    fill: var(--bg-color);
  }

  .themed-svg-wrapper :global(svg rect[stroke="#F3EAD6"]) {
    stroke: var(--text-color);
  }

  .themed-svg-wrapper :global(svg rect[fill="#A39C91"]) {
    fill: var(--grey-light);
  }

  .themed-svg-wrapper :global(svg rect[fill="#443E3D"]) {
    fill: var(--grey-darker);
  }

  .themed-svg-wrapper :global(svg rect[fill="#7A7A7A"]) {
    fill: var(--grey-mid);
  }

  /* Text and content */
  .themed-svg-wrapper :global(svg text),
  .themed-svg-wrapper :global(svg path[fill="#F3EAD6"]) {
    fill: var(--text-color);
  }

  /* Path strokes */
  .themed-svg-wrapper :global(svg path[stroke="#F3EAD6"]) {
    stroke: var(--text-color);
  }

  /* Accents and highlights */
  .themed-svg-wrapper :global(svg [stroke="#66CC64"]),
  .themed-svg-wrapper :global(svg [fill="#66CC64"]) {
    stroke: var(--green-mid);
    fill: var(--green-mid);
  }

  .themed-svg-wrapper :global(svg [fill="#37C5F0"]) {
    fill: var(--blue-mid);
  }

  .themed-svg-wrapper :global(svg [fill="#E1A1FE"]) {
    fill: var(--purple-mid);
  }

  /* Light color variants */
  .themed-svg-wrapper :global(svg [fill="#CCBB64"]) {
    fill: var(--yellow-mid);
  }

  .themed-svg-wrapper :global(svg [fill="#EAE7E0"]) {
    fill: var(--grey-mid);
  }

  .themed-svg-wrapper :global(svg [fill="#FEA1A3"]) {
    fill: var(--red-mid);
  }

  .themed-svg-wrapper :global(svg [fill="#FEEAA1"]) {
    fill: var(--yellow-mid);
  }

  .themed-svg-wrapper :global(svg [fill="#A1FEBB"]) {
    fill: var(--green-mid);
  }

  /* Gradients */
  .themed-svg-wrapper :global(svg [fill="url(#paint0_linear_3908_389)"]) {
    fill: url(#paint0_linear_3908_389);
    fill-opacity: 0.5;
    shape-rendering: crispEdges;
  }

  /* Ensure filters are preserved */
  .themed-svg-wrapper :global(svg g[filter="url(#filter1_d_3908_389)"]) {
    filter: url(#filter1_d_3908_389);
  }

  /* Border styling */
  .themed-svg-wrapper :global(svg rect[stroke="#66CC64"]) {
    stroke: var(--green-mid);
    stroke-width: 0.4;
    shape-rendering: crispEdges;
  }

  /* Preserve filter effects */
  .themed-svg-wrapper :global(svg filter),
  .themed-svg-wrapper :global(svg feFlood),
  .themed-svg-wrapper :global(svg feColorMatrix),
  .themed-svg-wrapper :global(svg feMorphology),
  .themed-svg-wrapper :global(svg feOffset),
  .themed-svg-wrapper :global(svg feGaussianBlur),
  .themed-svg-wrapper :global(svg feComposite),
  .themed-svg-wrapper :global(svg feBlend) {
    color-interpolation-filters: sRGB;
  }

  /* Glass effect with backdrop filter */
  .themed-svg-wrapper :global(svg foreignObject div) {
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    height: 100%;
    width: 100%;
  }

  /* New dataset background - LIGHTEST green */
  .themed-svg-wrapper :global(svg rect[rx="10.1807"]:not([stroke])),
  .themed-svg-wrapper :global(svg rect[fill="#66CC64"]) {
    fill: var(--green-lightest) !important;
  }

  /* Explicitly target the pill background */
  .themed-svg-wrapper :global(svg rect[rx="9.98065"]) {
    fill: var(--green-light) !important;
  }

  /* Dark theme overrides */
  :global(.dark) .themed-svg-wrapper :global(svg rect[stroke="#66CC64"]) {
    stroke: var(--green-light);
  }

  /* Preserve gradient in dark mode */
  :global(.dark) .themed-svg-wrapper :global(svg [fill="url(#paint0_linear_3908_389)"]) {
    fill-opacity: 0.3;
  }
</style> 