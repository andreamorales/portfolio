<script lang="ts">
  export let score: number;
  export let gradeLetter: string;
  export let progressColor: string = 'var(--interactive-color)';

  function getScoreColor(score: number): string {
    const percentage = score * 100;
    if (percentage >= 90) return 'var(--success)';
    if (percentage >= 80) return 'var(--info)';
    if (percentage >= 70) return 'var(--warning)';
    if (percentage >= 60) return 'var(--caution)';  // Changed from 50 to 60 to match CircularUpload
    return 'var(--error)';
  }

  $: progressColor = getScoreColor(score);  // Override the input progressColor with our calculated color
  $: dashOffset = 216 - (score * 100 / 100) * 216;

  // Add this to debug
  console.log('CSS Variable:', getComputedStyle(document.documentElement).getPropertyValue('--inverse-content'));
</script>

<div class="circular-container">
  <div class="gauge-container">
    <svg class="gauge-track" viewBox="0 0 100 100">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="inset-shadow">
          <!-- Deepest inner shadow -->
          <feFlood flood-color="black" flood-opacity="0.95"/>
          <feComposite operator="out" in2="SourceGraphic"/>
          <feGaussianBlur stdDeviation="6"/>
          <feComposite operator="atop" in2="SourceGraphic"/>
          
          <!-- Medium depth shadow -->
          <feFlood flood-color="black" flood-opacity="0.8"/>
          <feComposite operator="out" in2="SourceGraphic"/>
          <feGaussianBlur stdDeviation="3"/>
          <feComposite operator="atop" in2="SourceGraphic"/>
          
          <!-- Sharp edge shadow -->
          <feFlood flood-color="black" flood-opacity="0.9"/>
          <feComposite operator="out" in2="SourceGraphic"/>
          <feGaussianBlur stdDeviation="0.5"/>
          <feComposite operator="atop" in2="SourceGraphic"/>
        </filter>
      </defs>
      <!-- Background track -->
      <circle 
        class="track"
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="rgba(0, 0, 0, 0.08)"
        stroke-width="8"
        stroke-linecap="round"
        stroke-dasharray="216 320"
        stroke-dashoffset="0"
        transform="rotate(115 50 50)"
        filter="url(#inset-shadow)"
      />
      <!-- Progress track -->
      <circle 
        class="progress-track"
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke={progressColor}
        stroke-width="6"
        stroke-linecap="round"
        stroke-dasharray="216 320"
        stroke-dashoffset={dashOffset}
        transform="rotate(115 50 50)"
      />
    </svg>
    <div class="inner">
      <div class="grade">{gradeLetter}</div>
    </div>
  </div>
</div>

<style>
  .circular-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .gauge-container {
    position: relative;
    width: 300px;
    height: 300px;
  }

  .gauge-track {
    width: 100%;
    height: 100%;
  }

  .track {
    opacity: 1;
    border: none;
    box-shadow: none;
    transition: opacity 0.2s ease-in-out;
  }

  .progress-track {
    transition: stroke-dashoffset 0.1s ease-in-out, stroke 0.3s ease-in-out;
  }

  .inner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  .grade {
    font-size: 4rem;
    font-weight: bold;
    line-height: 1;
    margin-bottom: 0.5rem;
    font-family: var(--font-family-display);
  }
</style> 