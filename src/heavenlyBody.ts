import * as PIXI from 'pixi.js';
import { HeavenlyBodySettings } from './types';

export class HeavenlyBody extends PIXI.Sprite {
  xVelocity: number;
  xMax: number;
  x: number;
  y: number;
  zIndex: number;
  nextPhase: number;
  currentPhase: number;
  phaseTextures: Array<PIXI.Texture>;

  constructor(settings: HeavenlyBodySettings) {
    super();
    this.xMax = settings.xMax;
    this.xVelocity = settings.xVelocity;
    this.x = settings.x;
    this.y = settings.y;
    this.zIndex = settings.zIndex;
    this.phaseTextures = settings.textures;
    this.nextPhase = 1;
    this.currentPhase = 0;
    this.texture = this.phaseTextures[this.currentPhase];
  }

  move(): void {
    this.x -= this.xVelocity;
    if (this.x <= -this.width) {
      this.x = this.xMax;
      this.changePhase();
    }
  }

  changePhase(): void {
    if (this.currentPhase === 0) {
      this.texture = this.phaseTextures[this.nextPhase];
      this.currentPhase = this.nextPhase;
      this.nextPhase += 1;
      if (this.nextPhase === this.phaseTextures.length) {
        this.nextPhase = 1;
      }
    } else {
      // eslint-disable-next-line prefer-destructuring
      this.texture = this.phaseTextures[0];
      this.currentPhase = 0;
    }
  }

  reset(): void {
    this.x = this.xMax;
    this.currentPhase = 0;
  }
}
