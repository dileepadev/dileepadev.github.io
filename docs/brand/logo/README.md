# Logo

The logo is the handle, **`@dileepadev`**: the wordmark in Manrope 500 at full contrast, led by an
`@` at the same weight in the muted step of the same ink, set as one word with no space. The
two parts are told apart by contrast alone. Black and white only. The full rules, including what
never to do to it, are in [`../brand-guide.md`](../brand-guide.md) §3.

| File                                            | Surface          | `@`                   | Wordmark              |
| ----------------------------------------------- | ---------------- | --------------------- | --------------------- |
| `lockup-dark.svg`, `lockup-dark-outlined.svg`   | Carbon `#050505` | `ink-400` `#8D8D8D`   | `ink-100` `#F1F1F1`   |
| `lockup-light.svg`, `lockup-light-outlined.svg` | Paper `#F7F7F7`  | `paper-400` `#6A6A6A` | `paper-900` `#131313` |
| `mark-dark.svg`                                 | Carbon field     | -                     | `ink-100` `#F1F1F1`   |
| `mark-light.svg`                                | Paper field      | -                     | `paper-900` `#131313` |

The lockups have a transparent background and are drawn to sit on the surface named in the table.
The marks carry their field, so they work as an avatar as they are.

## Live text or outlined

`lockup-*.svg` is live text: it renders exactly right wherever Manrope is loaded, and stays a few
hundred bytes. `lockup-*-outlined.svg` has Manrope converted to paths, so it needs no font. Use the
outlined file anywhere the font might be missing: a conference speaker pack, a print vendor, a
third-party site. The two are laid out identically; the outlines come from the same kerning the
browser applies. Manrope is licensed under the SIL OFL 1.1, which permits outlining.

On our own surfaces, use the CSS lockup rather than these files. It follows the theme and needs no
light and dark swap:

```html
<a class="lockup" href="/" aria-label="dileepadev - home">
  <span class="mark" aria-hidden="true">@</span
  ><span class="wordmark">dileepadev</span>
</a>
```

`.lockup`, `.mark` and `.wordmark` are defined in [`../brand-tokens.css`](../brand-tokens.css); the
website renders them from `components/ui/Lockup.tsx`.

## Rules

- Minimum width **120px** for the lockup.
- Clear space equal to the wordmark's cap-height on all four sides.
- The `@` is always the muted step and the wordmark always full contrast. Never one colour for
  both, never the reverse, never a hue.
- Never outline it as a stroke, add a gradient or shadow, rotate it, or set it on a photograph
  without a solid backing shape.
- Use the reduced `@` mark only where the full handle will not fit: avatars and small square
  placements.

## Favicon

The favicon is the portrait, not the mark; see [`../brand-guide.md`](../brand-guide.md) §3.2. The
icon set is in [`../favicon/`](../favicon/), copied from the website.

## Rebuilding

```sh
python3 docs/brand/logo/generate.py
```

The script measures the live lockup in headless Chrome, takes Manrope's outlines at weight 500 and
writes all six files. It needs `pip install fonttools`, Google Chrome on `PATH`, and Manrope
installed as a variable font (fontconfig finds it). To change a colour, change it in the `THEMES`
table, from `brand-tokens.css`.
