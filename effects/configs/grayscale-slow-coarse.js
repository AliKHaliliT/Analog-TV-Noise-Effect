import { createEffect } from '../effect-creator.js';

const config = {
  isColor: false,
  grainSize: 4,
  updateInterval: 5,
};

export default createEffect(config);