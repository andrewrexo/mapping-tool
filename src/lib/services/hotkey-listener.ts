import { onDestroy } from 'svelte';
import { EventBus } from './event-bus';
import { tools } from '$lib/state/tool.svelte';

type HotkeyCallback = (event: KeyboardEvent) => void;

class HotkeyListener {
  private hotkeys: Map<string, HotkeyCallback> = new Map([
    ['1', (event) => tools.setTool('brush')],
    ['2', (event) => tools.setTool('eraser')],
    ['3', (event) => tools.setTool('bucket')]
  ]);

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  addHotkey(key: string, callback: HotkeyCallback): void {
    this.hotkeys.set(key.toLowerCase(), callback);
  }

  removeHotkey(key: string): void {
    this.hotkeys.delete(key.toLowerCase());
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    const callback = this.hotkeys.get(key);

    if (callback) {
      callback(event);
    }
  }

  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    this.hotkeys.clear();
  }
}

export function createHotkeyListener(): HotkeyListener {
  const listener = new HotkeyListener();

  onDestroy(() => {
    listener.destroy();
  });

  return listener;
}
