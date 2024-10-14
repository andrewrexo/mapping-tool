import { AUTO, Game } from 'phaser';
import { Boot } from './scenes/boot';
import { Load } from './scenes/load';
import { Map } from './scenes/map';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#000000',
  scene: [Boot, Load, Map],
  pixelArt: true
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
