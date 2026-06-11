# ORCA Website 2.0

Hand-coded static marketing site for **ORCA** — one document-backed source of truth for your structure.

**Live site:** https://christiankehr1.github.io/orca-website-2-0/

No framework, no build step for the site itself: plain HTML, CSS and vanilla JS, deployed straight to GitHub Pages. The repo also contains a packager that collapses each page into a single self-contained HTML file for pasting into Framer Embed elements.

## Repository layout

```
site/                    Everything that gets deployed (the GitHub Pages root)
├── index.html           Homepage
├── platform.html        Platform overview
├── solutions.html       Solutions
├── segment.html         Segment page (Family Offices)
├── why-orca.html        Why ORCA
├── customers.html       Customers
├── watch-demo.html      Watch demo
├── book-demo.html       Book a demo (SavvyCal widget)
├── 404.html             Not-found page
├── v2/                  Homepage v2 — awwwards-style redesign (incl. cookie consent)
├── demos/               Live demos: Sonar walkthrough + interactive structure chart
├── colors_and_type.css  Design tokens (colors, typography)
├── styles.css           Shared page styles
├── chrome.js            Injects the shared nav, footer and icon sprite on every page
├── fonts/               Self-hosted Inter + Inter Display (woff2)
└── assets/              Logo marks and other static assets

framer-embeds/           Generated, self-contained per-page HTML for Framer (see its README)
build-framer-embeds.js   Generates framer-embeds/ from site/
build-favicon.py         Generates the adaptive light/dark favicons into site/
.github/workflows/       GitHub Pages deploy workflow
```

## Local development

There are no dependencies. Serve the `site/` folder with any static server:

```bash
cd site && python3 -m http.server 8000
# → http://localhost:8000
```

(Opening the files directly also works, but a server keeps font and fetch paths happy.)

Shared chrome (nav, footer, icon sprite) lives in [`site/chrome.js`](site/chrome.js); design tokens in [`site/colors_and_type.css`](site/colors_and_type.css). Edit pages in place — no compile step.

## Deployment

Every push to `main` deploys `site/` to GitHub Pages via [`.github/workflows/pages.yml`](.github/workflows/pages.yml). Nothing else to do.

## Framer embeds

Each page can also live inside a Framer site as a single Embed element. Regenerate the bundles after changing anything in `site/`:

```bash
node build-framer-embeds.js
# or, to wire the live demos to GitHub Pages:
DEMO_BASE="https://christiankehr1.github.io/orca-website-2-0" node build-framer-embeds.js
```

This inlines CSS, fonts (base64), logos and scripts into one ~1.3 MB HTML file per page under `framer-embeds/`. Placement instructions, per-page embed heights and caveats are in [`framer-embeds/README.md`](framer-embeds/README.md).

## Favicons

The adaptive favicons (light/dark via `prefers-color-scheme`) are generated, not hand-drawn:

```bash
pip3 install --user Pillow   # one-time
python3 build-favicon.py     # writes favicon.svg/.ico + touch/PWA icons into site/
```
