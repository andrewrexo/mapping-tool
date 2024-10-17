import { Scene } from 'phaser';

export class Load extends Scene {
  constructor() {
    super({ key: 'load' });
  }

  preload() {
    this.load.multiatlas('tiles', 'map-tiles.json');
    this.load.multiatlas('objects', 'map-objects.json');

    this.load.json('map_data', 'map_data.json');
  }

  create() {
    // all assets loaded, launch the map scene
    this.scene.start('map');
  }
}
