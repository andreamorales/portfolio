<script lang="ts">
    import HeroIllustration from './HeroIllustration.svelte';
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { onMount } from 'svelte';

    // Split title into words and letters
    $: letters = "Ready to try Panto?".split(' ').map(word => ({
        chars: word.split('').map(char => ({
            char,
            isSpace: false
        })),
        isLastWord: false
    }));

    let calloutVisible = false;
    let calloutContainer: HTMLElement;

    onMount(() => {
        // Set up Intersection Observer for the callout section
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        calloutVisible = true;
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.2,
                rootMargin: '50px'
            }
        );

        if (calloutContainer) {
            observer.observe(calloutContainer);
        }

        return () => {
            observer.disconnect();
        };
    });
</script>

<div class="final-container flex-center" 
    bind:this={calloutContainer}>
        <div class="callout-section width-100 flex-column-center border-travel">
            <h1>
                {#each letters as word, wordIndex}
                    <span class="word" 
                        in:fly|local={{ 
                            y: -20, 
                            duration: 600, 
                            delay: 400 + (wordIndex * 100),
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
                in:fly|local={{ y: 20, duration: 800, delay: 800, easing: quintOut }}>
                <center><p>Start by appraising your data with 2 open-source models.</p></center>
                <div in:fly|local={{ y: 20, duration: 800, delay: 1000, easing: quintOut }}>
                    <button class="button-primary" on:click={() => window.location.href = 'https://forms.gle/NpzZTHxPxBgetko19'}>Request a demo</button>
                </div>
            </div>
        </div>
</div>

<style>
    .final-container {
        position: relative;
        overflow: visible;
        width: 100%;
        padding: 0;
    }

    .callout-section {
        text-align: center;
        padding: 4rem;
        filter: var(--callout-filter);
        background-color: color-mix(in srgb, var(--bg-color) 95%, transparent);
    }

    .callout-section h1 {
        font-size: 3.5em;
        background: var(--text-gradient);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        line-height: 1.2;
        margin: 0;
        padding: 0;
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

    .subtitle {
        width: min(800px, 100%);
        margin: 2rem auto 0;
        padding: 0 1rem;
        box-sizing: border-box;
    }

    p {
        margin-top: 0;
        padding-top: 0;
        opacity: 0.8;
    }

    @media (max-width: 768px) {
        .callout-section {
            text-align: center;
            max-width: 100%;
            margin: 0 auto;
            padding: 3rem 2rem;
        }
        
        .callout-section h1 {
            font-size: 2.5em;
        }
        
        .gradient-letter {
            font-size: 2.5rem;
        }
    }

    @keyframes drawLine {
        from {
            stroke-dashoffset: 2000;
        }
        to {
            stroke-dashoffset: 0;
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .flex-column-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    :global(.fade-path) {
        animation: fadeIn 2s ease-in forwards;
        opacity: 0;
    }

    :global(.draw-path) {
        stroke-dasharray: 2000;
        stroke-dashoffset: 2000;
        animation: drawLine 3s ease-in-out forwards;
    }

    /* Add theme-specific shadow colors */
    :global(.dark) .callout-section {
        --callout-filter: drop-shadow(0 0 40px color-mix(in srgb, var(--purple-mid) 2%, transparent));
    }

    :global(.light) .callout-section {
        --callout-filter: drop-shadow(0 0 40px color-mix(in srgb, var(--purple-darker) 8%, transparent));
    }
</style> 