<script lang="ts">
  import DockIcon from '$lib/components/ui/dock-icon.svelte';
  import { undo, redo, createHotkeyListener } from '$lib/services/hotkey-listener';
  import { tools } from '$lib/state/tool.svelte';
  import createDraggable from '$lib/state/draggable.svelte';

  let toolItems = [
    { label: 'Brush', icon: 'mdi:brush', action: () => tools.setTool('brush'), hotkey: '1' },
    {
      label: 'Eraser',
      icon: 'mdi:eraser',
      action: () => tools.setTool('eraser'),
      hotkey: '2'
    },
    {
      label: 'Paint',
      icon: 'mingcute:paint-fill',
      action: () => tools.setTool('bucket'),
      hotkey: '3'
    }
  ];

  let actionItems = [
    { label: 'Undo', icon: 'mdi:undo', action: () => undo(), hotkey: 'Cmd+Z' },
    { label: 'Redo', icon: 'mdi:redo', action: () => redo(), hotkey: 'Cmd+Shift+Z' }
  ];

  let isVertical = $state(false);

  let draggable = createDraggable({
    position: {
      left: 0,
      top: 0
    }
  });

  function isToolActive(label: string): boolean {
    if (label === 'Paint') return tools.currentTool === 'bucket';
    return tools.currentTool === label.toLowerCase();
  }

  function toggleOrientation() {
    isVertical = !isVertical;
  }

  $effect(() => {
    const listener = createHotkeyListener();

    return () => {
      listener.destroy();
    };
  });
</script>

<svelte:window onmousemove={draggable.onMouseMove} onmouseup={draggable.onMouseUp} />

{#snippet dropdown(item: { label: string; hotkey: string })}
  <div
    class="dropdown-content mt-1 bg-base-100 text-base-content px-2 py-1 gap-2 rounded-xl text-xs w-fit text-nowrap flex items-center justify-center"
  >
    {item.label}
    <kbd class="px-1.5 flex kbd kbd-sm">{item.hotkey}</kbd>
  </div>
{/snippet}

<section
  aria-label="Tool Dock"
  tabindex="-1"
  color="gray"
  class="draggable transition-all mt-[1px] duration-200 mx-auto w-[50px] p-2 flex gap-2 border-none ring-none {isVertical
    ? 'flex-col w-[40px]'
    : 'flex-row w-fit h-[41px]'}"
  style={draggable.left === 0 && draggable.top === 0
    ? 'transform: translateX(50%); right: 50%; top: 8px;'
    : `left: ${draggable.left}px; top: ${draggable.top}px;`}
  ondblclick={toggleOrientation}
>
  {#each toolItems as item}
    <DockIcon isActive={isToolActive(item.label)}>
      <div class="dropdown dropdown-end dropdown-hover dock-item w-full">
        <button
          class="btn-circle ring-none flex items-center justify-center text-2xl transition-all duration-100"
          onclick={item.action}
          class:active={isToolActive(item.label)}
          aria-label={item.label}
        >
          <iconify-icon icon={item.icon}></iconify-icon>
        </button>
        <!-- {@render dropdown(item)} -->
      </div>
    </DockIcon>
  {/each}
</section>

<style lang="postcss">
  .dock-item {
    transition: all 0.1s ease;
    user-select: none;
  }

  .dock-item:hover {
    transform: scale(1.1) translateY(-2px);
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  }

  .dock-item:hover::before,
  .dock-item:hover::after {
    transform: scale(1.1) translateY(-2px);
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  }

  .btn-circle {
    transition: all 0.3s ease;
  }

  .btn-circle:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
</style>
