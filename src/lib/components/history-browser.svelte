<script lang="ts">
  import { Popover, Button } from 'svelte-5-ui-lib';
  import { history } from '$lib/state/history.svelte';
  import { getActionDescription } from '$lib/actions';
  import { EventBus } from '$lib/services/event-bus';

  let actions = $derived.by(() => {
    const historyLength = history.past.length;
    const getLastNum = 20;
    const isSliceNeeded = historyLength > getLastNum;

    let result = isSliceNeeded ? history.past.slice(historyLength - getLastNum) : [...history.past];

    return result.reverse();
  });

  const handleRollback = (index: number) => {
    const actionsToUndo = history.rollbackTo(history.past.length - 1 - index);

    if (actionsToUndo) {
      EventBus.emit('batchUndo', actionsToUndo);
    }
  };
</script>

{#snippet popoverTitle()}
  <div class="flex items-center space-x-2 p-2 rtl:space-x-reverse">
    <p class="popover-title">Recent actions</p>
  </div>
{/snippet}

<Button id="history-popover" class="bg-neutral" pill={true}>
  <iconify-icon icon="mdi:history"></iconify-icon>
</Button>
<Popover
  triggeredBy="#history-popover"
  position="bottom-end"
  arrow={false}
  class="bg-neutral border-base-100 border-2 overflow-y-auto max-h-[300px] min-w-[300px] mt-2 grid grid-cols-1"
  titleSlot={popoverTitle}
>
  {#each actions as action, index}
    <button
      onclick={() => {
        handleRollback(index);
      }}
      class="popover-item"
    >
      <div class="flex items-center gap-2">
        {#if action.type === 'tile'}
          <iconify-icon icon="ic:twotone-draw"></iconify-icon>
        {:else if action.type === 'object'}
          <iconify-icon icon="mdi:square-rounded"></iconify-icon>
        {:else if action.type === 'fill'}
          <iconify-icon icon="mdi:bucket"></iconify-icon>
        {:else if action.type === 'undo'}
          <iconify-icon icon="mdi:undo"></iconify-icon>
        {:else if action.type === 'redo'}
          <iconify-icon icon="mdi:redo"></iconify-icon>
        {:else}
          ❓
        {/if}
        <p class="truncate text-slate-300">
          {getActionDescription(action)}
        </p>
      </div>
      <span class="text-right text-sm text-slate-400 flex items-center inset-y-4 flex-col">
        <iconify-icon icon="mdi:undo"></iconify-icon>
        undo
      </span>
    </button>
  {/each}
  {#if actions.length === 0}
    <p class="text-sm text-gray-500 dark:text-gray-400 p-2">No actions yet</p>
  {/if}
</Popover>

<style lang="postcss">
  iconify-icon {
    @apply text-2xl;
  }

  .popover-item iconify-icon {
    @apply text-2xl;
  }

  .popover-title {
    font-size: 1rem;
    @apply font-bold text-slate-300;
  }

  .popover-item {
    @apply flex gap-2 justify-between items-center p-2 text-slate-400 hover:bg-slate-700 select-none;
  }
</style>
