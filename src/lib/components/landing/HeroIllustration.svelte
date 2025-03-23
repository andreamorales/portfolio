<script lang="ts">
  import { theme } from '$lib/stores/theme';
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  // Light/dark mode colors
  const colors = {
    light: {
      board: {
        base: '#5C574F',
        gradient1: {
          start: 'rgba(243, 234, 214, 0.3)',
          end: 'rgba(243, 234, 214, 0.05)',
          startOpacity: '1',
          endOpacity: '1'
        },
        gradient2: {
          start: 'rgba(243, 234, 214, 0.2)',
          end: 'rgba(243, 234, 214, 0.2)',
          startOpacity: '1',
          endOpacity: '1'
        },
        stroke: '#F3EAD6'
      },
      leftBeam: {
        start: '#e9e1ce',
        end: '#252022'
      },
      rightBeams: {
        purple: '#F0B6FF',
        blue: '#64D3F7',
        green: '#80D67E',
        greenDark: '#3A7438'
      }
    },
    dark: {
      board: {
        base: '#F3EAD6',
        gradient1: {
          start: '#FCEFD1',
          end: '#EFE7D3',
          startOpacity: '1',
          endOpacity: '0.05'
        },
        gradient2: {
          start: '#12110F',
          end: '#D5CDBC',
          startOpacity: '1',
          endOpacity: '0'
        },
        stroke: '#222021'
      },
      leftBeam: {
        start: '#252022',
        end: '#E9E1CE'
      },
      rightBeams: {
        purple: '#C170FE',
        blue: '#1E9FE6',
        green: '#2E8C2D',
        greenDark: '#166B15'
      }
    }
  };

  $: currentColors = $theme === 'dark' ? colors.dark : colors.light;

  // Create style objects for light and dark modes
  $: lightStyles = {
    '--board-base': colors.light.board.base,
    '--board-stroke': colors.light.board.stroke,
    '--board-gradient1-start': colors.light.board.gradient1.start,
    '--board-gradient1-end': colors.light.board.gradient1.end,
    '--board-gradient1-start-opacity': colors.light.board.gradient1.startOpacity,
    '--board-gradient1-end-opacity': colors.light.board.gradient1.endOpacity,
    '--board-gradient2-start': colors.light.board.gradient2.start,
    '--board-gradient2-end': colors.light.board.gradient2.end,
    '--board-gradient2-start-opacity': colors.light.board.gradient2.startOpacity,
    '--board-gradient2-end-opacity': colors.light.board.gradient2.endOpacity,
    '--leftbeam-start': colors.light.leftBeam.start,
    '--leftbeam-end': colors.light.leftBeam.end,
    '--purple-mid': colors.light.rightBeams.purple,
    '--blue-mid': colors.light.rightBeams.blue,
    '--green-mid': colors.light.rightBeams.green,
    '--green-darker': colors.light.rightBeams.greenDark
  };

  $: darkStyles = {
    '--board-base': colors.dark.board.base,
    '--board-stroke': colors.dark.board.stroke,
    '--board-gradient1-start': colors.dark.board.gradient1.start,
    '--board-gradient1-end': colors.dark.board.gradient1.end,
    '--board-gradient1-start-opacity': colors.dark.board.gradient1.startOpacity,
    '--board-gradient1-end-opacity': colors.dark.board.gradient1.endOpacity,
    '--board-gradient2-start': colors.dark.board.gradient2.start,
    '--board-gradient2-end': colors.dark.board.gradient2.end,
    '--board-gradient2-start-opacity': colors.dark.board.gradient2.startOpacity,
    '--board-gradient2-end-opacity': colors.dark.board.gradient2.endOpacity,
    '--leftbeam-start': colors.dark.leftBeam.start,
    '--leftbeam-end': colors.dark.leftBeam.end,
    '--purple-mid': colors.dark.rightBeams.purple,
    '--blue-mid': colors.dark.rightBeams.blue,
    '--green-mid': colors.dark.rightBeams.green,
    '--green-darker': colors.dark.rightBeams.greenDark
  };

  let illustrationVisible = false;
  let illustrationContainer: HTMLElement;

  onMount(() => {
    // Set up Intersection Observer for the illustration
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            illustrationVisible = true;
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '50px'
      }
    );

    if (illustrationContainer) {
      observer.observe(illustrationContainer);
    }

    // Updated scroll handler for beams animation
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.body.scrollHeight;
      const scrollableHeight = (documentHeight - windowHeight) * 0.6;
      const offset = windowHeight / 2;
      const growthFactor = Math.min((scrollPosition + offset) / scrollableHeight, 1);

      // Apply animations to both left and right beams
      document.querySelectorAll('.left-beam, .right-beam').forEach((beam) => {
        const beamElement = beam as HTMLElement;
        beamElement.style.transform = `scaleY(${growthFactor * 1.2})`;
        beamElement.style.opacity = (growthFactor * 0.9).toString();
      });

      // Animate boards
      document.querySelectorAll('#Board1, #Board2, #Board3').forEach((board, index) => {
        const boardElement = board as HTMLElement;
        const delay = index * 0.2;
        boardElement.style.transform = `translateY(${growthFactor * -20}px)`;
        boardElement.style.opacity = Math.min(growthFactor + delay, 1).toString();
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<div class="illustration-wrapper flex-row-center" 
  bind:this={illustrationContainer}
  style:--board-base={currentColors.board.base}
  style:--board-stroke={currentColors.board.stroke}
  style:--board-gradient1-start={currentColors.board.gradient1.start}
  style:--board-gradient1-end={currentColors.board.gradient1.end}
  style:--board-gradient1-start-opacity={currentColors.board.gradient1.startOpacity}
  style:--board-gradient1-end-opacity={currentColors.board.gradient1.endOpacity}
  style:--board-gradient2-start={currentColors.board.gradient2.start}
  style:--board-gradient2-end={currentColors.board.gradient2.end}
  style:--board-gradient2-start-opacity={currentColors.board.gradient2.startOpacity}
  style:--board-gradient2-end-opacity={currentColors.board.gradient2.endOpacity}
  style:--leftbeam-start={currentColors.leftBeam.start}
  style:--leftbeam-end={currentColors.leftBeam.end}
  style:--purple-mid={currentColors.rightBeams.purple}
  style:--blue-mid={currentColors.rightBeams.blue}
  style:--green-mid={currentColors.rightBeams.green}
  style:--green-darker={currentColors.rightBeams.greenDark}>
  {#if illustrationVisible}
    <div class="animation-wrapper" in:fly={{ y: 50, duration: 1000, delay: 200, easing: quintOut }}>
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 -44 1304 269">
        <defs>
          <linearGradient id="linear-gradient" x1="537.7" y1="96.2" x2="1299.8" y2="96.2" gradientTransform="translate(0 225.9) scale(1 -1)" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#8ab3f7"/>
            <stop offset=".3" stop-color="#64c762"/>
            <stop offset=".7" stop-color="#e3a0fe"/>
            <stop offset="1" stop-color="#9fa5ff"/>
          </linearGradient>
          <linearGradient id="linear-gradient1" x1="537.7" y1="128.2" x2="1299.8" y2="128.2" gradientTransform="translate(0 225.9) scale(1 -1)" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#8ab3f7"/>
            <stop offset=".3" stop-color="#64c762"/>
            <stop offset=".7" stop-color="#e3a0fe"/>
            <stop offset="1" stop-color="#9fa5ff"/>
          </linearGradient>
          <linearGradient id="linear-gradient2" x1="537.7" y1="120.2" x2="1299.8" y2="120.2" gradientTransform="translate(0 225.9) scale(1 -1)" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#8ab3f7"/>
            <stop offset=".3" stop-color="#64c762"/>
            <stop offset=".7" stop-color="#e3a0fe"/>
            <stop offset="1" stop-color="#9fa5ff"/>
          </linearGradient>
          <linearGradient id="linear-gradient3" x1="537.7" y1="112.2" x2="1299.8" y2="112.2" gradientTransform="translate(0 225.9) scale(1 -1)" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#8ab3f7"/>
            <stop offset=".3" stop-color="#64c762"/>
            <stop offset=".7" stop-color="#e3a0fe"/>
            <stop offset="1" stop-color="#9fa5ff"/>
          </linearGradient>
          <linearGradient id="linear-gradient4" x1="537.7" y1="104.2" x2="1299.8" y2="104.2" gradientTransform="translate(0 225.9) scale(1 -1)" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#8ab3f7"/>
            <stop offset=".3" stop-color="#64c762"/>
            <stop offset=".7" stop-color="#e3a0fe"/>
            <stop offset="1" stop-color="#9fa5ff"/>
          </linearGradient>
          <linearGradient id="linear-gradient5" x1="549.5" y1="116.8" x2="-10.5" y2="116.8" gradientTransform="translate(0 225.9) scale(1 -1)" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="gray"/>
            <stop offset="1" stop-color="#3c3836"/>
          </linearGradient>
        </defs>
        <g id="RightBeams">
          <path class="st1" d="M537.7,129.7h766"/>
          <path class="st4" d="M537.7,97.7h766"/>
          <path class="st5" d="M537.7,105.7h766"/>
          <path class="st2" d="M537.7,113.7h766"/>
          <path class="st3" d="M537.7,121.7h766"/>
        </g>
        <g id="Board3">
          <path class="st6" d="M574,.8l37.3,43v180.1l-37.3-43V.8Z"/>
        </g>
        <g id="Board2">
          <path class="st6" d="M555.3.8l37.3,43v180.1l-37.3-43V.8Z"/>
        </g>
        <g id="Board1">
          <path class="st6" d="M537.5.8l37.3,43v180.1l-37.3-43V.8Z"/>
        </g>
        <g id="LeftBeam">
          <path class="st0" d="M1.2,56.1c23.7,0,24.4,81.2,57.6,77,41.5-5.4,43.8-96.8,85.4-99.3,49.5-2.9,28.6,127.3,80.3,127.3,55.7,0,45.3-74.3,83.7-74.3s44,106.6,91.8,97c39.5-7.9,39.6-99.7,75.2-99.7s20.1,33.4,77.8,31.5"/>
        </g>
      </svg>
    </div>
  {/if}
</div>

<style>
  .illustration-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 150px;
    /* CSS custom property defaults */
    --board-base: #FF0000;
    --board-stroke: #FF0000;
    --board-gradient1-start: #FF0000;
    --board-gradient1-end: #FF0000;
    --board-gradient1-start-opacity: 0;
    --board-gradient1-end-opacity: 1;
    --board-gradient2-start: #FF0000;
    --board-gradient2-end: #FF0000;
    --board-gradient2-start-opacity: 1;
    --board-gradient2-end-opacity: 0.2;
    --leftbeam-start: #252022;
    --leftbeam-end: #E9E1CE;
    --purple-mid: #E1A1FE;
    --blue-mid: #37C5F0;
    --green-mid: #66CC64;
    --green-darker: #2A5428;
  }

  .animation-wrapper {
    width: 100%;
    height: 100%;
  }

  /* Board styling */
  :global(#Board1),
  :global(#Board2),
  :global(#Board3) {
    fill: var(--board-base);
    stroke: var(--board-stroke);
    stroke-opacity: 0.4;
    transition: transform 0.3s ease, opacity 0.3s ease;
  }

  /* LeftBeam styling */
  :global(#LeftBeam path) {
    stroke: var(--text-color);
    fill: none;
    stroke-width: 1px;
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    opacity: 0.4;
    animation: drawLeftBeam 2s ease-out forwards;
  }

  /* RightBeams styling - starting from middle (3rd) beam */
  /* Middle beam (3rd) */
  :global(#RightBeams path:nth-child(3)) {
    stroke-dasharray: 766;
    stroke-dashoffset: 766;
    opacity: 0;
    animation: drawRightBeams 1s ease-out forwards;
    animation-delay: 1.2s;
  }

  /* Second from middle (2nd) */
  :global(#RightBeams path:nth-child(2)) {
    stroke-dasharray: 766;
    stroke-dashoffset: 766;
    opacity: 0;
    animation: drawRightBeams 1s ease-out forwards;
    animation-delay: 1.4s;
  }

  /* Second from middle (4th) */
  :global(#RightBeams path:nth-child(4)) {
    stroke-dasharray: 766;
    stroke-dashoffset: 766;
    opacity: 0;
    animation: drawRightBeams 1s ease-out forwards;
    animation-delay: 1.4s;
  }

  /* Outer beam (1st) */
  :global(#RightBeams path:nth-child(1)) {
    stroke-dasharray: 766;
    stroke-dashoffset: 766;
    opacity: 0;
    animation: drawRightBeams 1s ease-out forwards;
    animation-delay: 1.6s;
  }

  /* Outer beam (5th) */
  :global(#RightBeams path:nth-child(5)) {
    stroke-dasharray: 766;
    stroke-dashoffset: 766;
    opacity: 0;
    animation: drawRightBeams 1s ease-out forwards;
    animation-delay: 1.6s;
  }

  @keyframes drawLeftBeam {
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes drawRightBeams {
    to {
      stroke-dashoffset: 0;
      opacity: 1;
    }
  }

  /* Animation styles */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes beamMaskAnimation {
    from { stroke-dashoffset: 2000; }
    to { stroke-dashoffset: 0; }
  }


  #LeftBeam {
    opacity: 0;
    animation: fadeIn 1s ease-in forwards;
  }
  @keyframes drawLine {
    from { stroke-dashoffset: 2000; }
    to { stroke-dashoffset: 0; }
  }

  :global(.draw-path) {
    stroke-dasharray: none;
    stroke-dashoffset: none;
    animation: none;
  }

  /* SVG styles */
  :global(.st0) { 
    stroke: var(--text-color);
    fill: none;
  }
  
  :global(.st1) { stroke: url(#linear-gradient); }
  :global(.st2) { stroke: url(#linear-gradient3); }
  :global(.st3) { stroke: url(#linear-gradient4); }
  :global(.st4) { stroke: url(#linear-gradient1); }
  :global(.st5) { stroke: url(#linear-gradient2); }

  :global(.st6) {
    fill: var(--board-base);
    stroke: var(--board-stroke);
    stroke-width: 0.5px;
  }

  .animation-wrapper svg {
    width: 100%;
    height: auto;
    max-width: 1304px;
  }
</style> 