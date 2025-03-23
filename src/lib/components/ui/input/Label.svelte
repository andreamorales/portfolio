<script lang="ts">
  export let text: string = '';
  export let variant: 'outline' | 'solid' | 'platform' | 'semisolid' | 'professional' | 'version' = 'outline';
  export let platformType: 'API' | 'Valuation' | 'Robots' | 'Progressive' | 'Evals' = 'API';

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
      --tr: ${randRotation}deg;
      height: ${randHeight}px;
      width: ${randWidth}px;
      background: ${randColor};
      animation-delay: ${randDelay}s;
    `;
  }) : [];

  const platformConfig = {
    'API': {
      text: 'API',
      bg: 'color-mix(in srgb, var(--purple-darkest) 20%, transparent)'
    },
    'Valuation': {
      text: 'Novelty Scoring',
      bg: 'color-mix(in srgb, var(--pink-darkest) 20%, transparent)'
    },
    'Evals': {
      text: 'Tiny Evals',
      bg: 'color-mix(in srgb, var(--cyan-darkest) 20%, transparent)'
    },
    'Robots': {
      text: 'Crawler Block',
      bg: 'color-mix(in srgb, var(--orange-darkest) 20%, transparent)'
    },
    'Progressive': {
      text: 'Interpretability Analytics',
      bg: 'color-mix(in srgb, var(--cyan-darkest) 20%, transparent)'
    }
  };

  $: displayText = variant === 'platform' ? platformConfig[platformType].text : text;
  $: platformStyle = variant === 'platform' ? 
    `background-color: ${platformConfig[platformType].bg};` : '';
</script>

<div class="label" 
  class:solid={variant === 'solid'} 
  class:platform={variant === 'platform'} 
  class:semisolid={variant === 'semisolid'} 
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
        <div class="confetti" style={confettiStyles[i] || ''} />
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
    font-weight: 500;
    letter-spacing: 0.05em;
    border: 1px solid var(--text-color);
    color: var(--text-color);
    width: fit-content;
    white-space: nowrap;
  }

  .solid {
    background-color: var(--text-color);
    color: var(--bg-color);
  }

  .semisolid {
    background-color: color-mix(in srgb, var(--text-color) 20%, transparent);
    border: none;
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