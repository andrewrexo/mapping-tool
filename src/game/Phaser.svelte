<script module lang="ts">
  import type { Game, Scene } from 'phaser';
  import { EventBus } from '$lib/services/event-bus';

  export type TPhaserRef = {
    game: Game | null;
    scene: Scene | null;
  };
</script>

<script lang="ts">
  import StartGame from './main';

  let mounted = $state(false);

  let phaserRef: TPhaserRef = $state({
    game: null,
    scene: null
  });

  $effect(() => {
    if (mounted) return;

    phaserRef.game = StartGame('game-container');
    mounted = true;

    window.addEventListener('resize', () => {
      const width = Math.floor(window.innerWidth / 2) * 2;
      const height = Math.floor(window.innerHeight / 2) * 2;
      EventBus.emit('resize', { width, height });
    });

    return () => {
      window.removeEventListener('resize', () => {
        const width = Math.floor(window.innerWidth / 2) * 2;
        const height = Math.floor(window.innerHeight / 2) * 2;
        EventBus.emit('resize', { width, height });
      });
    };
  });
</script>

<div id="game-container" class=""></div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Pixelify+Sans:wght@400..700&display=swap');
</style>
