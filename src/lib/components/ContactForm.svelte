<script lang="ts">
  import { onMount } from 'svelte';
  import Label from '$lib/components/ui/input/Label.svelte';
  
  let name = '';
  let email = '';
  let message = '';
  let isSubmitting = false;
  let formStatus: { type: string; message: string } | null = null;
  let showForm = false;
  let dialogElement: HTMLDialogElement;
  
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
    if (dialogElement && dialogElement.open) {
      dialogElement.close();
    }
    showForm = false;
    window.history.pushState('', '', window.location.pathname);
  }
  
  function checkHash() {
    if (window.location.hash === '#contact') {
      showForm = true;
      if (dialogElement) {
        dialogElement.showModal();
      }
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
  <dialog 
    class="contact-overlay"
    bind:this={dialogElement}
    on:close={closeForm}
  >
    <button 
      class="contact-modal" 
      type="button"
      on:click|stopPropagation
      on:keydown={(e) => {
        if (e.key === 'Escape') closeForm();
      }}
    >
      <button class="close-button" on:click={closeForm}>×</button>
      
      <h2 id="contact-form-title">Get In Touch</h2>
      
      <form on:submit|preventDefault={handleSubmit} class="contact-form" method="dialog">
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
    </button>
  </dialog>
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
    border: none;
    margin: 0;
  }
  
  .contact-modal {
    background-color: var(--bg-color);
    border-radius: var(--border-radius);
    padding: 2rem;
    width: 100%;
    max-width: 500px;
    position: relative;
    box-shadow: var(--shadow-lg);
    border: none;
    cursor: default;
    text-align: left;
  }
  
  .contact-modal:focus {
    outline: none;
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
    font-size: var(--font-size-sm);
    color: var(--text-color);
    font-weight: 500;
  }
  
  input,
  textarea {
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-sm);
    background-color: var(--bg-color);
    color: var(--text-color);
    font-family: 'Recursive', sans-serif;
    font-size: var(--font-size-base);
    transition: border-color var(--transition);
  }
  
  input:focus,
  textarea:focus {
    outline: none;
    border-color: var(--interactive-hover);
  }
  
  .submit-button {
    background-color: var(--text-color);
    color: var(--bg-color);
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: var(--border-radius-sm);
    font-weight: 600;
    cursor: pointer;
    transition: background-color var(--transition);
  }
  
  .submit-button:hover:not(:disabled) {
    background-color: var(--interactive-hover);
  }
  
  .submit-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .form-status {
    text-align: center;
  }
</style> 