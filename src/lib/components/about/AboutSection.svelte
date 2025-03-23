<script>
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import SectionHeading from '../common/SectionHeading.svelte';
  
  let mounted = false;
  
  const skills = [
    { name: 'JavaScript', level: 90 },
    { name: 'TypeScript', level: 85 },
    { name: 'React', level: 88 },
    { name: 'Svelte', level: 80 },
    { name: 'HTML/CSS', level: 92 },
    { name: 'Node.js', level: 75 },
    { name: 'UI/UX Design', level: 82 }
  ];
  
  onMount(() => {
    mounted = true;
  });
</script>

<section id="about" class="about-section">
  <div class="container">
    <SectionHeading 
      title="About Me" 
      subtitle="Here you'll find more information about me, my current skills, and what I'm passionate about."
    />
    
    {#if mounted}
      <div class="about-content flex-row gap-large">
        <div class="about-text" in:fly={{ y: 20, duration: 800, delay: 200, easing: quintOut }}>
          <p>I'm a passionate Frontend Developer with a strong focus on creating beautiful, intuitive user interfaces. With over 5 years of experience in web development, I specialize in building responsive, accessible websites and applications.</p>
          
          <p>My approach combines technical expertise with an eye for design, allowing me to transform concepts into polished digital experiences. I'm constantly exploring new technologies and methodologies to enhance my skillset and deliver better results.</p>
          
          <p>When I'm not coding, you can find me hiking, reading, or experimenting with photography — activities that fuel my creativity and problem-solving abilities.</p>
        </div>
        
        <div class="skills-container" in:fly={{ y: 20, duration: 800, delay: 400, easing: quintOut }}>
          <h3>My Skills</h3>
          <div class="skills-list">
            {#each skills as skill, i}
              <div class="skill-item" 
                in:fly={{ y: 10, duration: 500, delay: 500 + (i * 100), easing: quintOut }}>
                <div class="skill-info">
                  <span class="skill-name">{skill.name}</span>
                  <span class="skill-percentage">{skill.level}%</span>
                </div>
                <div class="skill-bar">
                  <div class="skill-level" style="width: {skill.level}%"></div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  .about-section {
    padding: var(--spacing-extra-large) 0;
    background-color: var(--bg-color-alt);
  }
  
  .about-content {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
  }
  
  .about-text {
    flex: 1;
    min-width: 300px;
  }
  
  .about-text p {
    margin-bottom: var(--spacing-md);
    line-height: 1.7;
  }
  
  .skills-container {
    flex: 1;
    min-width: 300px;
  }
  
  .skills-container h3 {
    margin-bottom: var(--spacing-md);
    font-size: var(--font-size-xl);
  }
  
  .skills-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .skill-item {
    margin-bottom: var(--spacing-xs);
  }
  
  .skill-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }
  
  .skill-name {
    font-weight: var(--font-weight-medium);
  }
  
  .skill-percentage {
    color: var(--text-color-light);
  }
  
  .skill-bar {
    height: 8px;
    background-color: color-mix(in srgb, var(--text-color) 10%, transparent);
    border-radius: var(--border-radius-full);
    overflow: hidden;
  }
  
  .skill-level {
    height: 100%;
    background: var(--primary-gradient);
    border-radius: var(--border-radius-full);
    transition: width 1s ease-in-out;
  }
  
  @media (max-width: 768px) {
    .about-content {
      flex-direction: column;
      gap: var(--spacing-xl);
    }
  }
</style> 