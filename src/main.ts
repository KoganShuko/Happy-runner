import * as PIXI from 'pixi.js';
import { Character } from './character';
import { HeavenlyBody } from './heavenlyBody';
import { populateLayer } from './populateLayer';
import { Popup } from './popup';
import { Keys, LayerType, GroundType } from './enums';
import {
  CharacterSettings,
  PopulateSpriteSettings,
  LayerFactorySettings,
  GroundSettings,
  MovableLayerSettings,
  HeavenlyBodySettings,
} from './types';
import { Ground, LayerFactory, MovableLayer } from './containers';

export function main(app: PIXI.Application): void {
  const worldSettings = {
    gravity: 1,
    layer0Speed: 10,
    layer1Speed: 5,
    layer2Speed: 1,
    startGroundHeight: app.view.height - 60 * (Ground.currentLevel + 1),
    startBGHeight: app.view.height - 50 * (Ground.currentLevel + 1),
    layer0zIndex: 5,
    layer1zIndex: 4,
    layer2zIndex: 3,
  };

  const playerSettings: CharacterSettings = {
    animationSpeed: 0.1,
    spriteScale: 0.6,
    x: 50,
    y: worldSettings.startGroundHeight,
    xVelocity: worldSettings.layer0Speed,
    yJumpVelocity: 15,
  };

  const spritesheet = app.loader.resources['./src/assets/sprites.json']
    .spritesheet as PIXI.Spritesheet;
  const texturesKeys = Object.keys(spritesheet.textures);
  function getTextures(keys: Array<string>, type: string): Array<any> {
    const regexp = new RegExp(`^(${type})`);
    return keys
      .filter((key) => regexp.test(key))
      .map((key) => spritesheet.textures[key]);
  }
  const treeTextures = getTextures(texturesKeys, 'tree');
  const groundTextures = getTextures(texturesKeys, 'ground');
  const heavenlyBodyTextures = getTextures(texturesKeys, 'heavenlyBody');
  const bushTextures = getTextures(texturesKeys, 'bush');
  const characterAnimationTexture = spritesheet.animations.man;
  const rabbitAnimationTexture = spritesheet.animations.rabbit;
  const jumpTexture = spritesheet.textures['manJump.png'];
  const fallTexture = spritesheet.textures['manFall.png'];
  /* 
    there are two type of Layers in LayerFactory - with ground or without.
    with ground Laters are used to build front type platfrorm - they have width less then app,view.width,
    without are used to create bg layers that have app.view.width. bg ground layer is static

    LayerFactory create a new layer on x = app.view.width,
    then check when this layer is fully on the screen + gap width and then create a new one.
    LayerFactory layers can be Ground or Movable class that can be populated with populateLayer function.
    Thats why it is neaded to create start on screen layers seperatly 
  */
  const frontTreeSetting: PopulateSpriteSettings = {
    objCountMin: 1,
    objCountMax: 6,
    xMin: 0,
    sMin: 1.5,
    sMax: 2,
    yObj: 0,
  };
  const frontBushSetting: PopulateSpriteSettings = {
    objCountMin: 0,
    objCountMax: 3,
    xMin: 0,
    sMin: 0.6,
    sMax: 0.8,
    yObj: 0,
  };
  const frontRabbitSetting: PopulateSpriteSettings = {
    objCountMin: 1,
    objCountMax: 1,
    xMin: 0,
    sMin: 0.5,
    sMax: 0.6,
    yObj: 0,
    isAnimated: true,
    chance: 0.3,
  };
  const populateFrontLayerSettings = [
    {
      textures: treeTextures,
      settings: frontTreeSetting,
    },
    {
      textures: bushTextures,
      settings: frontBushSetting,
    },
    {
      textures: rabbitAnimationTexture,
      settings: frontRabbitSetting,
    },
  ];

  const frontLayerSpammerSettings: LayerFactorySettings = {
    type: LayerType.WITH_GROUNT,
    groundTextures,
    speed: worldSettings.layer0Speed,
    xMax: app.view.width,
    layerHeight: app.view.height,
    zIndex: worldSettings.layer0zIndex,
    populateFunction: populateLayer,
    populateFunctionSettings: populateFrontLayerSettings,
  };
  const frontLayerSpammer = new LayerFactory(frontLayerSpammerSettings);

  const startFrontGrondSettings: GroundSettings = {
    type: GroundType.FRONT,
    textures: groundTextures,
    xVelocity: worldSettings.layer0Speed,
    x: 0,
    y: worldSettings.startGroundHeight,
    xMax: app.view.width - 200,
    zIndex: worldSettings.layer0zIndex,
  };

  function initStartMap(): void {
    const startFrontGrond = new Ground(startFrontGrondSettings);
    populateLayer(
      startFrontGrond,
      populateFrontLayerSettings,
      app.view.width - 200
    );
    frontLayerSpammer.list = [];
    frontLayerSpammer.list.push(startFrontGrond);
    app.stage.addChild(startFrontGrond);
  }
  initStartMap();

  // sky layer
  const heavenlyBodySettings: HeavenlyBodySettings = {
    x: app.view.width,
    y: 0,
    xVelocity: worldSettings.layer2Speed,
    xMax: app.view.width,
    zIndex: worldSettings.layer2zIndex,
    textures: heavenlyBodyTextures,
  };
  const heavenlyBody = new HeavenlyBody(heavenlyBodySettings);
  app.stage.addChild(heavenlyBody);

  // BG layer
  const startBGGrondSettings: GroundSettings = {
    type: GroundType.BG,
    textures: groundTextures,
    xVelocity: 0,
    x: 0,
    y: worldSettings.startBGHeight,
    xMax: app.view.width,
    PxToBottom: app.view.height - worldSettings.startBGHeight,
    zIndex: 1,
  };
  const bgGround = new Ground(startBGGrondSettings);
  bgGround.filters = [
    new PIXI.filters.BlurFilter(10),
    new PIXI.filters.AlphaFilter(0.4),
  ];
  app.stage.addChild(bgGround);

  const treeLayerSettings: PopulateSpriteSettings = {
    objCountMin: 12,
    objCountMax: 15,
    xMin: 0,
    sMin: 1,
    sMax: 1.5,
    yObj: worldSettings.startBGHeight,
  };
  const populateTreeLayerSettings = [
    {
      textures: treeTextures,
      settings: treeLayerSettings,
    },
  ];

  const bgLayerFactorySettings: LayerFactorySettings = {
    type: LayerType.WITHOUT_GROUND,
    speed: worldSettings.layer1Speed,
    xMax: app.view.width,
    layerHeight: worldSettings.startBGHeight,
    zIndex: worldSettings.layer1zIndex,
    populateFunction: populateLayer,
    populateFunctionSettings: populateTreeLayerSettings,
    filter: [
      new PIXI.filters.BlurFilter(10),
      new PIXI.filters.AlphaFilter(0.4),
    ],
  };

  const bgSpriterSpammer = new LayerFactory(bgLayerFactorySettings);

  const startBGSpritesSetings: MovableLayerSettings = {
    x: 0,
    xMax: app.view.width,
    xVelocity: worldSettings.layer1Speed,
    zIndex: worldSettings.layer1zIndex,
  };

  const startBGSprites = new MovableLayer(startBGSpritesSetings);
  startBGSprites.filters = [
    new PIXI.filters.BlurFilter(10),
    new PIXI.filters.AlphaFilter(0.4),
  ];
  populateLayer(startBGSprites, populateTreeLayerSettings, app.view.width);
  bgSpriterSpammer.list.push(startBGSprites);
  app.stage.addChild(startBGSprites);

  // activate character
  const character = new Character(
    characterAnimationTexture,
    jumpTexture,
    fallTexture,
    playerSettings
  );
  app.stage.addChild(character);
  window.document.addEventListener('keydown', (e) => {
    if (e.keyCode !== Keys.JUMP) return;
    if (!character.isJumping && !character.isFalling) {
      app.ticker.add(character.jump(worldSettings.gravity, app.ticker));
    }
  });

  function play(): void {
    heavenlyBody.move();
    const newBGLayer = bgSpriterSpammer.spamLayers();
    if (newBGLayer) {
      app.stage.addChild(newBGLayer);
    }
    const bgSpriterSpammerList = [...bgSpriterSpammer.list];
    bgSpriterSpammerList.forEach((layer) => layer.move(bgSpriterSpammer.list));

    const newFrontLayer = frontLayerSpammer.spamLayers();
    if (newFrontLayer) {
      app.stage.addChild(newFrontLayer);
    }
    const frontLayerSpammerList = [...frontLayerSpammer.list];
    frontLayerSpammerList.forEach((layer) =>
      layer.move(frontLayerSpammer.list)
    );
    character.updateState(
      frontLayerSpammer.list,
      worldSettings.gravity,
      app.view.height,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      deathCb
    );
  }

  async function popupButtonRestartHandler(popup: Popup): Promise<void> {
    app.ticker.start();
    await popup.hide();
    app.stage.removeChild(popup.popup);
  }

  const endPopup = new Popup(
    {
      bg: spritesheet.textures['popupBg.png'],
      title: spritesheet.textures['title.png'],
      text: spritesheet.textures['result.png'],
      button: spritesheet.textures['button.png'],
      buttonText: spritesheet.textures['restart.png'],
    },
    popupButtonRestartHandler
  );

  function deathCb(): void {
    app.ticker.stop();
    frontLayerSpammer.list.forEach((el) => {
      app.stage.removeChild(el);
    });
    initStartMap();
    frontLayerSpammer.resetFactory();
    character.reset();
    heavenlyBody.reset();
    endPopup.resetAlpha();
    endPopup.appendTo(app.stage);
  }

  // start popup
  async function popupButtonStartHandler(popup: Popup): Promise<void> {
    await popup.hide();
    character.gotoAndPlay(1);
    app.stage.removeChild(popup.popup);
    app.ticker.add(play);
  }
  const startPopup = new Popup(
    {
      bg: spritesheet.textures['popupBg.png'],
      title: spritesheet.textures['title.png'],
      text: spritesheet.textures['startRule.png'],
      button: spritesheet.textures['button.png'],
      buttonText: spritesheet.textures['start.png'],
    },
    popupButtonStartHandler
  );

  startPopup.appendTo(app.stage);
}
