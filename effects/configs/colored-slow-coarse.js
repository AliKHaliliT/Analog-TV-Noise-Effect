import { createEffect } from '../effect-creator.js';

const config = {
  isColor: true,
  grainSize: 4,
  updateInterval: 5, // Higher interval means "slower"
};

export default createEffect(config);