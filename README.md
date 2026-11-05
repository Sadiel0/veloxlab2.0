# VeloxLab Studio

Static site for VeloxLab Studio. HTML, CSS, and one vanilla script. No framework and no build step.

## Run locally

From this folder:

```bash
python3 -m http.server 5173
```

Open http://127.0.0.1:5173/ and http://127.0.0.1:5173/es/

## Design

The visual system is Molten Ace: obsidian, bone, and amber. Headlines are Unbounded and body text is Manrope, self-hosted from Google Fonts (SIL Open Font License) in `assets/fonts/`.

The hero is a muted, ping-pong video (`assets/hero/`). The live 3D figure is a later phase and is not on the page. `prefers-reduced-motion` shows the still from `D1-keyart` instead of the video.

## Copy

Headlines and the offer titles come from the Molten Ace style guide. Strings the guide did not translate stay in English on `/es/` and are marked `COPY TODO`.

Reel, selected work, the real-estate outcomes, the creative-half loop, the `[X] days` turnaround, and the Cal.com slot are placeholders. Do not add stats or a made-up WhatsApp number.

The brand name is always **VeloxLab**.

## Contact

Both forms check required fields and a honeypot (`company_website`). They do not submit anywhere. The hand-off is marked `TODO(owner)` in `js/main.js`.

`#booking` is an empty slot for a Cal.com embed. Do not add the embed script until the owner supplies the link.

## Hosting

Hosting is not chosen. Do not add deploy config. Recommended headers and cache policy are in `docs/security-headers.md`.
