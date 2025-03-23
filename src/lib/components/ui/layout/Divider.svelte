<!-- Create a new Divider component -->
<script lang="ts">
  // Props for customization
  export let width: string = "100%";
  export let opacity: number = 0.3;
  export let margin: string = "0";
  export let color: string = "var(--text-color)";
  export let height: string = "0.5px";
  export let animate: boolean = false;
  export let animationDelay: string = "0s";
  
  // For debugging
  console.log("Divider props:", { width, opacity, margin, color, height, animate });
</script>

<div 
  class="divider" 
  class:animate
  style="
    width: {width}; 
    margin: {margin}; 
    height: {height};
    background-color: color-mix(in srgb, {color} {opacity * 100}%, transparent);
  "
></div>

<style>
  .divider {
    display: block;
    min-height: 0.5px; /* Ensure minimum height */
  }
  
  .animate {
    opacity: 0;
    transform: scaleX(0.8);
    animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    animation-delay: var(--animation-delay, 0s);
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scaleX(0.8);
    }
    to {
      opacity: 1;
      transform: scaleX(1);
    }
  }
</style> 