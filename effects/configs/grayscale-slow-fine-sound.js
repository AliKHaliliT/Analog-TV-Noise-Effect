import { createEffect } from '../effect-creator.js';

const config = {
  isColor: false,
  grainSize: 1,
  updateInterval: 5,
  withSound: true,
  soundVolume: 0.05,
};

export default createEffect(config);