<script lang="ts">
    import F5 from '$lib/images/F5.svg?raw';
    import ConsenSys from '$lib/images/Consensys.svg?raw';
    import Thoughtworks from '$lib/images/ThoughtWorks.svg?raw';
    import Roblox from '$lib/images/Roblox.svg?raw';
    import MongoDB from '$lib/images/MongoDB.svg?raw';
    import PantoOutlines from '$lib/images/panto_outlines.svg?raw';
    import { fade, fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { onMount } from 'svelte';
    import home from '$lib/images/home.svg';
    
    const OUTLINE_SVGS = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="346" height="432" viewBox="0 0 346 432" fill="none">
            <path d="M-68.3846 0.569499L-69.4107 111.446M345.456 196.968C345.456 196.968 282.023 197.336 228.232 197.647M39.1144 198.744L-69.187 199.361L-69.4107 111.446M39.1144 198.744L39.7688 311.733C39.7688 311.733 196.571 311.777 210.759 310.741C238.112 307.746 264.297 300.441 272.109 261.444C274.744 197.473 228.232 197.647 228.232 197.647M39.1144 198.744L147.87 198.112M39.1144 198.744L38.7288 132.214C38.4149 78.0524 -37.0006 49.0701 -69.4107 111.446M228.232 197.647C192.581 197.854 147.87 198.112 147.87 198.112M147.87 198.112L149.225 431.948" stroke="url(#paint0_linear_3960_148)"/>
            <defs>
                <linearGradient id="paint0_linear_3960_148" x1="-69.2854" y1="1.48077" x2="256.455" y2="323.468" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stop-color="currentColor" stop-opacity="0">
                        <animate attributeName="offset" values="0;0.4;0" dur="6s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="0.52" stop-color="currentColor" stop-opacity="var(--outline-opacity)">
                        <animate attributeName="offset" values="0.52;0.92;0.52" dur="6s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="1" stop-color="currentColor" stop-opacity="0">
                        <animate attributeName="offset" values="1;1.4;1" dur="6s" repeatCount="indefinite" />
                    </stop>
                </linearGradient>
            </defs>
        </svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="416" height="434" viewBox="0 0 416 434" fill="none">
            <path d="M413.101 433.06L414.77 322.191M0.405716 234.267C0.405716 234.267 63.84 234.267 117.632 234.267M306.752 234.266L415.056 234.277L414.77 322.191M306.752 234.266L306.753 121.275C306.753 121.275 149.953 120.322 135.76 121.276C108.39 124.113 82.1627 131.266 74.1256 170.217C71.1192 234.171 117.632 234.267 117.632 234.267M306.752 234.266L197.995 234.268M306.752 234.266L306.752 300.797C306.752 354.96 381.999 384.379 414.77 322.191M117.632 234.267C153.283 234.267 197.995 234.268 197.995 234.268M197.995 234.268L197.995 0.427798" stroke="url(#paint0_linear_3960_149)"/>
            <defs>
                <linearGradient id="paint0_linear_3960_149" x1="414.007" y1="432.154" x2="90.1378" y2="108.285" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stop-color="currentColor" stop-opacity="0">
                        <animate attributeName="offset" values="0;0.4;0" dur="6s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="0.52" stop-color="currentColor" stop-opacity="var(--outline-opacity)">
                        <animate attributeName="offset" values="0.52;0.92;0.52" dur="6s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="1" stop-color="currentColor" stop-opacity="0">
                        <animate attributeName="offset" values="1;1.4;1" dur="6s" repeatCount="indefinite" />
                    </stop>
                </linearGradient>
            </defs>
        </svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="433" height="416" viewBox="0 0 433 416" fill="none">
            <path d="M0.00586672 413.259L110.875 414.927M198.799 0.563423C198.799 0.563423 198.8 63.9977 198.8 117.789M198.8 306.91L198.789 415.213L110.875 414.927M198.8 306.91L311.791 306.911C311.791 306.911 312.744 150.111 311.79 135.918C308.953 108.548 301.8 82.3204 262.849 74.2833C198.895 71.2769 198.8 117.789 198.8 117.789M198.8 306.91L198.799 198.153M198.8 306.91L132.269 306.91C78.1064 306.91 48.6875 382.156 110.875 414.927M198.8 117.789C198.8 153.441 198.799 198.153 198.799 198.153M198.799 198.153H432.638" stroke="url(#paint0_linear_3960_152)"/>
            <defs>
                <linearGradient id="paint0_linear_3960_152" x1="0.911901" y1="414.165" x2="324.781" y2="90.2955" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stop-color="currentColor" stop-opacity="0">
                        <animate attributeName="offset" values="0;0.4;0" dur="6s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="0.52" stop-color="currentColor" stop-opacity="var(--outline-opacity)">
                        <animate attributeName="offset" values="0.52;0.92;0.52" dur="6s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="1" stop-color="currentColor" stop-opacity="0">
                        <animate attributeName="offset" values="1;1.4;1" dur="6s" repeatCount="indefinite" />
                    </stop>
                </linearGradient>
            </defs>
        </svg>`
    ];

    type Outline = {
        top: string;
        left: string;
        rotation: number;
        opacity: number;
        scale: number;
        zIndex: number;
        flipX: boolean;
        flipY: boolean;
        svgIndex: number;
    };

    // Split title into words and letters
    $: letters = "Know what your data's truly worth to AI".split(' ').map(word => ({
        chars: word.split('').map(char => ({
            char,
            isSpace: false
        })),
        isLastWord: false
    }));

    let mounted = false;
    let outlines: Outline[] = [];
    let lastWidth = 0;
    let heroContainer: HTMLElement;
    let isDarkMode = false;
    let uiImageVisible = false;
    let uiImageContainer: HTMLElement;
    
    onMount(() => {
        mounted = true;
        isDarkMode = document.documentElement.classList.contains('dark');
        
        // Set up Intersection Observer for UI image
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.target === uiImageContainer) {
                        if (entry.isIntersecting) {
                            uiImageVisible = true;
                            observer.unobserve(entry.target);
                        }
                    }
                });
            },
            {
                threshold: 0.2
            }
        );

        if (uiImageContainer) observer.observe(uiImageContainer);

        // Watch for theme changes using MutationObserver
        const themeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    isDarkMode = document.documentElement.classList.contains('dark');
                }
            });
        });
        
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Calculate viewport width accounting for scrollbar
        const setViewportWidth = () => {
            // Create a temporary div to measure the width difference
            const scrollDiv = document.createElement('div');
            scrollDiv.style.width = '100px';
            scrollDiv.style.height = '100px';
            scrollDiv.style.overflow = 'scroll';
            scrollDiv.style.position = 'absolute';
            scrollDiv.style.top = '-9999px';
            document.body.appendChild(scrollDiv);

            // Calculate scrollbar width
            const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
            document.body.removeChild(scrollDiv);

            // Set a consistent viewport width that accounts for scrollbar
            const vw = document.documentElement.clientWidth;
            lastWidth = vw;
            document.documentElement.style.setProperty('--vw', `${vw}px`);
            document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
            generateOutlines();
        };

        setViewportWidth();

        // Update on resize, but only if width changes significantly
        window.addEventListener('resize', () => {
            const newWidth = document.documentElement.clientWidth;
            if (Math.abs(newWidth - lastWidth) > 200) {
                setViewportWidth();
            }
        });

        // Clean up function
        return () => {
            observer.disconnect();
            themeObserver.disconnect();
            window.removeEventListener('resize', () => {
                const newWidth = document.documentElement.clientWidth;
                if (Math.abs(newWidth - lastWidth) > 200) {
                    setViewportWidth();
                }
            });
        };
    });

    // Function to check if two outlines overlap or are too similar when adjacent
    function doOutlinesOverlap(outline1: Outline, outline2: Outline) {
        const margin = 2;
        const rect1 = {
            left: parseFloat(outline1.left),
            top: parseFloat(outline1.top),
            right: parseFloat(outline1.left) + 346 * outline1.scale,
            bottom: parseFloat(outline1.top) + 432 * outline1.scale
        };
        const rect2 = {
            left: parseFloat(outline2.left),
            top: parseFloat(outline2.top),
            right: parseFloat(outline2.left) + 346 * outline2.scale,
            bottom: parseFloat(outline2.top) + 432 * outline2.scale
        };

        // Check for actual overlap
        const hasOverlap = !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);

        // If they're not overlapping but are close, check if they're too similar
        if (!hasOverlap) {
            const closeHorizontally = Math.abs(rect1.right - rect2.left) < 50 || Math.abs(rect1.left - rect2.right) < 50;
            const closeVertically = Math.abs(rect1.bottom - rect2.top) < 50 || Math.abs(rect1.top - rect2.bottom) < 50;
            
            if ((closeHorizontally || closeVertically) && 
                outline1.svgIndex === outline2.svgIndex && 
                outline1.flipX === outline2.flipX && 
                outline1.flipY === outline2.flipY && 
                Math.abs(outline1.rotation - outline2.rotation) < 45) {
                return true; // Too similar and too close
            }
        }

        return hasOverlap;
    }

    // Generate non-overlapping outlines
    function generateOutlines() {
        outlines = [];
        let attempts = 0;
        const maxAttempts = 100000;

        const sectionWidth = Math.max(lastWidth * 1.2, 2000);
        const sectionHeight = 800;
        const overflow = 40;

        while (outlines.length < 2400 && attempts < maxAttempts) {
            const outline: Outline = {
                top: Math.floor(Math.random() * sectionHeight - 300) + 'px',
                left: Math.floor(Math.random() * sectionWidth - sectionWidth/6) + 'px',
                rotation: Math.floor(Math.random() * 4) * 90,
                opacity: 0.15,
                scale: Math.random() * 0.4 + 0.9,
                zIndex: 0,
                flipX: Math.random() < 0.5,
                flipY: Math.random() < 0.5,
                svgIndex: Math.floor(Math.random() * OUTLINE_SVGS.length)
            };

            // Check if this outline overlaps with any existing ones
            let overlaps = false;
            for (const existing of outlines) {
                if (doOutlinesOverlap(outline, existing)) {
                    overlaps = true;
                    break;
                }
            }

            // Check if the outline extends too far below the section
            const outlineBottom = parseFloat(outline.top) + 432 * outline.scale;
            if (outlineBottom > sectionHeight + overflow) {
                overlaps = true;
            }

            if (!overlaps) {
                outlines = [...outlines, outline];
            }

            attempts++;
        }
    }
</script>

<div class="hero-container" bind:this={heroContainer} style="width: 100%;">
    <div class="hero-section width-100 flex-column-center gap-medium">
        <div class="flex-column-center gap-small">
            {#if mounted}
            <h1>
                {#each letters as word, wordIndex}
                    <span class="word" 
                        in:fly={{ 
                            y: -20, 
                            duration: 800, 
                            delay: 200 + (wordIndex * 80),
                            easing: quintOut 
                        }}>
                        {#each word.chars as { char }, charIndex}
                            <span class="gradient-letter">{char}</span>
                        {/each}
                    </span>
                    {#if wordIndex < letters.length - 1}
                        <span class="gradient-letter">&nbsp;</span>
                    {/if}
                {/each}
            </h1>
            <div class="subtitle flex-column-center gap-small"
                in:fly={{ y: 20, duration: 800, delay: 600, easing: quintOut }}>
                <center><p>Break the black box of AI and find out which data actually boosts model performance.
                    </p></center>
                <div in:fly={{ y: 20, duration: 800, delay: 800, easing: quintOut }}>
                    <button class="button-primary" on:click={() => window.location.href = 'https://forms.gle/NpzZTHxPxBgetko19'}>Try it out</button>
                </div>
            </div>
            {/if}
        </div>

        <div class="ui-image" bind:this={uiImageContainer} style="width: 100%;">
            {#if mounted && uiImageVisible}
                <div class="svg-wrapper"
                    in:fade={{ duration: 1000, delay: 200 }}
                >
                    <img 
                        src={home} 
                        alt="UI interface visualization"
                        class="ui-svg"
                        in:fly|local={{ y: 30, duration: 1200, delay: 200, easing: quintOut }}
                    />
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    :global(:root) {
        --outline-opacity: 0.5;
        --outline-glow-opacity: 0.3;
        --outline-peak-opacity: 0.4;
    }

    :global(.dark) {
        --outline-opacity: 0.5;
        --outline-glow-opacity: 0.3;
        --outline-peak-opacity: 0.4;
    }

    .hero-container {
        position: relative;
        min-height: fit-content;
        width: 100%;
        overflow: visible;
    }

    .hero-section {
        position: relative;
        width: 100%;
        max-width: 100%;
        text-align: center;
        z-index: 1;
        box-sizing: border-box;
        isolation: isolate;
        display: flex;
        flex-direction: column;
        padding-top: 3rem;
        padding-bottom: 3rem;
        overflow: visible;
        margin: 0;
    }

    .subtitle {
        width: min(1000px, 100%);
        margin: 0 auto;
        box-sizing: border-box;
    }

    h1 {
        font-size: 3.5em;
        background: var(--text-gradient);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    p {
        margin-top: 0;
        padding-top: 0;
        opacity: 0.8;
    }

    .word {
        white-space: nowrap;
    }

    .gradient-letter {
        font-size: 3.5rem;
        background: var(--text-gradient);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        display: inline-block;
    }

    h1 {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        line-height: 1.2;
        margin: 0;
        padding: 0;
    }

    @media (min-width: 768px) {
        .subtitle {
            width: min(1000px, 100%);
            margin: 0 auto;
        }

        .hero-section {
            text-align: center;
        }
    }

    .ui-image {
        width: 100%;
        max-width: 100%;
        position: relative;
        z-index: 1;
        overflow: visible;
        isolation: isolate;
        background: transparent;
        margin: 0 auto;
        display: flex;
        justify-content: center;
        box-sizing: border-box;
        padding: 0;
    }

    /* Add theme-specific shadow colors */
    :global(.dark) .ui-image {
        --image-shadow-color: color-mix(in srgb, var(--purple-mid) 7%, transparent);
    }

    :global(.light) .ui-image {
        --image-shadow-color: color-mix(in srgb, var(--purple-darker) 30%, transparent);
    }

    .ui-image::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
    }

    .ui-image::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100px;
        background: linear-gradient(to bottom, 
            transparent 0%,
            rgba(var(--bg-color-rgb), 0.1) 20%,
            rgba(var(--bg-color-rgb), 0.2) 40%,
            rgba(var(--bg-color-rgb), 0.4) 60%,
            rgba(var(--bg-color-rgb), 0.8) 80%,
            var(--bg-color) 100%
        );
        pointer-events: none;
    }

    .svg-wrapper {
        background-color: var(--bg-color);
        overflow: visible;
        width: 100%;
        box-shadow: none;
        filter: drop-shadow(0 0 40px var(--image-shadow-color));
        position: relative;
        z-index: 1;
        margin: 0 auto;
        padding: 0;
    }

    .ui-svg {
        width: 100%;
        height: auto;
        background-color: var(--bg-color) !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        display: block;
        object-fit: contain;
        max-width: 100%;
        filter: none;
        shape-rendering: geometricPrecision;
    }

    /* Target any potential background elements in the SVG */
    :global(.ui-svg rect),
    :global(.ui-svg path[fill="#ffffff"]),
    :global(.ui-svg path[fill="#fff"]),
    :global(.ui-svg path[fill="white"]),
    :global(.ui-svg [fill="white"]),
    :global(.ui-svg [fill="#ffffff"]),
    :global(.ui-svg [fill="#fff"]) {
        fill: var(--bg-color) !important;
    }

    /* Add these global styles to target SVG vertices and edges */
    :global(.ui-svg path),
    :global(.ui-svg line),
    :global(.ui-svg polyline),
    :global(.ui-svg polygon) {
        stroke-linejoin: round !important;
        stroke-linecap: round !important;
    }

    :global(.ui-svg #Layer_1) {
        background: transparent !important;
    }

    /* Add mobile-specific styles */
    @media (max-width: 768px) {
        .svg-wrapper {
            overflow: visible;
            width: 100%;
            padding: 0;
            margin: 0 auto;
        }
        
        .ui-image {
            padding: 0;
            margin: 0 auto;
            width: 100%;
        }
        
        .ui-svg {
            width: 100%;
        }
    }

    /* Add tablet-specific styles */
    @media (min-width: 769px) and (max-width: 1024px) {
        .svg-wrapper {
            overflow: visible;
            width: 100%;
            padding: 0;
            margin: 0 auto;
            /* Remove any potential transformations that might be causing clipping */
            transform: none;
        }
        
        .ui-image {
            padding: 0;
            margin: 0 auto;
            width: 100%;
            /* Ensure no hidden overflow at the tablet size */
            overflow: visible;
        }
        
        .ui-svg {
            width: 100%;
            /* Ensure the image isn't being scaled in a way that causes clipping */
            transform: none;
            /* Ensure the image isn't being clipped */
            max-width: 100%;
        }
        
        /* Ensure the hero container doesn't clip content */
        .hero-container, .hero-section {
            overflow: visible;
        }
    }
</style>