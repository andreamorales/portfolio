<script>
  import logo from '$lib/images/panto_mark_white.svg';
</script>

<div class="wrapper">
  <a href="/Protect" class="width-[25px] cursor-pointer">
    <img class="logo" src={logo} alt="Panto" width="25" />
  </a>
</div>

<style>
  .logo {
    display: none;
  }

  @media (min-width: 768px) {
    .wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }
  }

  .logo {
    display: flex;
    margin-top: 0px;
    margin-bottom: 1.5em;
    height: 6em;
  }

  img {
    height: 100%;
    flex-basis: 64px;
    flex-shrink: 0;
    flex-grow: 1;
  }
</style>
