# VeloxLab Studio

Static site for VeloxLab Studio. HTML, CSS, and vanilla scripts. No framework and no build step.

## Run locally

From this folder:

```bash
python3 -m http.server 5173
```

Open http://127.0.0.1:5173/ and http://127.0.0.1:5173/es/

## Design

The visual system is Molten Ace: obsidian, bone, and amber. Headlines are Unbounded and body text is Manrope, both self-hosted from Google Fonts (SIL Open Font License) in `assets/fonts/`.

The hero is a live 3D robot (see "3D stage" below). The poster in `assets/hero/` is the first paint and the fallback when WebGL is unavailable or `prefers-reduced-motion` is set. The earlier hero video loop is still in `assets/hero/` but no longer on the page. Every generated asset, with its prompt and job id, is in `prompts/asset-prompts.md`.

## 3D stage

`js/stage.js` draws one fixed WebGL canvas behind the whole page, and everything in it is driven by scroll position, so it also plays backwards:

1. The hero shows the robot chest up, holding its camera. Desktop loads `assets/3d/robot-hd.glb` (3.7 MB, full mesh, 4K textures); phones load `assets/3d/robot.glb` (2 MB, simplified, 2K textures). Both were generated with Higgsfield and compressed with gltf-transform.
2. Scrolling down dissolves it from the head down. Each piece that breaks off becomes a code glyph that snaps into a column and falls.
3. The rain falls away as the page begins and stays only as a faint presence behind the content. Scrolling back up re-forms the robot.

Each section is a station in `STATIONS`, with its own camera angle, distance, where the robot sits on screen, dissolve amount, rain strength and seam heat. Scroll blends between them. The mouse turns the robot a little and shifts the camera.

Three.js is self-hosted as `js/vendor/three.bundle.js`, so the recommended `script-src 'self'` policy still holds. To rebuild it, bundle `three@0.169.0` plus the addons named in its header with esbuild (`--bundle --format=esm --minify`). The model uses only quantization and WebP textures, which need no WebAssembly decoder.

If the device is slow, the stage turns off bloom and lowers resolution after a few seconds.

## Motion

The site follows the motion rules in `design/style-guide.md` §8: one orchestrated hero moment and restraint everywhere else. `js/main.js` ends with a small signature layer:

- Lenis smooth scrolling (`js/vendor/lenis.min.js`, MIT) with eased anchor jumps
- the hero entrance: CREATE and GROW slide in from the left, BUILD from the right, then the subline and Play reel fade in
- the hero words drifting apart (up to 6vw) as the robot dissolves
- a 1px amber ring in the nav pill that slides to the section in view, and the process line that fills as the steps enter

Nothing else animates. Body text never moves. Reduced motion turns all of it off.

## Copy

Homepage wording comes from `design/copy-v3.md` (v3.2). `design/style-guide.md` (v2.2) owns design, layout, tokens, and motion. Where the two disagree on copy, v3.2 wins. The brand name is always **VeloxLab**. Spanish uses usted. Do not add stats, prices, or a made-up WhatsApp number.

Unknowns are written `[PLACEHOLDER: …]`. Every element that holds one has `data-placeholder="P##"`. Prices (P10) are left off the page on purpose. Spec-ad delivery is 5 days and the reply time is 24 hours. Those are real values from v3.2. The first-cut and demo turnaround (P07) stays a placeholder.

Cal.com URLs, the WhatsApp link, the contact email, the social profile URLs, and the form endpoint live only in `js/config.js` as `window.VELOX_CONFIG`. The pages point at those keys with `data-config`. `js/main.js` copies them onto the controls. Replace `formEndpoint` with a real `https://` URL before leads can send. The provider is not chosen. The POST is JSON (`Accept` and `Content-Type` `application/json`), which Formspree and Web3Forms both accept.

A form shows its thank-you text only after that POST returns a 2xx status. While the endpoint is still unset, or the request fails, the form shows an error with the WhatsApp and email links and does not show the thank-you. `node --test scripts/form-submit.test.mjs` covers that rule.

Before a production deploy, run:

```bash
npm run check:placeholders
```

That runs `node scripts/check-placeholders.mjs`. It exits with an error if `index.html`, `es/index.html`, `privacy.html`, `styles.css`, or any file in `js/` still contains a `data-placeholder` attribute or the tokens `PLACEHOLDER` or `PROPOSED`. It does not read this README or `docs/`, which name those tokens on purpose. The check is the launch gate. It is not wired to a host.

### Guarantee and limited spots (P16, P17)

Sadiel confirmed the guarantee lines, so they are visible on every host, including production. Those sentences have no placeholder.

The limited-spots lines stay preview-only. The client and build counts inside them are still `[PLACEHOLDER: number]` (P17), so the launch check keeps failing until those numbers are filled in.

`showLimitedSpots` in `js/config.js` is the production switch for those lines only. It is `false`. Set that one line to `true` to show them on veloxlab.studio.

While the switch is off, `js/commitments.js` reveals the limited-spots lines (`data-preview-only`) only when:

- the URL has `?preview=1`, or
- `preview` is not `0` and the hostname is not `veloxlab.studio` or `www.veloxlab.studio`.

`?preview=0` hides the limited-spots lines on every host, including localhost. On `veloxlab.studio` they stay hidden unless the switch is `true` or the URL has `?preview=1`. The guarantee lines are not affected.

## Contact

Both forms check required fields and a honeypot (`company_website`). A filled honeypot is dropped and is not treated as a success. There is no Cal.com embed script. The booking buttons use the Cal.com URLs from `js/config.js`.

## What ships

These files are in git and are what the pages load:

- Hero clip: `assets/hero/hero-1080.mp4`, `hero-1080.webm`, `hero-720.mp4`, `hero-720.webm`
- Poster and reduced-motion still: `assets/hero/poster.webp`, `assets/hero/poster.avif`
- Logos: `assets/logo/veloxlab-primary.svg`, `veloxlab-icon.svg`, `veloxlab-watermark.svg`
- Favicon: `favicon.svg`
- Social image: `assets/og.jpg`
- Fonts: `assets/fonts/`

## Design source

`design/` is source and must not be deployed.

`design/` holds the copy and the style guide. The pages do not link to it.

- `design/style-guide.md` is the v2.2 guide (design, layout, tokens, motion)
- `design/copy-v3.md` is the v3.2 homepage copy. It wins wherever the guide still shows older wording.

There is no separate web root yet, because hosting is not chosen and the local server is the repo folder. `design/` can be fetched during that local preview. It is not part of the site. When a host is chosen, publish the HTML, CSS, `js/`, `favicon.svg`, and `assets/` only. Leave `design/` out of that bundle. Do not add a deploy config for this.

## Hosting

Hosting is not chosen. Do not add deploy config. Recommended headers and cache policy are in `docs/security-headers.md`.
