<script lang="ts">
  import { shareOnX, shareOnFacebook, shareOnLinkedIn } from '$lib/services';
  import { blur } from 'svelte/transition';
  import { Facebook, Twitter, Linkedin, Copy } from 'lucide-svelte';

  export let position = 89;
  export let referralCount = 12;
  export let refUUID = '';
  $: showPosition = position !== 0;
  $: defaultRefLink = `https://www.pantopanto.com/?ref=${refUUID}0`;

  const createRefLink = (type: string = '0') => {
    const refLink = `https://www.pantopanto.com/?ref=${refUUID}${type}`;
    return refLink;
  };

  const createShareMessage = (type: string = '0') => {
    /** Share message. Note only works for twitter/x posts. */

    const shareMessages = [
      `I reserved my spot for Panto. Claim, track, and make royalties with your IP. Here's my link so you can get access too: ${createRefLink(type)}`,
      `I reserved my spot for Panto. Claim, track, and make royalties with your IP. Here's my link so you can get access too: ${createRefLink(type)}`,
    ];
    const shareMessage =
      shareMessages[Math.floor(Math.random() * (shareMessages.length - 1))];
    return shareMessage;
  };

  const copyRefLink = () => {
    navigator.clipboard.writeText(createRefLink('0'));
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="waitlist-card flex-column-center gap-small"
  transition:blur={{ duration: 1000 }}
>
  <p>🤗 You're on the waitlist! 🤗</p>

  {#if showPosition}
    <div class="flex-colum-center gap-small">
      <h1>{position}</h1>
      <p><b>Your current position</b></p>
    </div>
  {:else}
    <br /> Your current position is ...
  {/if}

  {#if referralCount == 0}
    <p class="referred">You haven't referred anyone.</p>
  {:else}
    <p class="referred">You have referred {referralCount} other people.</p>
  {/if}

  <div class="separator"></div>

  <p><center>Invite others to get to the front of the line.</center></p>

  <!-- svelte-ignore missing-declaration -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="unique-ref-link flex-row-center" on:click={copyRefLink}>
    <p class="referral-link">{defaultRefLink}</p>
    <Copy size={20} />
  </div>

  <div class="referrals">
    <div class="social-icons">
      <button
        class="button-clear"
        on:click={() => shareOnFacebook(createRefLink('1'))}
      >
        <Facebook size={24} />
      </button>
      <button
        class="button-clear"
        on:click={() => shareOnX(createShareMessage('2'))}
      >
        <Twitter size={24} />
      </button>
      <button
        class="button-clear"
        on:click={() => shareOnLinkedIn(createRefLink('3'))}
      >
        <Linkedin size={24} />
      </button>
    </div>
  </div>
</div>

<style>
  .referred {
    font-size: 0.7em;
  }
  h1 {
    color: var(--grey);
    font-size: 5em;
    margin-bottom: 0;
    text-align: center;
  }
  .waitlist-card {
    font-size: 0.8em;
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 24px;
    border-radius: 8px;
    color: var(--grey);
    background-color: var(--white);
  }

  .waitlist-card p {
    color: var(--black);
  }

  .separator {
    width: 80%;
    margin: 0.5em;
    border-bottom: #33333333 1px solid;
  }
  .unique-ref-link {
    padding: 20px;
    background-color: transparent;
    border-radius: 8px;
    border: 1px solid;
    border-color: #191919;
    cursor: pointer;
    font-size: 0.7em;
  }

  .referral-link {
    text-align: center;
    color: #333;
    text-decoration: none;
  }

  .referrals {
    text-align: center;
  }

  .social-icons {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .social-icons button {
    width: fit-content;
  }
</style>
