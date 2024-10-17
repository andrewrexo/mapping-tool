export type HistoryAction = {
  type: 'tile' | 'object' | 'fill' | 'undo' | 'redo';
  x?: number;
  y?: number;
  oldValue?: string | null;
  newValue?: string | null;
  oldAlpha?: number;
  newAlpha?: number;
  layer?: number;
  tool?: string;
  changes?: {
    x: number;
    y: number;
    oldValue: string;
    newValue: string;
    oldAlpha: number;
    newAlpha: number;
  }[];
  undoneAction?: HistoryAction;
  redoneAction?: HistoryAction;
};

function createHistoryState() {
  let past = $state<HistoryAction[]>([]);
  let future = $state<HistoryAction[]>([]);
  let lastAction = $state<HistoryAction | null>(null);

  function addAction(action: HistoryAction) {
    past = [...past, action];
    future = [];
    lastAction = action;
  }

  function undo() {
    if (past.length === 0) return;
    const action = past.pop()!;
    future = [action, ...future];
    lastAction = { type: 'undo', undoneAction: action };
    return action;
  }

  function redo() {
    if (future.length === 0) return;
    const action = future.shift()!;
    past = [...past, action];
    lastAction = { type: 'redo', redoneAction: action };
    return action;
  }

  return {
    get past() {
      return past;
    },
    get future() {
      return future;
    },
    get lastAction() {
      return lastAction;
    },
    addAction,
    undo,
    redo,
    canUndo: () => past.length > 0,
    canRedo: () => future.length > 0
  };
}

export const history = createHistoryState();
