<script>
  import { fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
</script>

<div 
  class="footer-wrapper"
  in:fly={{ y: 20, duration: 600, delay: 1500, easing: quintOut }}
>
  <div class="hero-content gap-medium">
    <div class="flex-column gap-small">
      <div class="gap-extra-small flex-row align-center">
        <svg width="24" height="24" viewBox="0 0 694 1001" fill="var(--text-color)" xmlns="http://www.w3.org/2000/svg">
          <path d="M691.003 900.342L440.371 649.71L267.279 474.267L335.419 406.127C391.811 349.735 391.811 260.447 335.419 204.055C315.839 184.474 291.559 171.159 266.496 165.677L381.63 50.5428L334.636 3.54932L47.9758 289.426L12.7307 324.671L166.243 478.184L15.8636 628.563L17.4301 630.129L167.809 780.508L3.33203 944.985L55.8081 997.462L220.285 832.984L288.426 901.125C344.818 957.517 434.106 957.517 490.498 901.125C510.078 881.544 523.393 857.264 528.876 832.201L644.01 947.335L691.003 900.342ZM218.719 425.707L112.983 319.972L181.124 251.832C210.887 222.069 257.097 222.069 286.859 251.832C316.622 281.594 316.622 327.804 286.859 357.567L218.719 425.707ZM112.2 628.563L214.803 525.96L321.321 627.779L216.369 732.732L112.2 628.563ZM336.203 853.348L268.062 785.208L373.797 679.472L441.938 747.613C471.7 777.375 471.7 823.586 441.938 853.348C412.175 883.111 365.965 883.111 336.203 853.348Z" fill="var(--text-color)" stroke="var(--text-color)" stroke-width="4" stroke-miterlimit="10"/>
        </svg>
        <div class="status-indicator">
          <div class="pulse-dot"></div>
          <span>All Systems Healthy</span>
        </div>
      </div>
      <div class="flex-column gap-extra-small">
        <p>Backed by</p>
        <div class="backed-logo gap-extra-small">
          <svg xmlns="http://www.w3.org/2000/svg" id="a" viewBox="0 0 150 150" width="32" height="32" fill="var(--text-color)">
            <path d="M102.94,98.36c-3.01,3.01-6.6,5.39-10.54,7.02-3.95,1.62-8.18,2.45-12.46,2.44-8.62-.01-16.88-3.41-22.98-9.46-6.1-6.05-9.52-14.24-9.53-22.79,0-8.55,3.43-16.76,9.53-22.81,6.1-6.05,14.36-9.45,22.99-9.46,4.27-.02,8.51,.81,12.46,2.43,3.95,1.62,7.53,4.01,10.54,7.02l1.04,1.03,29.06-28.83h-31.96L79.94,3.99l-21.12,20.97H28.93v29.64L7.79,75.57l21.14,20.95v29.64h29.89l21.12,20.97,21.14-20.97h31.96l-29.06-28.83-1.04,1.03Zm-49.03,.97l-22.02,21.84v-44.16h12.69c.32,8.29,3.59,16.19,9.24,22.31h.1Zm-9.33-25.29h-12.69V29.93l22.02,21.84c-5.69,6.11-9.01,14.02-9.35,22.33l.02-.06Zm-15.69,0H13.38l15.51-15.39v15.39ZM125.91,27.81l-21.98,21.8c-6.17-5.64-14.17-8.92-22.55-9.24v-12.57h44.53Zm-47.48-2.92h-15.49l15.49-15.39v15.39Zm2.94-15.39l15.51,15.39h-15.51V9.51Zm-21.98,18.3h19.04v12.58c-8.37,.34-16.34,3.62-22.49,9.26l-22.02-21.84h25.47ZM13.38,76.97h15.51v15.37l-15.51-15.37Zm20.53,46.22l22.02-21.84c6.15,5.64,14.13,8.92,22.49,9.26v12.58H33.91Zm47.46,2.92h15.51l-15.51,15.39v-15.39Zm-2.94,15.39l-15.49-15.39h15.49v15.39Zm22-18.3h-19.06v-12.57c8.38-.32,16.38-3.59,22.55-9.22l21.98,21.78h-25.47Z" fill="var(--text-color)"/>
          </svg>
          <div><p>South Park Commons</p></div>
        </div>
      </div>
      <p>© '25 BeepBoopLabInc.</p>
    </div>
    <div class="flex-column gap-small">
      <div class="footer-category">Product</div>
      <a href="/Login">Login</a>
      <a href="https://trypanto.notion.site/Panto-s-Terms-and-Privacy-Policy-2fad693c82204df2a2494da6fcba7620?pvs=4">Terms and Privacy</a>
    </div>
    <div class="flex-column gap-small hide-mobile">
      <div>Social</div>
      <div class="social-links">
        <a href="https://x.com/get_panto" class="social-link" aria-label="Follow us on X (formerly Twitter)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
          </svg>
        </a>
        <a href="https://www.linkedin.com/company/106040232" class="social-link" aria-label="Follow us on LinkedIn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" fill="currentColor"/>
          </svg>
        </a>
      </div>
    </div>
    <div class="flex-column gap-small hide-mobile">
      <div>Contact</div>
      <a href="mailto:founders@pantopanto.com">hey@pantopanto.com</a>
      <p>169 Madison Ave #11141 <br />New York, NY 10016</p>
    </div>
  </div>
</div>

<style>
  .footer-wrapper {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    background-color: transparent;
    position: relative;
    padding: 0 24px;
  }

  .footer-wrapper::before {
    content: '';
    position: absolute;
    top: 0;
    left: 24px;
    right: 24px;
    height: 0.5px;
    background-color: var(--text-color);
    opacity: 0.4;
  }

  .hero-content {
    --side-padding: 40px;
    --vertical-padding: 40px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-direction: row;
    padding: var(--vertical-padding) var(--side-padding);
    width: 100%;
    max-width: 1400px;
    background-color: transparent;
    color: var(--text-color);
    font-family: 'Recursive Variable', sans-serif;
    font-weight: 600;
    font-size: 1em;
    gap: 1rem;
  }

  .backed-logo {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  
  p,
  a {
    color: var(--text-color);
    text-decoration: none;
    font-size: 1rem;
  }

  a {
    text-decoration: underline;
  }

  a:hover {
    cursor: pointer;
  }

  @media (min-width: 768px) {
    .hero-content {
      --side-padding: 8rem;
      flex-direction: row;
      gap: 4rem;
      flex-wrap: nowrap;
    }
  }

  @media (min-width: 1200px) {
    .hero-content {
      flex-direction: row;
      gap: 6rem;
    }
  }

  @media (max-width: 768px) {
    .hide-mobile {
      display: none;
    }

    .hero-content {
      --side-padding: 24px;
      gap: 2rem;
    }

    p, a {
      font-size: 0.875rem;
    }

    .footer-category {
      font-size: 0.75rem;
    }

    .status-indicator {
      font-size: 0.75rem;
    }

    .backed-logo p {
      font-size: 0.75rem;
    }
  }

  .align-center {
    align-items: center;
  }

  .gap-extra-small.flex-row.align-center {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .status-indicator {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--green-mid);
    font-size: 0.875rem;
    line-height: 1;
  }

  .pulse-dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    min-width: 6px;
    min-height: 6px;
    background-color: var(--green-mid);
    border-radius: 50%;
    position: relative;
    display: inline-block;
    vertical-align: middle;
  }

  .pulse-dot::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    background-color: var(--green-mid);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: pulse 2s ease-out infinite;
    will-change: transform, opacity;
  }

  @keyframes pulse {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.8;
    }
    100% {
      transform: translate(-50%, -50%) scale(2);
      opacity: 0;
    }
  }

  .social-links {
    display: flex;
    gap: 16px;
  }

  .social-link {
    display: flex;
    align-items: center;
    text-decoration: none;
  }

  .social-link:hover svg {
    opacity: 0.8;
  }
</style>