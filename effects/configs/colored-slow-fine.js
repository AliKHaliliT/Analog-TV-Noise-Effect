import { createEffect } from '../effect-creator.js';

const config = {
  isColor: true,
  grainSize: 1,
  updateInterval: 5,
};

export default createEffect(config);