import { Scene, GameObjects } from 'phaser';
import tileProperties from '$lib/tile';

// Define a type for layer properties
type Layer = {
  name: string;
  depthOffset: number;
  texture: string;
  renderOffset: { x: number; y: number };
};

export class Map extends Scene {
  private layers: Layer[];
  private mapSize = 10;
  private objectLayer: Layer;
  private objectMap: (GameObjects.Image | null)[][]; // New property to track objects

  constructor() {
    super({ key: 'map' });

    // Define layers with their properties
    this.layers = [
      {
        name: 'ground',
        texture: 'tiles',
        depthOffset: 0,
        renderOffset: { x: 0, y: 0 }
      },
      {
        name: 'objects',
        texture: 'objects',
        depthOffset: 32,
        renderOffset: { x: 2, y: 2 }
      }
    ];

    // Store a reference to the object layer for easier access
    this.objectLayer = this.layers.find((layer) => layer.name === 'objects')!;

    // Initialize the objectMap
    this.objectMap = Array(this.mapSize)
      .fill(null)
      .map(() => Array(this.mapSize).fill(null));
  }

  create() {
    const mapData = this.generateMap();
    this.drawMap(mapData.ground, this.layers[0]);
    this.drawMap(mapData.objects, this.layers[1]);

    const centerX = this.getTilePosition(this.mapSize / 2, this.mapSize / 2).x;
    const centerY = this.getTilePosition(this.mapSize / 2, this.mapSize / 2).y;

    // move the camera to the center of the map
    this.cameras.main.centerOn(centerX, centerY);
  }

  generateMap() {
    const minGroundTileId = 200;
    const maxGroundTileId = 1200;

    const ground = Array(this.mapSize)
      .fill(null)
      .map(() =>
        Array(this.mapSize)
          .fill(null)
          .map(
            () =>
              Math.floor(Math.random() * (maxGroundTileId - minGroundTileId + 1)) + minGroundTileId
          )
      );

    const objects = Array(this.mapSize)
      .fill(null)
      .map(() => Array(this.mapSize).fill(0));

    return { ground, objects };
  }

  getTilePosition(tileX: number, tileY: number): Phaser.Math.Vector2 {
    const x = Math.floor(((tileX - tileY) * tileProperties.tileWidth) / 2);
    const y = Math.floor(((tileX + tileY) * tileProperties.tileHeight) / 2);
    return new Phaser.Math.Vector2(x, y);
  }

  drawMap(map: number[][], layer: Layer) {
    const { tileWidth, animationFrameCount } = tileProperties;
    const mapWidth = map[0].length;
    const mapHeight = map.length;

    for (let rowIndex = 0; rowIndex < mapHeight; rowIndex++) {
      for (let colIndex = 0; colIndex < mapWidth; colIndex++) {
        const tileId = map[rowIndex][colIndex];

        const worldPos = this.getTilePosition(colIndex, rowIndex);

        // skip render if tileId is 0 (empty tile)
        if (tileId === 0) continue;

        const frame = this.textures.get(layer.texture).get(tileId);

        let entity;

        switch (layer.name) {
          case 'ground': {
            entity = this.add.sprite(worldPos.x, worldPos.y, 'tiles', tileId);

            if (frame && frame.width >= tileWidth * animationFrameCount) {
              this.setupAnimation(entity, tileId);
            }

            entity.setInteractive(this.input.makePixelPerfect()).on('pointerdown', () => {
              this.placeRandomObject(colIndex, rowIndex);
            });

            break;
          }
          case 'objects': {
            entity = this.add.image(worldPos.x, worldPos.y, 'objects', tileId);
            entity.setOrigin(0, 1);

            entity.y += 12;
            entity.x -= Math.floor(entity.width / 2);
            entity.x -= layer.renderOffset.x;

            entity.setDepth(layer.depthOffset + entity.y);

            // Store the object in our objectMap
            this.objectMap[rowIndex][colIndex] = entity as GameObjects.Image;

            break;
          }
        }
      }
    }
  }

  setupAnimation(tile: Phaser.GameObjects.Sprite, tileId: number) {
    const animKey = `tile-anim-${tileId}`;

    if (!this.anims.exists(animKey)) {
      const frames = this.createAnimationFrames(tile);

      this.anims.create({
        key: animKey,
        frames: frames,
        frameRate: tileProperties.animationFrameRate,
        repeat: -1
      });
    }

    tile.play(animKey);
  }

  createAnimationFrames(tile: GameObjects.Sprite): Phaser.Types.Animations.AnimationFrame[] {
    const texture = tile.texture;
    const frameName = tile.frame.name;
    const frameWidth = tile.width / 4;
    const frameHeight = tile.height;
    const originalX = tile.frame.cutX;
    const originalY = tile.frame.cutY;

    const frames: Phaser.Types.Animations.AnimationFrame[] = [];

    for (let i = 0; i < 4; i++) {
      const frame = texture.add(
        `${frameName}_${i}`,
        tile.frame.sourceIndex,
        originalX + Math.floor(frameWidth * i),
        originalY,
        Math.floor(frameWidth),
        frameHeight
      );

      if (!frame) {
        continue;
      }

      frames.push({ key: 'tiles', frame: frame.name });
    }

    return frames;
  }

  update() {
    // update ...
  }

  placeRandomObject(tileX: number, tileY: number) {
    if (this.objectMap[tileY][tileX]) {
      this.objectMap[tileY][tileX]!.destroy();
      this.objectMap[tileY][tileX] = null;
    }

    const minObjectTileId = 101;
    const maxObjectTileId = 500;
    const randomObjectId =
      Math.floor(Math.random() * (maxObjectTileId - minObjectTileId + 1)) + minObjectTileId;

    const worldPos = this.getTilePosition(tileX, tileY);
    const object = this.add.image(worldPos.x, worldPos.y, 'objects', randomObjectId);

    object.setOrigin(0, 1);
    object.y += 12;
    object.x -= Math.floor(object.width / 2);
    object.x -= this.objectLayer.renderOffset.x;
    object.setDepth(this.objectLayer.depthOffset + object.y);

    this.objectMap[tileY][tileX] = object;
  }
}
