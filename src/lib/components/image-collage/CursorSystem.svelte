<script lang="ts">
  import { onMount } from 'svelte';
  import type { Cursor } from './types.js';

  export let cursors: Cursor[] = [];
  export let onCursorsUpdate: (cursors: Cursor[]) => void;

  // Updated to use CSS variables with better contrast
  const fakeUserColors = [
    'var(--cursor-red)', 
    'var(--cursor-teal)', 
    'var(--cursor-blue)', 
    'var(--cursor-green)', 
    'var(--cursor-purple)', 
    'var(--cursor-pink)', 
    'var(--cursor-indigo)',
    'var(--cursor-yellow)'
  ];

  // Function to create a new fake cursor
  function createFakeCursor(isStatic = false, isPreexisting = false): Cursor {
    const id = Math.random().toString(36).substr(2, 9);
    const randomUserNumber = Math.floor(100 + Math.random() * 900);
    const name = `User${randomUserNumber}`;
    const color = fakeUserColors[Math.floor(Math.random() * fakeUserColors.length)];
    
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    
    const cursorLifespan = isStatic ? 
      (20000 + Math.random() * 20000) : // 20-40 seconds for static cursors
      (30000 + Math.random() * 30000);  // 30-60 seconds for moving cursors

    return {
      id,
      x: Math.random() * containerWidth,
      y: Math.random() * containerHeight,
      color,
      name,
      isDragging: false,
      isMovingToTarget: false,
      targetImage: null,
      targetX: 0,
      targetY: 0,
      destinationX: 100 + Math.random() * (containerWidth - 200),
      destinationY: 100 + Math.random() * (containerHeight - 200),
      delayCount: 0,
      curveOffsetX: (Math.random() * 100) - 50,
      curveOffsetY: (Math.random() * 100) - 50,
      timeFactor: isPreexisting ? Math.random() * 10 : 0,
      randomOffset: { x: 0, y: 0 },
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      originX: 0,
      originY: 0,
      holdDuration: 0,
      lastActiveTime: Date.now(),
      isStatic: isStatic || (!isPreexisting && Math.random() < 0.8),
      restingPeriod: isPreexisting ? 
        Math.random() * 4000 : 
        Math.random() < 0.8 ? 
          10000 + Math.random() * 10000 : 
          0,
      lifespan: cursorLifespan
    };
  }

  onMount(() => {
    // Create initial cursor
    cursors = [createFakeCursor()];
    onCursorsUpdate(cursors);
  });
</script>

<div class="fake-cursors-overlay">
  {#each cursors as cursor}
    <div 
      class="fake-cursor"
      style="
        left: {cursor.x}px;
        top: {cursor.y}px;
        --cursor-color: {cursor.color};
      "
    >
      <div class="fake-cursor-dot"></div>
      <div class="fake-cursor-name">{cursor.name}</div>
    </div>
  {/each}
</div>

<style>
  .fake-cursors-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1000;
  }

  .fake-cursor {
    position: absolute;
    transform: translate(-50%, -50%);
    transition: left 0.1s linear, top 0.1s linear;
    pointer-events: none;
  }

  .fake-cursor-dot {
    width: 8px;
    height: 8px;
    background-color: var(--cursor-color);
    border-radius: 50%;
    position: relative;
  }

  .fake-cursor-dot::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border: 2px solid var(--cursor-color);
    border-radius: 50%;
    opacity: 0.5;
  }

  .fake-cursor-name {
    position: absolute;
    top: -20px;
    left: 10px;
    background-color: var(--cursor-color);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-family: var(--font-recursive);
    white-space: nowrap;
  }
</style> 