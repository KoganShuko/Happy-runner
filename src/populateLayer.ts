import * as PIXI from 'pixi.js';
import { PopulateLayerSettings } from './types';
import { Ground, MovableLayer } from './containers';

export function populateLayer(
  obj: Ground | MovableLayer,
  settings: Array<PopulateLayerSettings>,
  xMax: number
): void {
  settings.forEach((textureObj) => {
    const { textures, settings: textureSettings } = textureObj;
    const {
      objCountMin,
      objCountMax,
      yObj,
      xMin,
      yMin,
      yMax,
      sMin,
      sMax,
      isAnimated,
      chance = 1,
    } = textureSettings;
    const isNeedToShow = Math.random() < chance ? 1 : 0;
    const objCount =
      Math.round(Math.random() * (objCountMax - objCountMin) + objCountMin) *
      isNeedToShow;
    for (let i = 0; i < objCount; i += 1) {
      let sprite: PIXI.Sprite | PIXI.AnimatedSprite;
      if (!isAnimated) {
        const index = Math.floor(Math.random() * textures.length);
        const texture = textures[index];
        sprite = new PIXI.Sprite(texture);
      } else {
        sprite = new PIXI.AnimatedSprite(textures) as PIXI.AnimatedSprite;
      }
      if (sprite instanceof PIXI.AnimatedSprite) {
        sprite.play();
        sprite.animationSpeed = 0.1;
      }
      if (sMin !== undefined && sMax !== undefined) {
        const scale = Math.random() * (sMax - sMin) + sMin;
        sprite.scale.set(scale);
      }
      if (xMin !== undefined && xMax !== undefined) {
        const x = Math.floor(
          Math.random() * (xMax - xMin - sprite.width) + xMin
        );
        sprite.x = x;
      }
      if (yMin !== undefined && yMax !== undefined) {
        const randY = Math.floor(Math.random() * (yMax - yMin) + yMin);
        sprite.y = randY - sprite.height;
      } else if (yObj !== undefined) {
        sprite.y = yObj - sprite.height;
      }
      obj.addChild(sprite);
    }
  });
}
