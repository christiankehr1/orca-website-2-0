#!/usr/bin/env python3
"""Generate ORCA favicons from the white logo symbol on the brand gradient.

Outputs into site/:
  favicon.ico (16/32/48), favicon-16.png, favicon-32.png, favicon.svg  -> rounded, for browser tabs
  apple-touch-icon.png (180), favicon-192.png, favicon-512.png          -> full-bleed square, for iOS / PWA

Run: python3 build-favicon.py
"""
import base64, os
from PIL import Image, ImageDraw

SITE = os.path.join(os.path.dirname(__file__), "site")
ASSETS = os.path.join(SITE, "assets")
M = 512  # master size

# --- brand vertical gradient: ocean #3a5f6d -> depth #26333f -> black ---
def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

top, mid, bot = (0x3a, 0x5f, 0x6d), (0x26, 0x33, 0x3f), (0, 0, 0)
grad = Image.new("RGBA", (M, M))
px = grad.load()
for y in range(M):
    t = y / (M - 1)
    c = lerp(top, mid, t / 0.5) if t < 0.5 else lerp(mid, bot, (t - 0.5) / 0.5)
    for x in range(M):
        px[x, y] = (c[0], c[1], c[2], 255)

# --- white ORCA symbol, centered at ~62% height ---
logo = Image.open(os.path.join(ASSETS, "orca-symbol-white.png")).convert("RGBA")
lw, lh = logo.size
th = int(M * 0.62)
tw = int(th * lw / lh)
logo_r = logo.resize((tw, th), Image.LANCZOS)

square = grad.copy()
square.alpha_composite(logo_r, ((M - tw) // 2, (M - th) // 2))

# rounded variant for tab favicons
radius = int(M * 0.18)
mask = Image.new("L", (M, M), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, M - 1, M - 1], radius=radius, fill=255)
rounded = square.copy()
rounded.putalpha(mask)

def save(img, name, size):
    img.resize((size, size), Image.LANCZOS).save(os.path.join(SITE, name))

# rounded -> tabs
save(rounded, "favicon-16.png", 16)
save(rounded, "favicon-32.png", 32)
rounded.save(os.path.join(SITE, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])

# full-bleed square -> iOS / PWA (iOS applies its own corner mask)
save(square, "apple-touch-icon.png", 180)
save(square, "favicon-192.png", 192)
save(square, "favicon-512.png", 512)

# scalable SVG favicon (embeds the rounded master as base64)
rpng = os.path.join(SITE, "_favicon-rounded-512.png")
rounded.save(rpng)
b64 = base64.b64encode(open(rpng, "rb").read()).decode()
os.remove(rpng)
svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" '
       'viewBox="0 0 512 512"><image width="512" height="512" '
       'href="data:image/png;base64,%s"/></svg>' % b64)
open(os.path.join(SITE, "favicon.svg"), "w").write(svg)

print("Wrote favicons to site/: favicon.ico, favicon.svg, favicon-16/32/192/512.png, apple-touch-icon.png")
