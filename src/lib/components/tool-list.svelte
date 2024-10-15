<script lang="ts">
  import { EventBus } from '$lib/services/event-bus';
  import { createHotkeyListener } from '$lib/services/hotkey-listener';
  import { tools } from '$lib/state/tool.svelte';

  let menuElement: HTMLUListElement;

  const updateMenuPosition = () => {
    if (menuElement) {
      const windowWidth = window.innerWidth;
      const menuWidth = menuElement.offsetWidth;
      menuElement.style.left = `${(windowWidth - menuWidth) / 2}px`;
    }
  };

  $effect(() => {
    updateMenuPosition();
  });

  $effect(() => {
    const listener = createHotkeyListener();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition);

    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition);
      listener.destroy();
    };
  });
</script>

<ul bind:this={menuElement} class="floating-menu menu menu-horizontal gap-2 p-0">
  <li>
    <button
      class="tooltip tooltip-left"
      data-tip="Brush"
      aria-label="Brush"
      onclick={() => tools.setTool('brush')}
      class:active={tools.currentTool === 'brush'}
    >
      <iconify-icon icon="mdi:brush"></iconify-icon>
    </button>
  </li>
  <li>
    <button
      class="tooltip tooltip-left"
      data-tip="Eraser"
      aria-label="Eraser"
      onclick={() => tools.setTool('eraser')}
      class:active={tools.currentTool === 'eraser'}
    >
      <iconify-icon icon="mdi:eraser"></iconify-icon>
    </button>
  </li>
  <li>
    <button
      class="tooltip tooltip-left"
      data-tip="Paint Bucket"
      aria-label="Paint Bucket"
      onclick={() => tools.setTool('bucket')}
      class:active={tools.currentTool === 'bucket'}
    >
      <iconify-icon icon="mingcute:paint-fill"></iconify-icon>
    </button>
  </li>
  <li>
    <button class="tooltip tooltip-left" data-tip="Zoom" aria-label="Zoom">
      <iconify-icon icon="mdi:magnify"></iconify-icon>
    </button>
  </li>
  <li>
    <button class="tooltip tooltip-left" data-tip="Layers" aria-label="Layers">
      <iconify-icon icon="mdi:layers"></iconify-icon>
    </button>
  </li>
  <li>
    <button class="tooltip tooltip-left" data-tip="Tools" aria-label="Tools">
      <iconify-icon icon="mdi:tools"></iconify-icon>
    </button>
  </li>
  <li>
    <button class="tooltip tooltip-left" data-tip="Undo" aria-label="Undo">
      <iconify-icon icon="mdi:undo"></iconify-icon>
    </button>
  </li>
  <li>
    <button class="tooltip tooltip-left" data-tip="Redo" aria-label="Redo">
      <iconify-icon icon="mdi:redo"></iconify-icon>
    </button>
  </li>
</ul>

<style lang="postcss">
  iconify-icon {
    @apply hover:scale-105 transition-all duration-100;
  }

  .floating-menu {
    @apply fixed top-3 transform;
    transition: left 0.3s ease;
  }

  .floating-menu button {
    @apply btn-xs flex items-center justify-center text-lg;
  }

  .floating-menu button.active {
    @apply bg-neutral text-primary;
  }
</style>
