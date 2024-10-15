export function generateMap(mapSize: number) {
  const minGroundTileId = 200;
  const maxGroundTileId = 1200;

  const ground = Array(mapSize)
    .fill(null)
    .map(() =>
      Array(mapSize)
        .fill(null)
        .map(
          () =>
            Math.floor(Math.random() * (maxGroundTileId - minGroundTileId + 1)) + minGroundTileId
        )
    );

  const objects = Array(mapSize)
    .fill(null)
    .map(() => Array(mapSize).fill(0));

  return { ground, objects };
}
