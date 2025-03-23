<script lang="ts">
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import F5 from '$lib/images/F5.svg?raw';
    import ConsenSys from '$lib/images/Consensys.svg?raw';
    import Thoughtworks from '$lib/images/ThoughtWorks.svg?raw';
    import Roblox from '$lib/images/Roblox.svg?raw';
    import MongoDB from '$lib/images/MongoDB.svg?raw';

    let mounted = false;
    let logoSectionVisible = false;
    let logoContainer: HTMLElement;

    onMount(() => {
        mounted = true;
        // Set up Intersection Observer for the logos section
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        logoSectionVisible = true;
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.2
            }
        );

        if (logoContainer) {
            observer.observe(logoContainer);
        }

        return () => {
            observer.disconnect();
        };
    });
</script>

<div class="logo-section" bind:this={logoContainer}>
    {#if mounted && logoSectionVisible}
        <p class="brought-by-text"
            in:fly={{ y: 20, duration: 800, delay: 200, easing: quintOut }}>
            Made by alumni from
        </p>
        <div class="logos flex-row-center gap-small">
            {#each [MongoDB, F5, Roblox, ConsenSys, Thoughtworks] as logo, i}
                <div in:fly={{ 
                    y: 20, 
                    duration: 600, 
                    delay: 400 + (i * 100), 
                    easing: quintOut 
                }}>
                    {@html logo}
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .logo-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-small);
        width: 100%;
    }

    .brought-by-text {
        font-size: 0.9rem;
        margin: 0;
        opacity: 0.8;
    }

    .logos {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        justify-content: center;
        gap: 2rem;
    }

    .logos :global(svg) {
        height: 1.5rem;
        width: auto;
        fill: currentColor;
    }

    /* Make MongoDB and F5 logos bigger */
    .logos :global(svg:first-child),
    .logos :global(svg:nth-child(2)) {
        height: 2rem;
    }

    .logos :global(svg path),
    .logos :global(svg rect),
    .logos :global(svg circle),
    .logos :global(svg .st0),
    .logos :global(svg polygon) {
        fill: currentColor;
    }

    @media (max-width: 992px) {
        .logos :global(svg) {
            height: 1.2rem;
        }

        .logos :global(svg:first-child),
        .logos :global(svg:nth-child(2)) {
            height: 1.6rem;
        }
    }

    @media (max-width: 768px) {
        .logo-section {
            flex-direction: column;
        }
        
        .logos {
            gap: 1.5rem;
        }

        .logos :global(svg) {
            height: 1rem;
        }

        .logos :global(svg:first-child),
        .logos :global(svg:nth-child(2)) {
            height: 1.4rem;
        }
    }
</style> 