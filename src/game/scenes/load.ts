import { Scene } from 'phaser';

export class Load extends Scene {
  constructor() {
    super({ key: 'load' });
  }

  preload() {
    // load assets for the mapping tool
  }

  create() {
    // all assets loaded, launch the map scene
    this.scene.start('map');
  }
}
