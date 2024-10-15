import Phaser from 'phaser';
import tileProperties from '$lib/tile';

export function createTileAnimation(scene: Phaser.Scene, tileId: string) {
  const animKey = `tile-anim-${tileId}`;

  if (!scene.anims.exists(animKey)) {
    const texture = scene.textures.get('tiles');
    const frame = texture.get(tileId);

    if (frame && frame.width >= tileProperties.tileWidth * tileProperties.animationFrameCount) {
      const frames = createAnimationFrames(scene, tileId);

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
  const originalX = frame.source.texture.frames[tileId].cutX;
  const originalY = frame.source.texture.frames[tileId].cutY;

  console.log(originalX, originalY, frame.source.texture.frames[tileId]);

  const frames: Phaser.Types.Animations.AnimationFrame[] = [];

  for (let i = 0; i < 4; i++) {
    const frameName = `${tileId}_${i}`;
    if (!texture.has(frameName)) {
      console.log(frameName);
      texture.add(
        `${frameName}`,
        frame.sourceIndex,
        originalX + Math.floor(frameWidth * i),
        originalY,
        Math.floor(frameWidth),
        frameHeight
      );
    }
    frames.push({ key: 'tiles', frame: frameName });
  }

  return frames;
}
