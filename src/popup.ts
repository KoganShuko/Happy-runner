import * as PIXI from 'pixi.js';
import { PopupTextures, PopupSprites } from './types';

export class Popup {
  private textures: PopupTextures;
  private clickHandler: Function;
  public popup: PIXI.PopupContainer;

  constructor(textures: PopupTextures, clickHandler: Function) {
    this.textures = textures;
    this.clickHandler = clickHandler;
    this.popup = this.createPopup();
  }

  private createPopup(): PIXI.PopupContainer {
    const keys = Object.keys(this.textures);
    const sprites: PopupSprites = {};
    keys.forEach((key) => {
      sprites[key] = new PIXI.Sprite(this.textures[key]);
    });
    const container = new PIXI.Container() as PIXI.PopupContainer;
    keys.forEach((key) => {
      const sprite = sprites[key];
      if (sprite) {
        container.addChild(sprite);
        if (key !== 'bg') {
          sprite.x = container.width / 2 - sprite.width / 2;
          if (key === 'title') {
            sprite.y = 100;
          } else if (key === 'text') {
            sprite.y = 200;
          } else if (key === 'button' || key === 'buttonText') {
            sprite.y = 500;
            sprite.interactive = true;
            sprite.buttonMode = true;
            sprite.on('pointerdown', () => this.clickHandler(this));
          }
        }
      }
    });
    container.zIndex = 10;
    return container;
  }

  public async hide(): Promise<void> {
    return new Promise((res) => {
      const changeAlpha = (): void => {
        if (this.popup.alpha <= 0) {
          res();
          return;
        }
        this.popup.alpha -= 0.05;
        window.requestAnimationFrame(changeAlpha);
      };
      window.requestAnimationFrame(changeAlpha);
    });
  }

  public appendTo(container: PIXI.Container): void {
    container.addChild(this.popup);
  }

  public resetAlpha(): void {
    this.popup.alpha = 1;
  }
}
