# Design system

The component and token contract every frontend in the platform implements.

**Canonical token sheet:** [`brand-tokens.css`](brand-tokens.css)
**Brand guide:** [`brand-guide.md`](brand-guide.md)

Applies to `dileepa-dev`, `admin-dileepa-dev`, `links-dileepa-dev`, and the static page in
`dileepadev.github.io`.

**Provenance.** v2.0 shipped as a draft: a brand guide, a token sheet, and an HTML layout
reference, reconciled against each other before anything was built. This document now describes
something different - the system as it actually reads on `dileepa-dev`, the platform's flagship
surface, after a post-launch pass corrected a set of places where the shipped site had drifted
from the v2.0 draft (a hard-coded button colour that ignored the theme, a neutral ramp with a
faint warm cast, type steps invented ad hoc, four unrelated hover treatments). Where the two
disagreed, the shipped, verified result won, and `brand-tokens.css` has been updated to match -
see its own header for the version note. This document is no longer a conflict ledger against a
draft; it is the current contract. The v1.0 HTML reference this repo once reconciled against no
longer exists here and isn't reproduced below.

## 1. The one rule about tokens

**Import the token sheet. Never copy values out of it.**

If you are typing a `#` followed by six hex digits in a component, you are creating the drift
this document exists to prevent. Every colour comes from a semantic variable - `--bg`, `--fg`,
`--fg-muted`, `--brand`, `--brand-fill`, `--on-brand`, `--bg-surface`, `--bg-raised`, `--border`,
`--border-strong`, `--border-input`, plus the derived interaction tokens (`--surface-hover`,
`--raised-hover`, `--brand-fill-hover`, `--brand-fill-active`, `--ring`). The raw palette
(`--emerald-deep`, `--ink-700`, `--paper-200`, …) exists so the semantic layer can be defined
once; components never reference it directly.

This matters because the semantic layer is what flips between themes. A component that reaches
past it into `--emerald-deep` looks correct on Paper and fails on Carbon.

### Per-framework wiring

| Repo | How |
| --- | --- |
| `dileepa-dev`, `admin-dileepa-dev` | Import into `app/globals.css`, expose through Tailwind 4 `@theme` |
| `links-dileepa-dev` | Import into `src/styles/global.css`, expose through Tailwind 4 `@theme` |
| `dileepadev.github.io` | Same as the links repo - vendor the file into `src/styles/` |

Fonts load from Google Fonts in the token sheet's `@import`. Next.js apps should replace that
with `next/font` for Manrope and JetBrains Mono and keep everything else identical.

**Import it into a cascade layer, not unlayered.** Any framework that also loads Tailwind (which
is every consumer above) must declare the layer order up front and import the token sheet into a
named layer that sits *before* Tailwind's `components`/`utilities` layers:

```css
@layer theme, base, brand, components, utilities;

@import "tailwindcss";
@import "./brand-tokens.css" layer(brand);
```

A bare `@import "./brand-tokens.css";`, with no `layer(...)`, loads the sheet **unlayered** - and
unlayered CSS beats every layered rule regardless of source order or specificity. This is not a
theoretical risk: it happened on `dileepa-dev`. The token sheet's blanket `a { color: var(--brand)
}` beat every Tailwind `text-*` utility in the app, including the primary button's own label
(rendering emerald text on an emerald fill), and its `h1, h2, h3 { margin: 0 }` beat every `mt-*`
utility on every heading in the app. Both failures were silent - no error, no warning, a page that
simply looked slightly wrong. Any component-level override that must win even against the layered
sheet (a one-off, page-specific exception) should stay unlayered, exactly as it would need to for
any other CSS layering scheme - but the sheet itself belongs in a layer.

## 2. Colour

**Governing rule:** Emerald is the only accent. No second hue. Everything else in the system is
neutral - the contrast between emerald and near-black or near-white is what carries the brand, not
a second colour competing for attention.

### 2.1 Brand colours

| Role | Name | Hex | Notes |
| --- | --- | --- | --- |
| Primary (light surfaces) | Emerald Deep | `#087F5B` | Buttons, links, headings, logo mark on Paper |
| Primary (dark surfaces) | Emerald Bright | `#23B888` | Same roles, on Carbon |
| Foundation (dark) | Carbon | `#050505` | Site, banners, decks, video |
| Foundation (light) | Paper | `#F7F7F7` | Documents, resume, print, light-mode site |

### 2.2 Neutrals

**Dark ramp:**

| Token | Hex | Use |
| --- | --- | --- |
| `ink-900` | `#050505` | Page foundation |
| `ink-800` | `#0D0D0D` | Card / section surface |
| `ink-700` | `#141414` | Raised surface, code blocks |
| `ink-600` | `#1F1F1F` | Structural rules - section tops, list-row dividers |
| `ink-500` | `#2E2E2E` | Component edges - card, chip, nav, icon-button borders |
| - | `#5B5B5B` | Form-control borders only (`--border-input`, not a ramp step) |
| `ink-400` | `#8D8D8D` | Secondary text (6.1:1) |
| `ink-100` | `#F1F1F1` | Primary text (18.0:1) |

**Light ramp:**

| Token | Hex | Use |
| --- | --- | --- |
| `paper-0` | `#FFFFFF` | Raised cards |
| `paper-50` | `#F7F7F7` | Page foundation |
| `paper-200` | `#E3E3E3` | Structural rules |
| `paper-300` | `#D2D2D2` | Component edges |
| - | `#8F8F8F` | Form-control borders only (`--border-input`) |
| `paper-400` | `#6A6A6A` | Secondary text (5.1:1) |
| `paper-900` | `#131313` | Primary text |

**Two border weights, not one.** `--border` draws the page's structural rules and stays quiet
enough that a long list reads as text rather than a table. `--border-strong` draws the edge of a
*thing* - a card, a chip, the nav, an icon button. `--border-input` is quieter than
`--border-strong` conceptually but is held to a harder floor: it's the one edge WCAG 1.4.11 treats
as load-bearing, since a text field's border is the only signal that it's a field at all, so it's
pinned to 3.0:1 against the page in both themes rather than left at the ramp's nearest stop.

### 2.3 Functional colours

These are interface states, not brand. Never use them in content or graphics.

| State | Hex (dark / light) | Note |
| --- | --- | --- |
| Success | `#23B888` / `#087F5B` | Reuses emerald - no new hue needed |
| Error | `#E5484D` / `#C4292E` | 5.2:1 / 5.3:1 on their backgrounds |
| Warning | `#D97706` / `#B45309` | UI states only, never a brand accent |

**Known gap:** these are wired into the Tailwind theme (`--color-error`, `--color-warning`,
`--color-success`) but not yet consumed anywhere on `dileepa-dev` - the contact form's toasts
render via `react-hot-toast`'s own default styling rather than these tokens. Themed toasts are
specified for `admin-dileepa-dev` (§12) and haven't been backported to the main site.

### 2.4 Links don't carry colour by default

This is the single biggest behavioural change from the v2.0 draft, and the one most likely to
regress if it isn't stated plainly: **an anchor's default colour is `inherit`, not `--brand`.**

```css
a {
  color: inherit;
  text-decoration: none;
}
```

A page where every link is emerald by default has no way to make *one* link mean something - the
accent has to be applied deliberately, by whatever is styling that particular link, not inherited
for free. In practice that means: nav links, entry/item titles, footer links, and the lockup mark
all state their own colour (usually `--fg-muted` at rest, stepping to `--fg` or `--brand` on hover
or active). The one deliberate exception is long-form prose - `.prose a` - where an unstyled link
would otherwise be invisible against its own paragraph, so it gets `--brand` with an underline by
default.

### 2.5 Verified contrast

| Pairing | Ratio | Verdict |
| --- | --- | --- |
| `ink-100` text on Carbon (`bg`) | 18.0:1 | AAA |
| `ink-400` muted text on Carbon (`bg`) | 6.1:1 | AAA |
| `ink-400` muted text on `bg-surface` | 5.9:1 | AAA |
| Emerald Bright on Carbon (`bg`) | 8.0:1 | AAA |
| Emerald Bright on `bg-surface` | 7.7:1 | AAA |
| `paper-900` text on Paper (`bg`) | 17.3:1 | AAA |
| `paper-400` muted text on Paper (`bg`) | 5.1:1 | AA |
| `paper-400` muted text on `bg-surface` | 5.4:1 | AA |
| Emerald Deep on Paper (`bg`) | 4.7:1 | AA |
| Emerald Deep on `bg-surface` | 5.0:1 | AA |
| `--on-brand` on `--brand-fill`, resting (both themes) | 6.0:1 dark / 4.7:1 light | AA+ |
| `--on-brand` on `--brand-fill`, hover | 6.6:1 dark / 5.5:1 light | AA+ |
| `--on-brand` on `--brand-fill`, active | 7.2:1 dark / 6.4:1 light | AAA / AA+ |
| `--border-input` on `--bg` (both themes) | 3.0:1 | WCAG 1.4.11 floor |
| Error on its background (both themes) | 5.2:1 / 5.3:1 | AA |
| Warning on its background (both themes) | 6.4:1 / 4.7:1 | AA |

**Forbidden pairings - these fail and must never ship:**

| Pairing | Ratio |
| --- | --- |
| Emerald Deep on Carbon | 4.1:1 ✗ |
| Emerald Bright on Paper | 2.4:1 ✗ |

### 2.6 Proportion

```text
Neutrals    ████████████████████████████████████████  85%
Emerald     ██████████████                             14%
Functional  ▌                                            1%
```

Emerald appears once per surface as a deliberate act - a button, a rule, a single highlighted
number. Scattering it across a page dilutes the one signal the palette has. **Audit method:** open
a finished page and count the emerald elements. More than two or three on a single viewport means
the accent has stopped being a signal.

## 3. Typography

### 3.1 The faces

| Role | Typeface | Source | Why |
| --- | --- | --- | --- |
| Display + UI | **Manrope** | Google Fonts, weights 400/500/700 | Geometric enough to read as engineering, with enough warmth to carry a human side alongside the technical one |
| Code + data | **JetBrains Mono** | Google Fonts, weights 400/500 | Legible at small sizes, pairs cleanly with Manrope's geometry |
| Fallback | system-ui | - | Both fonts are self-hostable; fallback is rarely needed |

Two families. No third.

### 3.2 Scale

| Level | Size / line-height | Weight | Tracking | Use |
| --- | --- | --- | --- | --- |
| Display | 44 / 1.1 | 700 | `-0.02em` | Hero statement only, once per page (34px below 720px) |
| H1 | 36 / 1.15 | 700 | `-0.02em` | Page title |
| H2 | 22 / 1.3 | 700 | `-0.02em` | Section |
| H3 | 18 / 1.35 | 500 | 0 | Subsection, card/entry/item title |
| Body | 16 / 1.65 | 400 | 0 | Everything |
| Small | 14 / 1.55 | 400 | 0 | Captions, metadata, mono figures |
| Label | 12 / 1.45 | 500 | `0.01em` | Badges, chips, gallery captions |

H2 moved from weight 500 to 700 and dropped from 24px to 22px: at 500, sitting one step above body
text under a 48px display, it read as barely-emphasised body copy rather than a heading - weight
now carries H2's rank instead of size, which is also why the display itself could come down from
48px without flattening the hierarchy above it.

**Tracking** opens as type gets smaller, not the other way round: `-0.02em` (`--track-tight`) on
display, H1, and H2, plus title-role text set at the H3 *size* - entry, item, and card titles, the
hero name - but not on the bare `<h3>` element or on body/small/label text. `0.01em`
(`--track-label`) applies to label-sized and mono UI text (badges, chips, nav links, button
labels, metadata) - the opposite direction, because tight tracking at 12px reads as cramped rather
than confident.

### 3.3 Weights

**400, 500, 700 only. No 600.** This is the one weight rule most likely to be violated by
accident, because 600 ("semibold") is many design tools' default emphasis step - every place it
crept in previously (the logo mark, the hero name, subsection titles) had to be remapped by hand.
600 muddies the difference between "emphasis" (500) and "heading" (700); there is no role for it
in this system.

### 3.4 Rules

- **Sentence case everywhere.** Headings, buttons, nav, labels. Title Case is for proper nouns.
- Body copy caps at ~68 characters per line (`p { max-width: 68ch }`); a paragraph used as pure
  layout opts out explicitly (`max-w-none`), it doesn't happen implicitly.
- Never set body text in mono. Mono is for things that are literally code, dates, figures, or
  identifiers - never prose, never a heading, never a button label.

## 4. Spacing, sizing & shape

### 4.1 Space scale

`--space-1` (4px) through `--space-16` (64px), on a 4px grid: 1, 2, 3, 4, **5**, 6, 8, **10**, 12,
16 (bold = added since v2.0, both were already in use as bare Tailwind values with no token behind
them - `--space-5` = 20px, `--space-10` = 40px).

### 4.2 Shape

| Token | Value | Use |
| --- | --- | --- |
| `--radius-sm` | 6px | Chips, badges, inline code |
| `--radius` | 8px | Buttons, inputs, icon buttons, gallery tiles |
| `--radius-lg` | 12px | Cards, empty states, code block chrome |
| `--radius-xl` | 16px | The nav |
| `--radius-pill` | 999px | Scrollbar thumb, the subsection accent rule's end-caps |

Four steps and a pill, not two - a single `--radius`/`--radius-lg` pair left the one floating
element on the page (the nav) with no token to reach for but an invented one-off value.

### 4.3 Control height

**One control height: `--control-h`, 40px.** A button, a text input, and an icon toggle used to
be 38px, 45px, and 36px respectively - three different heights for the same row of controls. When
a button sits beside a form field, or a toggle beside a nav link, they now resolve to the same
baseline in every theme, because height (not padding) is what's fixed on each.

### 4.4 Borders & motion

`--hairline: 1px` (not 0.5px - sub-pixel hairlines render inconsistently across browser zoom and
OS display scaling). `--dur: 160ms`, `--ease: cubic-bezier(0.4, 0, 0.2, 1)` for every colour,
background, border, and shadow transition in the system. `prefers-reduced-motion: reduce` collapses
all animation and transition duration to `0.01ms`.

## 5. Visual hierarchy & design principles

These are the judgment calls the token values above encode. When a new pattern doesn't have a
token yet, reason from these rather than inventing a one-off value:

1. **One accent, spent on purpose.** Emerald marks the thing on a surface that most deserves
   attention - a primary action, the current nav item, a section label - never decoration. If two
   or three elements on a viewport are already emerald, a fourth should be a different signal
   (weight, position) instead.
2. **Weight ranks; size only ranks where weight already has.** H2 outranks H3 by being bolder
   (700 vs 500), not primarily by being bigger. Reach for a heavier weight before a larger size
   when something needs to read as more important.
3. **Neutrals do the work.** At 85% of the palette, the neutral ramp - not colour - is what
   creates depth and separation: `bg` → `bg-surface` → `bg-raised`, `border` → `border-strong`.
   A page can be fully legible and hierarchical in grayscale before emerald ever appears.
4. **Every state reduces to one formula.** Hover, active, and focus are not designed per
   component; they're computed from `--fg`-mixes and a shared ring (§9). A new interactive
   component should reuse the formula, not invent a new hover colour.
5. **Structure is quieter than things.** A rule that separates content (`--border`) is always
   quieter than the edge of a component (`--border-strong`, `--border-input`). If a border is
   doing both jobs at once, it's usually a sign the layout needs a real component boundary, not a
   line.
6. **Mono means "this is data," not "this looks technical."** JetBrains Mono is reserved for
   things that are literally identifiers, dates, or code - a design choice, not a decoration.

## 6. Components

The contract. Same behaviour across every surface; framework is an implementation detail.

### Buttons

| Variant | Background (rest → hover → active) | Text | Border |
| --- | --- | --- | --- |
| Primary | `--brand-fill` → mix 88% toward `--fg` → mix 78% toward `--fg` | `--on-brand` | transparent |
| Secondary | transparent → `--surface-hover` → `--raised-hover` | `--fg` | `--border-strong`, warming to `--brand` on hover |

`font: 500 14px/1 Manrope`, `letter-spacing: 0.01em`, height `--control-h` (40px), padding
`0 var(--space-5)`, radius `--radius`. The fill **is** `--brand` - not a separately hard-coded
colour - which is why a primary button and a section label read as the same accent rather than two
different greens. Hover and active mix toward `--fg` rather than toward black or white, so
contrast against `--on-brand` rises in both themes at once. Disabled: 50% opacity,
`cursor: not-allowed`, hover suppressed. Destructive actions use `--error` as the fill, never a
new hue.

### Cards

`--bg-surface` background, `--border-strong` hairline, `--radius-lg`, `--space-6` padding. The one
hover pattern in the system: background steps to `--surface-hover`, border warms to `--brand`. No
shadow, no lift, no scale, no additional ring - a ring drawn on top of an already-emerald border
double-draws the same edge and becomes the loudest hover on the page instead of the quietest.

### Badges & chips

All badges share one treatment - `--bg-surface`, `--fg-muted`, `--border-strong`, `--radius-sm`,
`--text-label` at weight 500. With a single accent, **badges are told apart by label, not hue.**
The one filled variant (`--brand-fill`/`--on-brand`) is reserved: one per surface, at most.

Stack/tag chips are mono at `--text-label`, same shape and border as a badge. **Hover is strictly
opt-in for interactive targets** (clickable tags, links, and filter triggers) lifting to
`--surface-hover` background and a `--brand` border. Purely informative badges and chips (operational
status badges, technology stacks, read-only category labels) remain calm with `cursor: default` and no
hover effects to prevent false interactive affordances.

This is enforced in the token sheet, not only in the component. `.chip:hover` is scoped to
`a`/`button` ancestors and `.chip--interactive`; an unscoped `.chip:hover` in the sheet reaches
every chip on the page regardless of what the component does, because a `cursor: default` utility
cancels the cursor and nothing else. That was live on `dileepa-dev` until the sheet was reconciled
- the component was right and the layer underneath it was not.

### Forms

Inputs and textareas: `--bg-surface` background, `--border-input` (not `--border-strong` - see
§2.2), `--radius`, height `--control-h` for single-line inputs. Focus replaces the border with
`--brand` and adds the shared 3px `--ring` (§9) - no separate hard outline. Labels are
`--fg-muted` at `--text-small`, weight 500, `--track-label` tracking. Required markers are
`--brand`.

Browser autofill overrides both background and text colour and must be defeated explicitly:

```css
input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px var(--bg-surface) inset;
  -webkit-text-fill-color: var(--fg);
}
```

Copy this rather than rediscovering it - on a dark theme, un-defeated autofill repaints a field
pale blue with near-black text.

### Navigation

A floating pill, not a full-width bar pinned to the edge - the page's content sits *on* a surface
rather than *under* a toolbar. 64px tall (56px below 720px), `--radius-xl`, sticky 1rem from the
viewport top. Background is translucent in both themes -
`color-mix(in srgb, var(--bg-surface) 82%, transparent)` - with an 18px backdrop blur, because it
sits over scrolling content and an opaque bar would read as a second page pinned to the top. It is
the **only** element in the system that casts a shadow (`--shadow-nav`) and the only one that
blurs its backdrop, because it's the only element that's genuinely floating above the content
rather than sitting in the flow.

Nav links are `--text-small` at weight 500 with `--track-label` tracking, `--fg-muted` at rest,
`--fg` on hover, `--brand` for the current section - **colour only**, never a weight change (a
weight change was tried and reverted: it shifted every link either side by a pixel as the current
section changed while scrolling). On desktop (≥768px), `.nav-links` render inline. On mobile (<768px),
a dedicated mobile toggle button (`Menu`/`X` icons) opens an accessible, animated dropdown menu
(`.nav-mobile-menu`) housing both section and exploratory links with active dot indicators. The lockup
never shrinks or wraps (`flex: 0 0 auto; white-space: nowrap`) even when the nav is tight for space.

The theme toggle is a `--control-h` square icon button, `--border-strong`, `--radius`, hovering to
`--surface-hover` background with its border warming to `--brand` - the same formula as every
other bordered control, not a bespoke treatment.

### Logo lockup

**`dileepadev /.`** - the wordmark in Manrope weight 500, all lowercase, `--track-tight` tracking,
in `--fg`. The mark - an emerald forward slash and a solid emerald dot at its base - is **upright,
weight 700**, not italic and not 600. Wordmark and mark are flex siblings spaced by the wrapper's
`gap` (not a margin on the mark itself); the dot sits flush against the slash with no gap of its
own, so the pair reads as one character, `/.`, rather than two with daylight between them.

```html
<span class="lockup">
  <span class="wordmark">dileepadev</span>
  <span class="mark" aria-hidden="true">/</span>
</span>
```

The mark is decorative; the accessible name comes from the surrounding link's `aria-label`. Rules
unchanged from the brand guide: minimum 120px wide, clear space equal to the wordmark's cap-height
on all sides, the wordmark is never emerald, the `/.` is never the neutral text colour, never
outlined, gradiented, rotated, or placed on a photograph without a solid backing shape.

### Section headings & subsection titles

A section heading is a mono `--brand` label (`--text-small`, weight 500, `--track-label`,
`--space-2` below it) immediately above an H2, then an intro paragraph in `--fg-muted`. The label
carries the accent; the heading stays `--fg` - two emerald elements in one block would compete
with each other, which is what stops the accent reading as a signal.

A subsection title (used for the finer groupings inside a section - communities, events, posts,
videos) is the **same label system at a second rank**, not a separate one: `--text-small`, mono
family dropped in favour of the UI face, weight 700, `--track-label`, marked by a 2px `--brand`
rule at its side. It used to be an unrelated system - uppercase, `0.16em` tracking, weight 800,
with a glowing accent rule - with no visual relationship to the section label above it; the two
now differ only by weight and the presence of the side rule, not by an entirely different case and
tracking scheme.

### Entry & item lists

**Entry list** (experience, education): a 160px mono date column, then content. `--border`
hairline (structural, not a component edge) on top of each row, the last row also takes one on the
bottom. Org name in `--brand` at `--text-small`/500; title at the H3 size with `--track-tight`;
body in `--fg-muted`.

**Item list** (communities, events, posts, videos): content, then a 180px right-aligned mono
metadata column. Same `--border` row treatment. Collapses to one column below 720px with the
metadata left-aligned. Title links inherit colour at rest and step to `--brand` on hover (§2.4).

### Gallery

3-column grid (2 below 720px) of 4:3 figures, `--radius`, `--border-strong` (a figure is a thing,
not a rule), `object-fit: cover`. Caption at `--text-label`/`--lh-label`, revealed on hover **and**
keyboard focus over a fixed dark scrim - never themed, because the photograph underneath isn't
themed either. See §6.1.

### Footer

Column titles are mono, `--text-small`, weight 500, `--track-label`, `--fg` - distinguished from
the links beneath them by weight, not just by being first; at a shared weight, a title and its
first link were indistinguishable at a glance. Links are `--fg-muted`, stepping to `--brand` on
hover. The bottom bar is mono, `--text-small`, `--fg-muted`, `--track-label`, separated by a
`--border` hairline.

## 6.1 Photographs

Photographs appear in exactly **two** places on `dileepa.dev`: the hero portrait, and the event
gallery. That is the whole image budget, and it's deliberate - a page of photographs reads as a
deliberate section only when photographs are otherwise rare.

- Blog posts carry no banner; an image inside an article is an ordinary Markdown image belonging
  to that article.
- The videos index lists titles and dates, not thumbnails.
- Logos, tool marks, and project covers are not photographs and aren't counted here.
- A portrait always sits on `--bg-surface` with a `--border-strong` edge - a cut-out on the page
  background reads as a mistake.

## 7. Icons

The platform uses two complementary icon conventions:

**Pillar marks (brand SVG).** The six About-card marks, drawn for the six things that section names. They live in `docs/brand/icons/` and are ported into `components/icons/PillarIcons.tsx` from the `-symbol.svg` variant - the one that strokes `currentColor` rather than a literal `#23B888`, so the mark follows the theme's accent instead of being right in one theme and wrong in the other. The API serves twelve `PillarIcon` names against six marks; the map collapses them by concept so a card never falls back to a different icon system.

**Interface icons (Lucide):** Standardized on **`lucide-react`** across all UI components (navigation controls, form inputs, toggles, action buttons, search, sorting, and feedback states). Stroke width is standardized at `1.75`–`2.0` (optical weight: 1.75 for standard 16px controls, 2.0 for compact 14px badges/toggles). Common sizes: 14px (`h-3.5 w-3.5`), 16px (`h-4 w-4`), 18–20px (`h-4.5 w-4.5` / `h-5 w-5`).

**Brand & social glyphs (Inline SVG):** Filled marks for third-party platforms (GitHub, LinkedIn, X, YouTube, Instagram, Facebook) are hand-authored inline SVGs with path data centralized in `lib/social-icons.ts` (24×24 viewBox, `fill="currentColor"`, no stroke). Rendered at 18px glyph inside a 20px hit area, `--fg-muted` at rest, stepping to `--brand` on hover.

**Every decorative icon carries `aria-hidden="true"`.** The accessible name comes from the surrounding link's text or an explicit `aria-label` on the control (`aria-label="Switch theme"`, `aria-label="Open navigation menu"`) - never from the icon itself.

## 8. Backgrounds, shadows & effects

**No gradients on the emerald accent, ever.** The one gradient anywhere in the system is the
gallery caption scrim - `linear-gradient(to top, rgb(0 0 0 / 0.72), rgb(0 0 0 / 0))` - a fixed
black scrim for photo-caption legibility that is never themed, because the photograph beneath it
isn't themed either. It exists to solve a specific legibility problem, not as a decorative
technique to reach for elsewhere.

**No glow on the accent.** A subsection's accent rule previously carried a 12px glow in a colour
that wasn't even a sanctioned brand value; it's flat colour now. Flat reads as more deliberate than
a glow, and a glow is the same instinct as a gradient - decorating the one signal the palette has.

**Shadows are reserved for the one floating element.** The nav is the only component in the system
with a `box-shadow` and the only one with a `backdrop-filter` blur, because it's the only element
genuinely floating above scrolling content rather than sitting in the page flow. Cards, buttons,
chips, and inputs never gain a shadow at rest, hover, or focus - their state changes are entirely
background- and border-colour driven (§9). A component that seems to need a shadow to separate
itself from its surface is usually a sign it needs a `--border-strong` edge instead.

## 9. States - hover, active, focus, disabled

Every interactive state in the system reduces to one of these:

| State | On a bordered/transparent surface | On a filled surface (primary button) |
| --- | --- | --- |
| Rest | `--bg-surface` (or transparent), `--border-strong` | `--brand-fill` |
| Hover | background → `--surface-hover`, border → `--brand` | background → `--brand-fill-hover` (mix 88% toward `--fg`) |
| Active | background → `--raised-hover` | background → `--brand-fill-active` (mix 78% toward `--fg`) |
| Focus (no border of its own) | `2px solid var(--brand)` outline, 2px offset | - |
| Focus (has a border) | border → `--brand`, add `0 0 0 3px var(--ring)`, suppress the hard outline | same |
| Disabled | 50% opacity, `cursor: not-allowed`, hover suppressed | same |

A component with a visible border never gets both the hard outline *and* the soft ring - they'd
double the same edge. The current nav link is the one deliberate exception to "state = colour
change only" being about hover/active: it's colour-only by design, specifically because a weight
or size change there was tried and caused visible layout shift as the current section changed
during scroll (§6, Navigation).

## 10. Layout & responsive behaviour

**Container:** one universal measure across all surfaces: `min(100% - var(--space-8), 1020px)` (`width: min(100% - 2rem, 1020px)` in `.container`). Nav, footer, sections, directories, and the blog reader share this exact width to maintain unified vertical alignment. Running copy maintains comfortable readability via the 68ch rule (`p { max-width: 68ch }`), allowing wider containers to comfortably host multi-column grids, sidebar rails, and cards.

**Responsive breakpoints:**

- **768px (Navigation threshold):** Switches between desktop inline navigation (`.nav-links`) and the mobile toggle button (`.nav-mobile-toggle`) with dropdown menu (`.nav-mobile-menu`).
- **720px (Content layout threshold):** Mobile overrides via `max-width: 720px` query: the display steps down to 34px (2.125rem), section vertical padding reduces to `--space-12`, hero and entry/item grids collapse to 1 column, the gallery drops from 3 to 2 columns, and item metadata left-aligns.

**Section rhythm:** `--space-16` vertical padding (`--space-12` below 720px), a `--border` hairline
top edge on every section but the hero, and `scroll-margin-top` (80px desktop / 72px mobile) so a
hash link lands clear of the sticky nav rather than under it.

**Grid tracks holding article content need an explicit minimum.** A CSS grid track's automatic
minimum width is its *content's* min-content width - so a fixed-width sidebar next to a flexible
content track will get pushed past its container by anything wide inside that content (a code
block, a table) unless the flexible track is given `min-width: 0` (or `minmax(0, 1fr)` on the
track itself). This produced a real horizontal-scroll bug in the blog reader and is worth stating
as a standing rule for any future two-column layout: **the flexible column always gets
`min-width: 0`.**

## 11. Theming

Dark is the default. The token sheet resolves it in three layers:

```css
:root, [data-theme="dark"]  { /* Carbon foundation, Emerald Bright */ }
[data-theme="light"]        { /* Paper foundation, Emerald Deep */ }
@media (prefers-color-scheme: light) {
  :root:not([data-theme]) { /* system light, no explicit choice */ }
}
```

An explicit user choice wins over the system preference in both directions. Persist it under one
storage key across every surface - `dileepa-theme` - so the theme follows a visitor from the main
site to links to the blog.

**Two exceptions that always use Paper:** the resume (ATS parsers and print both punish dark
backgrounds) and anything going to print, handled by the token sheet's `@media print` block.

## 12. Admin-specific patterns

`admin-dileepa-dev` carries surfaces the public site doesn't. They were defined there first and
are recorded here so the platform keeps one contract rather than growing a second one. These
haven't been re-verified against `dileepa-dev` (which has none of them) - they're carried forward
from the original spec with token names updated to the current set.

**Tables.** Header cells are mono, weight 400, `--fg-muted`, sentence case - labels, not headings.
Body cells are `--fg`, top-aligned. Rows separate with a `--border` top rule and hover to
`--bg-raised`. A wide table scrolls inside its own box, never pushing the page sideways: wrap it in
`overflow-x: auto` with a `--border-strong` edge and `--radius-lg` on the wrapper.

**Fields.** Label above, control, then hint and error below - one component, so a field can't ship
without its error slot. Labels `--fg-muted` at `--text-small`, required markers in `--brand`,
controls follow §6 Forms exactly (`--border-input`, `--control-h`, the shared ring on focus). An
invalid control takes an `--error` border and `aria-invalid`.

**Repeatable field groups** - speakers, photos, links, gallery images. Each row is a card
(`--bg-surface`, `--border-strong`, `--radius-lg`) with a mono header carrying the row number and a
Remove control. **The index in a field name is a row identity, not a position:** rows keep a key
that never changes, so removing the second row doesn't silently re-label the third and move its
data. The reader sorts indices and tolerates gaps.

**Empty states** say what would appear and how to make it appear, and carry the action that makes
it appear.

**Destructive confirmations** name the thing being destroyed - "Delete this event?" with the title
in the body, never "Are you sure?" The confirm button names the action and takes `--error` as its
fill. Focus opens on Cancel, so a stray Enter lands on the safe option.

**Toasts** share one treatment; only an error varies, and only by border - with a single accent
there's no palette to signal type with beyond that. This is specified, not yet applied anywhere:
see the gap noted in §2.3.

## 13. Non-negotiables

A change that violates any of these is a bug, not a style preference.

1. **Emerald is the only accent.** No cyan, gold, violet, or any second hue.
2. **Never Emerald Deep `#087F5B` on Carbon** (4.1:1 - fails).
3. **Never Emerald Bright `#23B888` on Paper** (2.4:1 - fails).
4. **Weights 400, 500, 700 only.**
5. **Two families only** - Manrope and JetBrains Mono.
6. **Sentence case everywhere** - headings, buttons, nav, labels, table headers.
7. **Never set body text in mono.**
8. **No gradients or glows on the emerald.**
9. **One emerald accent per surface** - a button, a rule, or a highlighted number, not several.
10. **No hard-coded hex in components.**
11. **Links inherit colour by default; a component states its own** (§2.4) - the token sheet's
    default `a` rule is `color: inherit`, not `--brand`.
12. **The token sheet is imported into a cascade layer, never unlayered** (§1) - an unlayered
    import silently beats every utility class that should override it.

## 14. Review checklist

Before calling any UI change done:

- [ ] No hard-coded hex - every colour resolves through a semantic token
- [ ] No cyan, gold, or any second hue
- [ ] Weights 400, 500, 700 only
- [ ] Manrope for UI, JetBrains Mono for code and data, nothing else
- [ ] Sentence case throughout
- [ ] Links state their own colour deliberately - none rely on an inherited `--brand` default
- [ ] Hover/active/focus states use the shared formulas in §9, not a one-off treatment
- [ ] A bordered element's focus is the soft ring, not a doubled hard outline
- [ ] Checked in **both** themes - the accent stop and border weights differ per theme
- [ ] Checked at 375px width, with the token sheet imported into a layer if the app uses Tailwind
- [ ] `:focus-visible` state on every interactive element, keyboard-reachable in a sensible order
- [ ] One emerald accent per viewport, not several
