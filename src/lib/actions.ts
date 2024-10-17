import type { HistoryAction } from './state/history.svelte';

const getTileDescription = (action: HistoryAction) => {
  if (action.oldValue === null && action.newValue !== null) {
    return `Placed tile "${action.newValue}" at (${action.x}, ${action.y})`;
  } else if (action.oldValue !== null && action.newValue === null) {
    return `Erased tile "${action.oldValue}" at (${action.x}, ${action.y})`;
  } else if (action.oldValue === action.newValue || action.oldAlpha === 0) {
    return `Placed tile at (${action.x}, ${action.y})`;
  } else {
    return `Changed tile from "${action.oldValue}" to "${action.newValue}" at (${action.x}, ${action.y})`;
  }
};

const getFillDescription = (action: HistoryAction) => {
  const changesCount = action.changes?.length ?? 0;
  return `Used fill tool (${changesCount} tiles affected)`;
};

const getActionDescription = (action?: HistoryAction): string => {
  if (!action) return 'No actions yet';

  switch (action.type) {
    case 'tile':
      return getTileDescription(action);
    case 'object':
      return `Placed object at (${action.x}, ${action.y})`;
    case 'fill':
      return getFillDescription(action);
    case 'undo':
      return `Undid: ${getActionDescription(action.undoneAction)}`;
    case 'redo':
      return `Redid: ${getActionDescription(action.redoneAction)}`;
    default:
      return `${action.type} action`;
  }
};

export { getTileDescription, getFillDescription, getActionDescription };
