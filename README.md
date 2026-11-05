# VeloxLab Studio

Static site for VeloxLab Studio. HTML, CSS, and one vanilla script. No framework and no build step.

## Run locally

From this folder:

```bash
python3 -m http.server 5173
```

Open http://127.0.0.1:5173/ and http://127.0.0.1:5173/es/

## Design

The visual system is Molten Ace: obsidian, bone, and amber. Headlines are Unbounded, body text is Manrope, accent words are Instrument Serif italic, and labels are JetBrains Mono. All four are self-hosted from Google Fonts (SIL Open Font License) in `assets/fonts/`.

The hero is a live 3D robot (see "3D stage" below). The poster in `assets/hero/` is the first paint and the fallback when WebGL is unavailable or `prefers-reduced-motion` is set. The earlier hero video loop is still in `assets/hero/` but no longer on the page. Every generated asset, with its prompt and job id, is in `prompts/asset-prompts.md`.

## 3D stage

`js/stage.js` draws one fixed WebGL canvas behind the whole page, and everything in it is driven by scroll position, so it also plays backwards:

1. The hero shows the robot chest up, holding its camera. Desktop loads `assets/3d/robot-hd.glb` (3.7 MB, full mesh, 4K textures); phones load `assets/3d/robot.glb` (2 MB, simplified, 2K textures). Both were generated with Higgsfield and compressed with gltf-transform.
2. Scrolling down dissolves it from the head down. Each piece that breaks off becomes a code glyph that snaps into a column and falls.
3. That code rain is the background for the rest of the page. It drifts with the content and runs faster on fast scrolls.
4. At the contact section the robot re-forms.

Each section is a station in `STATIONS`, with its own camera angle, distance, where the robot sits on screen, dissolve amount, rain strength and seam heat. Scroll blends between them, and the camera circles the scene once through the process section. The mouse turns the robot a little and shifts the camera. Section labels and small captions decode out of the same glyphs (`decode` in `js/main.js`).

Three.js is self-hosted as `js/vendor/three.bundle.js`, so the recommended `script-src 'self'` policy still holds. To rebuild it, bundle `three@0.169.0` plus the addons named in its header with esbuild (`--bundle --format=esm --minify`). The model uses only quantization and WebP textures, which need no WebAssembly decoder.

If the device is slow, the stage turns off bloom and lowers resolution after a few seconds.

## Motion

`js/main.js` has two parts: the original page logic (nav, forms, video controls) and a motion layer. The motion layer adds:

- Lenis smooth scrolling (`js/vendor/lenis.min.js`, MIT) with eased anchor jumps
- a hero intro, scroll-out (the frame shrinks and the words drift apart), ember particles, film grain and a cursor glow
- a services marquee built from the service names on the page, numbered section labels taken from the nav, and serif accents on headings
- word-by-word heading reveals, staggered reveals for content, the process progress line and a rising footer watermark
- a custom cursor, magnetic buttons and card tilt on mouse and trackpad only

The decorative parts are injected by script, so EN and ES share the same code. Reduced motion turns all of it off.

## Copy

Headlines and the offer titles come from the Molten Ace style guide. Strings the guide did not translate stay in English on `/es/` and are marked `COPY TODO`.

Reel, selected work, the real-estate outcomes, the creative-half loop, the `[X] days` turnaround, and the Cal.com slot are placeholders. Do not add stats or a made-up WhatsApp number.

The brand name is always **VeloxLab**.

## Contact

Both forms check required fields and a honeypot (`company_website`). They do not submit anywhere. The hand-off is marked `TODO(owner)` in `js/main.js`.

`#booking` is an empty slot for a Cal.com embed. Do not add the embed script until the owner supplies the link.

## Hosting

Hosting is not chosen. Do not add deploy config. Recommended headers and cache policy are in `docs/security-headers.md`.
