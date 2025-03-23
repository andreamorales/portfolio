<script>
  import { goto } from '$app/navigation';
  import them from '$lib/icons/them.svg';
  import you from '$lib/icons/you.svg';
  import settings from '$lib/icons/settings.svg';
  import profile from '$lib/icons/profile.svg';

  const goToImageList = () => {
    goto(`/ImageList`, {});
  };

  const goToImageCapture = () => {
    goto(`/ImageCapture`, {});
  };

  const goToSettings = () => {
    goto(`/Settings`, {});
  };

  const goToProfile = () => {
    goto(`/Profile`, {});
  };
</script>

<div>
  <nav class="lower flex-row">
    <button class="button-clear" on:click={goToImageList}>
      <img class="nav-them" src={them} alt="them" />
      <p>Them</p>
    </button>
    <button class="button-clear" on:click={goToImageCapture}>
      <img class="nav-you" src={you} alt="you" />
      <p>You</p>
    </button>
    <button class="button-clear" on:click={goToSettings}>
      <img class="nav-settings" src={settings} alt="settings" />
      <p>Settings</p>
    </button>
    <button class="button-clear" on:click={goToProfile}>
      <img class="nav-profile" src={profile} alt="profile" />
      <p>Settings</p>
    </button>
  </nav>
</div>

<style>
  .lower {
    display: flex;
    padding-top: 1em;
    padding-bottom: 1em;
    position: fixed;
    justify-content: center;
    left: 0;
    bottom: 0;
    width: 100vw;
    height: 15vh;
    background-color: transparent;
    background-image: linear-gradient(#5a00ee00, #5a00ee98);
    background-position:
      bottom center,
      50%,
      50%;
    background-size: cover;
    z-index: 3;
  }

  @media (min-width: 768px) {
    .lower {
      display: none;
      height: 0;
      width: 0;
    }
  }

  nav p {
    margin: 0;
    font-size: 0.75em;
  }

  nav button {
    margin: 0;
    height: fit-content;
  }

  img {
    height: 100%;
    flex-basis: 64px;
    flex-shrink: 0;
    flex-grow: 1;
  }
</style>
