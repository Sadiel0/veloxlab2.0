# VeloxLab Studio

Static landing page for VeloxLab Studio. HTML, CSS, and vanilla JS. No build step and no framework.

## Run locally

From this folder:

```bash
python3 -m http.server 5173
```

Open http://127.0.0.1:5173/

Use a static file server. Opening `index.html` as a file will not load the ES module hero.

## Copy

Final headlines are not written yet. Visible draft strings that still need the designer are marked `[Placeholder]` and `<!-- COPY TODO -->`, and the nodes carry `data-copy`. Search this repo for `COPY TODO`.

Two offer titles are final and should not be rewritten: **Creative for your business** and **Development for your needs**.

Do not add stats, client counts, or other made-up numbers. The brand name is always **VeloxLab**, never Velox.

## English and Spanish

`index.html` is the English page (`lang="en"`). Spanish is not built. When it is, add `es/index.html` that reuses `styles.css` and `js/`, translate each `data-copy` node, and only then add `<link rel="alternate" hreflang="es">`. Do not point hreflang at a missing URL.

## Contact and booking

The contact form checks required fields and a honeypot (`company_website`). It does not submit anywhere. The hand-off is marked `TODO(owner)` in `js/main.js`.

`#booking` is an empty slot for a Cal.com embed. Do not add the embed script until the owner supplies the link.

## Hosting

Hosting is not chosen. Do not add deploy config. Recommended headers and cache policy are in `docs/security-headers.md`.
