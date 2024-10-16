import Phaser from 'phaser';
import tileProperties from '$lib/tile';

export function createTileAnimation(scene: Phaser.Scene, tileId: string) {
  const baseTileId = tileId.split('_')[0];
  const animKey = `anim_${baseTileId}`;

  if (!scene.anims.exists(animKey)) {
    const texture = scene.textures.get('tiles');
    const frame = texture.get(baseTileId);

    if (frame && frame.width >= tileProperties.tileWidth * tileProperties.animationFrameCount) {
      const frames = createAnimationFrames(scene, baseTileId);

      scene.anims.create({
        key: animKey,
        frames: frames,
        frameRate: tileProperties.animationFrameRate,
        repeat: -1
      });
    }
  }

  return animKey;
}

function createAnimationFrames(
  scene: Phaser.Scene,
  tileId: string
): Phaser.Types.Animations.AnimationFrame[] {
  const texture = scene.textures.get('tiles');
  const frame = texture.get(tileId);
  const frameWidth = frame.width / 4;
  const frameHeight = frame.height;
  const frames = frame.source.texture.frames as Record<string, { cutX: number; cutY: number }>;
  const originalX = frames[tileId].cutX;
  const originalY = frames[tileId].cutY;

  const framesArray: Phaser.Types.Animations.AnimationFrame[] = [];

  for (let i = 0; i < 4; i++) {
    const frameName = `${tileId}_${i}`;
    if (!texture.has(frameName)) {
      texture.add(
        `${frameName}`,
        frame.sourceIndex,
        originalX + Math.floor(frameWidth * i),
        originalY,
        Math.floor(frameWidth),
        frameHeight
      );
    }
    framesArray.push({ key: 'tiles', frame: frameName });
  }

  return framesArray;
}
