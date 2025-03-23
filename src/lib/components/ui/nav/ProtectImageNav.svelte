<script lang="ts">
  import { goto } from '$app/navigation';
  import logo from '$lib/images/panto_mark_white.svg';
  import { isJwtExpired } from '$lib/services';

  const goToProtect = () => {
    if (isJwtExpired()) {
      goto(`/Login`, {});
    } else {
      goto(`/Protect`, {});
    }
  };
</script>

<div class="wrapper">
  <button on:click={goToProtect}>
    <img src={logo} alt="Panto" />
  </button>
</div>

<style>
  .wrapper {
    display: flex;
    width: 100%;
    height: 3em;
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
  }

  .wrapper button {
    padding: 0;
    background-color: transparent;
    height: 100%;
    object-fit: contain;
    width: fit-content;
  }

  img {
    height: 100%;
  }

  @media (min-width: 768px) {
    .wrapper {
      height: 2em;
    }
  }
</style>
