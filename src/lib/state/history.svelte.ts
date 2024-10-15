import { create } from 'lodash';

export type HistoryAction = {
  type: 'tile' | 'object' | 'layer';
  x: number;
  y: number;
  oldValue: string | null;
  newValue: string | null;
  oldAlpha?: number;
  newAlpha?: number;
  layer?: number;
  tool?: string;
};

function createHistoryState() {
  let past = $state<HistoryAction[]>([]);
  let future = $state<HistoryAction[]>([]);

  function addAction(action: HistoryAction) {
    past = [...past, action];
    future = [];
  }

  function undo() {
    if (past.length === 0) return null;
    const action = past[past.length - 1];
    past = past.slice(0, -1);
    future = [action, ...future];
    return action;
  }

  function redo() {
    if (future.length === 0) return null;
    const action = future[0];
    past = [...past, action];
    future = future.slice(1);
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
