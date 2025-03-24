<script lang="ts">
  import { onMount } from 'svelte';
  import Label from '$lib/components/ui/input/Label.svelte';
  
  let name = '';
  let email = '';
  let message = '';
  let isSubmitting = false;
  let formStatus: { type: string; message: string } | null = null;
  let showForm = false;
  
  function handleSubmit() {
    // Prevent form submission if validation fails
    if (!name || !email || !message) {
      formStatus = { type: 'error', message: 'Please fill in all fields' };
      return;
    }
    
    // Simulate form submission
    isSubmitting = true;
    formStatus = null;
    
    // Simulated API call
    setTimeout(() => {
      isSubmitting = false;
      formStatus = { 
        type: 'success', 
        message: 'Thank you for your message! I\'ll get back to you soon.' 
      };
      
      // Reset form after successful submission
      name = '';
      email = '';
      message = '';
      
      // Close form after a delay
      setTimeout(() => {
        closeForm();
      }, 3000);
    }, 1500);
  }
  
  function closeForm() {
    showForm = false;
    window.history.pushState('', '', window.location.pathname);
  }
  
  function checkHash() {
    if (window.location.hash === '#contact') {
      showForm = true;
    }
  }
  
  onMount(() => {
    // Check on mount
    checkHash();
    
    // Listen for hash changes
    window.addEventListener('hashchange', checkHash);
    
    return () => {
      window.removeEventListener('hashchange', checkHash);
    };
  });
</script>

{#if showForm}
  <div 
    class="contact-overlay" 
    on:click|self={closeForm}
    on:keydown={(e) => e.key === 'Escape' && closeForm()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="contact-form-title"
    tabindex="0"
  >
    <div class="contact-modal">
      <button class="close-button" on:click={closeForm}>×</button>
      
      <h2 id="contact-form-title">Get In Touch</h2>
      
      <form on:submit|preventDefault={handleSubmit} class="contact-form">
        <div class="form-group">
          <label for="name">Name</label>
          <input 
            type="text" 
            id="name" 
            bind:value={name} 
            placeholder="Your Name" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            bind:value={email} 
            placeholder="Your Email" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="message">Message</label>
          <textarea 
            id="message" 
            bind:value={message} 
            placeholder="Your Message" 
            rows="5" 
            required
          ></textarea>
        </div>
        
        {#if formStatus}
          <div class="form-status {formStatus.type}">
            <Label 
              text={formStatus.message} 
              variant={formStatus.type === 'success' ? 'professional' : 'semisolid'} 
            />
          </div>
        {/if}
        
        <button 
          type="submit" 
          class="submit-button" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  </div>
{/if}

<style>
  .contact-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 1rem;
    font-family: 'Recursive', sans-serif;
    font-variation-settings: 'CASL' 0;
  }
  
  .contact-modal {
    background-color: var(--bg-color);
    border-radius: var(--border-radius);
    padding: 2rem;
    width: 100%;
    max-width: 500px;
    position: relative;
    box-shadow: var(--shadow-lg);
  }
  
  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-color);
    opacity: 0.7;
    transition: opacity var(--transition);
    font-family: 'Recursive', sans-serif;
  }
  
  .close-button:hover {
    opacity: 1;
  }
  
  h2 {
    margin-bottom: 1.5rem;
    font-size: var(--font-size-2xl);
    font-family: 'Recursive', sans-serif;
    font-weight: 400;
    color: var(--text-color);
  }
  
  .contact-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    font-family: 'Recursive', sans-serif;
    font-variation-settings: 'CASL' 0;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  label {
    font-weight: 400;
    font-size: var(--font-size-small);
    font-family: 'Recursive', sans-serif;
  }
  
  input, textarea {
    padding: var(--input-padding);
    border: var(--input-border-width) solid var(--input-border-color);
    border-radius: var(--border-radius);
    background-color: var(--input-bg-color);
    color: var(--input-text-color);
    font-family: 'Recursive', sans-serif;
    font-size: var(--input-font-size);
    font-variation-settings: 'CASL' 0;
  }
  
  input::placeholder, textarea::placeholder {
    color: var(--input-placeholder-color);
  }
  
  textarea {
    resize: vertical;
    min-height: 100px;
    line-height: 1.4;
  }
  
  .form-status {
    padding: 0.5rem 0;
    width: 100%;
  }
  
  .submit-button {
    padding: var(--button-padding);
    background-color: var(--button-bg-color);
    color: var(--button-text-color);
    border: 1px solid var(--text-color);
    border-radius: var(--border-radius);
    font-weight: 400;
    cursor: pointer;
    transition: all var(--transition);
    font-family: 'Recursive', sans-serif;
    text-transform: var(--button-text-transform);
  }
  
  .submit-button:hover:not(:disabled) {
    background: var(--text-color);
    color: var(--bg-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  .submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style> 