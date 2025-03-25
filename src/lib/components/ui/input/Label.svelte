<script lang="ts">
  export let text: string = '';
  export let variant: 'outline' | 'solid' | 'platform' | 'semisolid' | 'professional' | 'version' = 'outline';
  export let platformType: 'API' | 'Valuation' | 'Robots' | 'Progressive' | 'Evals' = 'API';
  export let color: 'default' | 'grey' = 'default';

  let isHovered = false;
  let randomSeed = 0;

  const colors = [
    'var(--purple-mid)',
    'var(--pink-mid)',
    'var(--cyan-mid)',
    'var(--orange-mid)',
    'var(--purple-lighter)',
    'var(--pink-lighter)',
    'var(--cyan-lighter)',
    'var(--orange-lighter)'
  ];

  $: confettiStyles = isHovered ? Array.from({ length: 6 }, (_, i) => {
    const randHeight = 2 + Math.random() * 6;
    const randWidth = 2 + Math.random() * 6;
    const randColor = colors[Math.floor(Math.random() * colors.length)];
    const randTy = -23 - Math.random() * 12;
    const randTx = (Math.random() * 30 - 15) * (i % 2 ? 1 : -1);
    const randRotation = Math.random() * 180;
    const randDelay = Math.random() * 0.2;
    
    return `
      --ty: ${randTy}px;
      --tx: ${randTx}px;
      height: ${randHeight}px;
      width: ${randWidth}px;
      background-color: ${randColor};
      transform: translate(var(--tx), var(--ty)) rotate(${randRotation}deg);
      animation-delay: ${randDelay}s;
    `;
  }) : [];

  let platformStyle = '';
  if (variant === 'platform') {
    switch (platformType) {
      case 'API':
        platformStyle = 'background-color: var(--purple-lightest); color: var(--purple-darker);';
        break;
      case 'Valuation':
        platformStyle = 'background-color: var(--blue-lightest); color: var(--blue-darker);';
        break;
      case 'Robots':
        platformStyle = 'background-color: var(--cyan-lightest); color: var(--cyan-darker);';
        break;
      case 'Progressive':
        platformStyle = 'background-color: var(--pink-lightest); color: var(--pink-darker);';
        break;
      case 'Evals':
        platformStyle = 'background-color: var(--orange-lightest); color: var(--orange-darker);';
        break;
    }
  }

  // Used to generate different random sparkles when hovering over version labels
  $: displayText = text;
</script>

<div class="label" 
  class:solid={variant === 'solid'} 
  class:platform={variant === 'platform'} 
  class:semisolid={variant === 'semisolid'} 
  class:semisolid-grey={variant === 'semisolid' && color === 'grey'}
  class:professional={variant === 'professional'} 
  class:version={variant === 'version'} 
  style={platformStyle}
  on:mouseenter={() => { isHovered = true; randomSeed++; }}
  on:mouseleave={() => { isHovered = false; }}
  role="status"
>
  {displayText.toUpperCase()}
  {#if variant === 'version'}
    <div class="confetti-container">
      {#each Array(6) as _, i}
        <div class="confetti" style={confettiStyles[i] || ''}></div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    border: 1px solid var(--text-color);
    color: var(--text-color);
    width: fit-content;
    white-space: nowrap;
    font-family: 'Recursive', monospace;
    font-variation-settings: 'MONO' 1, 'CASL' 0, 'wght' 700;
  }

  @media (max-width: 768px) {
    .label {
      font-size: 0.625rem; /* Even smaller text for mobile */
      padding: 3px 8px;
      border-radius: 12px;
    }
  }

  .solid {
    background-color: var(--text-color);
    color: var(--bg-color);
  }

  .semisolid {
    background-color: color-mix(in srgb, var(--text-color) 20%, transparent);
    border: none;
  }

  .semisolid-grey {
    background-color: color-mix(in srgb, var(--grey-mid) 50%, transparent);
    color: var(--grey-darker);
    border: none;
    opacity: 0.9;
  }

  .professional {
    background-color: color-mix(in srgb, var(--purple-lighter) 30%, transparent);
    border: none;
  }

  .platform {
    color: var(--text-color);
    border: none;
    padding: 6px 12px;
    font-weight: 600;
  }

  /* Light mode adjustments */
  :global(.light) .platform {
    background-color: color-mix(in srgb, var(--purple-darker) 20%, transparent);
  }

  .version {
    background-color: color-mix(in srgb, var(--text-color) 10%, transparent);
    border: none;
    padding: 4px 12px;
    font-size: 0.75rem;
    opacity: 0.8;
    position: relative;
    transition: transform 0.2s ease;
  }

  .version:hover {
    transform: scale(1.05);
  }

  .confetti-container {
    position: absolute;
    pointer-events: none;
    opacity: 0;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .version:hover .confetti-container {
    opacity: 1;
  }

  .confetti {
    position: absolute;
    border-radius: 1px;
    opacity: 0;
    will-change: transform;
    left: 0;
    top: 0;
  }

  .version:hover .confetti {
    animation: confetti-burst 1.5s cubic-bezier(0.45, 0, 0.55, 1) forwards;
  }

  @keyframes confetti-burst {
    0% {
      transform: translate(0, 0) rotate(0deg) scale(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
      transform: translate(
        calc(var(--tx) * 0.2),
        calc(var(--ty) * 0.8)
      ) rotate(calc(var(--tr) * 0.3)) scale(1);
    }
    100% {
      transform: translate(
        calc(var(--tx) * 2), 
        calc(var(--ty) * -0.2 + 20px)
      ) rotate(calc(var(--tr) * 2)) scale(0.8);
      opacity: 0;
    }
  }
</style> 