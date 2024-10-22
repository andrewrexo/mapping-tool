<script lang="ts">
  import { EventBus } from '$lib/services/event-bus';
  import { Button } from 'svelte-5-ui-lib';

  let fileInput: HTMLInputElement | null = $state(null);
  let fileName = $state('');
  let fileContent: string | null = $state(null);
  let error = $state('');

  let { closeModal }: { closeModal: () => void } = $props();

  function handleFileChange() {
    error = '';
    const file = fileInput?.files?.[0];
    if (file) {
      fileName = file.name;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          JSON.parse(content);
          fileContent = content;
        } catch (err) {
          error = 'Invalid JSON file';
          fileContent = null;
        }
      };
      reader.readAsText(file);
    } else {
      fileName = '';
      fileContent = null;
    }
  }

  function handleUpload() {
    if (fileContent) {
      try {
        const mapData = JSON.parse(fileContent);
        EventBus.emit('loadMap', mapData);
      } catch (error) {
        //todo: show error
        console.error('Error parsing uploaded JSON:', error);
      }
    }

    closeModal();
  }
</script>

<div class="map-upload-panel bg-base-200/80 backdrop-blur-sm p-4 rounded-lg">
  <h2 class="text-lg font-bold text-slate-300">Upload Map</h2>
  <div class="file-input-container">
    <input type="file" accept=".json" bind:this={fileInput} onchange={handleFileChange} />
    <Button class="w-full" onclick={() => fileInput?.click()}>
      {#if fileName}
        <iconify-icon icon="mdi:file-check" class="mr-2"></iconify-icon>
        {fileName}
      {:else}
        <iconify-icon icon="mdi:file-plus" class="mr-2"></iconify-icon>
        Choose File
      {/if}
    </Button>
  </div>
  {#if error}
    <p class="error">{error}</p>
  {/if}
  <Button class="upload-button w-full" onclick={handleUpload} disabled={!fileContent}>
    <iconify-icon icon="mdi:upload" class="mr-2"></iconify-icon>
    Upload {fileName ? fileName : 'Map'}
  </Button>
</div>

<style lang="postcss">
  h2 {
    margin-top: 0;
    margin-bottom: 1rem;
  }

  .file-input-container {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }

  input[type='file'] {
    display: none;
  }
</style>
