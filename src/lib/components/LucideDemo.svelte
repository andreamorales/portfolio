<script>
  // Direct import from lucide-svelte - use in non-runes mode
  import { User, Settings, FileText, Heart } from 'lucide-svelte';
</script>

<div class="lucide-demo">
  <h2>Lucide Icons Demo</h2>
  <div class="icons-container">
    <div class="icon-item">
      <!-- Just use the components directly -->
      <User size={24} color="var(--text-color)" />
      <span>User</span>
    </div>
    <div class="icon-item">
      <Settings size={24} color="var(--text-color)" />
      <span>Settings</span>
    </div>
    <div class="icon-item">
      <FileText size={24} color="var(--text-color)" />
      <span>FileText</span>
    </div>
    <div class="icon-item">
      <Heart size={24} color="var(--accent-color)" />
      <span>Heart</span>
    </div>
  </div>
</div>

<style>
  .lucide-demo {
    margin: 3rem 0;
    padding: 1.5rem;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    font-family: 'Recursive Variable';
  }

  h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: var(--font-size-2xl);
    font-weight: 500;
  }

  .icons-container {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
  }

  .icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  span {
    font-size: var(--font-size-small);
  }
</style> 