/**
 * @typedef {object} EffectConfig
 * @property {boolean} isColor - Determines if the noise is colored or grayscale.
 * @property {number} grainSize - The size of the pixel blocks (e.g., 1 for fine, 4 for coarse).
 * @property {number} updateInterval - The number of animation frames to wait before drawing the next pre-generated frame. 0 means update every frame.
 */

/**
 * Creates a canvas noise effect based on the provided configuration.
 * This factory handles frame generation, animation looping, and resizing logic.
 * @param {EffectConfig} config - The configuration object for the effect.
 * @returns {(canvas: HTMLCanvasElement) => {start: function, stop: function, resize: function}} A function that takes a canvas and returns an effect instance.
 */
export function createEffect(config) {
  return function(canvas) {
    const ctx = canvas.getContext('2d', { alpha: false });
    const state = {
      frameCount: 10, // Number of pre-generated noise frames
      frames: [],
      currentFrame: 0,
      frameCounter: 0,
      animationFrameId: null,
    };

    /**
     * Generates a set of noise frames and stores them in memory.
     * This pre-computation makes the animation loop very fast.
     */
    const generateFrames = () => {
      state.frames = [];
      const { width, height } = canvas;

      for (let i = 0; i < state.frameCount; i++) {
        const buffer = new ArrayBuffer(width * height * 4);
        const buffer32 = new Uint32Array(buffer);

        for (let y = 0; y < height; y += config.grainSize) {
          for (let x = 0; x < width; x += config.grainSize) {
            // Determine the random color for the block
            let pixelColor;
            if (config.isColor) {
              pixelColor = (255 << 24) | (Math.random() * 0x1000000);
            } else {
              const gray = Math.random() * 255;
              pixelColor = (255 << 24) | (gray << 16) | (gray << 8) | gray;
            }

            // Fill the block with the determined color
            for (let blockY = y; blockY < y + config.grainSize && blockY < height; blockY++) {
              for (let blockX = x; blockX < x + config.grainSize && blockX < width; blockX++) {
                buffer32[blockY * width + blockX] = pixelColor;
              }
            }
          }
        }
        state.frames.push(new ImageData(new Uint8ClampedArray(buffer), width, height));
      }
    };

    /**
     * The main animation loop. It draws a pre-generated frame to the canvas
     * at the interval specified in the config.
     */
    const animate = () => {
      state.animationFrameId = requestAnimationFrame(animate);
      state.frameCounter++;

      if (state.frameCounter >= config.updateInterval) {
        state.frameCounter = 0;
        ctx.putImageData(state.frames[state.currentFrame], 0, 0);
        state.currentFrame = (state.currentFrame + 1) % state.frameCount;
      }
    };

    /**
     * Sets the canvas dimensions and regenerates frames.
     * This is used for initialization and on window resize.
     */
    const setup = () => {
      // For coarse effects, we can use a smaller canvas and let CSS scale it up,
      // which is more performant.
      const scale = config.grainSize > 1 ? config.grainSize : 1;
      canvas.width = Math.floor(window.innerWidth / scale);
      canvas.height = Math.floor(window.innerHeight / scale);
      generateFrames();
    };

    return {
      start: () => {
        setup();
        animate();
      },
      stop: () => {
        if (state.animationFrameId) {
          cancelAnimationFrame(state.animationFrameId);
          state.animationFrameId = null;
        }
      },
      resize: setup,
    };
  };
}
