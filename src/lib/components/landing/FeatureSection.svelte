<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { ThemedSvg } from '$lib/components/ui/theme';

    export let title: string;
    export let description: string;
    export let imageUrl: string;
    export let imageAlt: string;
    export let imageOnLeft: boolean = true;
    export let isLastSection: boolean = false;
    export let raw: boolean = false;
    export let showTopDivider: boolean = false;

    let sectionEl: HTMLElement;
    let visible = false;

    // Function to split title into array of letters, preserving spaces
    $: letters = title.split(' ').map(word => ({
        chars: word.split('').map(char => ({
            char,
            isSpace: false
        })),
        isLastWord: false
    }));

    onMount(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        visible = true;
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.2
            }
        );

        observer.observe(sectionEl);

        return () => {
            observer.disconnect();
        };
    });
</script>

<section 
    class="feature-section" 
    class:last={isLastSection}
    class:image-left={imageOnLeft}
    bind:this={sectionEl}
>
    {#if visible}
        {#if showTopDivider}
            <div class="section-divider top-divider" 
                in:fade={{ duration: 1000, delay: 800 }}
                aria-hidden="true"></div>
        {/if}
        <div class="container-feature {imageOnLeft ? 'image-left' : 'image-right'} flex-row gap-medium">
            <div class="image-container"
                in:fly={{ 
                    x: imageOnLeft ? -50 : 50, 
                    duration: 1000, 
                    delay: 200,
                    easing: quintOut 
                }}>
                <ThemedSvg src={imageUrl} alt={imageAlt} {raw} />
            </div>
            <div class="content-feature">
                <h2>
                    {#each letters as word, wordIndex}
                        <span class="word"
                            in:fly={{ 
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
                </h2>
                <p in:fly={{ 
                    y: 20, 
                    duration: 800, 
                    delay: 600 + (letters.length * 100),
                    easing: quintOut 
                }}>{description}</p>
            </div>
        </div>
        {#if !isLastSection}
            <div class="section-divider" 
                in:fade={{ duration: 1000, delay: 800 }}
                aria-hidden="true"></div>
        {/if}
    {/if}
</section>

<style>
    .feature-section {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0;
        max-width: min(1400px, calc(100% - 4rem));
        margin: 0 auto;
        padding: 4rem;
    }

    .container-feature {
        width: 100%;
        margin: 0 auto;
        align-items: flex-start;
    }

    .image-right {
        flex-direction: row-reverse;
    }

    .image-container, .content-feature {
        flex: 1;
    }

    .image-container {
        width: 50%;
    }

    .content-feature {
        text-align: left;
        align-items: flex-start;
        width: 50%;
    }

    .word {
        white-space: nowrap;
    }

    .gradient-letter {
        font-size: 3rem;
        background: var(--text-gradient);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        display: inline-block;
    }

    h2 {
        margin-bottom: 2rem;
        padding-bottom: 0;
        line-height: 1.2;
        display: flex;
        flex-wrap: wrap;
        font-size: 2.5rem;
        font-family: var(--font-family-display);
    }

    p {
        margin: 0;
        font-size: var(--font-size-base);
        line-height: 1.6;
        text-align: left;
        color: var(--text-color);
        opacity: 0.8;
    }

    .section-divider {
        position: relative;
        height: 1px;
        width: 70%;
        background: linear-gradient(
            to right,
            transparent,
            var(--text-color) 50%,
            transparent 100%
        );
        margin-top: 2rem;
        margin-bottom: 2rem;
        opacity: 0.2;
        pointer-events: none;
    }

    .top-divider {
        margin: 0;
    }

    @media (min-width: 992px) {
        .section-divider {
            margin-top: 6rem;
            margin-bottom: 6rem;
        }

        .top-divider {
            margin: 0 auto 6rem auto;
        }
    }

    @media (max-width: 768px) {
        .feature-section {
            padding: 2rem 1rem;
        }

        .container-feature {
            max-width: 100%;
            flex-direction: column !important;
            gap: 2rem;
            padding: 0;
        }

        .image-container {
            width: 100%;
            order: 1;
        }

        .content-feature {
            width: 100%;
            text-align: left;
            order: 2;
        }

        h2 {
            font-size: 2rem;
            justify-content: flex-start;
            margin-bottom: 1.5rem;
        }

        .gradient-letter {
            font-size: 2rem;
        }

        p {
            text-align: left;
            font-size: 1rem;
            line-height: 1.5;
        }

        .section-divider {
            width: 90%;
            margin-top: 3rem;
            margin-bottom: 3rem;
        }
    }

    @media (max-width: 480px) {
        h2 {
            font-size: 1.75rem;
            margin-bottom: 1.25rem;
        }

        .gradient-letter {
            font-size: 1.75rem;
        }

        .container-feature {
            padding-bottom: 0;
        }
    }
</style>
