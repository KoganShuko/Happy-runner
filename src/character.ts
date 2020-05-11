import * as PIXI from 'pixi.js';
import { CharacterSettings, TickerFunction } from './types';
import { Ground, MovableLayer } from './containers';

export class Character extends PIXI.AnimatedSprite {
  public isJumping: boolean;
  public isFalling: boolean;
  private jumpTexture: PIXI.Texture;
  private fallTexture: PIXI.Texture;
  private xVelocity: number;
  private yStartVelocity: number;
  private yCurrentVelocity: number;
  private animationTextures: PIXI.Texture[];
  private jumAminationFunc: TickerFunction | undefined;

  constructor(
    textures: PIXI.Texture[],
    jumpTexture: PIXI.Texture,
    fallTexture: PIXI.Texture,
    settings: CharacterSettings
  ) {
    super(textures);
    const {
      animationSpeed,
      spriteScale,
      x,
      y,
      xVelocity,
      yJumpVelocity,
    } = settings;
    this.jumpTexture = jumpTexture;
    this.animationSpeed = animationSpeed;
    this.scale.set(spriteScale);
    this.x = x;
    this.y = y - this.height;
    this.xVelocity = xVelocity;
    this.yStartVelocity = yJumpVelocity;
    this.yCurrentVelocity = 0;
    this.isJumping = false;
    this.isFalling = false;
    this.animationTextures = textures;
    this.jumpTexture = jumpTexture;
    this.fallTexture = fallTexture;
    this.zIndex = 10;
  }

  jump(gravity: number, ticker: PIXI.Ticker): TickerFunction {
    this.stop();
    this.texture = this.jumpTexture;
    this.isJumping = true;
    this.yCurrentVelocity = this.yStartVelocity;
    this.jumAminationFunc = (): void => {
      if (this.yCurrentVelocity > 0) {
        this.y -= this.yCurrentVelocity;
        this.yCurrentVelocity -= gravity;
      } else if (this.yCurrentVelocity <= 0) {
        this.isJumping = false;
        if (this.jumAminationFunc) {
          ticker.remove(this.jumAminationFunc);
        }
      }
    };
    return this.jumAminationFunc;
  }

  fall(gravity: number): void {
    if (!this.isFalling) {
      this.texture = this.fallTexture;
    }
    this.isFalling = true;
    this.y -= this.yCurrentVelocity;
    this.yCurrentVelocity -= gravity;
  }

  checkGround(
    groundContainers: Array<MovableLayer | Ground>
  ): MovableLayer | Ground | undefined {
    const ground = groundContainers.find(
      (container) =>
        container.x <= this.x + this.xVelocity + this.width / 2 &&
        container.x + container.width >=
          this.x + this.xVelocity + this.width / 2
    );
    let isStanding = true;
    if (!ground) {
      isStanding = false;
    } else if (
      ground &&
      Math.abs(ground.y - this.y - this.height + this.yCurrentVelocity) > 15
    ) {
      isStanding = false;
    }
    return isStanding ? ground : undefined;
  }

  updateState(
    groundContainers: Array<MovableLayer | Ground>,
    gravity: number,
    maxHeight: number,
    deathCb: Function
  ): void {
    if (this.y > maxHeight) {
      deathCb();
    }
    if (!this.isJumping) {
      const ground = this.checkGround(groundContainers);
      if (!ground) {
        this.fall(gravity);
      } else {
        // eslint-disable-next-line no-lonely-if
        if (this.isFalling) {
          this.isFalling = false;
          this.y = ground.y - this.height;
          this.yCurrentVelocity = 0;
          this.textures = this.animationTextures;
          this.gotoAndPlay(1);
        }
      }
    }
  }

  reset(): void {
    this.y = this.textures[0].height;
  }
}
