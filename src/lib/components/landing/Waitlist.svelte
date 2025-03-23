<script lang="ts">
  import WaitlistShare from './WaitlistShare.svelte';
  import ShortUniqueId from 'short-unique-id';

  import { blur } from 'svelte/transition';
  import { onMount } from 'svelte';

  let email: string;
  let submitted: boolean = false;
  let runSvelteAnim = false;
  let waitlistPosition = 0;
  let refUUID = '';
  let referralCount = 0;
  let referralCode: string | null = '';

  const handleSubmit = async () => {
    if (submitted == true) {
      return;
    }
    submitted = true;

    // Check if email is in waitlist
    const response = await fetch(`/api/waitlist?email=${email}`);
    const record = await response.json();
    console.log(record);

    if (record) {
      // Email in waitlist; Retrieve record info
      refUUID = record.uuid;
      waitlistPosition = record.position;
      referralCount =
        record.linkCount +
        record.facebookCount +
        record.linkedinCount +
        record.xCount;
    } else {
      // Email not in waitlist; Create new waitlist email record
      refUUID = generateUUID();
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        body: JSON.stringify({ email, uuid: refUUID, referralCode }),
        headers: {
          'content-type': 'application/json',
        },
      });
      const newRecord = await response.json();

      waitlistPosition = newRecord.position;
      referralCount = 0;
    }
  };

  const generateUUID = () => {
    const uid = new ShortUniqueId({ length: 10 });
    return uid.rnd();
  };

  onMount(async () => {
    // @ts-ignore
    runSvelteAnim = true;
    const urlParams = new URLSearchParams(window.location.search);
    const hasRef = urlParams.has('ref');
    if (hasRef) {
      referralCode = urlParams.get('ref');
    }
  });
</script>

<div
  class="waitlist gap-small width-100"
  transition:blur={{ delay: 3000, duration: 1500 }}
>
  {#if submitted}
    <div>
      <WaitlistShare position={waitlistPosition} {refUUID} {referralCount}
      ></WaitlistShare>
    </div>
  {:else}
    <form
      class="waitlist-form width-100 gap-small"
      on:submit|preventDefault={handleSubmit}
    >
      <input
        type="text"
        bind:value={email}
        id="email"
        name="email"
        placeholder="Email"
        required
      />
      <button
        type="submit"
        class="submit-button button-primary"
        style={submitted ? '' : 'display:block'}
      >
        {submitted ? '' : 'Get early access'}
      </button>
    </form>
  {/if}
</div>

<style>
  .waitlist-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-items: center;
  }

  input {
    width: 100%;
  }

  .button-primary {
    width: 100%;
  }

  @media (min-width: 645px) {
    input {
      width: fit-content;
      flex-grow: 1;
    }

    .waitlist-form {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
    }
  }

  @media (min-width: 1536px) {
    .button-primary {
      width: fit-content;
    }
  }
</style>
