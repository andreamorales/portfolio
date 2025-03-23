<script lang="ts">
  import { LandingNav } from '$lib/components';
  import { logoHorizontalSvg } from '$lib/icons';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { MobileMenu } from '$lib/components/ui/nav';
  import { Label } from '$lib/components/ui/input';

  let scrolled = false;
  let mobileMenuOpen = false;
  let mounted = false;
  
  onMount(() => {
    mounted = true;
    if (browser) {
      const handleScroll = () => {
        scrolled = window.scrollY > 20;
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  });

  const toggleMobileMenu = () => {
    mobileMenuOpen = !mobileMenuOpen;
  };

  const closeMobileMenu = () => {
    mobileMenuOpen = false;
  };

  const goToLogin = () => {
    goto('/Login');
  };
</script>

<div class="nav-container width-100" class:mounted>
  <div class="nav-background" class:scrolled>
    <div class="desktop-inner">
      <div class="flex-row gap-small align-center">
        <a href="/" class="logo-link">
          {@html logoHorizontalSvg}
        </a>
        <Label text="v.0.3.1" variant="version" />
      </div>
      <div class="nav-center">
        <LandingNav />
      </div>
      <div class="nav-right">
        <button
          class="button-secondary"
          on:click={goToLogin}
        >Log in</button>
      </div>
      <button class="mobile-menu-toggle" on:click={toggleMobileMenu}>
        <div class="hamburger" class:open={mobileMenuOpen}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
    </div>
  </div>
</div>

{#if mounted}
  <MobileMenu isOpen={mobileMenuOpen} onClose={closeMobileMenu} />
{/if}

<style>
  .nav-container {
    height: 73px;
    position: relative;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .nav-container.mounted {
    opacity: 1;
  }

  .nav-background {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 1000;
    background-color: var(--bg-color);
    transition: background-color 0.3s ease, backdrop-filter 0.3s ease;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .nav-background.scrolled {
    background-color: rgba(var(--background-rgb), 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .desktop-inner {
    position: relative;
    max-width: var(--max-width);
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 16px 24px;
  }

  .nav-center {
    justify-self: center;
  }

  .nav-right {
    justify-self: end;
  }

  .desktop-inner::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 24px;
    right: 24px;
    height: 0.5px;
    background-color: var(--text-color);
    opacity: 0.4;
  }

  .logo-link {
    line-height: 0;
    font-size: 0;
  }

  .logo-link :global(svg) {
    width: 90px;
    height: auto;
  }

  .mobile-menu-toggle {
    display: none;
    background: none;
    border: none;
    padding: 8px;
    cursor: pointer;
  }

  .hamburger {
    width: 24px;
    height: 20px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .hamburger span {
    display: block;
    width: 100%;
    height: 2px;
    background-color: var(--text-color);
    transition: transform 0.3s ease;
  }

  .hamburger.open span:nth-child(1) {
    transform: translateY(9px) rotate(45deg);
  }

  .hamburger.open span:nth-child(2) {
    opacity: 0;
  }

  .hamburger.open span:nth-child(3) {
    transform: translateY(-9px) rotate(-45deg);
  }

  @media (max-width: 768px) {
    .nav-center, .nav-right {
      display: none;
    }

    .mobile-menu-toggle {
      display: block;
      justify-self: end;
    }

    .desktop-inner {
      grid-template-columns: 1fr auto;
      padding: 16px;
    }
  }

  .align-center {
    align-items: center;
  }
</style>
