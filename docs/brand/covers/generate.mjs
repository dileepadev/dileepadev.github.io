// Social covers: the J1 artwork - an engineer guiding a team of agents up to one goal - at every
// platform's size. Brand v2.1.0: black and white, Manrope and JetBrains Mono, the site's tiles,
// Lucide icons and dot grid.
//
//   node docs/brand/covers/generate.mjs            # all eight
//   node docs/brand/covers/generate.mjs x-header   # one
//
// Needs: Google Chrome on PATH; Manrope and JetBrains Mono installed; and the site checked out
// beside this repo (../dileepa-dev with `npm install` run) for lucide-react's icon data and sharp.
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
const T = { bg: "#050505", surface: "#0d0d0d", raised: "#141414", rule: "#1f1f1f", edge: "#2e2e2e", input: "#5b5b5b", body: "#a8a8a8", muted: "#8d8d8d", fg: "#f1f1f1" };
const W = 1584, H = 396;
const HERE = new URL(".", import.meta.url).pathname;
const SITE = new URL("../../../../dileepa-dev/", import.meta.url).pathname; // the site checkout, for lucide-react and sharp
const LUCIDE = SITE + "node_modules/lucide-react/dist/esm/icons/";
const iconInner = (n) => new Function("return " + readFileSync(LUCIDE + n + ".mjs", "utf8").match(/const __iconNode = (\[[\s\S]*?\]);\s*\n/)[1])()
  .map(([t, a]) => `<${t} ${Object.entries(a).filter(([k]) => k !== "key").map(([k, v]) => `${k}="${v}"`).join(" ")}/>`).join("");
const icon = (n, x, y, s, c = T.fg, sw = 1.7) => `<g transform="translate(${x - s / 2} ${y - s / 2}) scale(${s / 24})" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${iconInner(n)}</g>`;
const tile = (cx, cy, s, n, c = T.fg, k = 0.5, ring = false) => `${ring ? `<rect x="${cx - s / 2 - 6}" y="${cy - s / 2 - 6}" width="${s + 12}" height="${s + 12}" rx="${s * 0.27 + 5}" fill="none" stroke="${T.fg}" stroke-dasharray="3 4" opacity=".7"/>` : ""}<rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" rx="${s * 0.27}" fill="url(#tileG)" stroke="${ring ? T.body : T.edge}"/><rect x="${cx - s / 2 + 1}" y="${cy - s / 2 + 1}" width="${s - 2}" height="${s * .5}" rx="${s * .27}" fill="url(#tileHi)"/>${icon(n, cx, cy, s * k, c, 1.6)}`;
const person = (cx, cy, r, fill, stroke = "none") => `<g><circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}"/><path d="M${cx - r * 1.55} ${cy + r * 3.1} a${r * 1.55} ${r * 1.7} 0 0 1 ${r * 3.1} 0 z" fill="${fill}" stroke="${stroke}"/></g>`;
const dp = (d, c = T.input, dash = "3 5", arrow = false, w = 1.5) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-dasharray="${dash}" ${arrow ? 'marker-end="url(#arr)"' : ""}/>`;
const badge = (x, y, n = "check", r = 10) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${T.fg}"/>${icon(n, x, y, r * 1.3, T.bg, 2.8)}`;
const card = (cx, by, o = {}) => { const w = o.w ?? 50, h = o.h ?? 62, x = cx - w / 2, y = by - h;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${T.surface}" stroke="${o.hot ? T.fg : T.input}" stroke-width="${o.hot ? 1.8 : 1.4}"/>` +
    (o.ico ? icon(o.ico, cx, y + 20, 20, T.fg, 1.8) : "") +
    [0.72, 0.5, 0.62].slice(0, o.lines ?? 3).map((f, i) => `<rect x="${x + 9}" y="${y + (o.ico ? 38 : 14) + i * 9}" width="${(w - 18) * f}" height="4" rx="2" fill="${o.hot ? T.body : T.edge}"/>`).join("") + (o.check ? badge(x + w - 3, y + 3) : ""); };
const agent = (x, y, s, o = {}) => {
  const l = o.l ?? [18, 92], r = o.r ?? [82, 92];
  const arm = ([sx, sy], [hx, hy]) => `<path d="M${sx} ${sy} Q${(sx + hx) / 2 + (hx < sx ? -6 : 6)} ${Math.min(sy, hy) + 4} ${hx} ${hy}" fill="none" stroke="${T.muted}" stroke-width="5" stroke-linecap="round"/><circle cx="${hx}" cy="${hy}" r="5" fill="${T.body}"/>`;
  return `<g transform="translate(${x - 50 * s} ${y - 117 * s}) scale(${s})"><line x1="50" y1="14" x2="50" y2="5" stroke="${T.input}" stroke-width="3"/><circle cx="50" cy="5" r="4" fill="${o.live ? T.fg : T.fg}"/>
  ${arm([30, 68], l)}<rect x="32" y="97" width="36" height="12" rx="6" fill="${T.edge}" stroke="${T.input}" stroke-width="2"/><circle cx="40" cy="112" r="5" fill="${T.input}"/><circle cx="60" cy="112" r="5" fill="${T.input}"/>
  <rect x="45" y="51" width="10" height="8" fill="${T.input}"/><rect x="28" y="58" width="44" height="40" rx="14" fill="${T.rule}" stroke="${T.muted}" stroke-width="2.5"/>${o.chest ? icon(o.chest, 50, 78, 17, T.body, 2) : `<rect x="42" y="72" width="16" height="4" rx="2" fill="${T.input}"/>`}
  <rect x="22" y="14" width="56" height="38" rx="18" fill="${T.rule}" stroke="${T.muted}" stroke-width="2.5"/><rect x="34" y="28" width="32" height="9" rx="4.5" fill="${T.fg}"/>${arm([70, 68], r)}${o.prop ?? ""}</g>`; };
// The human: the engineer, in white, with round glasses. Anchored at the feet (150 tall locally).
const human = (x, y, s, o = {}) => {
  const l = o.l ?? [22, 108], r = o.r ?? [78, 108];
  const arm = ([sx, sy], [hx, hy]) => `<path d="M${sx} ${sy} Q${(sx + hx) / 2 + (hx < sx ? -7 : 7)} ${Math.max(sy, hy) - 6} ${hx} ${hy}" fill="none" stroke="#e4e4e4" stroke-width="9.5" stroke-linecap="round"/><circle cx="${hx}" cy="${hy}" r="6" fill="${T.fg}"/>`;
  return `<g transform="translate(${x - 50 * s} ${y - 150 * s}) scale(${s})"><defs><linearGradient id="shirt" x1="0" x2="1"><stop offset="0" stop-color="#f4f4f4"/><stop offset="1" stop-color="#c9c9c9"/></linearGradient></defs>
  <rect x="36" y="96" width="12" height="48" rx="6" fill="${T.body}"/><rect x="52" y="96" width="12" height="48" rx="6" fill="${T.body}"/>
  <rect x="32" y="141" width="19" height="8" rx="4" fill="${T.muted}"/><rect x="49" y="141" width="19" height="8" rx="4" fill="${T.muted}"/>
  ${arm([37, 56], l)}<path d="M29 58 Q29 40 46 40 H54 Q71 40 71 58 V94 Q71 104 61 104 H39 Q29 104 29 94 Z" fill="url(#shirt)"/>${arm([63, 56], r)}
  <rect x="45" y="32" width="10" height="12" rx="4" fill="#d6d6d6"/><path d="M43 41 L50 52 L57 41" fill="none" stroke="${T.muted}" stroke-width="2" stroke-linejoin="round"/><rect x="49" y="60" width="2" height="36" fill="#bdbdbd"/>
  <circle cx="50" cy="21" r="16" fill="${T.fg}"/><path d="M34 19 A16 16 0 0 1 66 19 Q50 8 34 19 Z" fill="#1d1d1d"/>
  <circle cx="43.5" cy="24" r="5.5" fill="none" stroke="${T.bg}" stroke-width="2"/><circle cx="56.5" cy="24" r="5.5" fill="none" stroke="${T.bg}" stroke-width="2"/><path d="M49 24h2" stroke="${T.bg}" stroke-width="2"/>${o.prop ?? ""}</g>`; };
const defs = `<defs><linearGradient id="tileG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#232323"/><stop offset="1" stop-color="#101010"/></linearGradient>
<linearGradient id="tileHi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="1.5" fill="${T.edge}"/></pattern>
<marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9" fill="none" stroke="${T.body}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></marker>
<linearGradient id="fadeL" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff"/></linearGradient><mask id="mL"><rect width="${W}" height="${H}" fill="url(#fadeL)"/></mask></defs>`;

const panel = (x, y, w, h, r = 20) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${T.surface}" stroke="${T.edge}"/>`;
const bars = (x, y, w, h, vals, hot = -1) => { const bw = (w - (vals.length - 1) * 6) / vals.length; return vals.map((v, i) => `<rect x="${x + i * (bw + 6)}" y="${y + h - v * h}" width="${bw}" height="${v * h}" rx="3" fill="${i === hot ? T.fg : T.input}"/>`).join(""); };
const spark = (x, y, w, h, pts) => { const d = pts.map((v, i) => `${i ? "L" : "M"}${x + i * w / (pts.length - 1)} ${y + h - v * h}`).join(" "); const last = pts[pts.length - 1];
  return `<path d="${d}" fill="none" stroke="${T.body}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${x + w}" cy="${y + h - last * h}" r="4" fill="${T.fg}"/>`; };
const ring = (cx, cy, r, f) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${T.edge}" stroke-width="6"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${T.fg}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${2 * Math.PI * r * f} ${2 * Math.PI * r}" transform="rotate(-90 ${cx} ${cy})"/>`;
const trail = (x, y, n = 3) => Array.from({ length: n }, (_, i) => `<path d="M${x - 16 - i * 14} ${y - 10 + i * 10}h${-12 + i * 2}" stroke="${T.input}" stroke-width="2.5" stroke-linecap="round" opacity="${0.85 - i * 0.25}"/>`).join("");
const ground = (g) => `<line x1="330" y1="${g}" x2="1570" y2="${g}" stroke="${T.edge}"/>`;


const g = 336;
const ringW = (cx, cy, r, f, w = 4) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${T.edge}" stroke-width="${w}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${T.body}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${2 * Math.PI * r * f} ${2 * Math.PI * r}" transform="rotate(-90 ${cx} ${cy})"/>`;
const qpt = (p0, c, p2, t = 0.5) => [(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p2[1]];

// J1 - the climb: pieces are handed up a staircase to the goal; the engineer guides from below
const art = () => { let s = "";
  const steps = [[560, 300], [700, 260], [840, 220], [980, 180], [1120, 140]];
    steps.forEach(([x, top], i) => { const w = i === 4 ? 440 : 140; s += `<rect x="${x}" y="${top}" width="${w}" height="${g - top}" rx="14" fill="${T.surface}" stroke="${T.edge}"/><rect x="${x + 2}" y="${top + 2}" width="${w - 4}" height="${Math.min(g - top - 4, 70)}" rx="12" fill="url(#dots)" opacity=".55"/>`; });
  const ic = ["list-checks", "search", "database", "code-xml", "flask-conical"], pi = ["database", "file-text", "code-xml", "shield-check"];
  steps.forEach(([x, top], i) => { s += agent(x + 70, top, 0.84, { chest: ic[i], r: [98, 52], l: [4, 60] }); });
  steps.forEach(([x, top], i) => { const ax = x + 70;
    if (i < 3) s += badge(ax + 34, top - 82, "check", 9); else if (i === 3) s += `<circle cx="${ax + 34}" cy="${top - 82}" r="9" fill="none" stroke="${T.fg}" stroke-dasharray="3 3"/>`; });
  for (let i = 0; i < 4; i++) { const a = [steps[i][0] + 70 + 40, steps[i][1] - 60], b = [steps[i + 1][0] + 70 - 40, steps[i + 1][1] - 60], c = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 40];
    s += dp(`M${a[0]} ${a[1]} Q${c[0]} ${c[1]} ${b[0]} ${b[1]}`, T.body, "4 4", true); const m = qpt(a, c, b); s += card(m[0], m[1] + 22, { w: 30, h: 38, lines: 0, ico: pi[i] }); }
  s += dp("M1236 84 L1352 84", T.body, "4 4", true) + card(1296, 108, { w: 30, h: 38, lines: 0, ico: "flask-conical" });
  s += ringW(1420, 84, 66, 0.8) + tile(1420, 84, 96, "target", T.fg, 0.5, true);
  s += dp("M1420 150 V186", T.body, "4 4", true) + `<line x1="1300" y1="186" x2="1540" y2="186" stroke="${T.edge}"/>`;
  [[1310, "presentation"], [1380, "pen-line"], [1450, "video"], [1520, "users"]].forEach(([x, i]) => (s += `<line x1="${x}" y1="186" x2="${x}" y2="204" stroke="${T.edge}"/>` + tile(x, 230, 52, i, T.body, 0.5)));
  s += human(450, g, 1.38, { l: [14, 106], r: [132, 14], prop: icon("compass", 152, -8, 30, T.fg, 2) });
  s += dp("M596 126 C740 24 1040 2 1340 52", T.body, "5 6", true, 1.6) + tile(909, 32, 34, "route", T.fg, 0.55);
  return s; };


const SPECS = [
  { name: "linkedin-cover", W: 1584, H: 396, s: 1, x: 0, y: 0, boost: 1 },
  { name: "x-header", W: 1500, H: 500, s: 0.94, x: 6, y: 38, boost: 1.12 },
  { name: "youtube-banner", W: 2560, H: 1440, s: 0.976, x: 507, y: 509, boost: 1.25 },
  { name: "facebook-cover", W: 1640, H: 624, s: 0.74, x: 234, y: 176, boost: 1.15 },
  { name: "reddit-banner", W: 1920, H: 384, s: 0.96, x: 200, y: 2, boost: 1 },
  { name: "github-social", W: 1280, H: 640, s: 0.76, x: 38, y: 300, custom: { hx: 64, hy: 168, hs: 96, dx: 68, dy: 232, ds: 48 } },
  { name: "twitch-banner", W: 1200, H: 480, s: 0.74, x: 14, y: 96, boost: 1.18 },
  { name: "discord-banner", W: 600, H: 240, s: 0.38, x: -1, y: 56, boost: 1.4 },
];
const defsFor = (p) => `<defs><linearGradient id="tileG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#232323"/><stop offset="1" stop-color="#101010"/></linearGradient>
<linearGradient id="tileHi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="1.5" fill="${T.edge}"/></pattern>
<pattern id="bgdots" width="${24 * p.s}" height="${24 * p.s}" patternUnits="userSpaceOnUse" patternTransform="translate(${p.x} ${p.y})"><circle cx="${12 * p.s}" cy="${12 * p.s}" r="${1.5 * p.s}" fill="${T.edge}"/></pattern>
<marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9" fill="none" stroke="${T.body}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></marker>
<linearGradient id="fadeX" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff"/></linearGradient><mask id="mX"><rect width="${p.W}" height="${p.H}" fill="url(#fadeX)"/></mask></defs>`;
const textFor = (p) => { const c = p.custom;
  const hs = c ? c.hs : 54 * p.s * p.boost, ds = c ? c.ds : 30 * p.s * p.boost;
  const hx = c ? c.hx : p.x + 52 * p.s, hy = c ? c.hy : p.y + 38 * p.s + hs, dx = c ? c.dx : p.x + 56 * p.s, dy = c ? c.dy : hy + 44 * p.s * p.boost;
  return `<text x="${hx}" y="${hy}" font-family="Manrope" font-weight="500" font-size="${hs}" letter-spacing="-0.03em"><tspan fill="${T.muted}">@</tspan><tspan fill="${T.fg}">dileepadev</tspan></text><text x="${dx}" y="${dy}" font-family="JetBrains Mono" font-size="${ds}" fill="${T.body}">dileepa.dev</text>`; };
const page = (p) => `<!doctype html><meta charset="utf-8"><style>*{margin:0}html,body{width:${p.W}px;height:${p.H}px;background:${T.bg};overflow:hidden}</style>
<svg width="${p.W}" height="${p.H}" xmlns="http://www.w3.org/2000/svg">${defsFor(p)}<rect width="${p.W}" height="${p.H}" fill="${T.bg}"/><rect width="${p.W}" height="${p.H}" fill="url(#bgdots)" mask="url(#mX)" opacity=".75"/>
<line x1="0" y1="${p.y + 336 * p.s}" x2="${p.W}" y2="${p.y + 336 * p.s}" stroke="${T.edge}" stroke-width="${Math.max(1, p.s)}"/>
<g transform="translate(${p.x} ${p.y}) scale(${p.s})">${art()}</g>${textFor(p)}</svg>`;
// --- export: render each page in headless Chrome, then make a JPG of each PNG -------------
const sharp = createRequire(SITE + "package.json")("sharp");
const tmp = mkdtempSync(join(tmpdir(), "covers-"));
const only = process.argv[2];
for (const p of SPECS) {
  if (only && p.name !== only) continue;
  const html = join(tmp, `${p.name}.html`), png = `${HERE}${p.name}.png`;
  writeFileSync(html, page(p));
  execFileSync("google-chrome", ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--disable-lcd-text", "--force-device-scale-factor=1", `--window-size=${p.W},${p.H}`, "--virtual-time-budget=4000", `--screenshot=${png}`, `file://${html}`], { stdio: "ignore" });
  await sharp(png).jpeg({ quality: 92, mozjpeg: true }).toFile(`${HERE}${p.name}.jpg`);
  console.log(`${p.name}  ${p.W}x${p.H}`);
}
