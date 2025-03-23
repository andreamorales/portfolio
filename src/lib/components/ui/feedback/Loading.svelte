<script lang="ts">
  export let message: string;
</script>

<div class="loading">
  <p>{message}</p>
</div>

<style>
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
