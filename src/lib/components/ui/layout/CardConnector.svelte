<script lang="ts">
    export let position: 'horizontal' | 'vertical' = 'horizontal';
  </script>
  
  <svg class="connector {position}" viewBox="0 0 26 33" preserveAspectRatio="none">
    <path 
      d="M25.469 16.0109C13.2403 16.0109 12.4292 26.7273 12.4292 32.0296L0.832092 16.1794C10.9154 16.1794 12.3157 6.87751 12.3157 0.824654L25.469 16.0109Z" 
      fill="var(--inverse-bg)"
    />
  </svg>
  
  <style>
    .connector {
      position: absolute;
      z-index: -1;
      pointer-events: none;
      width: 26px;
      height: 33px;
    }
  
    .vertical {
      left: -10px;
      bottom: -16px;
      transform: rotate(180deg);
    }
  </style> 