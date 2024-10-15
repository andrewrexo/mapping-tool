import { Scene, GameObjects } from 'phaser';
import tileProperties from '$lib/tile';
import { EventBus } from '$lib/services/event-bus';

// Add this import at the top of the file
import { debounce } from 'lodash';

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
  private objectMap: (GameObjects.Image | null)[][];
  private debouncedResize: () => void;
  private currentTile: string | null = null;
  private groundTiles: GameObjects.Sprite[][];
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private cameraSpeed: number = 10;
  private currentTool: 'brush' | 'eraser' | 'bucket' = 'brush';
  private currentObject: string | null = null;
  private currentLayer: 'tiles' | 'objects' = 'tiles';

  constructor() {
    super({ key: 'map' });

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

    this.objectLayer = this.layers.find((layer) => layer.name === 'objects')!;
    this.objectMap = Array(this.mapSize)
      .fill(null)
      .map(() => Array(this.mapSize).fill(null));

    this.groundTiles = Array(this.mapSize)
      .fill(null)
      .map(() => Array(this.mapSize).fill(null));

    this.debouncedResize = debounce(this.resize.bind(this), 100);
    EventBus.on('resize', this.debouncedResize);
  }

  launchNativeUI() {
    this.scene.launch('tile-select');
    this.scene.bringToTop('tile-select');
  }

  create() {
    const mapData = this.generateMap();
    this.drawMap(mapData.ground, this.layers[0]);
    this.drawMap(mapData.objects, this.layers[1]);

    // center camera and scale the game
    this.centerCamera();
    this.scaleGame();

    // show native UI (tile selectors)
    this.launchNativeUI();

    // this.scale.on('resize', this.debouncedResize);
    this.scene.get('tile-select').events.on('tileSelected', this.handleTileSelected, this);

    // listen for the tileSelected event
    const tileSelectUI = this.scene.get('tile-select');
    tileSelectUI.events.on('tileSelected', this.handleTileSelected, this);
    tileSelectUI.events.on('objectSelected', this.handleObjectSelected, this);
    // Add this line to listen for tab changes
    tileSelectUI.events.on('tabChanged', this.handleTabChanged, this);

    // Add this line to create cursor keys
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Add this line to listen for toolSelected event
    EventBus.on('toolSelected', this.handleToolSelected, this);
  }

  resize() {
    this.scaleGame();

    // resize ui to fill the screen
    const tileSelectScene = this.scene.get('tile-select');

    // @ts-ignore
    tileSelectScene.resize();
  }

  scaleGame() {
    const width = Math.floor(window.innerWidth / 2) * 2;
    const height = Math.floor(window.innerHeight / 2) * 2 - 64;

    this.scale.resize(width, height);
    this.centerCamera();
  }

  centerCamera() {
    const cameraOffsetY = 64;

    const centerX = this.getTilePosition(this.mapSize / 2, this.mapSize / 2).x;
    const centerY = this.getTilePosition(this.mapSize / 2, this.mapSize / 2).y;
    this.cameras.main.centerOn(centerX, centerY + cameraOffsetY);
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

            // Modify this part to use the current tool
            entity
              .setInteractive(this.input.makePixelPerfect())
              .on('pointerdown', () => {
                this.applyTool(colIndex, rowIndex);
              })
              .on('pointerover', () => {
                if (this.input.activePointer.isDown) {
                  this.applyTool(colIndex, rowIndex);
                }
              });

            // store the ground tile in our groundTiles array
            this.groundTiles[rowIndex][colIndex] = entity as GameObjects.Sprite;

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
    this.handleCameraMovement();
  }

  handleCameraMovement() {
    if (!this.cursors) return;

    if (this.cursors.left.isDown) {
      this.cameras.main.scrollX -= this.cameraSpeed;
    } else if (this.cursors.right.isDown) {
      this.cameras.main.scrollX += this.cameraSpeed;
    }

    if (this.cursors.up.isDown) {
      this.cameras.main.scrollY -= this.cameraSpeed;
    } else if (this.cursors.down.isDown) {
      this.cameras.main.scrollY += this.cameraSpeed;
    }
  }

  placeRandomObject(tileX: number, tileY: number) {
    if (this.currentTile) {
      this.placeTile(tileX, tileY);
    } else {
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

  handleTileSelected = ({ frameName, tab }: { frameName: string; tab: 'tiles' | 'objects' }) => {
    console.log(`Map scene received selected tile: ${frameName} from tab: ${tab}`);
    this.currentTile = frameName;
    this.currentObject = null;
    this.currentLayer = tab;
  };

  handleObjectSelected = ({ frameName, tab }: { frameName: string; tab: 'tiles' | 'objects' }) => {
    console.log(`Map scene received selected object: ${frameName} from tab: ${tab}`);
    this.currentObject = frameName;
    this.currentTile = null;
    this.currentLayer = tab;
  };

  handleTabChanged = (tab: 'tiles' | 'objects') => {
    console.log(`Tab changed to: ${tab}`);
    this.currentLayer = tab;
  };

  placeTile(tileX: number, tileY: number) {
    if (this.currentTile) {
      const existingTile = this.groundTiles[tileY][tileX];
      if (existingTile) {
        existingTile.setTexture('tiles', this.currentTile);

        const frame = this.textures.get('tiles').get(parseInt(this.currentTile));
        if (frame && frame.width >= tileProperties.tileWidth * tileProperties.animationFrameCount) {
          this.setupAnimation(existingTile, parseInt(this.currentTile));
        } else {
          existingTile.stop();
        }
      }
    } else if (this.currentObject) {
      this.placeObject(tileX, tileY);
    }
  }

  placeObject(tileX: number, tileY: number) {
    if (this.objectMap[tileY][tileX]) {
      this.objectMap[tileY][tileX]!.destroy();
      this.objectMap[tileY][tileX] = null;
    }

    const worldPos = this.getTilePosition(tileX, tileY);
    const object = this.add.image(worldPos.x, worldPos.y, 'objects', this.currentObject!);

    object.setOrigin(0, 1);
    object.y += 12;
    object.x -= Math.floor(object.width / 2);
    object.x -= this.objectLayer.renderOffset.x;
    object.setDepth(this.objectLayer.depthOffset + object.y);

    this.objectMap[tileY][tileX] = object;
  }

  handleToolSelected = (tool: 'brush' | 'eraser' | 'bucket') => {
    this.currentTool = tool;
  };

  applyTool(tileX: number, tileY: number) {
    switch (this.currentTool) {
      case 'brush':
        if (this.currentLayer === 'tiles') {
          this.placeTile(tileX, tileY);
        } else {
          this.placeObject(tileX, tileY);
        }
        break;
      case 'eraser':
        if (this.currentLayer === 'tiles') {
          this.eraseTile(tileX, tileY);
        } else {
          this.eraseObject(tileX, tileY);
        }
        break;
      case 'bucket':
        if (this.currentLayer === 'tiles') {
          this.fillArea(tileX, tileY);
        }
        // Note: Bucket fill doesn't make sense for objects, so we don't implement it for the objects layer
        break;
    }
  }

  eraseTile(tileX: number, tileY: number) {
    const existingTile = this.groundTiles[tileY][tileX];
    if (existingTile) {
      existingTile.setTexture('tiles', '1'); // Assuming '1' is your default/empty tile
      existingTile.stop(); // Stop any animations
    }
  }

  eraseObject(tileX: number, tileY: number) {
    if (this.objectMap[tileY][tileX]) {
      this.objectMap[tileY][tileX]!.destroy();
      this.objectMap[tileY][tileX] = null;
    }
  }

  fillArea(startX: number, startY: number) {
    if (!this.currentTile) return;

    const targetTileFrame = this.groundTiles[startY][startX].frame.name;
    const newTileFrame = this.currentTile;

    if (targetTileFrame === newTileFrame) return;

    const stack: [number, number][] = [[startX, startY]];
    const visited: Set<string> = new Set();

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = `${x},${y}`;

      if (
        x < 0 ||
        x >= this.mapSize ||
        y < 0 ||
        y >= this.mapSize ||
        visited.has(key) ||
        this.groundTiles[y][x].frame.name !== targetTileFrame
      ) {
        continue;
      }

      this.placeTile(x, y);
      visited.add(key);

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
  }
}
