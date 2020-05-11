import * as PIXI from 'pixi.js';
import { LayerType, GroundType } from './enums';
import {
  LayerFactorySettings,
  GroundSettings,
  MovableLayerSettings,
} from './types';

export class MovableLayer extends PIXI.Container {
  xVelocity: number;
  xMax: number;

  constructor(settings: MovableLayerSettings) {
    super();
    this.xVelocity = settings.xVelocity;
    this.xMax = settings.xMax;
    this.x = settings.x;
    this.zIndex = settings.zIndex;
  }

  move(containersArr: Array<PIXI.Container>): void {
    this.x -= this.xVelocity;
    if (this.x < -this.xMax) {
      this.destroy();
      containersArr.shift();
    }
  }
}

export class Ground extends MovableLayer {
  public static currentLevel = 1;
  public static width = 50;
  public static hightDiff = 50;
  private static maxLevel = 3;
  private textures: Array<PIXI.Texture>;
  private type: GroundType;
  private PxToBottom?: number; // to calc how many sprites to the app bottom

  constructor(settings: GroundSettings) {
    super({
      x: settings.x,
      xMax: settings.xMax,
      xVelocity: settings.xVelocity,
      zIndex: settings.zIndex,
    });
    this.type = settings.type;
    this.textures = settings.textures;
    this.y = settings.y;
    this.PxToBottom = settings.PxToBottom;
    this.createground();
  }

  createground(): void {
    const groundCount = Math.floor(this.xMax / Ground.width);
    let groundCountY: number;
    if (this.PxToBottom) {
      groundCountY = Math.ceil(this.PxToBottom / Ground.width);
    } else {
      groundCountY = 2;
    }
    for (let i = 0; i < groundCount; i += 1) {
      for (let j = 0; j < groundCountY; j += 1) {
        let groundSprite: PIXI.Sprite;
        if (j === 0) {
          if (this.type !== GroundType.FRONT) {
            groundSprite = new PIXI.Sprite(this.textures[1]);
          } else {
            // eslint-disable-next-line no-lonely-if
            if (i === 0) {
              groundSprite = new PIXI.Sprite(this.textures[2]);
            } else if (i === groundCount - 1) {
              groundSprite = new PIXI.Sprite(this.textures[3]);
            } else {
              groundSprite = new PIXI.Sprite(this.textures[1]);
            }
          }
        } else {
          groundSprite =
            this.type === GroundType.FRONT
              ? new PIXI.Sprite(this.textures[4])
              : new PIXI.Sprite(this.textures[0]);
        }
        groundSprite.x = Ground.width * i;
        groundSprite.y = -5 + groundSprite.height * j;
        this.addChild(groundSprite);
      }
    }
  }
  static changeGroundLevel(level: number): number {
    let nextLevel;
    if (level === 0) {
      nextLevel = level + 1;
    } else if (level === Ground.maxLevel) {
      nextLevel = level - 1;
    } else {
      const random = Math.random() > 0.5;
      if (random) {
        nextLevel = level - 1;
      } else {
        nextLevel = level + 1;
      }
    }
    return nextLevel;
  }
}

export class LayerFactory {
  public list: Array<MovableLayer | Ground> = [];
  private type: LayerType;
  private speed: number;
  private xMax: number;
  private layerHeight: number;
  private zIndex: number;
  private groundTextures?: Array<PIXI.Texture>;
  private populateFunction?: Function;
  private populateFunctionSettings?: object;
  private gapLengthOffScreen?: number;
  private groundWidthOffScreen?: number;
  private currentLevel: number;
  private container?: MovableLayer | Ground;
  private filter?: PIXI.Filter[];

  constructor(settings: LayerFactorySettings) {
    this.type = settings.type;
    this.groundTextures = settings.groundTextures;
    this.speed = settings.speed;
    this.xMax = settings.xMax;
    this.layerHeight = settings.layerHeight;
    this.currentLevel = 2;
    this.populateFunction = settings.populateFunction;
    this.populateFunctionSettings = settings.populateFunctionSettings;
    this.filter = settings.filter;
    this.zIndex = settings.zIndex;
  }
  // eslint-disable-next-line consistent-return
  spamLayers(): Ground | MovableLayer | undefined {
    if (this.groundWidthOffScreen && this.groundWidthOffScreen > 0) {
      this.groundWidthOffScreen -= this.speed;
    } else if (this.gapLengthOffScreen && this.gapLengthOffScreen > 0) {
      this.gapLengthOffScreen -= this.speed;
    } else if (!this.groundWidthOffScreen || this.groundWidthOffScreen <= 0) {
      if (this.type === LayerType.WITH_GROUNT) {
        this.gapLengthOffScreen =
          Math.random() * this.speed * 15 + 10 * this.speed;
        this.groundWidthOffScreen =
          Math.floor(
            (Math.random() * this.speed * 35 + 20 * this.speed) / Ground.width
          ) * Ground.width;
        this.currentLevel = Ground.changeGroundLevel(this.currentLevel);
      } else if (this.type === LayerType.WITHOUT_GROUND) {
        this.gapLengthOffScreen = 0;
        this.groundWidthOffScreen = this.xMax;
      }
      if (this.groundWidthOffScreen) {
        if (this.type === LayerType.WITH_GROUNT && this.groundTextures) {
          const y =
            this.layerHeight - Ground.hightDiff * (this.currentLevel + 1) - 20;
          const groundSettings: GroundSettings = {
            type: GroundType.FRONT,
            textures: this.groundTextures,
            xVelocity: this.speed,
            x: this.xMax,
            y,
            xMax: this.groundWidthOffScreen,
            zIndex: this.zIndex,
          };
          this.container = new Ground(groundSettings);
        } else if (this.type === LayerType.WITHOUT_GROUND) {
          const layerSettings: MovableLayerSettings = {
            x: this.xMax,
            xMax: this.xMax,
            xVelocity: this.speed,
            zIndex: this.zIndex,
          };
          this.container = new MovableLayer(layerSettings);
        }
        if (this.container) {
          if (this.populateFunction && this.populateFunctionSettings) {
            this.populateFunction(
              this.container,
              this.populateFunctionSettings,
              this.groundWidthOffScreen
            );
          }
          if (this.filter) {
            this.container.filters = this.filter;
          }
          this.groundWidthOffScreen -= this.speed;
          this.list.push(this.container);
          return this.container;
        }
      }
    }
  }

  resetFactory(): void {
    this.groundWidthOffScreen = undefined;
    this.gapLengthOffScreen = undefined;
  }
}
