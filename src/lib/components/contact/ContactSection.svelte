<script>
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import SectionHeading from '../common/SectionHeading.svelte';
  import SocialIcons from '../common/SocialIcons.svelte';
  
  let mounted = false;
  let name = '';
  let email = '';
  let message = '';
  let isSubmitting = false;
  let formStatus = null;
  
  function handleSubmit() {
    // Prevent form submission if validation fails
    if (!name || !email || !message) {
      formStatus = { type: 'error', message: 'Please fill in all fields' };
      return;
    }
    
    // Simulate form submission
    isSubmitting = true;
    formStatus = null;
    
    // Fake API call
    setTimeout(() => {
      isSubmitting = false;
      formStatus = { type: 'success', message: 'Thank you! Your message has been sent successfully.' };
      
      // Reset form
      name = '';
      email = '';
      message = '';
    }, 1500);
  }
  
  onMount(() => {
    mounted = true;
  });
</script>

<section id="contact" class="contact-section">
  <div class="container">
    <SectionHeading 
      title="Get In Touch" 
      subtitle="Have a question or want to work together? Feel free to contact me using the form below."
    />
    
    {#if mounted}
      <div class="contact-content flex-row gap-large">
        <div class="contact-info" in:fly={{ x: -30, duration: 800, delay: 200, easing: quintOut }}>
          <h3>Contact Information</h3>
          <p>Feel free to reach out to me for any inquiries, project proposals, or just to say hello. I'm always open to discussing new opportunities and ideas.</p>
          
          <div class="contact-details">
            <div class="contact-item">
              <span class="contact-label">Email:</span>
              <a href="mailto:hello@example.com" class="contact-value">hello@example.com</a>
            </div>
            
            <div class="contact-item">
              <span class="contact-label">Location:</span>
              <span class="contact-value">San Francisco, CA</span>
            </div>
            
            <div class="contact-item">
              <span class="contact-label">Availability:</span>
              <span class="contact-value">Full-time / Freelance</span>
            </div>
          </div>
          
          <div class="social-links-container">
            <h4>Find me on</h4>
            <SocialIcons />
          </div>
        </div>
        
        <div class="contact-form-container" in:fly={{ x: 30, duration: 800, delay: 400, easing: quintOut }}>
          <form on:submit|preventDefault={handleSubmit} class="contact-form">
            <h3>Send Me a Message</h3>
            
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
                {formStatus.message}
              </div>
            {/if}
            
            <button 
              type="submit" 
              class="button button-primary submit-button" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  .contact-section {
    padding: var(--spacing-extra-large) 0;
    background-color: var(--bg-color-alt);
  }
  
  .contact-content {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
  }
  
  .contact-info, .contact-form-container {
    flex: 1;
    min-width: 300px;
  }
  
  .contact-info h3, .contact-form-container h3 {
    margin-bottom: var(--spacing-md);
    font-size: var(--font-size-xl);
  }
  
  .contact-info p {
    margin-bottom: var(--spacing-lg);
    color: var(--text-color-light);
    line-height: 1.7;
  }
  
  .contact-details {
    margin-bottom: var(--spacing-lg);
  }
  
  .contact-item {
    margin-bottom: var(--spacing-sm);
  }
  
  .contact-label {
    font-weight: var(--font-weight-medium);
    margin-right: var(--spacing-xs);
    display: inline-block;
    width: 100px;
  }
  
  .contact-value {
    color: var(--text-color-light);
  }
  
  .social-links-container {
    margin-top: var(--spacing-lg);
  }
  
  .social-links-container h4 {
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-size-base);
    color: var(--text-color-light);
  }
  
  .contact-form {
    background-color: var(--bg-color);
    padding: var(--spacing-lg);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
  }
  
  .form-group {
    margin-bottom: var(--spacing-md);
  }
  
  .form-group label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-weight: var(--font-weight-medium);
  }
  
  .form-status {
    padding: var(--spacing-sm);
    border-radius: var(--border-radius);
    margin-bottom: var(--spacing-md);
  }
  
  .form-status.success {
    background-color: color-mix(in srgb, var(--success-color) 10%, transparent);
    color: var(--success-color);
  }
  
  .form-status.error {
    background-color: color-mix(in srgb, var(--error-color) 10%, transparent);
    color: var(--error-color);
  }
  
  .submit-button {
    width: 100%;
  }
  
  @media (max-width: 768px) {
    .contact-content {
      flex-direction: column;
      gap: var(--spacing-xl);
    }
    
    .contact-form-container {
      order: -1;
    }
  }
</style> 