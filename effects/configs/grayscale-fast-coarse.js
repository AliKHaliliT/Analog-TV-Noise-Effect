import { createEffect } from '../effect-creator.js';

const config = {
  isColor: false,
  grainSize: 4,
  updateInterval: 0,
};

export default createEffect(config);