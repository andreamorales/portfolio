<script lang="ts">
  import { onMount } from 'svelte';
  
  let visible = false;
  
  onMount(() => {
    // Small delay for animation
    setTimeout(() => {
      visible = true;
    }, 300);
  });
</script>

<section id="hero" class="hero-section">
  <div class="container">
    <div class="hero-content" class:visible>
      <h1 class="hero-title">
        Hi, I'm <span class="highlight">Andy</span>
      </h1>
      <h2 class="hero-subtitle">Full Stack Developer</h2>
      <p class="hero-description">
        I build modern web applications with a focus on performance, accessibility, and user experience.
      </p>
      <div class="hero-cta">
        <a href="#projects" class="btn btn-primary">View My Work</a>
        <a href="#contact" class="btn btn-secondary">Get In Touch</a>
      </div>
    </div>
    <div class="hero-image" class:visible>
      <div class="code-block">
        <div class="code-line"><span class="token-keyword">function</span> <span class="token-function">Developer</span>() {</div>
        <div class="code-line">  <span class="token-keyword">const</span> <span class="token-variable">skills</span> = [</div>
        <div class="code-line">    <span class="token-string">'JavaScript'</span>,</div>
        <div class="code-line">    <span class="token-string">'TypeScript'</span>,</div>
        <div class="code-line">    <span class="token-string">'React'</span>,</div>
        <div class="code-line">    <span class="token-string">'Svelte'</span>,</div>
        <div class="code-line">    <span class="token-string">'Node.js'</span></div>
        <div class="code-line">  ];</div>
        <div class="code-line">  </div>
        <div class="code-line">  <span class="token-keyword">return</span> {</div>
        <div class="code-line">    <span class="token-property">code</span>: <span class="token-function">() => '</span>💻<span class="token-function">'</span>,</div>
        <div class="code-line">    <span class="token-property">create</span>: <span class="token-function">() => '</span>✨<span class="token-function">'</span>,</div>
        <div class="code-line">    <span class="token-property">solve</span>: <span class="token-function">() => '</span>🧩<span class="token-function">'</span></div>
        <div class="code-line">  };</div>
        <div class="code-line">}</div>
      </div>
    </div>
  </div>
  <div class="hero-scroll">
    <a href="#about" aria-label="Scroll to About section">
      <div class="scroll-icon"></div>
    </a>
  </div>
</section>

<style>
  .hero-section {
    min-height: calc(100vh - 80px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    padding: var(--spacing-xl) 0;
    overflow: hidden;
  }
  
  .hero-content {
    max-width: 600px;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity var(--transition-slow) var(--easing-standard),
                transform var(--transition-slow) var(--easing-standard);
  }
  
  .hero-content.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .hero-title {
    font-size: clamp(2.5rem, 5vw, 3.5rem);
    line-height: 1.1;
    margin-bottom: var(--spacing-md);
    font-weight: var(--font-weight-bold);
  }
  
  .highlight {
    background: var(--text-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: inline-block;
  }
  
  .hero-subtitle {
    font-size: clamp(1.5rem, 3vw, 2rem);
    margin-bottom: var(--spacing-md);
    color: var(--text-color-light);
    font-weight: var(--font-weight-medium);
  }
  
  .hero-description {
    font-size: var(--font-size-lg);
    line-height: 1.6;
    margin-bottom: var(--spacing-lg);
    color: var(--text-color-light);
    max-width: 540px;
  }
  
  .hero-cta {
    display: flex;
    gap: var(--spacing-md);
    margin-top: var(--spacing-lg);
  }
  
  .hero-image {
    max-width: 550px;
    position: relative;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity var(--transition-slow) 0.2s var(--easing-standard),
                transform var(--transition-slow) 0.2s var(--easing-standard);
  }
  
  .hero-image.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .code-block {
    background-color: var(--code-bg);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-md);
    font-family: 'Fira Code', monospace;
    font-size: var(--font-size-sm);
    line-height: 1.5;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-color);
    overflow: hidden;
    position: relative;
  }
  
  .code-block::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      45deg,
      rgba(99, 102, 241, 0.05),
      rgba(236, 72, 153, 0.05)
    );
    z-index: -1;
  }
  
  .code-line {
    padding: 0.2rem 0;
    white-space: pre;
  }
  
  .token-keyword {
    color: #c678dd;
  }
  
  .token-function {
    color: #61afef;
  }
  
  .token-variable {
    color: #e06c75;
  }
  
  .token-string {
    color: #98c379;
  }
  
  .token-property {
    color: #e5c07b;
  }
  
  .hero-scroll {
    position: absolute;
    bottom: var(--spacing-lg);
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    animation: bounce 2s infinite;
  }
  
  .scroll-icon {
    width: 30px;
    height: 50px;
    border: 2px solid var(--text-color-light);
    border-radius: 15px;
    position: relative;
  }
  
  .scroll-icon::before {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    background: var(--text-color-light);
    border-radius: 50%;
    left: 50%;
    top: 30%;
    transform: translateX(-50%);
    animation: scrollDown 1.5s infinite;
  }
  
  @keyframes scrollDown {
    0% {
      opacity: 1;
      top: 30%;
    }
    100% {
      opacity: 0;
      top: 70%;
    }
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
  
  .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-xl);
    align-items: center;
  }
  
  @media (max-width: 992px) {
    .container {
      grid-template-columns: 1fr;
    }
    
    .hero-image {
      margin: 0 auto;
      order: -1;
    }
    
    .hero-content {
      text-align: center;
      margin: 0 auto;
    }
    
    .hero-cta {
      justify-content: center;
    }
  }
  
  @media (max-width: 576px) {
    .hero-cta {
      flex-direction: column;
      width: 100%;
    }
    
    .btn {
      width: 100%;
    }
  }
</style> 