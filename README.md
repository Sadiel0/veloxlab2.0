# VeloxLab Studio

Static site for VeloxLab Studio. HTML, CSS, and vanilla scripts. No framework and no build step.

## Run locally

From this folder:

```bash
python3 -m http.server 5173
```

Open http://127.0.0.1:5173/ and http://127.0.0.1:5173/es/

## Design

The visual system is Molten Ace: obsidian, bone, and amber. Headlines are Unbounded and body text is Manrope, self-hosted from Google Fonts (SIL Open Font License) in `assets/fonts/`.

The hero is a muted, ping-pong video in `assets/hero/` (`hero-1080` and `hero-720`, MP4 and WebM). The live 3D figure is a later phase and is not on the page. `prefers-reduced-motion` shows `assets/hero/poster.webp` (AVIF alongside it), made from the key art.

## Copy

Copy follows the Molten Ace style guide v2.1. The brand name is always **VeloxLab**. Nav labels, the process steps, and the bilingual quote stay in English on `/es/` because the guide did not supply Spanish for them. Do not add stats, prices, or a made-up WhatsApp number.

Unknowns are written `[PLACEHOLDER: …]`. Business commitments use `[PROPOSED - Sadiel to approve]`. Every element that holds one of those has `data-placeholder="P##"` (P01–P19 in the guide). Prices (P10) are left off the page on purpose.

Cal.com URLs, the WhatsApp link, the contact email, the social profile URLs, and the form endpoint live only in `js/config.js` as `window.VELOX_CONFIG`. The pages point at those keys with `data-config`. `js/main.js` copies them onto the controls. Keep `ready` set to `false` until every string in that file is a real value.

Before a production deploy, run:

```bash
npm run check:placeholders
```

That runs `node scripts/check-placeholders.mjs`. It exits with an error if `index.html`, `es/index.html`, `privacy.html`, `styles.css`, or any file in `js/` still contains a `data-placeholder` attribute or the tokens `PLACEHOLDER` or `PROPOSED`. It does not read this README or `docs/`, which name those tokens on purpose. The check is the launch gate. It is not wired to a host.

### Guarantee and scarcity (P16, P17)

The guarantee and scarcity lines stay in the HTML so this check keeps failing until Sadiel approves them. Visitors do not see them on the production host.

`js/main.js` reveals elements marked `data-preview-only` only when:

- the URL has `?preview=1`, or
- `preview` is not `0` and the hostname is not `veloxlab.studio` or `www.veloxlab.studio`.

`?preview=0` hides them on every host, including localhost. On `veloxlab.studio` they stay hidden unless the URL has `?preview=1`. A preview is not an approval. After Sadiel approves the wording, replace the proposed text (or delete the line), remove `data-preview-only` and `hidden` if the line should ship, and remove `data-placeholder` so the check can pass.

## Contact

Both forms check required fields and a honeypot (`company_website`). They do not POST while `ready` is false in `js/config.js`. There is no Cal.com embed script. The booking buttons use the Cal.com URLs from that same file.

## What ships

These files are in git and are what the pages load:

- Hero clip: `assets/hero/hero-1080.mp4`, `hero-1080.webm`, `hero-720.mp4`, `hero-720.webm`
- Poster and reduced-motion still: `assets/hero/poster.webp`, `assets/hero/poster.avif`
- Logos: `assets/logo/veloxlab-primary.svg`, `veloxlab-icon.svg`, `veloxlab-watermark.svg`
- Favicon: `favicon.svg`
- Social image: `assets/og.jpg`
- Fonts: `assets/fonts/`

## Design source

`design/` is the source for that work. The pages do not link to it.

- `design/style-guide.md` is the v2.1 guide
- `design/mockups/home-desktop-molten.jpg`, `home-mobile-molten.jpg`, `D1-mockup.jpg`, `offers-split.jpg`
- `design/keyart/D1-keyart.jpg` is the original still. The site uses the smaller poster above.
- `design/source/hero-loop-molten.mp4` is the raw loop. The site plays the re-encoded files in `assets/hero/`.

There is no separate web root yet, because hosting is not chosen and the local server is the repo folder. `design/` can be fetched during that local preview. It is not part of the site. When a host is chosen, publish the HTML, CSS, `js/`, `favicon.svg`, and `assets/` only. Leave `design/` out of that bundle. Do not add a deploy config for this.

## Hosting

Hosting is not chosen. Do not add deploy config. Recommended headers and cache policy are in `docs/security-headers.md`.
