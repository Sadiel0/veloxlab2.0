# VeloxLab: Molten Ace style guide (v2, build spec)
Direction D1 "Molten Ace", picked by Sadiel on Nov 4, 2026. Site: veloxlab.studio. Readers: The Engineer and anyone writing copy.
Every rule is a yes/no check. **Name rule: always "VeloxLab" (company: "VeloxLab Studio"), never "Velox" or "VELOXLAB" in text.** Uppercase only via CSS on the kinetic hero words.

**Changelog**
- **Nov 4, 2026 · v2.1 (copy):** "listing videos" → "brand films" in the Creative bullet. Both split-offer halves, free offers and CTAs rewritten as named offers using Hormozi's value equation ($100M Offers): dream outcome, likelihood (mechanism + proof slots), speed, effort, stack, risk reversal, honest scarcity. Hero subline, spotlight CTA, contact headline and CTA rewritten so every button says what happens next. Placeholder convention added (§0) and every unknown listed in §14 "Placeholders to replace before launch". Guarantees and scarcity marked [PROPOSED - Sadiel to approve].
- **Nov 4, 2026 · v2:** Switched from Ace Noir to **D1 Molten Ace** (Sadiel: "it wasn't the ace one... the one with the robot. That fit my site better"). New palette, type (Unbounded + Manrope), robot hero. Kept from v1.1: broad small-business positioning, split offers with the repo's real offers, real estate spotlight, no fake stats, reduced motion and a11y. Hero words now CREATE / BUILD / GROW. New assets: `offers-split.jpg`, `home-desktop-molten.jpg`, `home-mobile-molten.jpg`, `hero-loop-molten.mp4`. Ace Noir archived at `style-guide-ace-noir.md`.
- Nov 4, 2026 · v1.1 (Ace Noir): split offers, real estate spotlight, broad positioning, stats card removed.
- Nov 4, 2026 · v1: Ace Noir locked (superseded).

---
## 0. Placeholder convention
- **In copy:** `[PLACEHOLDER: what goes here]`, never invented values. Business commitments (guarantees, slot limits): `[PROPOSED - Sadiel to approve]`.
- **In code:** every element holding placeholder content gets `data-placeholder="<ID from §14>"` (e.g. `<a href="https://cal.com/PLACEHOLDER-veloxlab/intro" data-placeholder="P01">`). Visually: render placeholder text as-is in staging; a launch check (`document.querySelectorAll('[data-placeholder]').length === 0` and no "PLACEHOLDER" / "PROPOSED" strings in the build) blocks production deploy.
- All placeholders are listed in §14.

## 1. Brief
- **What it is:** VeloxLab Studio, an AI-native creative and development studio in Miami, bilingual EN/ES. Two tracks: **Creative** (brand identity, AI content: ads, UGC, video, motion graphics) and **Development** (websites and landing pages, apps and dashboards, AI agents and automations).
- **Who it's for:** small businesses and people who need it: shops, restaurants, clinics, service pros, founders, creators, real estate agents. Not niched in v1; real estate is one worked example (11.6).
- **What the site does:** (1) show the work, (2) get a call booked or a free offer claimed (spec ad / AI audit).
- **Positioning:** "Creative for your business. Development for your needs." The robot operator is the studio's mascot: a machine that makes things by hand-held craft. AI is how we work, not what we sell.
- **Is:** bold, cinematic, hot-on-dark, confident. **Is not:** cheesy sci-fi, neon cyberpunk, cluttered, "AI magic" talk, discount energy.
- **References:** `directions-v2/D1-mockup.jpg`, `D1-keyart.jpg`; the Pinterest "tech landing page" pin (graphite + molten orange, 3D figure, huge wide type).

## 2. Logo
- **Primary:** "VeloxLab" wordmark in Manrope 700 (tracking −0.01em) + a small solid amber spade (#FF9A2E) after it, spade height = cap height, gap 0.18em (as in D1-mockup). Rebuild as SVG: `/assets/logo/veloxlab-primary.svg` (outlined text).
- **Icon:** the amber spade alone (favicon, avatar, loader). `veloxlab-icon.svg`. Optional "visor" variant: spade inside a rounded-helmet outline for social.
- **Colors:** wordmark --text (#F2EEE8) + amber spade on dark; one-color #0E0E10 on light; all-white on photos with ≥40% scrim. Spade is the only amber part.
- **Clear space:** height of the "V" on all sides. **Min size:** 110px wide; icon 16px favicon / 24px elsewhere.
- **Don'ts:** no stretching, glow on the wordmark, gradients, outlines, rotation, all caps, recolors; never "Velox".

## 3. Color tokens
```css
:root{
  --n-950:#0E0E10; /* obsidian bg */
  --n-900:#1A1A1E; /* graphite surface */
  --n-850:#24242A; /* surface-2 / hover */
  --n-800:#2C2B30; /* hairline (decorative only) */
  --n-600:#6B6770; /* border-strong: inputs, outlined pills */
  --n-400:#A39E97; /* ash: secondary text */
  --n-50: #F2EEE8; /* bone: text */
  --white:#FFFFFF; /* CTA pill */
  --amber:#FF9A2E;    /* molten: the one accent */
  --amber-hi:#FFB561; /* hover/highlight */
  --chrome:#B8BEC6;   /* Development side lines/labels only */
  --danger:#FF7A6B;   /* form errors only */
  --bg:var(--n-950); --surface:var(--n-900); --surface-2:var(--n-850);
  --text:var(--n-50); --text-2:var(--n-400);
  --border:var(--n-800); --border-strong:var(--n-600);
  --accent:var(--amber); --accent-hi:var(--amber-hi);
  --cta-bg:var(--white); --on-cta:var(--n-950); --focus:var(--amber-hi);
}
```
**Measured contrast (WCAG 2.x; AA = 4.5 body, 3 large/UI):**
| Pair | bg #0E0E10 | surface #1A1A1E | surface-2 #24242A | Allowed for |
|---|---|---|---|---|
| text #F2EEE8 | 16.69 | 15.01 | 13.35 | everything |
| text-2 #A39E97 | 7.25 | 6.52 | 5.80 | body, captions |
| amber #FF9A2E | 9.10 | 8.19 | 7.29 | text, icons, one hero word |
| amber-hi #FFB561 | 11.05 | — | — | hover text |
| chrome #B8BEC6 | 10.30 | 9.27 | 8.24 | Dev labels, lines |
| danger #FF7A6B | 7.57 | 6.81 | 6.06 | errors |
| border-strong #6B6770 | 3.49 | 3.14 | **2.79 ✗** | control borders on bg/surface only |
| border #2C2B30 | 1.37 | 1.24 | 1.10 | **decorative only** |
| bg text on white pill | 19.28 | | | primary CTA |
| bg text on amber | 9.10 | | | amber button (Creative CTA hover only) |
| bg text on amber-hi | 11.05 | | | |
Rules: amber ≤10% of any screen (glow light in imagery doesn't count). No blue/purple/neon green. Gradients only: (a) photo/video scrim bg→transparent, (b) the radial ember glow behind the hero figure (amber at ≤18% opacity), (c) chrome sheen inside Dev imagery.

## 4. Typography
- **Display:** **Unbounded** 600/700/800 (wide, rounded, futuristic). Kinetic hero words use 800 + `text-transform:uppercase`; section headings 600 in sentence case. **Body/UI:** **Manrope** 400/500/600/700. Both cover Spanish glyphs.
- Google Fonts: `https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap` → self-host WOFF2 (latin + latin-ext), preload Unbounded 800 + Manrope 400, metric-matched fallbacks with `size-adjust` (CLS 0).
- **Scale (1.25, base 16):**
```css
:root{
  --fs-xs:.8125rem;                                  /* 13 captions */
  --fs-sm:.875rem;                                   /* 14 UI, labels */
  --fs-base:clamp(1rem,.96rem + .2vw,1.0625rem);     /* 16→17 */
  --fs-lg:clamp(1.125rem,1.05rem + .35vw,1.25rem);   /* 18→20 lead */
  --fs-h4:clamp(1.25rem,1.1rem + .6vw,1.563rem);     /* 20→25 */
  --fs-h3:clamp(1.5rem,1.2rem + 1.1vw,1.953rem);     /* 24→31 */
  --fs-h2:clamp(1.953rem,1.4rem + 2.2vw,3.052rem);   /* 31→49 */
  --fs-h1:clamp(2.441rem,1.5rem + 3.6vw,4.768rem);   /* 39→76 */
  --fs-kinetic:clamp(3rem,1rem + 9vw,9.5rem);        /* 48→152 hero words */
}
```
- Line height: kinetic 0.9, H1/H2 1.05, H3/H4 1.15, body 1.6, UI 1.3. Tracking: kinetic +0.02em (Unbounded is wide already), headings −0.01em, labels +0.06em.
- Unbounded never below 20px and never for paragraphs. Body max 62ch; headings `text-wrap:balance`, max 14ch.
- No uppercase eyebrows above headings (no "(02) SERVICES" mono labels).

## 5. Layout
- Grid 12 cols/24px gutter ≥1024; 8/20 at 768–1023; 4/16 <768. Margin `clamp(20px,5vw,80px)`. Content max 1360px; text 720px. Full-bleed: hero, reel, split offers.
- Spacing (8px): `--s-1:4 --s-2:8 --s-3:16 --s-4:24 --s-5:32 --s-6:48 --s-7:64 --s-8:96 --s-9:128 --s-10:160` (px).
- Breakpoints `sm 480 · md 768 · lg 1024 · xl 1280 · 2xl 1536`.
- Section padding `clamp(96px,12vw,160px)` desktop, 80px mobile. Separate sections with space and a 1px `--border` line, not color blocks. Only Contact uses `--surface`.
- Desktop hero frame: the page sits on --bg; hero is an r-xl (28px) rounded "screen" inset by the page margin, like D1-mockup.
- No two consecutive sections share a layout.

## 6. Components
- **Radii:** `--r-sm:8px --r-md:14px --r-lg:20px --r-xl:28px --r-pill:999px`. Buttons and nav are pills; media r-md; hero frame and reel r-xl. Inputs r-sm.
- **Shadows/glow:** `--sh-1: 0 1px 0 rgba(242,238,232,.05) inset`; `--sh-2: 0 30px 80px -30px rgba(0,0,0,.85)`; `--glow-amber: 0 0 0 1px rgba(255,154,46,.55), 0 8px 32px -8px rgba(255,154,46,.45)`.
| Button | Default | Hover (hover:hover + pointer:fine) | focus-visible | Disabled |
|---|---|---|---|---|
| Primary pill "Book a call" | bg white, text --on-cta, Manrope 600 15px, 44px tall (52 mobile), padding 0 22px | bg --amber-hi, 240ms | 2px outline --focus, offset 3px | 40% opacity, no hover |
| Outline pill "Play reel" | 1px --border-strong, text --text, ▶ icon | border --amber, `--glow-amber` | same | same |
| Text link | --text, 1px amber underline at .2em | 2px underline, --amber-hi | same | --text-2 |
- Arrow icons: only on the nav CTA. No "→" on links.
- **Nav (pill):** 72px desktop. Logo left · centered pill group (`--surface` at 80%, 1px --border, r-pill) with Work · Services · Real estate · Process · Contact (active item = 1px amber ring as in D1) · right: EN|ES toggle + white "Book a call" pill. Sticky; the pill group gets `backdrop-filter:blur(10px)` after 80px (the only blur on the site). Hides on scroll down, shows on scroll up (desktop). Mobile: logo + menu button → full-screen sheet, links in Unbounded --fs-h3; "Book a call" becomes a sticky bottom white pill (full-width minus 16px margins, safe-area aware).
- **EN/ES toggle:** segmented, `role="group"`, `aria-pressed`, routes `/` and `/es/` with hreflang. Suggest ES from `navigator.language`; never auto-redirect.
- **Work card:** poster (16:9 or 4:5), r-md, no border; caption below: client (Manrope 600) · industry · deliverable (--text-2). Hover: 1.03 scale inside clip, 6s muted preview, amber 1px ring.
- **Form field:** 56px, bg --surface, 1px --border-strong, r-sm, label above. Focus: border amber + `--glow-amber`. Error: --danger + message via `aria-describedby`. Fields: Name, Email, Phone (opt.), Website or Instagram (opt.), Topic (Creative / Development / Real estate / Not sure), Language (EN/ES), Message.
- **Video player:** custom controls, captions EN+ES.

## 7. Imagery, video and 3D
- **The operator:** obsidian-black glossy armor (roughness .15–.25) with chrome joints (metalness 1, roughness .25), molten amber seams (emissive #FF9A2E, intensity pulsing 0.6–1.0), spade-shaped visor glowing amber, holding a cinema camera. Always on graphite with a warm ember haze from lower right; light smoke.
- **Work imagery:** real client footage, warm grade, lifted blacks to ~#0E0E10, highlights warm cream; 2–3% grain. Dev work = real screen recordings on dark devices, never fake dashboards.
- **Creative surface texture:** cracked obsidian with molten amber veins + ember smoke. **Development surface texture:** brushed chrome-grey with a thin chrome blueprint grid and wireframes.
- **Avoid:** blue/teal sci-fi LUTs, neon grids, circuit boards, glowing brains, generic "AI" robots with faces, handshake stock, glassmorphism cards, lens-flare overload, visible AI artifacts (extra fingers on the robot, melted camera parts).
- Placeholders: filename and alt text include `PLACEHOLDER`.

## 8. Motion
```css
:root{
  --dur-fast:120ms; --dur-base:240ms; --dur-slow:560ms; --dur-hero:1200ms;
  --ease-out-expo:cubic-bezier(.16,1,.3,1);   /* entrances, kinetic words */
  --ease-inout:cubic-bezier(.65,0,.35,1);     /* seams, line draws */
}
```
- **The one orchestrated hero moment (≤1.8s, once per load):** (1) seams ignite from the spade visor outward (video/WebGL, 0–1200ms; CSS fallback: radial amber glow fades 0→.18); (2) kinetic words slide in from their sides, CREATE from left, BUILD from right, GROW from left/below, `translateX(±12vw)→0` + opacity, `--dur-slow`, 80ms stagger, `--ease-out-expo`, starting at 300ms; (3) subline, Play reel and CTA fade in 900–1500ms.
- **Cursor:** figure parallax ±10px x / ±6px y, words counter-shift ±4px (lerp .08). Only `(hover:hover) and (pointer:fine)`.
- **Scroll:** kinetic words drift apart up to 6vw as the hero scrolls out (transform only); section line draws (`scaleX 0→1`, --dur-slow); split offers seam draw (11.5). No fade-up on every section; body text never animates.
- **Never:** scroll-jacking, blinking, autoplay sound, animating width/height/top/left, logo animation outside the loader.
- **Reduced motion:**
```css
@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}
  .hero-loop{display:none} .hero-still{display:block}  /* D1-keyart.jpg */
  [data-parallax],[data-kinetic]{transform:none!important;opacity:1!important}
}
```
  JS: `matchMedia('(prefers-reduced-motion: reduce)')` → no cursor parallax, words placed statically, WebGL single frame.
- **Looping video:** `autoplay muted loop playsinline preload="metadata"`, poster; visible Pause/Play 44px button (WCAG 2.2.2); pause off-screen and on hidden tab.

## 9. 3D implementation
- **Phase 1 (launch):** `hero-loop-molten.mp4` (muted) under the kinetic words, `D1-keyart.jpg` as poster/still. Fallback chain: video → still.
- **Phase 2:** live WebGL operator (R3F + drei or vanilla three): `operator.glb` ≤600KB Draco/meshopt, ≤40k tris, KTX2, 1k HDRI ≤200KB; emissive seam pulse in shader; desktop + fine pointer + not low-end only; DPR ≤1.75; `frameloop="demand"` when idle; lazy `import()` after first paint.
- LCP = H1 text, never the canvas/video. Budgets: hero JS ≤150KB gz excl. three; first view ≤1.2MB mobile; LCP <2.5s, INP <200ms, CLS <0.1.

## 10. Voice
- Calm, sure, short. Talk about the client's business and results, not the tech. ES is written fresh, not translated (Miami Spanish; "usted" in CTAs pending Sadiel's call).
- **Kinetic hero words (picked):** **CREATE / BUILD / GROW** (GROW in amber). ES: **CREA / CONSTRUYE / CRECE** (CRECE in amber). Considered: SHOOT / SHIP / SCALE (too startup), FILM / BUILD / LAUNCH.
- **Accessible H1 (visually hidden text behind the kinetic words / visible on mobile under them):** EN "Creative and development for your business." ES "Creatividad y desarrollo para su negocio."
- **Subline (visible, bilingual):** EN: "Your brand, video and website, done for you in English and Spanish, so customers find you, trust you and book. Miami-based." ES: "Su marca, su video y su sitio web, hechos por nosotros en español e inglés, para que los clientes lo encuentren, confíen y reserven. Desde Miami." [PLACEHOLDER: confirm usted vs tú]
- **Hero CTA:** white pill "Book a 15-min call" / "Agende una llamada de 15 min" → [PLACEHOLDER: Cal.com URL] (P01). Outline pill "Play the 60-sec reel" / "Ver el reel de 60 s".
- Other lines: "Create gets you seen. Build makes it work." / "Lo creativo lo hace visible. Lo técnico lo hace funcionar." · "See the work before you pay for it." / "Vea el trabajo antes de pagar."
- **Avoid:** "revolutionize", "cutting-edge", "unleash", "game-changer", "AI-powered magic", "next-gen", "Velox", exclamation marks, emoji in UI, real-estate-only wording outside 11.6.

## 11. Page section specs (homepage; `/` EN, `/es/` ES)
### 11.0 Page order
1 Nav · 2 Hero · 3 Reel · 4 Selected work · 5 **Split offers** (`#services`) · 6 **Real estate spotlight** (`#real-estate`) · 7 Process · 8 Bilingual / why us · 9 Contact / booking · 10 Footer.
Layout alternation: framed hero → full-bleed reel → mosaic → split → band → timeline → two columns → split form.
**No stats card anywhere** (not in the hero, not below the fold) unless Sadiel supplies real numbers. The D1 mockup's "120+ / 48h" card is removed.

### 11.1 Nav
```
[VeloxLab♠]     ( Work  Services  Real estate  Process  Contact )     EN|ES  ( Book a call )
```

### 11.2 Hero (rounded frame, 100svh − 32px, min 640px)
```
| CREATE                                  ┌──────────────┐         |
| Brand, video, websites and AI           │  OPERATOR     │ (▶ Play reel) |
| automations for small businesses.       │  spade visor  │   BUILD |
| Miami-based, en español también.        │  cinema cam   │         |
|                                         │  (video loop) │         |
| GROW  (amber)                           └──────────────┘  [❚❚]   |
|                                   ( Book a call )  ← nav CTA also |
```
- Figure centered, cols 4–9, bleeding to the frame bottom. Words placed on 3 corners as in D1-mockup: CREATE top-left, BUILD mid-right, GROW bottom-left in amber. Words sit *behind* the figure's shoulder where they overlap (z-order: word 1 and 3 behind, BUILD in front).
- Subline under CREATE (Manrope 400, --fs-lg, --text, max 34ch). Outline pill "Play reel" upper-right of the figure; Pause button bottom-right.
- **Mobile:** figure portrait-cropped centered (~55svh); CREATE above, BUILD/GROW stacked below at `clamp(48px,16vw,96px)`; subline; "Play reel" text link; sticky "Book a call" pill (see `home-mobile-molten.jpg`). Video at 720p; no WebGL.

### 11.3 Reel (full-bleed, r-xl)
- 16:9 PLACEHOLDER showreel, muted 10s teaser loop, click plays with sound. Caption: "60-second reel · brands, food, retail, web, real estate (PLACEHOLDER)". Mobile edge-to-edge, native fullscreen on play.

### 11.4 Selected work
```
| Selected work                                          |
| ┌──────── big 16:9 ────────┐ ┌── 4:5 ──┐               |
| │ Café brand film (PH)     │ │ Site (PH)│              |
| └──────────────────────────┘ └─────────┘               |
|        ┌── 4:5 ──┐ ┌─────── 16:9 ───────┐              |
```
- 4–6 projects, **mixed industries and both tracks** (café brand + reels, boutique landing page, clinic booking automation, one listing film). Caption: client · industry · deliverable. All PLACEHOLDER until real work exists. Mobile: scroll-snap carousel 85vw with "1 / 6".

### 11.5 Split offers (`#services`)
**Source:** the live repo's two tracks (`Sadiel0/veloxlab2.0` → `index.html` `section.services`, "Two ways we work."). Offer names and bullets are the real ones; half titles are new (Sadiel).

**Desktop (≥1024, fine pointer), resting 50/50, min-height 88svh, full-bleed:**
```
| Two ways we work.                                                    |
|─────────────────────────────┬♠┬───────────────────────────────────────|
| CREATIVE: warm, molten      │A│  DEVELOPMENT: cool chrome, blueprint  |
| [cracked obsidian, amber    │M│  [brushed chrome-grey, 1px chrome     |
|  veins, ember smoke loop]   │B│   grid 48px, site wireframe]          |
| Creative for                │E│  Development for                      |
| your business               │R│  your needs                           |
| Create gets you seen.       │ │  Build makes it work.                 |
| Brand Identity              │S│  01 Websites & Landing Pages          |
|   Logo, visual system, voice│E│     Fast, 3D-ready sites that convert.|
| AI Content Production       │A│  02 Apps & Dashboards                 |
|   Ads, UGC, brand films,    │M│     Internal tools, client portals,   |
|   motion graphics.          │ │     live data.                        |
|                             │ │  03 AI Agents & Automations           |
| ( Get my free spec ad )     │ │     Assistants, lead follow-up,       |
|                             │ │     workflows that run themselves.    |
|                             │ │  ( Book a free AI audit )             |
|─────────────────────────────┴─┴───────────────────────────────────────|
 hover/focus Creative → 60/40  ◀──┼──▶  hover/focus Development → 40/60
```
- **Seam:** 2px molten amber line, center, with a soft glow (`box-shadow 0 0 16px rgba(255,154,46,.5)`), and a 56px amber spade in a dark teardrop "drip" at mid-height (see `offers-split.jpg`). `aria-hidden`.
- **Creative half:** background `offers-creative-loop.mp4` (PLACEHOLDER: amber veins pulsing, smoke) + poster, under a bg→transparent scrim (70%, 55% on hover). Title --text; tagline --text-2; CTA = white pill.
- **Development half:** --surface base with a chrome sheen gradient (#1A1A1E → #2A2C31 at 35° ≤8% lightness shift), 1px chrome grid at 10%, SVG wireframe at 14% drawn with `stroke-dasharray`. Row numbers "01–03" Manrope 600 in --chrome. CTA = outline pill (border --chrome, hover border amber).
- **Type:** half title Unbounded 600 --fs-h2, max 12ch; tagline Manrope 400 --fs-lg; offer names Manrope 600 --fs-base; descriptions Manrope 400 --fs-sm --text-2; rows separated by 1px --border.
- **Expand (transform/clip-path, never width):** both halves are full-width layers in one grid cell, clipped `inset(0 50% 0 0)` / `inset(0 0 0 50%)`. Hover or `:focus-within` moves the clip edge and the seam (`translateX(±10vw)`) to 60/40, --dur-slow, --ease-out-expo. Content anchored to each half's outer edge (no reflow). Narrow side: descriptions to opacity 0, names stay. Wide side: CTA lifts `translateY(8px)→0`, --dur-base, 60ms stagger. 120ms leave delay.
- **Single motion moment:** on 35% in view (once), the seam pours top→bottom like molten metal (`scaleY 0→1`, 840ms, --ease-inout), then the spade drip glows (opacity .4→1, 240ms). The Creative loop plays only while in view.
- **Copy (v2.1, Hormozi value equation):** Value = (dream outcome × perceived likelihood) ÷ (time delay × effort). Each half: offer name → dream outcome headline (customer's words) → mechanism (likelihood) → stacked deliverables → speed + done-for-you → risk reversal → honest scarcity → free lead magnet → CTA that says what happens next. No hype, no numbers we can't prove. ES in "usted" [PLACEHOLDER: confirm usted vs tú].

**CREATIVE half: "The Seen Stack" / ES "El Paquete Visible"**
- Half title (kept): "Creative for your business" / "Creativo para su negocio"
- Headline (dream outcome): EN "Look like the best option in Miami, before anyone calls." ES "Parezca la mejor opción de Miami, antes de que lo llamen."
- Mechanism line: EN "Our Brief → Shoot → Cut system: one 15-minute call, we plan the shots, film or build them with AI, and hand you content ready to post in both languages." ES "Nuestro sistema Brief → Rodaje → Edición: una llamada de 15 minutos, planeamos las tomas, las filmamos o creamos con IA, y le entregamos contenido listo para publicar en ambos idiomas."
- Stack (each line = its own item; no prices shown until P10):
  1. **Brand Identity kit**: logo, color, type and voice your customers recognize. / "Kit de identidad: logo, colores, tipografía y tono que sus clientes reconocen."
  2. **Brand film**: one hero video that explains what you do in under a minute. / "Video de marca: un video principal que explica lo que hace en menos de un minuto."
  3. **Social cut pack**: vertical reels, ads and UGC-style clips cut from the same shoot. [PLACEHOLDER: number of cuts] / "Paquete de cortes: reels verticales, anuncios y clips estilo UGC del mismo rodaje."
  4. **Bilingual versions**: EN and ES captions or voice-over on every piece. / "Versiones bilingües: subtítulos o voz en español e inglés en cada pieza."
  5. **Motion graphics**: logo animation and on-screen text for every cut. / "Gráficos en movimiento: animación de logo y textos en pantalla."
- Speed + effort: EN "You show up for one call. We do the rest. First cut in [PLACEHOLDER: turnaround days] days." ES "Usted solo asiste a una llamada. Nosotros hacemos el resto. Primer corte en [PLACEHOLDER: días de entrega] días."
- Proof slot: [PLACEHOLDER: real client logo/quote/result, hide block if none] (P13).
- Risk reversal: EN "Love the first cut, or we re-edit until you do. Still not right? You don't pay. [PROPOSED - Sadiel to approve]" ES "Si el primer corte no le encanta, lo reeditamos hasta que sí. ¿Aún no le convence? No paga. [PROPOSED - Sadiel to approve]"
- Scarcity (only if true): EN "We take [PLACEHOLDER: number] new creative clients a month so every shoot gets our full attention. [PROPOSED - Sadiel to approve]" ES "Aceptamos [PLACEHOLDER: número] clientes creativos nuevos al mes para dar toda nuestra atención a cada rodaje. [PROPOSED - Sadiel to approve]"
- **Free offer (lead magnet): "Free Spec Ad" / "Anuncio de prueba gratis"**: EN "Before you spend a dollar, we make a short ad for your business so you can see the quality first." What you get: · a 15–30s vertical ad made for your business [PLACEHOLDER: confirm length] · in English, Spanish or both · ready to post on Instagram or TikTok · yours to keep, no contract. Delivered in [PLACEHOLDER: turnaround days] days. ES "Antes de gastar un dólar, hacemos un anuncio corto para su negocio para que vea la calidad primero." · un anuncio vertical de 15–30 s para su negocio · en español, inglés o ambos · listo para Instagram o TikTok · suyo, sin contrato.
- Form: Business name · Instagram or website · Email (helper text: "We'll send your spec ad here. No spam." / "Le enviaremos su anuncio aquí. Sin spam.") → submit to [PLACEHOLDER: form endpoint] (P06).
- **CTA:** "Get my free spec ad" / "Quiero mi anuncio gratis" (white pill). Success: "Got it. We'll email you within [PLACEHOLDER: reply time] to start your spec ad." / "Recibido. Le escribiremos en [PLACEHOLDER: tiempo de respuesta] para empezar su anuncio."

**DEVELOPMENT half: "The Done-For-You Build" / ES "Lo Construimos por Usted"**
- Half title (kept): "Development for your needs" / "Desarrollo a su medida"
- Headline: EN "A website that books customers while you work." ES "Un sitio web que consigue clientes mientras usted trabaja."
- Mechanism line: EN "Audit → Build → Automate: we find where you lose time or leads, build the fix, then connect it so it runs without you." ES "Auditoría → Construcción → Automatización: encontramos dónde pierde tiempo o clientes, construimos la solución y la conectamos para que funcione sin usted."
- Stack:
  1. **Website or landing page**: fast, mobile-first, 3D-ready, built to turn visitors into calls. / "Sitio web o landing page: rápido, pensado para móvil, listo para 3D, hecho para convertir visitas en llamadas."
  2. **Booking + lead capture**: forms, calendar and WhatsApp wired in so no lead slips. / "Reservas y captura de clientes: formularios, calendario y WhatsApp conectados."
  3. **App or dashboard** (if you need one): internal tools, client portals, live data. / "App o panel: herramientas internas, portales de clientes, datos en vivo."
  4. **AI assistant + follow-up**: answers common questions and follows up with leads in EN and ES. / "Asistente con IA y seguimiento: responde preguntas y da seguimiento en español e inglés."
  5. **Launch + handover**: hosting set up, a short how-to video, and [PLACEHOLDER: support period] of fixes. / "Lanzamiento y entrega: hosting, video tutorial y [PLACEHOLDER: periodo de soporte] de ajustes."
- Speed + effort: EN "No tech skills needed. You approve, we build. Working demo in [PLACEHOLDER: turnaround days] days." ES "No necesita saber de tecnología. Usted aprueba, nosotros construimos. Demo funcionando en [PLACEHOLDER: días de entrega] días."
- Proof slot: [PLACEHOLDER: real site/screenshot/result, hide if none] (P13).
- Risk reversal: EN "If the working demo isn't what you asked for, you walk away and owe nothing. [PROPOSED - Sadiel to approve]" ES "Si la demo no es lo que pidió, se retira sin pagar nada. [PROPOSED - Sadiel to approve]"
- Scarcity: EN "We run [PLACEHOLDER: number] builds at a time. [PROPOSED - Sadiel to approve]" ES "Trabajamos [PLACEHOLDER: número] proyectos a la vez. [PROPOSED - Sadiel to approve]"
- **Free offer: "Free 15-Minute AI Audit" / "Auditoría de IA gratis de 15 minutos"**: EN "A short call where we look at how your business runs and show you what to fix first." What you get: · where you're losing time or leads · 1–2 quick AI wins you can use this month · a ballpark for a site, app or agent · a short written summary after the call [PLACEHOLDER: confirm] · no pitch, no obligation. ES "Una llamada corta donde vemos cómo funciona su negocio y le mostramos qué arreglar primero." · dónde pierde tiempo o clientes · 1–2 mejoras rápidas con IA para este mes · un estimado para un sitio, app o agente · un resumen escrito después · sin presión, sin compromiso.
- **CTA:** "Pick a time for my free audit" / "Elegir hora para mi auditoría" (outline pill) → [PLACEHOLDER: Cal.com audit URL] (P02).
- **Order of elements inside each half:** half title → headline → mechanism → stack (desktop: names always visible, descriptions on expand) → speed line → guarantee (small, --text-2) → free offer block → CTA. Scarcity line sits under the CTA in --fs-xs, only once approved; otherwise remove the element.
- **Keyboard/a11y:** each half is a `<section aria-labelledby>`; focus enters via its links/CTA; `:focus-within` == hover. Tab order Creative → its CTA → Development → its CTA. Details always in the DOM (opacity only, never `display:none`). Focus ring 2px --focus offset 3px; on white pill use a --bg inner ring + amber outer ring.
- **Hover gating:** expand only in `@media (hover:hover) and (pointer:fine)`; else static 50/50, all visible.
- **Reduced motion:** static 50/50, seam drawn, details visible, loop → poster.
- **Mobile (<768):**
```
| Two ways we work.            |
| ┌ CREATIVE (molten still) ┐  |
| │ Creative for            │  |
| │ your business           │  |
| │ Brand Identity          │  |
| │ AI Content Production   │  |
| │ ( Get my free spec ad )  │ |  ← full-width pill, 52px
| └─────────────────────────┘  |
| ━━━━━━━━━━ ♠ ━━━━━━━━━━      |  ← amber seam turns horizontal
| ┌ DEVELOPMENT (chrome grid)┐ |
| │ Development for          │ |
| │ your needs               │ |
| │ 01 Websites & Landing    │ |
| │ 02 Apps & Dashboards     │ |
| │ 03 AI Agents & Autom.    │ |
| │ ( Book a free AI audit ) │ |  ← full-width pill, 52px
| └──────────────────────────┘ |
```
  Details visible by default, CTAs at the bottom of each half (thumb zone), still image instead of video. Tablet: same stack, 2-col rows.
- **Anti-generic:** no twin SaaS cards, no glass, no icon-in-circle grids, no pricing tiles, no "→" on every link.
- **A11y checklist:** ☐ hover == focus-within ☐ text on the brightest frame of the molten loop ≥4.5:1 (scrim) ☐ details always in DOM ☐ transform/clip-path only, CLS 0 ☐ reduced motion static ☐ loop muted, pauses off-screen ☐ targets ≥44px ☐ `lang="es"` on `/es/`.

### 11.6 Real estate spotlight (`#real-estate`)
**Desktop band (~70svh max, --border lines top and bottom):**
```
| ┌──── 16:9 listing film (PLACEHOLDER) ────┐  Real estate, for example. |
| │                ( ▶ )                    │  How we'd film a Miami       |
| └─────────────────────────────────────────┘  listing, in two languages. |
|  Brickell penthouse · film + 3 reels (PH)    · [outcome 1 PLACEHOLDER]  |
|                                              · [outcome 2 PLACEHOLDER]  |
|                                              · [outcome 3 PLACEHOLDER]  |
|                                              ( See how we'd do yours )  |
```
- Film cols 1–7, text 8–12. H3 Unbounded 600 EN "Real estate, for example." ES "Bienes raíces, por ejemplo." Lead EN "Listing films and reels in English & Español for Miami agents." ES "Videos y reels de propiedades en español e inglés para agentes en Miami."
- Outcome bullets: 2–3, **PLACEHOLDER until Sadiel gives real results**; no invented numbers.
- CTA outline pill: "Get a free spec ad for your listing" / "Pida un anuncio de prueba para su propiedad" → `#contact?topic=real-estate` (prefills Topic). Helper under it: "Send us one listing link. We'll show you what it could look like." / "Envíenos el enlace de una propiedad y le mostramos cómo podría verse."
- Outcome bullets: [PLACEHOLDER: outcome 1/2/3] (P12).
- **Mobile:** film full-width, title, lead, bullets, full-width pill.

### 11.7 Process
```
 01 ───── 02 ───── 03 ───── 04
 Brief    Create or build   Revise   Launch
```
- Repo copy: 01 Brief: "15-minute call. Goals, audience, style." 02 Create or build: "First cut or working demo in [X] days. Two rounds of revisions." (keep [X] hidden until confirmed). Steps 3–4 per repo. Numbers in Unbounded amber; a horizontal amber line fills as it enters. Mobile: vertical timeline.

### 11.8 Bilingual / why us
```
| "Miami speaks two languages. Your business should too."   |
| EN column            │  ES column                         |
| bilingual work · premium craft · speed                    |
```
- Two columns with a 1px amber hairline between. Testimonials: [PLACEHOLDER: real testimonial, name, business] (P11); hide the block until real. **No stats, no fake quotes.**

### 11.9 Contact / booking (bg --surface, r-xl panel)
```
| Tell us what you need.       |  Name / Email / Phone      |
| Cuéntenos qué necesita.      |  Site or IG / Topic / EN·ES |
| WhatsApp · email · Miami, FL |  Message  ( Send )          |
|                              |  or pick a time (Cal.com)   |
```
- Headline EN "Tell us what you need. We'll reply with a plan." ES "Cuéntenos qué necesita. Le respondemos con un plan." Sub: "Book a 15-minute call, or send a message and we'll get back to you within [PLACEHOLDER: reply time]." / "Agende una llamada de 15 minutos, o escríbanos y le respondemos en [PLACEHOLDER: tiempo de respuesta]."
- Primary CTA: "Book my 15-min call" / "Agendar mi llamada" → [PLACEHOLDER: Cal.com URL] (P01). Form submit: "Send and get my plan" / "Enviar y recibir mi plan" → [PLACEHOLDER: form endpoint] (P06). WhatsApp: "Message us on WhatsApp" → `https://wa.me/[PLACEHOLDER: number]` (P03). Email: [PLACEHOLDER: email] (P04).
- Field helper text: Name "So we know who to reply to." · Email "Your plan goes here." · Phone (optional) "Only if you prefer a call or WhatsApp." · Website or Instagram (optional) "Helps us see where you are today." · Topic · Language · Message "What do you want customers to do?" (ES: "Para saber a quién responder." · "Aquí le enviamos el plan." · "Solo si prefiere llamada o WhatsApp." · "Nos ayuda a ver dónde está hoy." · "¿Qué quiere que hagan sus clientes?")
- Success: "Thanks. We'll reply within [PLACEHOLDER: reply time]." / "Gracias. Le responderemos en [PLACEHOLDER: tiempo de respuesta]." 

### 11.10 Footer
- Socials: Instagram / TikTok / YouTube / LinkedIn → [PLACEHOLDER: handles] (P05).
- Wordmark + spade, "Creative & development studio · Miami · EN/ES", nav, socials, email, © 2026 VeloxLab Studio, privacy. Giant faint "VeloxLab" in Unbounded 800 at 5% opacity across the bottom (desktop).

### 11.11 SEO and meta
- `<title>VeloxLab Studio | Creative & development for small businesses, Miami (EN/ES)</title>`; hreflang en/es/x-default; OG image = D1 keyart 1200×630 with wordmark; LocalBusiness + VideoObject schema; bilingual alt text.

## 12. Assets
| File | Status | Use |
|---|---|---|
| `/workspace/veloxlab/directions-v2/D1-keyart.jpg` | ✔ | hero poster, reduced-motion still, OG source (upscale for retina) |
| `/workspace/veloxlab/assets/hero-loop-molten.mp4` | ✔ Kling 3.0 std, 5.04s, 1280×720, audio stripped; first/last frames differ (flare + head turn at end) so ping-pong or 400ms crossfade | hero loop (re-encode H.264 + WebM ≤2.5MB; 1080p desktop / 720p mobile; strip audio) |
| `/workspace/veloxlab/directions-v2/D1-mockup.jpg` | reference | hero layout (ignore its stats card and old real-estate copy) |
| `/workspace/veloxlab/assets/home-desktop-molten.jpg` | ✔ mockup, reference only | page layout |
| `/workspace/veloxlab/assets/home-mobile-molten.jpg` | ✔ mockup, reference only | mobile layout |
| `/workspace/veloxlab/assets/offers-split.jpg` | ✔ mockup, reference only | split offers |
| `assets/offers/creative-loop.mp4` + poster | TODO (PLACEHOLDER) | Creative half bg |
| `assets/logo/veloxlab-{primary,icon}.svg` | TODO | rebuild from D1 mockup |
| `assets/3d/operator.glb` | TODO phase 2 | WebGL hero |
| `assets/reel/*`, `assets/work/*` | TODO (needs real work) | reel, Selected work |
| Ace Noir files (`hero-loop.mp4`, `hero-keyart.jpg`, `home-desktop.jpg`, `home-mobile.jpg`, `offers-split-ace-noir.jpg`) | archived | not used |

## 13. Ship checklist
- [ ] "VeloxLab" spelled right everywhere; never "Velox"
- [ ] Every color from a token; every text pair in the contrast table
- [ ] 2 font families, self-hosted, no CLS on swap
- [ ] One load animation (hero); reduced-motion tested
- [ ] Hover gated behind (hover:hover) and (pointer:fine); hover == focus
- [ ] Videos muted, pause button, pause off-screen
- [ ] No WebGL on mobile; LCP <2.5s mobile
- [ ] EN and ES complete with hreflang
- [ ] **No stats card or numbers unless real**; placeholders labeled; no fake testimonials
- [ ] Zero `data-placeholder` attributes and zero "PLACEHOLDER"/"PROPOSED" strings in the production build (§0, §14)
- [ ] Every guarantee and scarcity line approved by Sadiel or removed
- [ ] Every button says what happens next (no bare "Submit" / "Learn more")
- [ ] Creative bullet says "brand films" (not "listing videos")
- [ ] Copy is broad (small business); real estate only in 11.6 and as one example

## 14. Placeholders to replace before launch
| ID | Where | Placeholder | Needs from Sadiel |
|---|---|---|---|
| P01 | Nav, hero, contact | `https://cal.com/PLACEHOLDER-veloxlab/intro` | Cal.com booking link (15-min intro) |
| P02 | Dev CTA | `https://cal.com/PLACEHOLDER-veloxlab/ai-audit` | Cal.com audit event link |
| P03 | Contact, footer | `https://wa.me/PLACEHOLDER` | WhatsApp number |
| P04 | Contact, footer | `hello@PLACEHOLDER.veloxlab.studio` | Contact email |
| P05 | Footer | IG / TikTok / YouTube / LinkedIn `PLACEHOLDER` handles | Social handles |
| P06 | Spec form, contact form | form endpoint `PLACEHOLDER` (e.g. Formspree/Resend) | Where form submissions go |
| P07 | Creative + Dev speed lines, spec ad | [PLACEHOLDER: turnaround days] | Real first-cut / demo / spec turnaround |
| P08 | Spec ad success, contact | [PLACEHOLDER: reply time] | Response time promise |
| P09 | Creative stack, spec ad | number of social cuts; spec ad length (15–30s) | Real deliverable counts |
| P10 | Offers (not shown in v1) | prices | Pricing, if ever shown |
| P11 | Bilingual / why us | testimonial, name, business | Real testimonials (else hide) |
| P12 | Real estate spotlight | outcome 1–3, featured listing film | Real listing film + results |
| P13 | Both offer halves | proof slot (client logo/quote/result) | Real proof (else hide) |
| P14 | Dev stack item 5 | support period | Post-launch support length |
| P15 | Dev audit | written summary after call | Confirm you'll send one |
| P16 | Both halves | guarantee lines [PROPOSED] | Approve, edit or cut |
| P17 | Both halves | monthly slot / concurrent build limits [PROPOSED] | Real capacity numbers or cut |
| P18 | All ES copy | usted vs tú | Register decision |
| P19 | Reel, Selected work | reel + 4–6 projects | Real work |
