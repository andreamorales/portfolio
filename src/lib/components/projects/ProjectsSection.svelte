<script>
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import SectionHeading from '../common/SectionHeading.svelte';
  
  let mounted = false;
  
  const projects = [
    {
      title: "E-Commerce Platform",
      description: "A full-featured online store built with React, Node.js, and MongoDB. Includes user authentication, product management, cart functionality, and payment processing with Stripe.",
      image: "https://via.placeholder.com/600x400",
      tags: ["React", "Node.js", "MongoDB", "Express"],
      demoLink: "#",
      codeLink: "#"
    },
    {
      title: "Task Management App",
      description: "A productivity application for managing tasks and projects. Features drag-and-drop interfaces, team collaboration tools, and real-time updates using WebSockets.",
      image: "https://via.placeholder.com/600x400",
      tags: ["Vue.js", "Firebase", "SCSS", "WebSockets"],
      demoLink: "#",
      codeLink: "#"
    },
    {
      title: "Weather Dashboard",
      description: "An interactive weather application that provides real-time weather data and forecasts. Integrates with multiple weather APIs and includes data visualization charts.",
      image: "https://via.placeholder.com/600x400",
      tags: ["JavaScript", "APIs", "Chart.js", "Responsive Design"],
      demoLink: "#",
      codeLink: "#"
    },
    {
      title: "Portfolio Site",
      description: "A responsive portfolio website built with Svelte and SvelteKit. Features smooth animations, dark/light theme toggle, and optimized performance metrics.",
      image: "https://via.placeholder.com/600x400",
      tags: ["Svelte", "SvelteKit", "CSS3", "Animation"],
      demoLink: "#",
      codeLink: "#"
    }
  ];
  
  onMount(() => {
    mounted = true;
  });
</script>

<section id="projects" class="projects-section">
  <div class="container">
    <SectionHeading 
      title="My Projects" 
      subtitle="Here's a selection of some recent work. I've done everything from web apps to mobile apps."
    />
    
    {#if mounted}
      <div class="projects-grid">
        {#each projects as project, i}
          <div class="project-card"
            in:fly={{ 
              y: 30, 
              duration: 800, 
              delay: 200 + (i * 150), 
              easing: quintOut 
            }}>
            <div class="project-image">
              <img src={project.image} alt={project.title} />
              <div class="project-overlay">
                <div class="project-links">
                  <a href={project.demoLink} class="button button-primary" target="_blank" rel="noopener noreferrer">Live Demo</a>
                  <a href={project.codeLink} class="button button-secondary" target="_blank" rel="noopener noreferrer">View Code</a>
                </div>
              </div>
            </div>
            <div class="project-content">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div class="project-tags">
                {#each project.tags as tag}
                  <span class="tag">{tag}</span>
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>

<style>
  .projects-section {
    padding: var(--spacing-extra-large) 0;
  }
  
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: var(--spacing-xl);
  }
  
  .project-card {
    background-color: var(--bg-color-alt);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .project-card:hover {
    transform: translateY(-10px);
    box-shadow: var(--shadow-xl);
  }
  
  .project-image {
    position: relative;
    overflow: hidden;
    height: 220px;
  }
  
  .project-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  .project-card:hover .project-image img {
    transform: scale(1.05);
  }
  
  .project-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .project-card:hover .project-overlay {
    opacity: 1;
  }
  
  .project-links {
    display: flex;
    gap: var(--spacing-sm);
  }
  
  .project-content {
    padding: var(--spacing-lg);
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  
  .project-content h3 {
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-size-xl);
  }
  
  .project-content p {
    margin-bottom: var(--spacing-md);
    color: var(--text-color-light);
    flex-grow: 1;
  }
  
  .project-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }
  
  .tag {
    padding: 4px 10px;
    border-radius: var(--border-radius-full);
    background-color: color-mix(in srgb, var(--primary-color) 15%, transparent);
    color: var(--primary-color);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
  }
  
  @media (max-width: 768px) {
    .projects-grid {
      grid-template-columns: 1fr;
    }
  }
</style> 