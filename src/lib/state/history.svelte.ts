import { create } from 'lodash';

export type HistoryAction = {
  type: 'tile' | 'object' | 'fill';
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
};

function createHistoryState() {
  let past = $state<HistoryAction[]>([]);
  let future = $state<HistoryAction[]>([]);

  function addAction(action: HistoryAction) {
    past = [...past, action];
    future = [];
  }

  function undo(): HistoryAction | null {
    if (past.length === 0) return null;
    const action = past.pop()!;
    future = [action, ...future];
    return action;
  }

  function redo(): HistoryAction | null {
    if (future.length === 0) return null;
    const action = future.shift()!;
    past = [...past, action];
    return action;
  }

  return {
    get past() {
      return past;
    },
    get future() {
      return future;
    },
    addAction,
    undo,
    redo,
    canUndo: () => past.length > 0,
    canRedo: () => future.length > 0
  };
}

export const history = createHistoryState();
