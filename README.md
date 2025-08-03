# Analog TV Noise Effect 📺
<div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px;">
    <img src="https://img.shields.io/github/license/AliKHaliliT/Analog-TV-Noise-Effect" alt="License">
    <img src="https://img.shields.io/github/last-commit/AliKHaliliT/Analog-TV-Noise-Effect" alt="Last Commit">
    <img src="https://img.shields.io/github/issues/AliKHaliliT/Analog-TV-Noise-Effect" alt="Open Issues">
</div>
<br/>
This project is a lightweight, performant, and customizable generator for animated analog TV noise effects using HTML Canvas and modern JavaScript. It leverages pre-computation and a modular factory pattern to create various styles of static, from fine-grained grayscale fuzz to coarse, colorful snow, with optional synchronized audio.

A live demo is hosted on GitHub Pages.

**[View Live Demo](https://alikhalilit.github.io/Analog-TV-Noise-Effect/)**

-----

## Features

  * **High Performance:** Uses pre-rendered frames and `requestAnimationFrame` for a smooth, CPU-friendly visual animation loop.
  * **Immersive Audio:** Includes an optional and synchronized static audio hiss generated via the **Web Audio API** for a more complete experience.
  * **Highly Customizable:** Easily create new effects by defining a simple configuration object.
      * **Visuals:** Grayscale or full color, fine or coarse grain, and variable animation speed.
      * **Audio:** Enable or disable sound and control its volume.
  * **Modular Design:** Effects are created via a central factory, `effect-creator.js`.
  * **Responsive:** The canvas automatically resizes to fill the viewport.
  * **Modern JavaScript:** Built with ES Modules and a performant `AudioWorklet` for non-blocking sound generation.
  * **Demo:** Includes a straightforward interface to switch between presets and toggle fullscreen mode.

-----

## How It Works

The core of the project is the `effect-creator.js` module, which acts as a factory for generating noise effects.

1.  **Configuration:** Each effect (e.g., `grayscale-fast-coarse-sound.js`) is a configuration file that specifies properties for visuals (`isColor`, `grainSize`, `updateInterval`) and audio (`withSound`, `soundVolume`).

2.  **Effect Factory (`createEffect`):** This function takes a configuration object and returns another function. This returned function, when given a `<canvas>` element, initializes the effect.

3.  **Frame Pre-computation:** To ensure high performance, the factory pre-generates a set number of visual noise frames (as `ImageData` objects) and stores them in an array. This avoids costly per-frame pixel manipulation during the animation.

4.  **Animation Loop (`animate`):** A `requestAnimationFrame` loop cycles through the pre-generated frames. The `updateInterval` config determines how many browser frames to wait before drawing the next noise frame, controlling the animation's "speed".

5.  **Audio Generation:** When enabled, the effect uses the **Web Audio API**. An `AudioWorklet` generates white noise in a separate, high-priority audio thread, ensuring that sound playback is smooth and doesn't block the main UI thread. This audio is synchronized to start and stop with the visual effect.

-----

## Project Structure

```
.
├── docs/
│   └── index.html              # Demo page served by GitHub Pages
└── effects/
    ├── configs/                # Configuration files for visual effects
    │   ├── colored-fast-coarse.js
    │   ├── colored-fast-fine.js
    │   ├── colored-slow-coarse.js
    │   ├── colored-slow-fine.js
    │   ├── grayscale-fast-coarse-sound.js
    │   ├── grayscale-fast-fine-sound.js
    │   ├── grayscale-slow-coarse-sound.js
    │   └── grayscale-slow-fine-sound.js
    └── effect-creator.js      # Core factory for creating effects
```

-----

## Getting Started

Because this project uses ES Modules, you need to run it from a local web server. You cannot just open `docs/index.html` directly in your browser from the file system.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/AliKHaliliT/Analog-TV-Noise-Effect.git
    cd Analog-TV-Noise-Effect
    ```

2.  **Start a local server:**
    If you have Node.js, you can use a simple package like `http-server`.

    ```bash
    # Install the server (if you don't have it)
    npm install -g http-server

    # Run the server from the project's root directory
    http-server .
    ```

    Alternatively, you can use the **Live Server** extension in VS Code.

3.  **View in browser:**
    Open your browser and navigate to the local address provided by your server (e.g., `http://localhost:8080/docs/`).

-----

## How to Create a Custom Effect

Creating a new effect variation is simple:

1.  **Create a new config file** in the `effects/configs/` directory. For example, `my-custom-effect.js`.

2.  **Define your effect's configuration** inside the new file.

    ```javascript
    // effects/configs/my-custom-effect.js
    import { createEffect } from '../effect-creator.js';

    // A slow, coarse, grayscale effect with sound
    const config = {
      isColor: false,
      grainSize: 8,         // Very large blocks
      updateInterval: 10,     // Update every 10 frames
      withSound: true,        // Enable audio noise
      soundVolume: 0.08,      // Set a custom volume (0.0 to 1.0)
    };

    export default createEffect(config);
    ```

3.  **Add it to the demo page**. Open `docs/index.html` and add your new effect to the `EFFECTS_CONFIG` array.

    ```javascript
    const EFFECTS_CONFIG = [
      { name: "Colored - Fast & Coarse", file: "colored-fast-coarse.js" },
      // ... existing effects
      { name: "My Custom Effect", file: "my-custom-effect.js" } // Add your new effect here
    ];
    ```

That's it\! Your new effect will now appear in the dropdown selector.

-----

## Beyond the Canvas

While this demo is built using the HTML Canvas 2D API, the core logic is highly portable. The `generateFrames` function in `effect-creator.js` works by manipulating a raw pixel buffer (`Uint32Array`).

This means you can adapt the noise generation logic for use in any environment that allows for pixel manipulation. The fundamental algorithm for creating the blocky, random noise remains the same wherever you choose to implement it.

-----

## License

This work is under an [MIT](https://choosealicense.com/licenses/mit/) License.