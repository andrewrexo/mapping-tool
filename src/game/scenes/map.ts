import { debounce } from 'lodash';
import { Scene, GameObjects } from 'phaser';
import tileProperties from '$lib/tile';
import { EventBus } from '$lib/services/event-bus';
import { createTileAnimation } from '$lib/animation';
import { tools } from '$lib/state/tool.svelte';
import { history, type HistoryAction } from '$lib/state/history.svelte';
import { GlobalAnimationManager } from '$lib/services/animation-manager';
import { saveMap } from '$lib/map';

type Layer = {
  name: string;
  depthOffset: number;
  texture: string;
  renderOffset: { x: number; y: number };
};

export class Map extends Scene {
  private layers: Layer[];
  private mapSize = 15;
  private objectLayer: Layer;
  private objectMap: (GameObjects.Image | null)[][];
  private currentTile: string | null = null;
  private groundTiles: GameObjects.Sprite[][];
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private cameraSpeed: number = 10;
  private currentObject: string | null = null;
  private currentLayer: 'tiles' | 'objects' = 'tiles';
  private grid: Phaser.GameObjects.Graphics | null = null;
  private lastAppliedTile: { x: number; y: number } | null = null;
  private animationManager: GlobalAnimationManager;
  private previewTile: Phaser.GameObjects.Sprite | null = null;
  private previewObject: Phaser.GameObjects.Image | null = null;

  constructor() {
    super({ key: 'map' });
    this.animationManager = new GlobalAnimationManager(1000);

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

    EventBus.on('resize', this.resize.bind(this));
  }

  create() {
    // Initialize empty ground tiles
    // this.initializeEmptyMap();

    const mapData = this.cache.json.get('map_data');

    this.drawMap(mapData.layers[0].tiles, this.layers[0]);
    this.drawMap(mapData.layers[1].tiles, this.layers[1]);
    this.drawGrid();

    // Center camera and scale the game
    this.centerCamera();
    this.scaleGame();

    // Show native UI (tile selectors)
    this.launchNativeUI();

    this.cursors = this.input.keyboard!.createCursorKeys();

    const tileSelectUI = this.scene.get('tile-select');
    tileSelectUI.events.on('tileSelected', this.handleTileSelected, this);
    tileSelectUI.events.on('objectSelected', this.handleObjectSelected, this);
    tileSelectUI.events.on('tabChanged', this.handleTabChanged, this);

    EventBus.on('undo', this.undo, this);
    EventBus.on('redo', this.redo, this);
    EventBus.on('batchUndo', this.handleBatchUndo, this);
    EventBus.on('exportMap', this.exportMap, this);
  }

  exportMap(callback: () => void) {
    saveMap(
      this.mapSize,
      [
        this.groundTiles.filter(Boolean) as Phaser.GameObjects.Image[][],
        this.objectMap.filter(Boolean) as Phaser.GameObjects.Image[][]
      ],
      callback
    );
  }

  initializeEmptyMap() {
    // Create animations for all possible animated tiles
    for (let i = 200; i <= 1200; i += 100) {
      createTileAnimation(this, i.toString());
    }

    for (let y = 0; y < this.mapSize; y++) {
      for (let x = 0; x < this.mapSize; x++) {
        const worldPos = this.getTilePosition(x, y);
        const tile = this.add.sprite(worldPos.x, worldPos.y, 'tiles', '101');
        tile.setOrigin(0.5, 0.5);
        tile.setAlpha(0.001);
        tile.setDepth(this.layers[0].depthOffset + worldPos.y);
        this.groundTiles[y][x] = tile;

        tile
          .setInteractive(this.input.makePixelPerfect())
          .on('pointerdown', () => {
            this.applyTool(x, y);
          })
          .on('pointerover', () => {
            if (this.input.activePointer.isDown) {
              this.applyTool(x, y);
            } else {
              this.showPreview(x, y);
            }
          })
          .on('pointerout', () => {
            this.hidePreview();
          });
      }
    }

    this.initializePreviewSprites();
  }

  initializePreviewSprites() {
    const centerPos = this.getTilePosition(0, 0);
    this.previewTile = this.add.sprite(centerPos.x, centerPos.y, 'tiles', '101');
    this.previewTile.setVisible(false);
    this.previewTile.setAlpha(0.5);
    this.previewTile.setDepth(this.layers[0].depthOffset + 1);

    this.previewObject = this.add.image(centerPos.x, centerPos.y, 'objects', '101');
    this.previewObject.setOrigin(0, 1);
    this.previewObject.setVisible(false);
    this.previewObject.setAlpha(0.5);
    this.previewObject.setDepth(this.layers[1].depthOffset - 1);
  }

  launchNativeUI() {
    this.scene.launch('tile-select');
    this.scene.bringToTop('tile-select');
  }

  resize() {
    this.scaleGame();
    this.drawGrid(); // Redraw the grid when resizing

    // resize ui to fill the screen
    const tileSelectScene = this.scene.get('tile-select');

    // @ts-ignore
    tileSelectScene.resize();
  }

  scaleGame() {
    const width = Math.floor(window.innerWidth / 2) * 2;
    const height = Math.floor(window.innerHeight / 2) * 2 - 50;

    this.scale.resize(width, height);
    this.centerCamera();
  }

  centerCamera() {
    const cameraOffsetY = 128;

    const centerX = this.getTilePosition(this.mapSize / 2, this.mapSize / 2).x;
    const centerY = this.getTilePosition(this.mapSize / 2, this.mapSize / 2).y;
    this.cameras.main.centerOn(centerX, centerY + cameraOffsetY);
  }

  getTilePosition(tileX: number, tileY: number): Phaser.Math.Vector2 {
    const x = Math.floor(((tileX - tileY) * tileProperties.tileWidth) / 2);
    const y = Math.floor(((tileX + tileY) * tileProperties.tileHeight) / 2);
    return new Phaser.Math.Vector2(x, y);
  }

  drawMap(map: any[][], layer: Layer) {
    const { tileWidth, animationFrameCount } = tileProperties;
    const mapWidth = map[0].length;
    const mapHeight = map.length;

    for (let rowIndex = 0; rowIndex < mapHeight; rowIndex++) {
      for (let colIndex = 0; colIndex < mapWidth; colIndex++) {
        const tileId = map[rowIndex][colIndex];

        if (tileId === null || tileId.frame === 0) {
          continue;
        }

        const worldPos = this.getTilePosition(colIndex, rowIndex);
        const frame = this.textures.get(layer.texture).get(tileId.frame);

        let entity;

        switch (layer.name) {
          case 'ground': {
            entity = this.add.sprite(worldPos.x, worldPos.y, 'tiles', tileId.frame);

            if (frame && frame.width >= tileWidth * animationFrameCount) {
              this.setupAnimation(entity, tileId.frame);
            }

            entity
              .setInteractive(this.input.makePixelPerfect())
              .on('pointerdown', () => {
                this.applyTool(colIndex, rowIndex);
              })
              .on('pointerover', () => {
                if (this.input.activePointer.isDown) {
                  this.applyTool(colIndex, rowIndex);
                } else {
                  this.showPreview(colIndex, rowIndex);
                }
              })
              .on('pointerout', () => {
                this.hidePreview();
              });

            // store the ground tile in our groundTiles array
            this.groundTiles[rowIndex][colIndex] = entity as GameObjects.Sprite;

            break;
          }
          case 'objects': {
            entity = this.add.image(worldPos.x, worldPos.y, 'objects', tileId.frame);
            entity.setOrigin(0, 1);

            entity.setPosition(
              worldPos.x - Math.floor(entity.width / 2) - this.objectLayer.renderOffset.x,
              worldPos.y + 12
            );

            entity.setDepth(layer.depthOffset + worldPos.y);

            // Store the object in our objectMap
            this.objectMap[rowIndex][colIndex] = entity as GameObjects.Image;

            break;
          }
        }
      }
    }

    this.initializePreviewSprites();
  }

  setupAnimation(tile: Phaser.GameObjects.Sprite, tileId: string) {
    const animKey = createTileAnimation(this, tileId);
    tile.play(animKey);
  }

  update(time: number, delta: number) {
    this.handleCameraMovement();
    this.animationManager.update(delta);

    // Update all animated tiles
    this.groundTiles.forEach((row) => {
      row.forEach((tile) => {
        if (tile.anims.isPlaying) {
          const progress = this.animationManager.getProgress();
          const totalFrames = tile.anims.getTotalFrames();
          const currentFrame = Math.floor(progress * totalFrames);
          if (tile.anims.currentAnim) {
            tile.setFrame(tile.anims.currentAnim.frames[currentFrame].frame.name);
          }
        }
      });
    });
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
    // Extract the base tile ID from the frame name (e.g., '396_1' -> '396')
    this.currentTile = frameName.split('_')[0];
    this.currentObject = null;
    this.currentLayer = tab;
    this.hidePreview();
  };

  handleObjectSelected = ({ frameName, tab }: { frameName: string; tab: 'tiles' | 'objects' }) => {
    console.log(`Map scene received selected object: ${frameName} from tab: ${tab}`);
    this.currentObject = frameName;
    this.currentTile = null;
    this.currentLayer = tab;
    this.hidePreview();
  };

  handleTabChanged = (tab: 'tiles' | 'objects') => {
    console.log(`Tab changed to: ${tab}`);
    this.currentLayer = tab;
    this.hidePreview();
  };

  placeTile(tileX: number, tileY: number) {
    if (this.currentTile) {
      const existingTile = this.groundTiles[tileY][tileX];
      const currentFrame = existingTile.frame.name;
      const newFrame = this.currentTile;
      const oldAlpha = existingTile.alpha;
      const newAlpha = 1;

      if (currentFrame.split('_')[0] === newFrame.split('_')[0]) {
        if (oldAlpha === newAlpha) {
          return;
        }
      }

      console.log(`Placing tile ${newFrame} at ${tileX}, ${tileY}`);

      if (existingTile.frame) {
        const oldValue = currentFrame;
        const newValue = newFrame;

        history.addAction({
          type: 'tile',
          x: tileX,
          y: tileY,
          oldValue,
          newValue,
          oldAlpha,
          newAlpha,
          layer: 0,
          tool: tools.currentTool
        });

        this.applyTileChange(existingTile, newValue, newAlpha);
      }
    }
  }

  placeObject(tileX: number, tileY: number) {
    if (this.currentObject) {
      const oldObject = this.objectMap[tileY][tileX];
      const oldValue = oldObject ? oldObject.frame.name : null;
      const newValue = this.currentObject;

      if (oldValue && oldValue.split('_')[0] === newValue.split('_')[0]) {
        return;
      }

      console.log(`Placing object ${newValue} at ${tileX}, ${tileY}`);

      history.addAction({
        type: 'object',
        x: tileX,
        y: tileY,
        oldValue,
        newValue,
        layer: 1,
        tool: tools.currentTool
      });

      this.applyObjectChange(tileX, tileY, newValue);
    }
  }

  applyTool(tileX: number, tileY: number) {
    switch (tools.currentTool) {
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
        break;
    }
    this.hidePreview();
  }

  eraseTile(tileX: number, tileY: number) {
    const existingTile = this.groundTiles[tileY][tileX];
    const oldValue = existingTile.frame.name;
    const oldAlpha = existingTile.alpha;

    if (!existingTile) return;

    if (existingTile.visible && oldAlpha > 0) {
      history.addAction({
        type: 'tile',
        x: tileX,
        y: tileY,
        oldValue,
        newValue: null,
        oldAlpha,
        newAlpha: 0,
        layer: 0,
        tool: 'eraser'
      });

      existingTile.setVisible(false);
      existingTile.setAlpha(0);
      existingTile.stop();
    }
  }

  eraseObject(tileX: number, tileY: number) {
    if (this.objectMap[tileY][tileX]) {
      const oldValue = this.objectMap[tileY][tileX]!.frame.name;

      history.addAction({
        type: 'object',
        x: tileX,
        y: tileY,
        oldValue,
        newValue: null,
        layer: 1,
        tool: 'eraser'
      });

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
    const fillChanges: {
      x: number;
      y: number;
      oldValue: string;
      newValue: string;
      oldAlpha: number;
      newAlpha: number;
    }[] = [];

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

      fillChanges.push({
        x,
        y,
        oldValue: this.groundTiles[y][x].frame.name,
        newValue: newTileFrame,
        oldAlpha: this.groundTiles[y][x].alpha,
        newAlpha: 1
      });

      this.applyTileChange(this.groundTiles[y][x], newTileFrame, 1);
      visited.add(key);

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    history.addAction({
      type: 'fill',
      changes: fillChanges,
      tool: 'bucket'
    });
  }

  applyTileChange(tile: Phaser.GameObjects.Sprite, newValue: string, alpha: number) {
    const baseTileId = newValue.split('_')[0]; // Extract base tile ID
    tile.setTexture('tiles', baseTileId);
    tile.setVisible(true);
    tile.setAlpha(alpha);

    const frame = this.textures.get('tiles').get(parseInt(baseTileId));
    if (frame && frame.width >= tileProperties.tileWidth * tileProperties.animationFrameCount) {
      const animKey = createTileAnimation(this, baseTileId);
      if (this.anims.exists(animKey)) {
        tile.play(animKey);
        // Don't pause the animation
      }
    } else {
      tile.stop();
      tile.setFrame(baseTileId);
    }
  }

  applyObjectChange(x: number, y: number, valueToApply: string | null) {
    if (this.objectMap[y][x]) {
      this.objectMap[y][x]!.destroy();
      this.objectMap[y][x] = null;
    }

    if (valueToApply) {
      const worldPos = this.getTilePosition(x, y);
      const object = this.add.image(worldPos.x, worldPos.y, 'objects', valueToApply);
      object.setOrigin(0, 1);
      object.setPosition(
        worldPos.x - Math.floor(this.previewObject!.width / 2) - this.objectLayer.renderOffset.x,
        worldPos.y + 12
      );
      object.setDepth(this.objectLayer.depthOffset + worldPos.y);
      this.objectMap[y][x] = object;
    }
  }

  drawGrid() {
    if (this.grid) {
      this.grid.destroy();
    }

    this.grid = this.add.graphics();
    this.grid.setPosition(0, -16);
    this.grid.lineStyle(1, 0xffffff, 0.3);

    for (let x = 0; x <= this.mapSize; x++) {
      for (let y = 0; y <= this.mapSize; y++) {
        const topLeft = this.getTilePosition(x, y);
        const topRight = this.getTilePosition(x + 1, y);
        const bottomLeft = this.getTilePosition(x, y + 1);

        this.grid.moveTo(topLeft.x, topLeft.y);
        this.grid.lineTo(topRight.x, topRight.y);
        this.grid.moveTo(topLeft.x, topLeft.y);
        this.grid.lineTo(bottomLeft.x, bottomLeft.y);
      }
    }

    this.grid.strokePath();
    this.grid.setDepth(1);

    this.input.on('pointerdown', this.handleGridInteraction, this);
    this.input.on('pointermove', this.handleGridInteraction, this);
  }

  handleGridInteraction(pointer: Phaser.Input.Pointer) {
    if (pointer.isDown) {
      const { tileX, tileY } = this.getTileCoordinates(pointer.x, pointer.y);
      if (
        tileX >= 0 &&
        tileX < this.mapSize &&
        tileY >= 0 &&
        tileY < this.mapSize &&
        (!this.lastAppliedTile ||
          this.lastAppliedTile.x !== tileX ||
          this.lastAppliedTile.y !== tileY)
      ) {
        this.applyTool(tileX, tileY);
        this.lastAppliedTile = { x: tileX, y: tileY };
      }
    } else {
      this.lastAppliedTile = null;
    }
  }

  getTileCoordinates(x: number, y: number): { tileX: number; tileY: number } {
    const worldPoint = this.cameras.main.getWorldPoint(x, y);
    const tileY = Math.round(
      (worldPoint.y / (tileProperties.tileHeight / 2) -
        worldPoint.x / (tileProperties.tileWidth / 2)) /
        2
    );
    const tileX = Math.round(
      (worldPoint.y / (tileProperties.tileHeight / 2) +
        worldPoint.x / (tileProperties.tileWidth / 2)) /
        2
    );
    return { tileX, tileY };
  }

  undo() {
    const action = history.undo();
    if (action) {
      this.applyHistoryAction(action, true);
    }
  }

  redo() {
    const action = history.redo();
    if (action) {
      this.applyHistoryAction(action, false);
    }
  }

  applyHistoryAction(action: HistoryAction, isUndo: boolean) {
    if (action.type === 'fill') {
      const changes = action.changes;
      if (changes) {
        changes.forEach((change) => {
          const tile = this.groundTiles[change.y][change.x];
          const valueToApply = isUndo ? change.oldValue : change.newValue;
          const alphaToApply = isUndo ? change.oldAlpha : change.newAlpha;
          this.applyTileChange(tile, valueToApply, alphaToApply);
        });
      }
    } else {
      const { type, x, y, oldValue, newValue, oldAlpha, newAlpha } = action;
      if (typeof x === 'number' && typeof y === 'number') {
        const valueToApply = isUndo ? oldValue : newValue;
        const alphaToApply = isUndo ? oldAlpha : newAlpha;

        if (type === 'tile') {
          const tile = this.groundTiles[y][x];
          if (valueToApply) {
            this.applyTileChange(tile, valueToApply, alphaToApply ?? 1);
          } else {
            tile.setVisible(false);
            tile.setAlpha(0);
            tile.stop();
          }
        } else if (type === 'object') {
          this.applyObjectChange(x, y, valueToApply ?? null);
        }
      }
    }
  }

  shutdown() {
    EventBus.off('undo', this.undo, this);
    EventBus.off('redo', this.redo, this);
    EventBus.off('batchUndo', this.handleBatchUndo, this);
  }

  handleBatchUndo = (actionsToUndo: HistoryAction[]) => {
    actionsToUndo.forEach((action) => {
      switch (action.type) {
        case 'tile':
          this.undoTileAction(action);
          break;
        case 'object':
          this.undoObjectAction(action);
          break;
        case 'fill':
          this.undoFillAction(action);
          break;
      }
    });

    this.updateWorldState();
  };

  undoTileAction(action: HistoryAction) {
    if (action.x !== undefined && action.y !== undefined && action.oldValue !== undefined) {
      // Restore the old tile value
      this.applyTileChange(
        this.groundTiles[action.y][action.x],
        action.oldValue ?? '',
        action.oldAlpha ?? 1
      );
    }
  }

  undoObjectAction(action: HistoryAction) {
    if (action.x !== undefined && action.y !== undefined) {
      this.applyObjectChange(action.x, action.y, action.oldValue ?? null);
    }
  }

  undoFillAction(action: HistoryAction) {
    if (action.changes) {
      action.changes.forEach((change) => {
        this.applyTileChange(
          this.groundTiles[change.y][change.x],
          change.oldValue,
          change.oldAlpha
        );
      });
    }
  }

  updateWorldState() {
    this.drawGrid();
  }

  showPreview(tileX: number, tileY: number) {
    const worldPos = this.getTilePosition(tileX, tileY);

    if (this.currentLayer === 'tiles' && this.currentTile) {
      this.previewTile!.setPosition(worldPos.x, worldPos.y);
      this.previewTile!.setTexture('tiles', this.currentTile);
      this.previewTile!.setVisible(true);
      this.previewTile!.setAlpha(0.5);
      this.previewTile!.setDepth(this.layers[0].depthOffset + worldPos.y + 10000);

      if (this.previewObject) {
        this.previewObject.setVisible(false);
      }
    } else if (this.currentLayer === 'objects' && this.currentObject) {
      this.previewObject!.setTexture('objects', this.currentObject);
      this.previewObject!.setVisible(true);
      this.previewObject!.setAlpha(0.5);
      this.previewObject!.setOrigin(0, 1);
      this.previewObject!.setPosition(
        worldPos.x - Math.floor(this.previewObject!.width / 2) - this.objectLayer.renderOffset.x,
        worldPos.y + 12
      );
      this.previewObject!.setDepth(this.objectLayer.depthOffset + worldPos.y + 10000);

      if (this.previewTile) {
        this.previewTile.setVisible(false);
      }
    } else {
      this.hidePreview();
    }
  }

  hidePreview() {
    if (this.previewTile) {
      this.previewTile.setVisible(false);
    }
    if (this.previewObject) {
      this.previewObject.setVisible(false);
    }
  }
}
