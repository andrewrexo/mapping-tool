import tile from '$lib/tile';
import Phaser from 'phaser';
import type GridTable from 'phaser3-rex-plugins/templates/ui/gridtable/GridTable';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { createTileAnimation } from '$lib/animation';

export class TileSelect extends Phaser.Scene {
  rexUI!: RexUIPlugin;
  tileGridTable: GridTable | null = null;
  objectGridTable: GridTable | null = null;
  tileFrames: string[] = [];
  objectFrames: string[] = [];
  selectedItem: Phaser.GameObjects.Sprite | null = null;
  selectedItemIndex: number | null = null;
  selectedItemFrameName: string | null = null;
  currentTab: 'tiles' | 'objects' = 'tiles';
  tabButtons: any;
  objectGridPosition: { x: number; y: number } = { x: 0, y: 140 };
  tileGridPosition: { x: number; y: number } = { x: 0, y: 140 };
  tabPosition: { x: number; y: number } = { x: 100, y: 288 };

  constructor() {
    super({ key: 'tile-select' });
    this.resize = this.resize.bind(this);
  }

  createTabs() {
    const tabWidth = 100;
    const tabHeight = 40;
    const tabSpacing = 0;
    const tabsCount = 2;
    const totalWidth = tabWidth * tabsCount + tabSpacing * (tabsCount - 1);

    const tilesTab = this.createTabButton('Tiles', 0, true);
    const objectsTab = this.createTabButton('Objects', 1, false);

    this.tabButtons = this.rexUI.add
      .sizer({
        x: tabWidth + 10,
        y: this.game.scale.height - 288,
        width: totalWidth,
        height: tabHeight,
        orientation: 'x'
      })
      .add(tilesTab, { padding: { right: tabSpacing / 2 } })
      .add(objectsTab, { padding: { left: tabSpacing / 2 } })
      .layout();

    tilesTab.on('pointerdown', () => this.onTabButtonClick('tiles'));
    tilesTab.on('pointerover', () => this.onTabButtonHover(tilesTab));
    tilesTab.on('pointerout', () => this.onTabButtonOut(tilesTab));
    objectsTab.on('pointerdown', () => this.onTabButtonClick('objects'));
    objectsTab.on('pointerover', () => this.onTabButtonHover(objectsTab));
    objectsTab.on('pointerout', () => this.onTabButtonOut(objectsTab));
  }

  createTabButton(text: string, index: number, isActive: boolean) {
    const tabWidth = 100;
    const tabHeight = 40;

    const background = this.rexUI.add.roundRectangle(
      0,
      0,
      tabWidth,
      tabHeight,
      {
        tl: index === 0 ? 10 : 0,
        tr: index === 1 ? 10 : 0,
        bl: 0,
        br: 0
      },
      isActive ? 0x4a5460 : 0x2a323c
    );

    const button = this.rexUI.add.label({
      width: tabWidth,
      height: tabHeight,
      background: background,
      text: this.add.text(0, 0, text, {
        fontSize: 16,
        stroke: '#000',
        strokeThickness: 3,
        fontFamily: 'Inter',
        resolution: 1
      }),
      space: { left: 10, right: 10, top: 5, bottom: 5 },
      align: 'center'
    });

    button.setInteractive();

    return button;
  }

  onTabButtonClick(tabName: 'tiles' | 'objects') {
    if (this.selectedItemFrameName) {
      const previousIndex = (
        this.currentTab === 'tiles' ? this.tileFrames : this.objectFrames
      ).indexOf(this.selectedItemFrameName);
      this.unselectItemByIndex(previousIndex);
    }
    this.events.emit('tabChanged', tabName);

    this.currentTab = tabName;
    this.updateTabAppearance();
    this.updateGridVisibility();

    this.selectedItemFrameName = null;
    this.selectedItem = null;
    this.selectedItemIndex = null;
  }

  updateTabAppearance() {
    this.tabButtons.children.forEach((button: any, index: number) => {
      if (button.text) {
        console.log(index, this.currentTab);
        const isActive =
          (index === 0 && this.currentTab === 'tiles') ||
          (index === 1 && this.currentTab === 'objects');

        const background = button.getElement('background');

        background.setFillStyle(isActive ? 0x4a5460 : 0x2a323c);
      }
    });
  }

  createTileGrid() {
    const gridColumns = Math.floor(this.scale.width / 64);

    this.tileGridTable = this.rexUI.add.gridTable({
      x: this.game.scale.width / 2,
      y: this.game.scale.height - 140,
      width: this.game.scale.width,
      height: tile.tileHeight * 8,
      scrollMode: 0,
      background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 10, 0x2a323c, 0.8),
      table: {
        cellWidth: 64,
        cellHeight: 32,
        columns: gridColumns,
        mask: {
          padding: 2
        },
        reuseCellContainer: true
      },
      slider: {
        track: this.rexUI.add.roundRectangle(0, 0, 5, 0, 2, 0x373f4a),
        thumb: this.rexUI.add.roundRectangle(0, 0, 5, 0, 3, 0xa6adbb)
      },
      mouseWheelScroller: {
        speed: 1,
        focus: false
      },
      space: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
        table: 10
      },
      createCellContainerCallback: (cell) => {
        return this.createCellContainer(cell, 'tiles');
      },
      items: this.tileFrames
    });

    this.tileGridTable.layout();
  }

  createObjectGrid() {
    const gridColumns = Math.floor(this.game.scale.width / 64);

    this.objectGridTable = this.rexUI.add.gridTable({
      x: this.game.scale.width / 2,
      y: this.game.scale.height - 140,
      width: this.game.scale.width,
      height: tile.tileHeight * 8,
      scrollMode: 0,
      background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 10, 0x2a323c, 0.8),
      table: {
        cellWidth: 64,
        cellHeight: 64,
        columns: gridColumns,
        mask: {
          padding: 2
        },
        reuseCellContainer: true
      },
      slider: {
        track: this.rexUI.add.roundRectangle(0, 0, 5, 0, 2, 0x373f4a),
        thumb: this.rexUI.add.roundRectangle(0, 0, 5, 0, 3, 0xa6adbb)
      },
      mouseWheelScroller: {
        speed: 1,
        focus: false
      },
      space: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
        table: 10
      },
      createCellContainerCallback: (cell) => {
        return this.createCellContainer(cell, 'objects');
      },
      items: this.objectFrames
    });

    this.objectGridTable.layout();
  }

  createButton(text: string) {
    return this.rexUI.add.label({
      width: 100,
      height: 40,
      background: this.rexUI.add.roundRectangle(
        0,
        0,
        100,
        40,
        {
          tl: 10,
          tr: 0,
          bl: 10,
          br: 0
        },
        0x2a323c,
        0.8
      ),
      text: this.add.text(0, 0, text, { fontSize: 18 }),
      space: { left: 10, right: 10, top: 5, bottom: 5 },
      align: 'center'
    });
  }

  updateGridVisibility() {
    if (this.tileGridTable) {
      this.tileGridTable.setVisible(this.currentTab === 'tiles');
    }
    if (this.objectGridTable) {
      this.objectGridTable.setVisible(this.currentTab === 'objects');
    }
  }

  create() {
    const allTileFrames = this.textures.get('tiles').getFrameNames();
    const allObjectFrames = this.textures.get('objects').getFrameNames();

    this.tileFrames = this.groupAndFilterFrames(allTileFrames).sort((a, b) => {
      const aNum = parseInt(a.replace(/\D/g, ''));
      const bNum = parseInt(b.replace(/\D/g, ''));
      return aNum - bNum;
    });

    this.objectFrames = this.groupAndFilterFrames(allObjectFrames).sort((a, b) => {
      const aNum = parseInt(a.replace(/\D/g, ''));
      const bNum = parseInt(b.replace(/\D/g, ''));
      return aNum - bNum;
    });

    this.createTabs();
    this.createTileGrid();
    this.createObjectGrid();
    this.updateGridVisibility();

    this.scale.on('resize', this.resize, this);

    if (this.tileGridTable) {
      this.onCellClick(this.tileGridTable.getCell(0).getContainer()!, 0, 'tiles');
    }
  }

  groupAndFilterFrames(frames: string[]): string[] {
    const groupedFrames: { [key: string]: string[] } = {};

    frames.forEach((frame) => {
      const baseName = frame.replace(/_\d+$/, '');
      if (!groupedFrames[baseName]) {
        groupedFrames[baseName] = [];
      }
      groupedFrames[baseName].push(frame);
    });

    // For each group, only keep the first frame
    return Object.values(groupedFrames).map((group) => group[0]);
  }

  createCellContainer(cell: any, type: 'tiles' | 'objects') {
    const scene = cell.scene;
    const frame = cell.item;
    const container = scene.add.container();

    let textureKey: string;
    let size: number;
    let scale: number = 1;
    let cropWidth: number | null = null;
    let cropHeight: number | null = null;

    switch (type) {
      case 'tiles':
        textureKey = 'tiles';
        size = 32;
        break;
      case 'objects':
        textureKey = 'objects';
        size = 64;
        break;
      default:
        throw new Error(`Unsupported cell type: ${type}`);
    }

    const sprite = scene.add.sprite(32, size / 2, textureKey, frame);
    sprite.setName('itemSprite');

    if (type === 'tiles' && sprite.width >= 64 * 4) {
      const animKey = createTileAnimation(scene, frame);
      if (scene.anims.exists(animKey)) {
        sprite.play(animKey);
      }

      cropWidth = 64;
      cropHeight = 32;
    }

    if (cropWidth && cropHeight) {
      sprite.setCrop(0, 0, cropWidth, cropHeight);
      sprite.setSize(64, 32);
    }

    // Add a background rectangle for hover and click effects
    const background = scene.add.rectangle(32, size / 2, 64, size, 0xffffff, 0);
    container.add(background);
    container.sendToBack(background);
    container.add(sprite);

    sprite.setOrigin(0.5);

    if (type === 'objects') {
      scale = Math.min(64 / sprite.width, 64 / sprite.height);
      sprite.setScale(scale);
    }

    sprite.setInteractive();
    sprite.depth = sprite.y + cell.index;
    sprite.on('pointerover', () => this.onCellOver(container));
    sprite.on('pointerout', () => this.onCellOut(container));
    sprite.on('pointerdown', () => this.onCellClick(container, cell.index, type));

    if (frame === this.selectedItemFrameName) {
      background.setFillStyle(0xffffff, 0.3);
    }

    return container;
  }

  selectItem(sprite: Phaser.GameObjects.Sprite) {
    if (!sprite || !sprite.frame) {
      console.error('Invalid sprite selected:', sprite);
      return;
    }

    const frameName = sprite.frame.name;

    if (this.selectedItemFrameName === frameName) {
      return;
    }

    if (this.selectedItemFrameName) {
      const previousIndex = (
        this.currentTab === 'tiles' ? this.tileFrames : this.objectFrames
      ).indexOf(this.selectedItemFrameName);
      this.unselectItemByIndex(previousIndex);
    }

    this.selectedItemFrameName = frameName;

    const container = sprite.parentContainer as Phaser.GameObjects.Container;
    if (container) {
      const background = container.list[0] as Phaser.GameObjects.Rectangle;
      background.setFillStyle(0xffffff, 0.3);
    }
  }

  selectItemByIndex(index: number) {
    const gridTable = this.currentTab === 'tiles' ? this.tileGridTable : this.objectGridTable;
    if (gridTable) {
      const cell = gridTable.getCell(index);
      if (cell) {
        const container = cell.getContainer() as Phaser.GameObjects.Container;
        const sprite = container?.list[1] as Phaser.GameObjects.Sprite;
        if (sprite) {
          this.selectItem(sprite);
        }
      }
    }
  }

  unselectItemByIndex(index: number) {
    const gridTable = this.currentTab === 'tiles' ? this.tileGridTable : this.objectGridTable;
    if (gridTable) {
      const cell = gridTable.getCell(index);

      if (cell) {
        const container = cell.getContainer();
        if (container && container instanceof Phaser.GameObjects.Container) {
          const background = container.list[0] as Phaser.GameObjects.Rectangle;
          background.setFillStyle(0xffffff, 0);
        }
      }
    }
  }

  onCellClick(cellContainer: any, cellIndex: number, type: 'tiles' | 'objects') {
    console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} cell clicked:`, cellIndex);
    const sprite = cellContainer.list.find(
      (item: any) => item instanceof Phaser.GameObjects.Sprite
    ) as Phaser.GameObjects.Sprite;
    if (sprite && sprite.frame) {
      const frameName = sprite.frame.name;
      this.selectItem(sprite);
      this.events.emit(`${type.slice(0, -1)}Selected`, { frameName, tab: this.currentTab });

      // Show the background when clicked
      const background = cellContainer.list[0] as Phaser.GameObjects.Rectangle;
      background.setFillStyle(0xffffff, 0.3);
    } else {
      console.error(`Invalid sprite in ${type} cell:`, cellContainer);
    }
  }

  onCellOver(cellContainer: any) {
    cellContainer.list[0].setFillStyle(0xffffff, 0.1);
  }

  onCellOut(cellContainer: any) {
    if (cellContainer.list[1].frame.name !== this.selectedItemFrameName) {
      cellContainer.list[0].setFillStyle(0xffffff, 0);
    } else {
      cellContainer.list[0].setFillStyle(0xffffff, 0.3);
    }
  }

  resize() {
    if (this.tabButtons) {
      this.tabButtons.destroy();
    }
    if (this.tileGridTable) {
      this.tileGridTable.destroy();
    }
    if (this.objectGridTable) {
      this.objectGridTable.destroy();
    }

    // Recreate the components
    this.createTabs();
    this.createTileGrid();
    this.createObjectGrid();
    this.updateGridVisibility();

    // Update the position of the components
    if (this.tabButtons) {
      this.tabButtons.setPosition(
        this.tabPosition.x + 10,
        this.game.scale.height - this.tabPosition.y
      );
    }
    if (this.tileGridTable) {
      this.tileGridTable.setPosition(
        this.game.scale.width / 2,
        this.game.scale.height - this.tileGridPosition.y
      );
    }
    if (this.objectGridTable) {
      this.objectGridTable.setPosition(
        this.game.scale.width / 2,
        this.game.scale.height - this.objectGridPosition.y
      );
    }

    // Reselect the previously selected item
    if (this.selectedItemFrameName) {
      const index = (this.currentTab === 'tiles' ? this.tileFrames : this.objectFrames).indexOf(
        this.selectedItemFrameName
      );

      if (index !== -1) {
        this.selectItemByIndex(index);
      }
    }
  }

  onTabButtonHover(button: any) {
    const background = button.getElement('background');
    const isActive =
      (button.text === 'Tiles' && this.currentTab === 'tiles') ||
      (button.text === 'Objects' && this.currentTab === 'objects');

    if (!isActive) {
      background.setFillStyle(0x373f4a);
    }
  }

  onTabButtonOut(button: any) {
    const background = button.getElement('background');
    const isActive =
      (button.text === 'Tiles' && this.currentTab === 'tiles') ||
      (button.text === 'Objects' && this.currentTab === 'objects');

    if (!isActive) {
      background.setFillStyle(0x2a323c);
    }
  }
}
