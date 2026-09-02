# Personal brand guide

**Dileepa - @dileepadev**
Version 2.0

For the full component contract - buttons, cards, forms, navigation, icons, states, layout - see
[`design-system.md`](design-system.md). This document covers brand identity: colour, type, and
the mark.

## 1. Color system

**Governing rule:** Emerald is the only accent. No second hue. Everything else in the system is
neutral - the contrast between emerald and near-black or near-white is what carries the brand, not
a second color competing for attention.

### 1.1 Brand colors

| Role | Name | Hex | Notes |
| --- | --- | --- | --- |
| Primary (light surfaces) | Emerald Deep | `#087F5B` | Buttons, links, headings, logo mark on Paper |
| Primary (dark surfaces) | Emerald Bright | `#23B888` | Same roles, on Carbon |
| Foundation (dark) | Carbon | `#050505` | Site, banners, decks, video |
| Foundation (light) | Paper | `#F7F7F7` | Documents, resume, print, light-mode site |

### 1.2 Neutrals

**Dark ramp** (derived from Carbon, so surfaces step up cleanly instead of turning muddy):

| Token | Hex | Use |
| --- | --- | --- |
| `ink-900` | `#050505` | Page foundation |
| `ink-800` | `#0D0D0D` | Card / section surface |
| `ink-700` | `#141414` | Raised surface, code blocks |
| `ink-600` | `#1F1F1F` | Structural rules - dividers, section rows |
| `ink-500` | `#2E2E2E` | Component edges - cards, chips, controls |
| `ink-400` | `#8D8D8D` | Secondary text (6.1:1) |
| `ink-100` | `#F1F1F1` | Primary text (18.0:1) |

**Light ramp:**

| Token | Hex | Use |
| --- | --- | --- |
| `paper-0` | `#FFFFFF` | Raised cards |
| `paper-50` | `#F7F7F7` | Page foundation |
| `paper-200` | `#E3E3E3` | Structural rules |
| `paper-300` | `#D2D2D2` | Component edges |
| `paper-400` | `#6A6A6A` | Secondary text (5.1:1) |
| `paper-900` | `#131313` | Primary text |

Both ramps carry a third role not shown above - a dedicated, higher-contrast border reserved for
form fields (3.0:1 against the page in both themes, the WCAG floor for a control's only visible
edge). See `design-system.md` §2.2 for the full three-tier border system this feeds.

### 1.3 Functional colors

These are interface states, not brand. Never use them in content or graphics.

| State | Hex | Note |
| --- | --- | --- |
| Success | `#23B888` / `#087F5B` | Reuses emerald - no new hue needed |
| Error | `#E5484D` / `#C4292E` | 5.2:1 on Carbon, 5.3:1 on Paper |
| Warning | `#D97706` / `#B45309` | UI states only, never used as a brand accent |

### 1.4 Verified contrast

Every permitted pairing, measured against the current foundation colors:

| Pairing | Ratio | Verdict |
| --- | --- | --- |
| Emerald Bright on Carbon | 8.0:1 | AAA |
| Emerald Deep on Paper | 4.7:1 | AA |
| `ink-100` text on Carbon | 18.0:1 | AAA |
| `ink-400` secondary text on Carbon | 6.1:1 | AAA |
| `paper-400` secondary text on Paper | 5.1:1 | AA |
| Button text on Emerald Bright fill (dark) | 6.0:1 | AA+ |
| Button text on Emerald Deep fill (light) | 4.7:1 | AA |
| Error red on Carbon | 5.2:1 | AA |

**Forbidden pairings - these fail and must never ship:**

| Pairing | Ratio |
| --- | --- |
| Emerald Deep on Carbon | 4.1:1 ✗ |
| Emerald Bright on Paper | 2.4:1 ✗ |

### 1.5 Proportion

```markdown
Neutrals    ████████████████████████████████████████  85%
Emerald     ██████████████                             14%
Functional  ▌                                            1%
```

Emerald appears once per surface as a deliberate act - a button, a rule, a single highlighted
number. Scattering it across a page dilutes the one signal the palette has.

### 1.6 Links are neutral by default

A link does not turn emerald automatically. The base rule is `color: inherit` - a link reads as
part of its surrounding text unless the component it belongs to deliberately gives it the accent
(a nav item's current state, an entry's organisation name, a link inside an article). This keeps
emerald meaning something: if every link were green, none of them would stand out as *the* one
worth noticing. See `design-system.md` §2.4.

## 2. Typography

### 2.1 The faces

| Role | Typeface | Source | Why |
| --- | --- | --- | --- |
| Display + UI | **Manrope** | Google Fonts | Geometric enough to read as engineering, with enough warmth in the curves to carry a human side alongside the technical one. Not Inter - Inter is the default every technical portfolio already uses, and defaults don't identify anyone. |
| Code + data | **JetBrains Mono** | Google Fonts | Legible at small sizes, designed for long reading, pairs cleanly with Manrope's geometry. |
| Fallback stack | system-ui | - | Both fonts are self-hostable and load from the same source, so fallback is rarely needed. |

Two families. No third. A third face is fragmentation in typographic form.

### 2.2 Scale

| Level | Size / line-height | Weight | Use |
| --- | --- | --- | --- |
| Display | 44 / 1.1 | 700 | Hero statement only, once per page |
| H1 | 36 / 1.15 | 700 | Page title |
| H2 | 22 / 1.3 | 700 | Section |
| H3 | 18 / 1.35 | 500 | Subsection |
| Body | 16 / 1.65 | 400 | Everything |
| Small | 14 / 1.55 | 400 | Captions, metadata, mono |
| Label | 12 / 1.45 | 500 | Badges, chips, captions on photographs |

Weights 400, 500, 700 only. No 600 - it muddies the difference between "emphasis" and "heading."
H2 leans on weight rather than size to outrank H3 - at a lighter weight it read as barely-emphasised
body text rather than a heading in its own right.

### 2.3 Rules

- **Sentence case everywhere.** Headings, buttons, nav, slide titles. Title Case is for proper
  nouns - **including the role, which is `AI Engineer`.** That covers it wherever it is used as a
  label: the site `<title>`, the Person schema's `jobTitle`, the line under the hero portrait, the
  terminal profile's role field. The discipline is not a proper noun and stays lowercase - "AI
  engineering" in a section intro, "an AI engineer" in the running prose of a biography.
- Body copy caps at ~68 characters per line.
- Never set body text in mono. Mono is for things that are literally code, numbers, or
  identifiers.
- Letter-spacing: `-0.02em` on display, H1, and H2 (and title-role text set at the H3 size - card,
  entry and item titles); `0.01em` on label-sized and mono UI text (badges, chips, metadata); `0`
  everywhere else.

## 3. Logo and mark

### 3.1 Primary lockup

**`dileepadev /.`**

The wordmark `dileepadev` set in Manrope Medium, all lowercase, `-0.02em` tracking, in `ink-100` on
Carbon or `paper-900` on Paper. Followed by the mark: an emerald forward slash, upright and set at
weight 700, with a solid emerald dot flush against its base - `/.`

The wordmark stays neutral; the emerald lives entirely in the `/.` It reads as a terminal
character - a command-line prompt, a closing note, a full stop with intent. That's the one place
color is allowed in the lockup, and it never moves elsewhere in the mark.

**Specs:**

- Minimum size: 120px wide (the `/.` must stay legible as two distinct strokes)
- Clear space: equal to the cap-height of the wordmark on all four sides
- The wordmark is never set in emerald. The `/.` is never set in the neutral text color.
- Never outline it, never add a gradient, never rotate it, never place it on a photograph without
  a solid backing shape

### 3.2 Reduced mark

For small square placements where the full wordmark won't fit: the `/.` alone, in emerald,
centered on a Carbon or Paper field.

**The favicon and app icons are the portrait, not the mark.** At 16px the `/.` reads as a smudge,
and the face is what people already recognise across the platform's other surfaces. The reduced
mark stays the answer for in-product square placements where a photograph would be wrong.

**There is deliberately no SVG favicon, and there is not going to be one.** SEO and metadata
audit tools flag its absence as a tip, and the tip is sound in general and inapplicable here: the
identity is a photograph, and a photograph has no vector form. Both ways of answering the tool
are worse than leaving it flagged.

- A vector of the `/.` would put **a second design** in the browser tab while every other surface
  - home screen, app icon, share sheet, this page - shows the face. One identity, rendered
  consistently, beats a scalable one that disagrees with the rest of the platform. This was
  built and measured before it was rejected: the mark does hold two distinct strokes at 16px when
  it is drawn as geometry rather than set in type, so the original "smudge" reasoning above is
  not the reason it was dropped. Consistency is.
- A PNG base64'd inside an SVG wrapper satisfies the checker and nothing else: the same pixels,
  roughly a third larger, with none of the scaling or `prefers-color-scheme` behaviour that is
  the only reason to want SVG in the first place.

> [!NOTE]
> `logo/mark-dark.svg` and `logo/mark-light.svg` still italicise the slash. Brand tokens v2.1
> sets it upright at weight 700 (`.mark` in `brand-tokens.css`), so those two files are stale
> against the sheet and should be redrawn.

### 3.3 Custom mark, if commissioned later

Brief: *a single continuous stroke that resolves into the `/.` terminal.* Avoid a circuit-board
motif, a brain, a neural-net diagram, or a robot - the three visual clichés of AI branding, all
three dated on arrival.

## 4. Quick reference

```markdown
PRIMARY     Emerald Deep    #087F5B   light surfaces
            Emerald Bright  #23B888   dark surfaces
FOUNDATION  Carbon          #050505   dark
            Paper           #F7F7F7   light

TYPE        Manrope (display + UI) · JetBrains Mono (code)
            Weights 400 / 500 / 700 only - no 600

RULE        Emerald is the only accent. No second hue.
            Links are neutral by default; a component states its own accent.

LOGO        dileepadev /.   - wordmark neutral, upright "/." in emerald, weight 700

TAGLINE     Building AI systems and the community around them.

PILLARS     Build · Teach · Ship
```

## 5. Portrait

The portrait is the one photograph the brand uses (§3.2) - the face on the profile picture, and
on every platform crop derived from it (LinkedIn, GitHub, Facebook, X, YouTube). This section
covers only the field it sits on, not the photograph itself.

| Token | Hex | Role |
| --- | --- | --- |
| `portrait-field` | `#D2D2D2` | Default background for every portrait crop. Reuses `paper-300` (§1.2) - no new token. |
| `portrait-on-dark` | `#F1F1F1` | Swap-in field on Carbon surfaces. Reuses `ink-100` (§1.2). |
| `portrait-on-light` | `#6A6A6A` | Swap-in field on Paper surfaces. Reuses `paper-400` (§1.2). |

Supersedes any earlier portrait background of `#7E7E7E` or `#757575` - wherever those appear,
`portrait-field` is the current value.

**The favicon and app-icon set is the exception: it ships with a transparent field.** A browser
tab, a home screen and an installed app each draw their own background, and a filled `#D2D2D2`
square reads as a grey tile against every one of them that is not Paper. The fields above apply
to the platform profile crops, where the surface is fixed and the photograph needs a ground.

### Verified contrast

| Pairing | Ratio | Verdict |
| --- | --- | --- |
| `portrait-field` vs subject (hair/shirt) | 12.85:1 | AAA |
| `portrait-field` vs white/light platform chrome | ≈1.4:1 | Intentionally soft - a photo field, not a control's edge, so the 3:1 non-text floor in §1.2 doesn't apply here. |
| `portrait-field` vs dark platform chrome | ≈10–12:1 | AAA |
