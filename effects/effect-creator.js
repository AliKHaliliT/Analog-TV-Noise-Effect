/**
 * @typedef {object} EffectConfig
 * @property {boolean} isColor - Determines if the noise is colored or grayscale.
 * @property {number} grainSize - The size of the pixel blocks (e.g., 1 for fine, 4 for coarse).
 * @property {number} updateInterval - The number of animation frames to wait before drawing the next pre-generated frame. 0 means update every frame.
 * @property {boolean} [withSound=false] - Determines if static audio noise should be played.
 * @property {number} [soundVolume=0.05] - The volume for the static audio noise (0.0 to 1.0).
 */

// This self-contained string defines the audio processor that generates white noise.
// It runs in a separate thread for performance.
const noiseProcessorCode = `
  class NoiseProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
      const output = outputs[0];
      // Fill each channel's buffer with random values between -1.0 and 1.0
      output.forEach(channel => {
        for (let i = 0; i < channel.length; i++) {
          channel[i] = Math.random() * 2 - 1;
        }
      });
      // Return true to keep the processor alive.
      return true;
    }
  }
  registerProcessor("noise-processor", NoiseProcessor);
`;

/**
 * Creates a canvas noise effect based on the provided configuration.
 * This factory handles frame generation, animation looping, and resizing logic.
 * @param {EffectConfig} config - The configuration object for the effect.
 * @returns {(canvas: HTMLCanvasElement) => {start: function, stop: function, resize: function}} A function that takes a canvas and returns an effect instance.
 */
export function createEffect(config) {
  // Set default values for new audio properties
  const finalConfig = {
    withSound: false,
    soundVolume: 0.05,
    ...config,
  };

  return function(canvas) {
    const ctx = canvas.getContext("2d", { alpha: false });
    const state = {
      frameCount: 10,
      frames: [],
      currentFrame: 0,
      frameCounter: 0,
      animationFrameId: null,
      audioContext: null, // To hold our audio context
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

        for (let y = 0; y < height; y += finalConfig.grainSize) {
          for (let x = 0; x < width; x += finalConfig.grainSize) {
            let pixelColor;
            if (finalConfig.isColor) {
              pixelColor = (255 << 24) | (Math.random() * 0x1000000);
            } else {
              const gray = Math.random() * 255;
              pixelColor = (255 << 24) | (gray << 16) | (gray << 8) | gray;
            }

            for (let blockY = y; blockY < y + finalConfig.grainSize && blockY < height; blockY++) {
              for (let blockX = x; blockX < x + finalConfig.grainSize && blockX < width; blockX++) {
                buffer32[blockY * width + blockX] = pixelColor;
              }
            }
          }
        }
        state.frames.push(new ImageData(new Uint8ClampedArray(buffer), width, height));
      }
    };

    /**
     * The main animation loop.
     */
    const animate = () => {
      state.animationFrameId = requestAnimationFrame(animate);
      state.frameCounter++;

      if (state.frameCounter >= finalConfig.updateInterval) {
        state.frameCounter = 0;
        ctx.putImageData(state.frames[state.currentFrame], 0, 0);
        state.currentFrame = (state.currentFrame + 1) % state.frameCount;
      }
    };

    /**
     * Sets the canvas dimensions and regenerates frames.
     */
    const setup = () => {
      const scale = finalConfig.grainSize > 1 ? finalConfig.grainSize : 1;
      canvas.width = Math.floor(window.innerWidth / scale);
      canvas.height = Math.floor(window.innerHeight / scale);
      generateFrames();
    };

    /**
     * Initializes the Web Audio API and starts the noise.
     */
    const setupAudio = async () => {
      if (!finalConfig.withSound || state.audioContext) return;

      try {
        // Create an AudioContext. It must be created after a user interaction
        // on some browsers, but we attempt it here.
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create a GainNode for volume control
        const gainNode = state.audioContext.createGain();
        gainNode.gain.setValueAtTime(finalConfig.soundVolume, state.audioContext.currentTime);
        gainNode.connect(state.audioContext.destination);

        // Load the noise processor worklet
        const blob = new Blob([noiseProcessorCode], { type: "application/javascript" });
        const workletURL = URL.createObjectURL(blob);
        await state.audioContext.audioWorklet.addModule(workletURL);
        
        // Create the node and connect it to the gain node (volume)
        const noiseNode = new AudioWorkletNode(state.audioContext, "noise-processor");
        noiseNode.connect(gainNode);

      } catch (e) {
        console.error("Could not initialize Web Audio:", e);
        if (state.audioContext) {
            state.audioContext.close();
            state.audioContext = null;
        }
      }
    };


    return {
      start: async () => {
        setup();
        animate();
        // Start the audio if configured to do so
        await setupAudio();
      },
      stop: () => {
        if (state.animationFrameId) {
          cancelAnimationFrame(state.animationFrameId);
          state.animationFrameId = null;
        }
        // Close the audio context to stop sound and free resources
        if (state.audioContext) {
          state.audioContext.close().then(() => {
            state.audioContext = null;
          });
        }
      },
      resize: setup,
    };
  };
}