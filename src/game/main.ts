import { AUTO, Game } from 'phaser';
import { Boot } from './scenes/boot';
import { Load } from './scenes/load';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#028af8',
  scene: [Boot, Load, Map]
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
