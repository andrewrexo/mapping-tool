<script lang="ts">
  import Phaser, { type TPhaserRef } from '$lib/components/Phaser.svelte';

  let phaserRef: TPhaserRef = $state({
    game: null,
    scene: null
  });
</script>

<div id="app">
  <Phaser {phaserRef} />
</div>
