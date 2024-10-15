import { AUTO, Game } from 'phaser';
import { Boot } from './scenes/boot';
import { Load } from './scenes/load';
import { Map } from './scenes/map';
import { TileSelect } from './scenes/tile-select';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#000000',
  scene: [Boot, Load, Map, TileSelect],
  pixelArt: true,
  plugins: {
    scene: [
      {
        key: 'rexUI',
        plugin: RexUIPlugin,
        mapping: 'rexUI'
      }
    ]
  }
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
