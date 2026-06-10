#!/usr/bin/env node
/* ------------------------------------------------------------------
   build-framer-embeds.js
   Collapses each page in site/ into ONE self-contained .html file
   suitable for pasting into a Framer "Embed" element (HTML mode).

   Inlines: colors_and_type.css + styles.css, the icon sprite + nav +
   footer (chrome.js), every page script, fonts (base64), and the
   logo PNGs (base64). The two live demos can't be inlined, so they
   revert to their styled placeholders — see framer-embeds/README.md
   for the one-step way to wire them live.

   Run: node build-framer-embeds.js
   ------------------------------------------------------------------ */
const fs = require("fs");
const path = require("path");

const SITE = path.join(__dirname, "site");
const OUT = path.join(__dirname, "framer-embeds");
fs.mkdirSync(OUT, { recursive: true });

/* 1 — design tokens CSS with fonts inlined as base64 data URIs */
let tokens = fs.readFileSync(path.join(SITE, "colors_and_type.css"), "utf8");
const fontDir = path.join(SITE, "fonts");
for (const f of fs.readdirSync(fontDir)) {
  if (!f.endsWith(".woff2")) continue;
  const b64 = fs.readFileSync(path.join(fontDir, f)).toString("base64");
  tokens = tokens.split(`fonts/${f}`).join(`data:font/woff2;base64,${b64}`);
}
const styles = fs.readFileSync(path.join(SITE, "styles.css"), "utf8");
const combinedCss = tokens + "\n\n" + styles;

/* 2 — logo PNGs as base64 */
const dataPng = (p) => `data:image/png;base64,${fs.readFileSync(p).toString("base64")}`;
const logoBlack = dataPng(path.join(SITE, "assets/orca-symbol-black.png"));
const logoWhite = dataPng(path.join(SITE, "assets/orca-symbol-white.png"));

/* 3 — chrome.js with logos inlined */
let chrome = fs.readFileSync(path.join(SITE, "chrome.js"), "utf8")
  .split("assets/orca-symbol-black.png").join(logoBlack)
  .split("assets/orca-symbol-white.png").join(logoWhite);

/* 4 — live-demo embeds.
   If DEMO_BASE is set (e.g. DEMO_BASE=https://user.github.io/repo node build-framer-embeds.js),
   the demo iframes point at the hosted demos and stay live. Otherwise they revert to styled
   placeholders (the fonts/CSS/chrome are still fully inlined either way). */
const DEMO_BASE = (process.env.DEMO_BASE || "").replace(/\/$/, "");
function handleDemo(block) {
  if (DEMO_BASE) {
    return block.replace(/src="demos\//g, `src="${DEMO_BASE}/demos/`);
  }
  const isSonar = block.includes("sonar");
  const label = isSonar ? "Interactive Sonar walkthrough" : "Live structure chart";
  const icon = isSonar ? "spark" : "chart";
  const minH = isSonar ? 480 : 300;
  return `<div class="ph" style="min-height:${minH}px;border:0;border-radius:0">
          <span class="ph__tag">interactive demo</span>
          <span class="ph__icon"><svg class="ic" width="20" height="20"><use href="#i-${icon}"/></svg></span>
          <div><div class="ph__label">${label}</div><div class="ph__sub">Self-contained build keeps this as a placeholder. Re-run with DEMO_BASE set to go live — see README.</div></div>
        </div>`;
}

/* 5 — build each page */
const pages = ["index", "platform", "solutions", "segment", "why-orca", "customers", "watch-demo", "book-demo", "404"];
const report = [];
for (const name of pages) {
  let html = fs.readFileSync(path.join(SITE, `${name}.html`), "utf8");

  // inline the two stylesheets
  html = html
    .split('<link rel="stylesheet" href="colors_and_type.css" />').join(`<style>\n${combinedCss}\n</style>`)
    .split('<link rel="stylesheet" href="styles.css" />').join("");

  // strip favicon links — pointless inside an iframe embed, and would leave
  // unresolved relative refs (the page itself lives on GitHub Pages with favicons)
  html = html.replace(/[ \t]*<link rel="(?:icon|apple-touch-icon)"[^>]*\/?>\n?/g, "");

  // inline chrome.js
  html = html.split('<script src="chrome.js"></script>').join(`<script>\n${chrome}\n</script>`);

  // inline logos referenced directly in page bodies
  html = html.split("assets/orca-symbol-black.png").join(logoBlack)
             .split("assets/orca-symbol-white.png").join(logoWhite);

  // demo embeds: live (if DEMO_BASE) or styled placeholder
  html = html.replace(/<div class="embed"[\s\S]*?<\/iframe>\s*<\/div>/g, handleDemo);

  // Framer page routing: break cross-page links out of the embed iframe to the
  // parent Framer page paths; keep same-page #anchors scrolling inside the embed.
  const selfSlug = name === "index" ? "/" : `/${name}`;
  const routing = `
<script>
/* Framer routing — added by build-framer-embeds.js.
   Maps page.html links to Framer page paths and target=_top so they navigate
   the parent Framer site, not the embed iframe. Same-page #anchors stay internal.
   If your Framer slugs differ from these, change MAP and re-run the build. */
(function () {
  var MAP = {"index.html":"/","platform.html":"/platform","solutions.html":"/solutions","segment.html":"/segment","why-orca.html":"/why-orca","customers.html":"/customers","watch-demo.html":"/watch-demo","book-demo.html":"/book-demo"};
  var SELF = ${JSON.stringify(selfSlug)};
  function rewrite() {
    var links = document.querySelectorAll("a[href]");
    for (var i = 0; i < links.length; i++) {
      var a = links[i], h = a.getAttribute("href");
      if (!h) continue;
      var m = h.match(/^([A-Za-z0-9_-]+)\\.html(#.*)?$/);
      if (!m) continue;
      var base = MAP[m[1] + ".html"] || ("/" + m[1]);
      if (base === SELF && m[2]) { a.setAttribute("href", m[2]); a.removeAttribute("target"); }
      else { a.setAttribute("href", base + (m[2] || "")); a.setAttribute("target", "_top"); }
    }
  }
  rewrite();
  document.addEventListener("DOMContentLoaded", rewrite);
  setTimeout(rewrite, 0);
})();
</script>`;
  html = html.replace("</body>", routing + "\n</body>");

  fs.writeFileSync(path.join(OUT, `${name}.html`), html);
  report.push([`${name}.html`, (Buffer.byteLength(html) / 1024).toFixed(0) + " KB"]);
}

console.log("Wrote self-contained embeds to framer-embeds/:");
report.forEach(([n, s]) => console.log("  " + n.padEnd(18) + s));
