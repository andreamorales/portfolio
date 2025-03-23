<script lang="ts">
  // Props
  export let size: 'small' | 'medium' | 'large' = 'medium';
  
  // Computed properties
  $: dimensions = {
    small: { width: 60, height: 75, thickness: 2 },
    medium: { width: 100, height: 125, thickness: 3 },
    large: { width: 140, height: 175, thickness: 4 }
  }[size];
  
  $: width = dimensions.width;
  $: height = dimensions.height;
  $: thickness = dimensions.thickness;
  
  // Fixed values
  const duration = 3; // Animation duration in seconds
  const minOpacity = 0.2; // Minimum opacity (20%)
  const maxOpacity = 1.0; // Maximum opacity (100%)
  
  // Generate a unique ID for the gradient
  const gradientId = `outline-gradient-${Math.random().toString(36).substring(2, 11)}`;
</script>

<div 
  class="loading-container" 
  style="--thickness: {thickness}px; --duration: {duration}s; --min-opacity: {minOpacity}; --max-opacity: {maxOpacity};"
>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={width} 
    height={height} 
    viewBox="-80 0 426 432" 
    fill="none"
    aria-label="Loading"
    role="img"
  >
    <defs>
      <linearGradient id={gradientId} x1="-69.2854" y1="1.48077" x2="256.455" y2="323.468" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="var(--accent-color)" stop-opacity="var(--min-opacity)">
          <animate attributeName="offset" values="0;0.4;0" dur="{duration}s" repeatCount="indefinite" />
        </stop>
        <stop offset="0.52" stop-color="var(--accent-color)" stop-opacity="var(--max-opacity)">
          <animate attributeName="offset" values="0.52;0.92;0.52" dur="{duration}s" repeatCount="indefinite" />
        </stop>
        <stop offset="1" stop-color="var(--accent-color)" stop-opacity="var(--min-opacity)">
          <animate attributeName="offset" values="1;1.4;1" dur="{duration}s" repeatCount="indefinite" />
        </stop>
      </linearGradient>
    </defs>
    <path 
      d="M-68.3846 0.569499L-69.4107 111.446M345.456 196.968C345.456 196.968 282.023 197.336 228.232 197.647M39.1144 198.744L-69.187 199.361L-69.4107 111.446M39.1144 198.744L39.7688 311.733C39.7688 311.733 196.571 311.777 210.759 310.741C238.112 307.746 264.297 300.441 272.109 261.444C274.744 197.473 228.232 197.647 228.232 197.647M39.1144 198.744L147.87 198.112M39.1144 198.744L38.7288 132.214C38.4149 78.0524 -37.0006 49.0701 -69.4107 111.446M228.232 197.647C192.581 197.854 147.87 198.112 147.87 198.112M147.87 198.112L149.225 431.948" 
      class="outline-path"
      stroke={`url(#${gradientId})`}
    >
      <animate 
        attributeName="stroke-dashoffset" 
        from="1500" 
        to="-1500" 
        dur="{duration}s" 
        repeatCount="indefinite" 
      />
    </path>
  </svg>
</div>

<style>
  .loading-container {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  .outline-path {
    stroke-width: var(--thickness);
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    stroke-dasharray: 1500;
    stroke-dashoffset: 1500;
  }
</style> 