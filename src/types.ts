import * as PIXI from 'pixi.js';
import { LayerType, GroundType } from './enums';

export interface PopulateSpriteSettings {
  objCountMin: number;
  objCountMax: number;
  xMin: number;
  yObj?: number;
  yMin?: number;
  yMax?: number;
  sMin?: number;
  sMax?: number;
  isAnimated?: boolean;
  chance?: number;
}

export interface PopulateLayerSettings {
  textures: Array<any>;
  settings: PopulateSpriteSettings;
}

declare module 'pixi.js' {
  interface PopupContainer extends PIXI.Container {
    hide: Function;
  }
}

export interface TickerFunction {
  (...params: any[]): any;
}

export interface CharacterSettings {
  animationSpeed: number;
  spriteScale: number;
  x: number;
  y: number;
  xVelocity: number;
  yJumpVelocity: number;
}

export interface PopupTextures {
  [key: string]: PIXI.Texture | undefined;
  bg?: PIXI.Texture;
  title?: PIXI.Texture;
  text?: PIXI.Texture;
  button?: PIXI.Texture;
  buttonText?: PIXI.Texture;
}
export interface PopupSprites {
  [key: string]: PIXI.Sprite | undefined;
  bg?: PIXI.Sprite;
  title?: PIXI.Sprite;
  text?: PIXI.Sprite;
  button?: PIXI.Sprite;
  buttonText?: PIXI.Sprite;
}

export interface LayerFactorySettings {
  type: LayerType;
  speed: number;
  xMax: number;
  layerHeight: number;
  groundTextures?: Array<PIXI.Texture>;
  populateFunction?: Function;
  populateFunctionSettings?: object;
  zIndex: number;
  filter?: PIXI.Filter[];
}

export interface GroundSettings {
  type: GroundType;
  textures: Array<PIXI.Texture>;
  x: number;
  y: number;
  xMax: number;
  xVelocity: number;
  zIndex: number;
  PxToBottom?: number;
}

export interface MovableLayerSettings {
  xVelocity: number;
  xMax: number;
  x: number;
  zIndex: number;
}

export interface HeavenlyBodySettings {
  xVelocity: number;
  xMax: number;
  x: number;
  y: number;
  zIndex: number;
  textures: Array<PIXI.Texture>;
}
