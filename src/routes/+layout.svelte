<script lang="ts">
  import '../app.css';
  import 'iconify-icon';
  import { SvelteToast, toast } from '@zerodevx/svelte-toast';
  let { children } = $props();

  let isDrawerOpen = $state(false);
  let isSaved = $state(false);

  const closeDrawer = () => {
    isDrawerOpen = false;
  };

  const handleTitleClick = () => {
    if (isSaved) {
      return;
    }

    isSaved = !isSaved;

    toast.push('Map saved successfully!', {
      duration: 2000
    });
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeDrawer();
    }
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

<SvelteToast />

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

  <div class="floating-menu grid grid-flow-col min-w-[520px]">
    <ul class="menu menu-horizontal bg-base-200 rounded-box gap-2 p-2 shadow-lg">
      <li>
        <button class="tooltip tooltip-top" data-tip="Brush" aria-label="Brush">
          <iconify-icon icon="mdi:brush"></iconify-icon>
        </button>
      </li>
      <li>
        <button class="tooltip tooltip-top" data-tip="Eraser" aria-label="Eraser">
          <iconify-icon icon="mdi:eraser"></iconify-icon>
        </button>
      </li>
      <li>
        <button class="tooltip tooltip-top" data-tip="Tile Picker" aria-label="Color Picker">
          <iconify-icon icon="mdi:eyedropper"></iconify-icon>
        </button>
      </li>
      <li>
        <button class="tooltip tooltip-top" data-tip="Zoom" aria-label="Zoom">
          <iconify-icon icon="mdi:magnify"></iconify-icon>
        </button>
      </li>
      <li>
        <button class="tooltip tooltip-top" data-tip="Layers" aria-label="Layers">
          <iconify-icon icon="mdi:layers"></iconify-icon>
        </button>
      </li>
      <li>
        <button class="tooltip tooltip-top" data-tip="Tools" aria-label="Tools">
          <iconify-icon icon="mdi:tools"></iconify-icon>
        </button>
      </li>
      <li>
        <button class="tooltip tooltip-top" data-tip="Undo" aria-label="Undo">
          <iconify-icon icon="mdi:undo"></iconify-icon>
        </button>
      </li>
      <li>
        <button class="tooltip tooltip-top" data-tip="Redo" aria-label="Redo">
          <iconify-icon icon="mdi:redo"></iconify-icon>
        </button>
      </li>
    </ul>
  </div>
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
    position: absolute;
    width: fit-content;
    transform: translateX(-50%);
    left: 50%;
    bottom: 20px;
    z-index: 1000;
  }

  .floating-menu .menu {
    backdrop-filter: blur(10px);
  }

  :global(.svelte-toast) {
    @apply font-sans;
  }

  :global(.svelte-toast .toast) {
    @apply bg-success text-success-content;
  }
</style>
