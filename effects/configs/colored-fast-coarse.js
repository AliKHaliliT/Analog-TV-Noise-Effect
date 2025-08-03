import { createEffect } from '../effect-creator.js';

const config = {
  isColor: true,
  grainSize: 4,
  updateInterval: 0, // 0 updates every frame for "fast"
};

export default createEffect(config);