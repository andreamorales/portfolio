<script lang="ts">
  import { onMount } from 'svelte';
  import { theme } from '$lib/stores/theme';
  
  let beamsContainer: HTMLDivElement;
  let animationIds: number[] = [];
  
  // Define colors using CSS variables for better theme consistency
  const colors = {
    light: {
      blue: "var(--blue-mid)",      // Mid blue from variables.css
      green: "var(--green-mid)",    // Mid green from variables.css
      purple: "var(--purple-mid)",  // Mid purple from variables.css
      indigo: "var(--purple-mid)"   // Mid purple as indigo substitute
    },
    dark: {
      blue: "var(--blue-mid)",      // Mid blue with opacity added in getColor
      green: "var(--green-mid)",    // Mid green with opacity added in getColor
      purple: "var(--purple-mid)",  // Mid purple with opacity added in getColor
      indigo: "var(--blue-mid)"     // Mid blue as indigo substitute with opacity
    }
  };
  
  // Get the appropriate color based on current theme
  // Add 50% opacity to dark mode colors using color-mix
  $: getColor = (colorName: 'blue' | 'green' | 'purple' | 'indigo') => {
    const baseColor = $theme === 'light' ? colors.light[colorName] : colors.dark[colorName];
    // Add 50% opacity to dark mode colors using color-mix
    return $theme === 'light' 
      ? baseColor 
      : `color-mix(in srgb, ${baseColor} 50%, transparent)`;
  };
  
  function startAnimations() {
    // Clear any existing animation IDs
    stopAnimations();
    
    // Get all animation elements
    const animations = beamsContainer.querySelectorAll('animate');
    
    // Start each animation
    animations.forEach((anim: SVGAnimateElement) => {
      // Reset the animation
      anim.setAttribute('begin', 'indefinite');
      
      // Start the animation
      const id = window.setTimeout(() => {
        anim.beginElement();
      }, 10);
      
      animationIds.push(id);
    });
  }
  
  function stopAnimations() {
    // Clear all animation timeouts
    animationIds.forEach(id => window.clearTimeout(id));
    animationIds = [];
    
    // Get all animation elements
    const animations = beamsContainer.querySelectorAll('animate');
    
    // Stop each animation
    animations.forEach((anim: SVGAnimateElement) => {
      anim.setAttribute('begin', 'indefinite');
      anim.endElement();
    });
  }
  
  // Update gradient colors when theme changes
  $: if (beamsContainer && $theme) {
    // Update all stop colors based on current theme
    const stops = beamsContainer.querySelectorAll('stop');
    stops.forEach(stop => {
      const color = stop.getAttribute('data-color');
      if (color) {
        stop.setAttribute('stop-color', getColor(color as any));
      }
    });
  }
</script>

<div 
  class="vertical-beams-container" 
  bind:this={beamsContainer} 
  on:mouseenter={startAnimations}
  on:mouseleave={stopAnimations}
>
  <svg class="vertical-beams" viewBox="0 0 60 1000" preserveAspectRatio="none">
    <defs>
      <!-- Gradient 1 - Extreme downward movement of all colors -->
      <linearGradient id="vertical-gradient-1" x1="0%" y1="0%" x2="0%" y2="100%" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color={getColor('blue')} data-color="blue">
          <animate attributeName="offset" values="0;1.0;0" dur="2s" begin="indefinite" repeatCount="indefinite" />
        </stop>
        <stop offset="0.3" stop-color={getColor('green')} data-color="green">
          <animate attributeName="offset" values="0.3;1.3;0.3" dur="2s" begin="indefinite" repeatCount="indefinite" />
        </stop>
        <stop offset="0.7" stop-color={getColor('purple')} data-color="purple">
          <animate attributeName="offset" values="0.7;1.7;0.7" dur="2s" begin="indefinite" repeatCount="indefinite" />
        </stop>
        <stop offset="1" stop-color={getColor('indigo')} data-color="indigo">
          <animate attributeName="offset" values="1;2.0;1" dur="2s" begin="indefinite" repeatCount="indefinite" />
        </stop>
      </linearGradient>
      
      <!-- Gradient 2 - Extreme upward movement of all colors -->
      <linearGradient id="vertical-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color={getColor('blue')} data-color="blue">
          <animate attributeName="offset" values="0;-1.0;0" dur="2.5s" begin="indefinite" repeatCount="indefinite" />
        </stop>
        <stop offset="0.3" stop-color={getColor('green')} data-color="green">
          <animate attributeName="offset" values="0.3;-0.7;0.3" dur="2.5s" begin="indefinite" repeatCount="indefinite" />
        </stop>
        <stop offset="0.7" stop-color={getColor('purple')} data-color="purple">
          <animate attributeName="offset" values="0.7;-0.3;0.7" dur="2.5s" begin="indefinite" repeatCount="indefinite" />
        </stop>
        <stop offset="1" stop-color={getColor('indigo')} data-color="indigo">
          <animate attributeName="offset" values="1;0;1" dur="2.5s" begin="indefinite" repeatCount="indefinite" />
        </stop>
      </linearGradient>
      
      <!-- Gradient 3 - Extreme compression/expansion (accordion effect) -->
      <linearGradient id="vertical-gradient-3" x1="0%" y1="0%" x2="0%" y2="100%" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color={getColor('blue')} data-color="blue">
          <animate attributeName="offset" values="0;0;0" dur="1.5s" begin="indefinite" repeatCount="indefinite" />
        </stop>
        <stop offset="0.3" stop-color={getColor('green')} data-color="green">
          <animate attributeName="offset" values="0.3;0.1;0.3" dur="1.5s" begin="indefinite" repeatCount="indefinite" />
        </stop>
        <stop offset="0.7" stop-color={getColor('purple')} data-color="purple">
          <animate attributeName="offset" values="0.7;0.2;0.7" dur="1.5s" begin="indefinite" repeatCount="indefinite" />
        </stop>
        <stop offset="1" stop-color={getColor('indigo')} data-color="indigo">
          <animate attributeName="offset" values="1;0.3;1" dur="1.5s" begin="indefinite" repeatCount="indefinite" />
        </stop>
      </linearGradient>
      
      <!-- Gradient 4 - Colors move in opposite directions (stretch effect) -->
      <linearGradient id="vertical-gradient-4" x1="0%" y1="0%" x2="0%" y2="100%" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color={getColor('blue')} data-color="blue">
          <animate attributeName="offset" values="0;0.5;0" dur="3s" begin="indefinite" repeatCount="indefinite" />
        </stop>
        <stop offset="0.3" stop-color={getColor('green')} data-color="green">
          <animate attributeName="offset" values="0.3;-0.2;0.3" dur="3s" begin="indefinite" repeatCount="indefinite" />
        </stop>
        <stop offset="0.7" stop-color={getColor('purple')} data-color="purple">
          <animate attributeName="offset" values="0.7;1.4;0.7" dur="3s" begin="indefinite" repeatCount="indefinite" />
        </stop>
        <stop offset="1" stop-color={getColor('indigo')} data-color="indigo">
          <animate attributeName="offset" values="1;0.3;1" dur="3s" begin="indefinite" repeatCount="indefinite" />
        </stop>
      </linearGradient>
    </defs>
    
    <!-- Four vertical beams with gradients -->
    <line class="beam beam-1" x1="8" y1="0" x2="8" y2="1000" />
    <line class="beam beam-2" x1="16" y1="0" x2="16" y2="1000" />
    <line class="beam beam-3" x1="24" y1="0" x2="24" y2="1000" />
    <line class="beam beam-4" x1="32" y1="0" x2="32" y2="1000" />
  </svg>
</div>

<style>
  .vertical-beams-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 40px;
    height: 100vh;
    z-index: 1;
    pointer-events: auto;
  }
  
  .vertical-beams {
    width: 100%;
    height: 100%;
  }
  
  .beam {
    stroke-width: 1px; /* Increased from 0.5px to make beams more visible */
  }
  
  .beam-1 {
    stroke: url(#vertical-gradient-1);
  }
  
  .beam-2 {
    stroke: url(#vertical-gradient-2);
  }
  
  .beam-3 {
    stroke: url(#vertical-gradient-3);
  }
  
  .beam-4 {
    stroke: url(#vertical-gradient-4);
  }
</style> 