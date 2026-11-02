#!/usr/bin/env python3
"""The @dileepadev logo: live-text and outlined lockups, and the reduced mark, in both themes.

    python3 docs/brand/logo/generate.py

Brand v2.1.0: the handle is the logo. The "@" is one step muted and the wordmark full contrast,
both Manrope 500 with -0.02em tracking, set as one word. Black and white only.

Needs: `pip install fonttools`; Google Chrome on PATH (it measures the live lockup, so the
outlines are spaced exactly as the site draws it); and Manrope installed as a variable font.
"""
import re, subprocess, tempfile, json, pathlib
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

HERE = pathlib.Path(__file__).parent
FONT = subprocess.run(["fc-match", "-f", "%{file}", "Manrope"], capture_output=True, text=True).stdout  # fontconfig finds the installed variable font

# Semantic palette, from ../brand-tokens.css.
THEMES = {
    "dark": {"field": "#050505", "mark": "#8D8D8D", "word": "#F1F1F1"},   # Carbon: ink-400 / ink-100
    "light": {"field": "#F7F7F7", "mark": "#6A6A6A", "word": "#131313"},  # Paper: paper-400 / paper-900
}
SIZE = 32          # font size of the lockup file, in px
TRACK = -0.02      # em; --track-tight
GAP = 0.02         # em; the site's .lockup gap, which cancels the "@" glyph's own tracking
BASE = 34          # baseline y in the 48px-high lockup viewBox
PAD = 2            # px of air around the ink

font = instancer.instantiateVariableFont(TTFont(FONT), {"wght": 500})
upem, cmap, gs = font["head"].unitsPerEm, font.getBestCmap(), font.getGlyphSet()

def measure():
    """Start position of each glyph and the advance of the "@", from Chrome's own layout."""
    html = f"""<svg width="1200" height="300" xmlns="http://www.w3.org/2000/svg" font-family="Manrope" font-weight="500" font-size="1000" letter-spacing="{TRACK * 1000}">
<text id="m" x="0" y="200">@</text><text id="w" x="0" y="200">dileepadev</text></svg>
<script>document.fonts.ready.then(()=>{{const w=document.getElementById('w');const xs=[...Array(10)].map((_,i)=>w.getStartPositionOfChar(i).x/1000);
document.body.insertAdjacentHTML('beforeend','<pre id=out>'+JSON.stringify({{xs,m:document.getElementById('m').getComputedTextLength()/1000}})+'</pre>')}})</script>"""
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False) as f:
        f.write(html)
    out = subprocess.run(["google-chrome", "--headless=new", "--disable-gpu", "--virtual-time-budget=3000", "--dump-dom", f"file://{f.name}"], capture_output=True, text=True).stdout
    return json.loads(re.search(r'<pre id="out">(.*?)</pre>', out).group(1))

def glyph(ch, size, x, y):
    """The outline of one character as an SVG path, its origin at (x, y), plus its ink bounds."""
    name, s = cmap[ord(ch)], size / upem
    pen = SVGPathPen(gs, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
    gs[name].draw(TransformPen(pen, (s, 0, 0, -s, x, y)))
    bp = BoundsPen(gs); gs[name].draw(TransformPen(bp, (s, 0, 0, -s, x, y)))
    return pen.getCommands(), bp.bounds

m = measure()
word_x0 = (m["m"] + GAP) * SIZE
pos = [("@", 0)] + [(c, word_x0 + x * SIZE) for c, x in zip("dileepadev", m["xs"])]
ink_l = glyph("@", SIZE, 0, BASE)[1][0]
shift = PAD - ink_l                                      # so the ink starts PAD px in
drawn = [glyph(c, SIZE, x + shift, BASE) for c, x in pos]
W = round(drawn[-1][1][2] + PAD, 2)
mark_d = drawn[0][0]
word_d = "".join(g[0] for g in drawn[1:])
tr = f"{TRACK * SIZE:.2f}"

for theme, c in THEMES.items():
    live = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} 48" width="{W}" height="48" role="img" aria-label="@dileepadev">
  <!-- Live text: Manrope 500 must be available. Use the outlined file anywhere it might not be. -->
  <text x="{shift:.2f}" y="{BASE}" font-family="Manrope, system-ui, sans-serif" font-weight="500" font-size="{SIZE}" letter-spacing="{tr}"><tspan fill="{c['mark']}">@</tspan><tspan dx="{GAP * SIZE:.2f}" fill="{c['word']}">dileepadev</tspan></text>
</svg>
"""
    outlined = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} 48" width="{W}" height="48" role="img" aria-label="@dileepadev">
  <!-- Outlined: Manrope 500 converted to paths, so it needs no font. For speaker packs, print and third-party sites; on our own surfaces use the CSS lockup. Manrope is SIL OFL 1.1. -->
  <path fill="{c['mark']}" d="{mark_d}"/>
  <path fill="{c['word']}" d="{word_d}"/>
</svg>
"""
    (HERE / f"lockup-{theme}.svg").write_text(live)
    (HERE / f"lockup-{theme}-outlined.svg").write_text(outlined)

    # The reduced mark: the "@" alone at full contrast, centred on a Carbon or Paper field.
    d, (x0, y0, x1, y1) = glyph("@", SIZE, 0, 0)
    k = 28 / (y1 - y0)                                   # the "@" is 28px tall on the 48px field
    d, (x0, y0, x1, y1) = glyph("@", SIZE * k, 0, 0)
    d, _ = glyph("@", SIZE * k, 24 - (x0 + x1) / 2, 24 - (y0 + y1) / 2)
    (HERE / f"mark-{theme}.svg").write_text(f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="@dileepadev">
  <!-- Reduced mark: the "@" alone, outlined, centred on a field. For avatars and small square placements. -->
  <rect width="48" height="48" fill="{c['field']}"/>
  <path fill="{c['word']}" d="{d}"/>
</svg>
""")
print(f"lockup {W} x 48; wordmark starts at {word_x0:.2f}px; kerned positions {[round(x*SIZE,2) for x in m['xs']]}")
