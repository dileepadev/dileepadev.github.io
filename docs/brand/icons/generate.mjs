// The six pillar marks, in the v2.1.0 palette: black and white, no hue.
//
//   node docs/brand/icons/generate.mjs
//
// The geometry lives in each `<name>-symbol.svg`, which matches `components/icons/PillarIcons.tsx`
// on the site and strokes `currentColor` so it follows any theme. Edit a symbol and run this to
// rebuild the other four files for it. Needs the site checked out as ../dileepa-dev with
// `npm install` run, for `sharp`.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const HERE = new URL(".", import.meta.url).pathname;
const sharp = createRequire(new URL("../../../../dileepa-dev/package.json", import.meta.url).pathname)("sharp");
const INK_100 = "#F1F1F1", INK_800 = "#0D0D0D", INK_500 = "#2E2E2E", CARBON = "#050505";
const STROKE = 'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

for (const file of readdirSync(HERE).filter((f) => f.endsWith("-symbol.svg")).sort()) {
  const name = file.replace("-symbol.svg", "");
  const src = readFileSync(HERE + file, "utf8");
  const title = src.match(/<title>(.*?)<\/title>/s)[1];
  const desc = src.match(/<desc>(.*?)<\/desc>/s)[1];
  const shapes = src.slice(src.indexOf("</desc>") + 7, src.lastIndexOf("</svg>")).trim().replaceAll("currentColor", INK_100);
  const indent = (s, n) => s.split("\n").map((l) => " ".repeat(n) + l.trim()).join("\n");

  // Ink 100, for a Carbon surface.
  const standalone = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${INK_100}" ${STROKE}>
  <title>${title}</title>
  <desc>${desc}</desc>
${indent(shapes, 2)}
</svg>
`;
  // The same mark on a round Carbon badge with a hairline edge.
  const badge = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="60" height="60" fill="none">
  <title>${title} - badge</title>
  <circle cx="30" cy="30" r="29" fill="${INK_800}" stroke="${INK_500}" stroke-width="2"/>
  <g transform="translate(18 18)" stroke="${INK_100}" ${STROKE} fill="none">
${indent(shapes, 4)}
  </g>
</svg>
`;
  writeFileSync(`${HERE}${name}.svg`, standalone);
  writeFileSync(`${HERE}${name}-badge.svg`, badge);

  // PNGs at 512px: the mark on a Carbon field, and the badge on transparency.
  const field = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 36 36" width="512" height="512"><rect x="-6" y="-6" width="36" height="36" fill="${CARBON}"/><g fill="none" stroke="${INK_100}" ${STROKE}>${shapes}</g></svg>`;
  await sharp(Buffer.from(field)).png({ compressionLevel: 9 }).toFile(`${HERE}${name}.png`);
  await sharp(Buffer.from(badge.replace('width="60" height="60"', 'width="512" height="512"'))).png({ compressionLevel: 9 }).toFile(`${HERE}${name}-badge.png`);
  console.log(name);
}
