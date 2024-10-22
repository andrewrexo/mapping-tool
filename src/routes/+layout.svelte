<script lang="ts">
  import '../app.css';
  import 'iconify-icon';
  import ToolDock from '$lib/components/tool-dock.svelte';
  import HistoryBrowser from '$lib/components/history-browser.svelte';
  import { Toast, Button } from 'svelte-5-ui-lib';
  import { fly, scale, fade } from 'svelte/transition';
  import { cubicInOut, elasticOut } from 'svelte/easing';
  import { EventBus } from '$lib/services/event-bus';
  import MapUpload from '$lib/components/map-upload.svelte';

  let { children } = $props();

  let isDrawerOpen = $state(false);
  let isSaved = $state(false);
  let isModalOpen = $state(false);
  let showCheck = $state(false);
  let isUploadModalOpen = $state(false);
  let showUploadCheck = $state(false);

  let mapName = $state('Untitled Map');

  const closeDrawer = () => {
    isDrawerOpen = false;
  };

  const handleTitleClick = () => {
    if (isSaved) return;

    EventBus.emit('exportMap', () => {
      isSaved = true;
      showCheck = true;

      setTimeout(() => {
        showCheck = false;
        isSaved = false;
      }, 2000);
    });
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeDrawer();
    }
  };

  const openUploadModal = () => {
    isUploadModalOpen = true;
  };

  const closeUploadModal = () => {
    isUploadModalOpen = false;
    showUploadCheck = true;

    setTimeout(() => {
      showUploadCheck = false;
    }, 2000);
  };

  $effect(() => {
    if (isSaved) {
      setTimeout(() => {
        isModalOpen = false;
      }, 1500);
    }
  });

  $effect(() => {
    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<svelte:head>
  <title>Map Editor</title>
</svelte:head>

{#snippet toastIcon()}
  <iconify-icon icon="mdi:content-save"></iconify-icon>
{/snippet}

<div class="layout">
  <header class="py-2 px-2 border-b border-neutral flex justify-between items-center">
    <div class="flex items-center justify-center gap-2">
      <Button
        class="bg-neutral gap-2 w-32 h-10 relative overflow-hidden save-button transition-all duration-300 hover:scale-[1.025] hover:shadow-lg"
        style="box-shadow: 0 0 0 0 transparent;"
        color="green"
        pill={true}
        onclick={handleTitleClick}
      >
        {#if !showCheck}
          <iconify-icon
            icon="mdi:content-save"
            transition:scale={{ duration: 300, easing: cubicInOut }}
          ></iconify-icon>
          <span transition:scale={{ duration: 300, easing: cubicInOut }}>Save</span>
        {:else}
          <div
            class="absolute inset-0 flex items-center justify-center bg-green-500"
            transition:scale={{ duration: 500, easing: elasticOut }}
          >
            <iconify-icon
              icon="mdi:check"
              class="text-white text-2xl"
              transition:scale={{ delay: 150, duration: 500, easing: elasticOut }}
            ></iconify-icon>
          </div>
        {/if}
      </Button>
      <div class="flex justify-center">
        <Button
          pill={true}
          class="bg-neutral gap-2 w-32 h-10 relative overflow-hidden upload-button transition-all duration-300 hover:scale-[1.025] hover:shadow-lg"
          style="box-shadow: 0 0 0 0 transparent;"
          onclick={openUploadModal}
        >
          {#if !showUploadCheck}
            {#if isUploadModalOpen}
              <iconify-icon icon="mdi:loading" class="animate-spin"></iconify-icon>
            {:else}
              <iconify-icon icon="mdi:upload" in:scale={{ duration: 300, easing: cubicInOut }}
              ></iconify-icon>
            {/if}
            <span transition:scale={{ duration: 300, easing: cubicInOut }}>Upload</span>
          {:else}
            <div
              class="absolute inset-0 flex items-center justify-center bg-orange-500"
              transition:scale={{ duration: 500, easing: elasticOut }}
            >
              <iconify-icon
                icon="mdi:file-check"
                class="text-white text-2xl"
                transition:fade={{ delay: 150, duration: 300 }}
              ></iconify-icon>
            </div>
          {/if}
        </Button>
      </div>
      <Toast
        bind:toastStatus={isModalOpen}
        icon={toastIcon}
        iconClass="w-4 h-4"
        color="green"
        baseClass="p-2 z-10 absolute left-2 top-16 bg-neutral text-neutral-content"
        transition={fly}
        dismissable={false}
        params={{ duration: 300, easing: cubicInOut, x: 50 }}
      >
        <b>{mapName}</b> has been <span class="text-green-500">saved</span> to your disk.
      </Toast>
    </div>
    <HistoryBrowser />
  </header>

  {#if isUploadModalOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      role="button"
      tabindex="0"
      class="fixed inset-0 bg-black/40 z-50"
      onclick={closeUploadModal}
      transition:fade={{ duration: 300 }}
    >
      <div
        class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        onclick={(e) => e.stopPropagation()}
        role="button"
        tabindex="0"
      >
        <div
          class="bg-base-100 rounded-lg shadow-xl min-w-[300px]"
          transition:scale={{ duration: 300, easing: cubicInOut }}
        >
          <MapUpload closeModal={closeUploadModal} />
        </div>
      </div>
    </div>
  {/if}

  <div class="drawer drawer-end">
    <input id="nav-drawer" type="checkbox" class="drawer-toggle" bind:checked={isDrawerOpen} />
    <div class="drawer-side">
      <label for="nav-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
      <ul class="menu bg-base-200 text-base-content h-full w-80 p-4">
        <li>
          <button>
            <iconify-icon icon="mdi:home"></iconify-icon>
            Home
          </button>
        </li>
        <li>
          <button>
            <iconify-icon icon="mdi:layers"></iconify-icon>
            Layers
          </button>
        </li>
        <li>
          <button>
            <iconify-icon icon="mdi:palette"></iconify-icon>
            Color Palette
          </button>
        </li>
        <li>
          <button>
            <iconify-icon icon="mdi:image-filter"></iconify-icon>
            Filters
          </button>
        </li>
        <li>
          <button>
            <iconify-icon icon="mdi:shape-outline"></iconify-icon>
            Shapes
          </button>
        </li>
        <li>
          <button>
            <iconify-icon icon="mdi:text"></iconify-icon>
            Text
          </button>
        </li>
      </ul>
    </div>
  </div>

  <ToolDock />
  <main class="content">
    {@render children()}
  </main>
</div>

<style lang="postcss">
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
  }

  .layout {
    display: grid;
    grid-template-areas:
      'header header'
      'nav main';
    grid-template-columns: auto 1fr;
    grid-template-rows: auto 1fr;
    height: 100vh;
  }

  header {
    grid-area: header;
  }

  .drawer {
    grid-area: nav;
    z-index: 1000;
  }

  .content {
    grid-area: main;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  iconify-icon {
    @apply text-2xl;
  }
</style>
