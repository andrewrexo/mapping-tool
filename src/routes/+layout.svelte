<script lang="ts">
  import '../app.css';
  import 'iconify-icon';
  import ToolDock from '$lib/components/tool-dock.svelte';
  import HistoryBrowser from '$lib/components/history-browser.svelte';
  import { Toast, Button } from 'svelte-5-ui-lib';
  import { fly } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';

  let { children } = $props();

  let isDrawerOpen = $state(false);
  let isSaved = $state(false);
  let isModalOpen = $state(false);

  const closeDrawer = () => {
    isDrawerOpen = false;
  };

  const handleTitleClick = () => {
    if (isSaved) {
      return;
    }

    isSaved = !isSaved;
    isModalOpen = true;
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeDrawer();
    }
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
    <div class="flex items-center justify-center gap-8">
      <Button pill={true} class="gap-2" color="gray" onclick={handleTitleClick}>
        <iconify-icon icon="mdi:content-save"></iconify-icon>
        Untitled Map
      </Button>
      <Toast
        bind:toastStatus={isModalOpen}
        icon={toastIcon}
        color="gray"
        baseClass="p-2 z-10 absolute left-2 top-16 bg-neutral text-neutral-content"
        transition={fly}
        dismissable={false}
        params={{ duration: 500, easing: cubicInOut, x: 50 }}
      >
        <b>Untitled Map</b> has been saved
      </Toast>
    </div>
    <HistoryBrowser />
  </header>

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
</style>
