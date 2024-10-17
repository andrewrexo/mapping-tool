<script lang="ts">
  import { Popover, Button, List, Li } from 'svelte-5-ui-lib';
  import { history } from '$lib/state/history.svelte';
  import { getActionDescription } from '$lib/actions';

  let actions = $derived.by(() => {
    const historyLength = history.past.length;
    const getLastNum = 20;
    const isSliceNeeded = historyLength > getLastNum;

    let result = isSliceNeeded ? history.past.slice(historyLength - getLastNum) : [...history.past];

    return result.reverse();
  });
</script>

{#snippet popoverTitle()}
  <div class="flex items-center space-x-2 p-2 rtl:space-x-reverse">
    <p class="text-sm text-slate-200">Recent Actions</p>
  </div>
{/snippet}

<Button id="history-popover" color="gray" pill={true} class="">
  <iconify-icon icon="mdi:history"></iconify-icon>
</Button>
<Popover
  triggeredBy="#history-popover"
  position="bottom-end"
  arrow={false}
  class="bg-neutral border-base-100 border-2 overflow-y-auto max-h-[300px] mt-2"
  titleSlot={popoverTitle}
>
  {#each actions as action}
    <span>
      <div
        class="flex items-center space-x-4 p-2 rtl:space-x-reverse text-slate-400 hover:bg-slate-700 border-t-2 border-b-1 border-slate-600 select-none"
      >
        {#if action.type === 'tile'}
          <iconify-icon icon="vaadin:paintbrush"></iconify-icon>
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
        <p class="text-sm truncate text-slate-300">
          {getActionDescription(action)}
        </p>
      </div>
    </span>
  {/each}
  {#if actions.length === 0}
    <p class="text-sm text-gray-500 dark:text-gray-400 p-2">No actions yet</p>
  {/if}
</Popover>

<style lang="postcss">
  iconify-icon {
    @apply text-xl;
  }
</style>
