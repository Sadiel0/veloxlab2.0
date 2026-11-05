# VeloxLab Studio — baseline quality audit

Audit of the first draft (`050d5e3`, `index.html` and the four scripts) before the foundations edits. Lab only. The site is not deployed, so there is no CrUX field data and these numbers are not a p75.

## Conditions

| Item | Value |
| --- | --- |
| URL | `http://127.0.0.1:5173/` served by `python3 -m http.server` |
| Date | 2026-11-05 |
| Browser | Chrome 156.0.8078.47, headless, SwiftShader (`ANGLE` / `SwiftShader Device (Subzero)`) |
| Lighthouse | 12, categories performance, accessibility, best-practices, SEO |
| Mobile | Lighthouse mobile emulation, 412×823, DPR 1.75, 4× CPU |
| Desktop | Lighthouse desktop preset |
| Layout pass | Puppeteer, widths 375, 768, 1280, 1920 |

SwiftShader runs WebGL on the CPU. Frame times here are worse than a phone GPU. They are still evidence that the shader loops do not survive a slow GPU.

## Evidence

| Signal | Scope / conditions | Result | Source |
| --- | --- | --- | --- |
| Lighthouse performance | Mobile, lab | **43**. FCP 2.2s, LCP **4.3s**, TBT **161,620ms**, CLS **0**, SI 13.5s | `/tmp/vlx-before/lh-mobile.report.json` |
| Lighthouse performance | Desktop, lab | **59**. FCP 0.5s, LCP **1.0s**, TBT **35,680ms**, CLS **0.024**, SI 11.1s | `/tmp/vlx-before/lh-desktop.report.json` |
| Lighthouse accessibility | Mobile and desktop | **96** both | Same reports |
| Lighthouse best practices | Mobile and desktop | **96** both | Same reports |
| Lighthouse SEO | Mobile and desktop | **100** both. This score does not check Open Graph, JSON-LD, or a missing sitemap | Same reports |
| LCP element | Mobile | `h1.hero-title` (“Fast work that looks expensive.”). TTFB ~0.45s (10%), render delay **3.87s (90%)** | `largest-contentful-paint-element` |
| Long tasks | Mobile trace | 20 long tasks, all `js/media.js`. Longest **5,841ms** at ~4.2s. Later tasks ~600ms each through ~175s | `long-tasks` |
| Main thread | Mobile | 179.8s, almost all grouped as “other” on `js/media.js` (shader frames, not script parse) | `mainthread-work-breakdown`, `bootup-time` |
| Third party | Mobile | jsDelivr Three.js ~1,280ms main thread, 261KB. Google Fonts CSS render-blocking ~770ms. Lenis ~4KB, negligible | `third-party-summary`, `render-blocking-resources` |
| Console | 375 / 768 / 1280 / 1920, 2.5s after load | One error: `favicon.ico` **404**. No `pageerror`. No other warnings captured | Puppeteer console log |
| Horizontal overflow | Those four widths | `scrollWidth - clientWidth = 0` at each | Puppeteer |
| Contrast | Footer “© 2026 VELOXLAB STUDIO · MIAMI” | **4.22:1**, `#6b7480` on `#07080b`, 12px. Needs 4.5:1 | Lighthouse `color-contrast`; matches a manual WCAG calc (4.23) |
| WebGL | All four widths | Unmasked renderer SwiftShader. 8 canvases (hero + 7 tiles) | Puppeteer |
| Tap targets while VELO is `hidden` | All four widths | Close control measured 35×35 and choice rows ~37px tall | Puppeteer. The widget is `scale(0.8)` in that state (`styles.css` `.velo[data-state="hidden"]`). 44×0.8 ≈ 35. Not a visible-target failure |
| CrUX / field LCP, INP, CLS | Origin | Not available. Site is not public | — |

## Issues

Line numbers are the draft at `050d5e3`.

### High

1. **Performance — media shader loops block the main thread.** `js/media.js:230-238` keeps a `requestAnimationFrame` loop and draws every visible tile. On this lab machine one draw is hundreds of milliseconds, and Lighthouse scrolls the page so a tile stays visible for the whole trace. Mobile TBT 161s and desktop TBT 35s are measured, and they are SwiftShader-inflated. A real GPU will be faster. The cost model (several full-viewport fragment shaders, plus a Three.js transmission hero) is still a poor phone budget. Evidence: measured.
2. **Performance — LCP render delay.** `styles.css:277` starts `.reveal` at `opacity: 0`. The hero `h1` (`index.html:51`) uses that class, so the largest text is invisible until `js/main.js` adds `.in`. Lighthouse: 90% of the 4.3s mobile LCP is render delay. `js/main.js` is also behind the deferred Lenis script (`index.html:279`). Evidence: measured.
3. **Performance — Three.js hero downloads and starts immediately, including on phones.** `js/hero.js:2-7` static-imports Three and the postprocessing passes. `js/hero.js:194` calls `init()` as soon as the module runs. Reduced motion still builds the scene and renders a frame (`js/hero.js:177-180`). The next design replaces this hero with video, so the fix is to not let it run on small screens or reduced motion, and to import it after first paint. Evidence: measured bootup (`hero.js` ~523ms scripting, `three.module.js` ~1,280ms) plus code path.
4. **Accessibility — body text fails AA.** `--ink-3: #6b7480` (`styles.css:11`) on `--bg` is 4.22:1 at 12px. Lighthouse flagged the footer (`index.html:220`). The same token colors `.sec-meta`, `.scroll-cue`, and the social row. Evidence: measured.
5. **Accessibility — no skip link, and the assistant stays in the tab order while hidden.** There is no skip link in `index.html`. `.velo` uses `pointer-events: none` when hidden (`styles.css:284`) but the buttons stay focusable. Puppeteer listed those controls while `data-state="hidden"`. Evidence: measured for the focusable controls; skip link is source inspection.
6. **Accessibility — form errors are color only.** `js/main.js:63-66` toggles `.bad`. `styles.css:242` turns the border amber. Nothing sets `aria-invalid` or writes an error message. The amber contrast itself passes; the failure is that color is the only cue and it is not announced. Evidence: source inspection (Lighthouse did not flag it).

### Medium

7. **SEO — tags the Lighthouse SEO category does not require.** No canonical, Open Graph, Twitter card, or JSON-LD. `robots.txt` and `sitemap.xml` are absent (Lighthouse treats a missing robots file as not applicable, so SEO stayed 100). `index.html` has a title (50 characters) and a description (125 characters). Evidence: source inspection.
8. **Structure — missing about, and contact is not a form.** Sections cover hero, work, services, offers, process, contact. There is no about section. Contact (`index.html:204-215`) is a `href="#"` book link and a mailto. `js/main.js:76-80` prevents the book click and scrolls back to contact. No Cal.com slot. Evidence: source inspection.
9. **Forms — no honeypot, no submit target.** `js/main.js:71` has a TODO and does not send the form. There is no spam field. Evidence: source inspection.
10. **Copy — realtor-only lines and a made-up stat.** Hero readout shows a hardcoded **60 FPS** (`index.html:43-47`). Work meta says “04 pieces” (`index.html:74`). Featured and clip copy say “Real estate push-in” (`index.html:82`, `index.html:93`). Services say “listing videos” (`index.html:130`). The form placeholder says “Velox Realty” (`index.html:167`). The brand on the lockup is already VeloxLab. Evidence: source inspection.
11. **Best practices — favicon 404.** Console error for `/favicon.ico`. No icon is linked. Evidence: measured.
12. **Performance — render-blocking fonts.** `index.html:10` Google Fonts stylesheet, ~770ms on mobile. `font-display: swap` is already in the URL. Evidence: measured. Left in place for now so the type does not shift; see remaining issues.
13. **i18n — English is set, Spanish is not planned in the markup.** `lang="en"` is present (`index.html:2`). No `hreflang`, and assistant strings are only in `js/bot.js`. Evidence: source inspection.
14. **Cache and compression.** Lighthouse flagged uncompressed HTML/CSS/JS and `max-age=0` on same-origin files. That is the Python static server, not an application bug. Record the host policy in docs. Do not add a hash build. Evidence: measured, cause is the local server.

### Low

15. **Dead social and WhatsApp links.** Instagram, TikTok, LinkedIn, and WhatsApp use `href="#"` (`index.html:222`, `index.html:267`). `js/bot.js:72` prevents WhatsApp and has a TODO. Evidence: source inspection.
16. **Lenis on touch screens.** `js/main.js:9-14` starts smooth scroll on every pointer type except reduced motion. It hijacks native scroll. Evidence: source inspection. Not separately timed.
17. **Security headers.** None can be set from this static folder without a host file. Policy belongs in `docs/`, not a Cloudflare `_headers` file, until hosting is chosen. Evidence: source inspection.
18. **No `og:image`.** There is no final share image. Do not invent one. Evidence: source inspection.

### Checked, not a defect

- CLS is under 0.1 on both lab runs (mobile ~0, desktop 0.024).
- No horizontal overflow at 375, 768, 1280, 1920.
- One `h1`. Heading order passed Lighthouse.
- Controls in the draft have accessible names. Inputs are wrapped in labels.
- `:focus-visible` exists (`styles.css:53`).
- Viewport does not disable zoom.
- `prefers-reduced-motion` short-circuits CSS animation (`styles.css:381-385`).
- No secrets, API keys, or tokens in the repo.
- Tap-target measurements on the hidden assistant are the scaled-off state, not the open panel (CSS sizes are 44px and up).

## Fix order

1. Stop the media loops and the Three.js hero from running on small screens and reduced motion, and load Three only after first paint. This is the measured TBT/LCP failure. Do not rebuild the scene; a video hero replaces it next.
2. Paint the hero text without waiting on `.reveal`, and raise `--ink-3` above 4.5:1.
3. Add the skip link, move the hidden assistant out of the tab order, and describe form errors in text.
4. Add canonical, social meta, JSON-LD, `robots.txt`, `sitemap.xml`, a favicon, the about section, the booking slot, and a real contact form with a honeypot.
5. Replace realtor-only lines and the FPS / piece-count stats with marked placeholders. Do not write new marketing headlines.
6. Record header and cache policy in docs. Leave hosting unset.

## What this pass does not claim

- No field Core Web Vitals. Re-measure with CrUX after launch.
- Desktop TBT after the hero is allowed to run on a real GPU was not measured here. This machine has no hardware GL.
- Keyboard, form, and width checks for the edited page are in the PR notes, not in this baseline table.
