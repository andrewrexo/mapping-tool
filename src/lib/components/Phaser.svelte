<script module lang="ts">
  import type { Game, Scene } from 'phaser';

  export type TPhaserRef = {
    game: Game | null;
    scene: Scene | null;
  };
</script>

<script lang="ts">
  import StartGame from '../../game/main';

  let mounted = $state(false);

  let {
    phaserRef = $bindable()
  }: {
    phaserRef: TPhaserRef;
  } = $props();

  $effect(() => {
    if (mounted) return;

    phaserRef.game = StartGame('game-container');
    mounted = true;
  });
</script>

<div id="game-container"></div>
