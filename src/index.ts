import * as PIXI from 'pixi.js';
import { main } from './main';

// test2

import './index.scss';

const app = new PIXI.Application({
  width: 800,
  height: 600,
  transparent: true,
});

app.stage.sortableChildren = true;

document.body.appendChild(app.view);
app.loader.add('./src/assets/sprites.json').load(() => main(app));
