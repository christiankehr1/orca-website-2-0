#!/usr/bin/env python3
"""Generate appearance-adaptive ORCA favicons from the logo symbol.

Two branded cards, switched by the browser's light/dark appearance:
  - light mode -> light gradient card + depth-navy ORCA mark
  - dark mode  -> ocean->depth->black gradient card + white ORCA mark

Outputs into site/:
  favicon.svg            adaptive (light/dark via prefers-color-scheme)
  favicon.ico            dark card 16/32/48 — universal fallback (always visible)
  apple-touch-icon.png   dark card 180 (iOS)
  favicon-192/512.png    dark card (PWA)

Run: python3 build-favicon.py   (needs Pillow: pip3 install --user Pillow)
"""
import base64, io, os
from PIL import Image, ImageDraw

SITE = os.path.join(os.path.dirname(__file__), "site")
ASSETS = os.path.join(SITE, "assets")
M = 512

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def vgrad(stops):
    g = Image.new("RGBA", (M, M)); px = g.load()
    for y in range(M):
        t = y / (M - 1); c = stops[-1][1]
        for i in range(len(stops) - 1):
            p0, c0 = stops[i]; p1, c1 = stops[i + 1]
            if p0 <= t <= p1:
                c = lerp(c0, c1, (t - p0) / (p1 - p0) if p1 > p0 else 0); break
        for x in range(M):
            px[x, y] = (c[0], c[1], c[2], 255)
    return g

# ORCA mark alpha (shape), tintable to any colour
sym = Image.open(os.path.join(ASSETS, "orca-symbol-white.png")).convert("RGBA")
alpha = sym.split()[3]
def mark(color):
    img = Image.new("RGBA", sym.size, color + (0,)); img.putalpha(alpha); return img

dark_grad  = vgrad([(0, (0x3a, 0x5f, 0x6d)), (0.5, (0x26, 0x33, 0x3f)), (1, (0, 0, 0))])
light_grad = vgrad([(0, (0xff, 0xff, 0xff)), (1, (0xe9, 0xee, 0xf3))])

def compose(grad, logo, hf=0.62):
    th = int(M * hf); tw = int(th * logo.width / logo.height)
    lr = logo.resize((tw, th), Image.LANCZOS)
    out = grad.copy(); out.alpha_composite(lr, ((M - tw) // 2, (M - th) // 2)); return out

dark_sq  = compose(dark_grad,  mark((255, 255, 255)))
light_sq = compose(light_grad, mark((0x26, 0x33, 0x3f)))

def rounded(img, border=None):
    r = int(M * 0.18)
    mask = Image.new("L", (M, M), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, M - 1, M - 1], radius=r, fill=255)
    out = img.copy(); out.putalpha(mask)
    if border:  # subtle hairline so a light card reads on light browser chrome
        ImageDraw.Draw(out).rounded_rectangle([4, 4, M - 5, M - 5], radius=r - 4, outline=border, width=8)
    return out

dark_round  = rounded(dark_sq)
light_round = rounded(light_sq, border=(0xcf, 0xd8, 0xe3, 255))

def save(img, name, size):
    img.resize((size, size), Image.LANCZOS).save(os.path.join(SITE, name))

# dark card -> universal fallback + iOS/PWA
dark_round.save(os.path.join(SITE, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
save(dark_sq, "apple-touch-icon.png", 180)
save(dark_sq, "favicon-192.png", 192)
save(dark_sq, "favicon-512.png", 512)

# adaptive SVG: light card by default, dark card under prefers-color-scheme: dark
def b64(img):
    bio = io.BytesIO(); img.save(bio, "PNG"); return base64.b64encode(bio.getvalue()).decode()
svg = (
'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">'
'<style>.d{display:none}@media (prefers-color-scheme:dark){.l{display:none}.d{display:inline}}</style>'
'<image class="l" width="512" height="512" href="data:image/png;base64,%s"/>'
'<image class="d" width="512" height="512" href="data:image/png;base64,%s"/>'
'</svg>' % (b64(light_round), b64(dark_round)))
open(os.path.join(SITE, "favicon.svg"), "w").write(svg)

# remove now-unused single-mode PNGs from the earlier version
for old in ("favicon-16.png", "favicon-32.png"):
    p = os.path.join(SITE, old)
    if os.path.exists(p): os.remove(p)

# verification copies (not shipped)
light_round.save("/tmp/fav-light.png"); dark_round.save("/tmp/fav-dark.png")
print("Wrote adaptive favicon.svg + favicon.ico + apple-touch/192/512 (dark card). Verify: /tmp/fav-light.png, /tmp/fav-dark.png")
