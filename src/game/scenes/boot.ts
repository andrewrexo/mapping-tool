import { Scene } from 'phaser';

export class Boot extends Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload() {
    // load any assets that are needed for preload stage
  }

  create() {
    this.scene.start('Preloader');
  }
}
