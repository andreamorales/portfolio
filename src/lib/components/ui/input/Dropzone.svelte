<script lang="ts">
  import { Dropzone } from 'flowbite-svelte';

  let value: any[] = [];
  const dropHandle = (event: any) => {
    value = [];
    event.preventDefault();
    if (event.dataTransfer.items) {
      [...event.dataTransfer.items].forEach((item, i) => {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          value.push(file.name);
          value = value;
        }
      });
    } else {
      [...event.dataTransfer.files].forEach((file, i) => {
        value = file.name;
      });
    }
  };

  const handleChange = (event: any) => {
    const files = event.target.files;
    if (files.length > 0) {
      value.push(files[0].name);
      value = value;
    }
  };

  const showFiles = (files: any[]) => {
    console.log(`files:`, files);
    console.log(`value:`, value);
    if (files.length === 1) return files[0];
    let concat = '';
    files.map((file) => {
      concat += file;
      concat += ',';
      concat += ' ';
    });

    if (concat.length > 40) concat = concat.slice(0, 40);
    concat += '...';
    return concat;
  };
</script>

<Dropzone
  id="dropzone"
  on:drop={dropHandle}
  on:dragover={(event) => {
    event.preventDefault();
  }}
  on:change={handleChange}
>
  <svg
    aria-hidden="true"
    class="mb-3 w-10 h-10"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ><path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    /></svg
  >
  {#if value.length === 0}
    <p class="mb-2 text-sm dark:text-gray-400">
      <span class="font-semibold">Click to upload</span> or drag and drop
    </p>
    <p class="text-xs dark:text-gray-400">
      SVG, PNG, JPG, or PDF (MAX. 800x400px)
    </p>
  {:else}
    <p class="text-black">{showFiles(value)}</p>
  {/if}
</Dropzone>
