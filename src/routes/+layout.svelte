<script lang="ts">
  import '../app.css';
  import 'iconify-icon';
  import { SvelteToast, toast } from '@zerodevx/svelte-toast';
  import { EventBus } from '$lib/services/event-bus';

  let { children } = $props();

  let isDrawerOpen = $state(false);
  let isSaved = $state(false);
  let currentTool = $state('brush');

  const closeDrawer = () => {
    isDrawerOpen = false;
  };

  const handleTitleClick = () => {
    if (isSaved) {
      return;
    }

    isSaved = !isSaved;

    toast.push('<iconify-icon icon="mdi:content-save"></iconify-icon> Map saved successfully!', {
      duration: 3000
    });
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeDrawer();
    }
  };

  const handleToolClick = (tool: 'brush' | 'eraser' | 'bucket') => {
    currentTool = tool;
    EventBus.emit('toolSelected', tool);
  };

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

<div class="toast-wrap">
  <SvelteToast />
</div>

<div class="layout">
  <header class="py-2 px-2 border-b border-neutral flex justify-between items-center">
    <div class="flex items-center gap-2">
      <button class="btn btn-neutral btn-md flex items-center gap-2" onclick={handleTitleClick}>
        <iconify-icon icon="mdi:content-save"></iconify-icon>
        Untitled Map
      </button>
    </div>
    <label
      for="nav-drawer"
      class="tooltip tooltip-bottom btn btn-neutral btn-md flex items-center gap-2"
    >
      <iconify-icon icon="material-symbols:menu-open-rounded"></iconify-icon>
    </label>
  </header>

  <div class="floating-menu">
    <ul class="menu menu-horizontal rounded-box gap-2 p-2 shadow-lg">
      <li>
        <button
          class="tooltip tooltip-bottom"
          data-tip="Brush"
          aria-label="Brush"
          onclick={() => handleToolClick('brush')}
          class:active={currentTool === 'brush'}
        >
          <iconify-icon icon="mdi:brush"></iconify-icon>
        </button>
      </li>
      <li>
        <button
          class="tooltip tooltip-bottom"
          data-tip="Eraser"
          aria-label="Eraser"
          onclick={() => handleToolClick('eraser')}
          class:active={currentTool === 'eraser'}
        >
          <iconify-icon icon="mdi:eraser"></iconify-icon>
        </button>
      </li>
      <li>
        <button
          class="tooltip tooltip-bottom"
          data-tip="Paint Bucket"
          aria-label="Paint Bucket"
          onclick={() => handleToolClick('bucket')}
          class:active={currentTool === 'bucket'}
        >
          <iconify-icon icon="mdi:format-color-fill"></iconify-icon>
        </button>
      </li>
      <li>
        <button class="tooltip tooltip-bottom" data-tip="Zoom" aria-label="Zoom">
          <iconify-icon icon="mdi:magnify"></iconify-icon>
        </button>
      </li>
      <li>
        <button class="tooltip tooltip-bottom" data-tip="Layers" aria-label="Layers">
          <iconify-icon icon="mdi:layers"></iconify-icon>
        </button>
      </li>
      <li>
        <button class="tooltip tooltip-bottom" data-tip="Tools" aria-label="Tools">
          <iconify-icon icon="mdi:tools"></iconify-icon>
        </button>
      </li>
      <li>
        <button class="tooltip tooltip-bottom" data-tip="Undo" aria-label="Undo">
          <iconify-icon icon="mdi:undo"></iconify-icon>
        </button>
      </li>
      <li>
        <button class="tooltip tooltip-bottom" data-tip="Redo" aria-label="Redo">
          <iconify-icon icon="mdi:redo"></iconify-icon>
        </button>
      </li>
    </ul>
  </div>

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

  <main class="content">
    {@render children()}
  </main>
</div>

<style lang="postcss">
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: Arial, Helvetica, sans-serif;
  }

  iconify-icon {
    @apply hover:scale-105 transition-all duration-300 text-2xl;
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
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .floating-menu {
    position: fixed;
    top: 34px;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
  }

  .toast-wrap {
    font-family: Roboto, sans-serif;
    font-size: 1rem;
    --toastBackground: oklch(0.313815 0.021108 254.139);
    --toastColor: oklch(0.710396 0.015376 254.139);
    --toastBarBackground: rgb(34 197 94);
    --toastBorderRadius: 0.5rem;
  }
  .toast-wrap :global(strong) {
    font-weight: 600;
  }

  .toast-wrap :global(iconify-icon) {
    @apply text-xl -mb-1 text-green-500;
  }

  .floating-menu button.active {
    @apply bg-primary text-primary-content;
  }
</style>
