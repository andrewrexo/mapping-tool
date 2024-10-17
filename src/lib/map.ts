import { downloadJson } from './utils';

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

const makeLayerData = (mapSize: number, ground: GameObject, objects: GameObject) => {
  const layerData: LayerData[] = [
    {
      name: 'ground',
      sprites: ground,
      tiles: new Array(mapSize).fill(null).map(() => new Array(mapSize).fill(null))
    },
    {
      name: 'objects',
      sprites: objects,
      tiles: new Array(mapSize).fill(null).map(() => new Array(mapSize).fill(null))
    }
  ];

  layerData.forEach((layer, index) => {
    for (let y = 0; y < mapSize; y++) {
      for (let x = 0; x < mapSize; x++) {
        const tile = layer.sprites[y][x];
        if (tile && tile.visible && tile.alpha > 0) {
          layer.tiles[y][x] = {
            x,
            y,
            frame: tile.frame.name,
            alpha: tile.alpha,
            metadata: {}
          };
        }
      }
    }
  });

  const cleanedLayerData: LayerDataExport[] = layerData.map(({ sprites, ...rest }) => rest);
  return cleanedLayerData;
};

export const saveMap = (mapSize: number, layers: GameObject[], callback: () => void): MapData => {
  const layerData = makeLayerData(mapSize, layers[0], layers[1]);

  const mapData: MapData = {
    size: mapSize,
    layers: layerData
  };

  downloadJson(mapData, 'map_data', callback);
  return mapData;
};

interface MapData {
  size: number;
  layers: LayerDataExport[];
}

interface LayerData {
  name: string;
  tiles: TileData[][];
  sprites: GameObject;
}

type LayerDataExport = Omit<LayerData, 'sprites'>;

type GameObject = Phaser.GameObjects.Sprite[][] | Phaser.GameObjects.Image[][];

interface TileData {
  x: number;
  y: number;
  frame: string;
  alpha?: number;
  metadata: Record<string, any>;
}
