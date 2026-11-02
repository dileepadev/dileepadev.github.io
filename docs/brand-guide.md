# Personal brand guide

**Dileepa - @dileepadev**
Version 2.1.0

For the full component contract - buttons, cards, forms, navigation, icons, states, layout - see
[`design-system.md`](design-system.md). This document covers brand identity: colour, type, the
mark, and the portrait.

## 1. Color system

**Governing rule:** contrast is the accent. There is no brand hue. The palette runs from Carbon to
Paper, and emphasis comes from contrast, weight and fill - a near-white line on Carbon, a filled
button, a bolder word - never from a colour. Colour appears only to report a state: success,
error, warning.

### 1.1 Brand colors

| Role | Name | Hex | Notes |
| --- | --- | --- | --- |
| Foundation (dark) | Carbon | `#050505` | Site, banners, decks, video, social cards |
| Foundation (light) | Paper | `#F7F7F7` | Documents, resume, print, light-mode site |
| Accent on dark | Ink 100 | `#F1F1F1` | Primary buttons, current marks, focus rings, links in prose - on Carbon |
| Accent on light | Paper 900 | `#131313` | The same roles on Paper |

The accent and the primary text are the same value. That is the point: a filled button, a
current nav item and a heading are one ink, and they read as the same voice.

### 1.2 Neutrals

**Dark ramp** (derived from Carbon, so surfaces step up cleanly instead of turning muddy):

| Token | Hex | Use |
| --- | --- | --- |
| `ink-900` | `#050505` | Page foundation |
| `ink-800` | `#0D0D0D` | Panel / section surface |
| `ink-700` | `#141414` | Raised surface, code blocks |
| `ink-600` | `#1F1F1F` | Structural rules - dividers, list rows |
| `ink-500` | `#2E2E2E` | Component edges - buttons, selects, toggles, interactive chips |
| - | `#8D8D8D` | Secondary text, `ink-400` (6.1:1) - dates, names, labels |
| - | `#A8A8A8` | Running text, `--fg-body` (8.6:1) - every paragraph |
| `ink-100` | `#F1F1F1` | Primary text and the accent (18.0:1) |

**Light ramp:**

| Token | Hex | Use |
| --- | --- | --- |
| `paper-0` | `#FFFFFF` | Raised cards |
| `paper-50` | `#F7F7F7` | Page foundation |
| `paper-200` | `#E3E3E3` | Structural rules |
| `paper-300` | `#D2D2D2` | Component edges |
| - | `#6A6A6A` | Secondary text, `paper-400` (5.0:1) |
| - | `#4F4F4F` | Running text, `--fg-body` (7.6:1) |
| `paper-900` | `#131313` | Primary text and the accent (17.3:1) |

**Three text steps, not two.** `--fg` is for titles and what carries a line; `--fg-body` is for
running text, anything read sentence by sentence; `--fg-muted` is for what you glance at - dates,
names, labels, captions. With only two, paragraphs either sat at full contrast and competed with
their own headings, or at the muted step and read as metadata.

Both ramps also carry a dedicated, higher-contrast border for form fields - `#5B5B5B` on Carbon,
`#8F8F8F` on Paper, 3.0:1 against the page, the WCAG floor for a control's only visible edge. See
`design-system.md` §2.2 for the border system this feeds.

### 1.3 Functional colors

These are interface states, not brand. Never use them in content, graphics or decoration.

| State | Hex (dark / light) | Note |
| --- | --- | --- |
| Success | `#23B888` / `#087F5B` | A state only - a copy confirmation, a sent message |
| Error | `#E5484D` / `#C4292E` | 5.2:1 on Carbon, 5.3:1 on Paper |
| Warning | `#D97706` / `#B45309` | UI states only, never a brand accent |

### 1.4 Verified contrast

| Pairing | Ratio | Verdict |
| --- | --- | --- |
| `ink-100` text on Carbon | 18.0:1 | AAA |
| `--fg-body` on Carbon | 8.6:1 | AAA |
| `ink-400` secondary text on Carbon | 6.1:1 | AA |
| `paper-900` text on Paper | 17.3:1 | AAA |
| `--fg-body` on Paper | 7.6:1 | AAA |
| `paper-400` secondary text on Paper | 5.0:1 | AA |
| Text on the primary fill (both themes) | 18.0:1 / 17.3:1 | AAA |
| Field border on the page (both themes) | 3.0:1 | WCAG 1.4.11 floor |
| Error red on its page (both themes) | 5.2:1 / 5.3:1 | AA |

**Forbidden pairings - these fail and must never ship:**

| Pairing | Ratio |
| --- | --- |
| `ink-500` (an edge) as text on Carbon | 1.5:1 ✗ |
| `paper-300` (an edge) as text on Paper | 1.4:1 ✗ |

Border and surface steps are for edges and fills, never for text.

### 1.5 Proportion

```markdown
Neutrals          ████████████████████████████████████████  85%
Full-contrast ink ██████████████                             14%
Functional        ▌                                            1%
```

Full-contrast ink is the emphasis. One filled primary action per surface stays the focal point;
everything around it sits on the muted and surface steps. If every element on a screen is at full
contrast, none of them is emphasised.

### 1.6 Links

A link does not carry a colour of its own. The base rule is `color: inherit` - a link reads as part
of its surrounding text until the component it belongs to states otherwise. What marks it is
shape: **every text link carries an arrow** - `→` for a page on the site, `↗` for one that leaves
it - so a reader can see that an event title or a project name opens something, without the
palette needing a link colour. On hover the text steps down to the muted ink. Inside long-form
prose a link is underlined instead, because an arrow after every inline link would break the
sentence; one that leaves the site still takes its `↗`. See `design-system.md` §2.4.

## 2. Typography

### 2.1 The faces

| Role | Typeface | Source | Why |
| --- | --- | --- | --- |
| Display + UI | **Manrope** | Google Fonts | Geometric enough to read as engineering, with enough warmth in the curves to carry a human side alongside the technical one. Not Inter - Inter is the default every technical portfolio already uses, and defaults don't identify anyone. |
| Code + data | **JetBrains Mono** | Google Fonts | Legible at small sizes, designed for long reading, pairs cleanly with Manrope's geometry. |
| Fallback stack | system-ui | - | Both fonts are self-hostable and load from the same source, so fallback is rarely needed. |

Two families. No third. A third face is fragmentation in typographic form.

### 2.2 Scale

The two largest steps are fluid: they grow with the viewport, so there is no separate mobile size.

| Level | Size / line-height | Weight | Use |
| --- | --- | --- | --- |
| Display | 44 → 80 / 1.02 | 700 | Hero statement only, once per page |
| H1 | 36 → 56 / 1.06 | 500 | Page title |
| H2 | 28 / 1.2 | 500 | Section |
| Lead | 20 → 26 / 1.35 | 400 | The one sentence that opens a section |
| H3 | 19 / 1.35 | 500 | Subsection, card and item titles |
| Body | 17 / 1.65 | 400 | Everything read |
| Small | 15 / 1.55 | 400 | Captions, metadata |
| Label | 13 / 1.45 | 500 | Badges, chips, dates - and the floor: nothing is set smaller |

**Weights 400, 500, 700 only - and 700 is rare.** 400 is reading text, 500 is everything a reader
acts on or scans (headings, labels, buttons, the nav), and 700 is kept for two places: the display
line and `<strong>`. At 700 the display reads as a different rank from the H1 under it; at 500 it
read as a larger H1. No 600 - it muddies the difference between emphasis and heading.

### 2.3 Rules

- **Sentence case everywhere.** Headings, buttons, nav, slide titles. Title Case is for proper
  nouns - **including the role, which is `AI Engineer`.** That covers it wherever it is used as a
  label: the site `<title>`, the Person schema's `jobTitle`, the line under the portrait, the
  terminal profile's role field. The discipline is not a proper noun and stays lowercase - "AI
  engineering" in a section intro, "an AI engineer" in the running prose of a biography.
- Body copy caps at ~68 characters per line.
- **Nothing below 13px.** The label step is the floor.
- Never set body text in mono. Mono is for things that are literally code, numbers, or
  identifiers.
- Letter-spacing: `-0.04em` on the display and H1 (at 80px, `-0.02em` still reads loose);
  `-0.02em` on H2 and title-role text at the H3 size; `0.01em` on label-sized and mono UI text;
  `0` everywhere else.

## 3. Logo and mark

### 3.1 Primary lockup

**`@dileepadev`**

The handle is the logo. The wordmark `dileepadev` set in Manrope Medium (500), all lowercase,
`-0.02em` tracking, at full contrast - `ink-100` on Carbon, `paper-900` on Paper. It is led by the
mark, an `@` at the same weight in the muted step of the same ink, set against the wordmark with no
space: `@dileepadev` is one word.

The split between the `@` and the wordmark is carried by contrast alone. It is the same two-part
lockup the brand has always had, without a hue: the wordmark is the name, the `@` says it is a
handle - the one people search, tag and type.

**Specs:**

- Minimum size: 120px wide (the `@` must stay legible as a ring with its `a`)
- Clear space: equal to the cap-height of the wordmark on all four sides
- Both parts at weight 500. A bolder `@` reads as a symbol bolted on, not the handle's first
  character.
- Black and white only. Never colour the lockup, never outline it, never add a gradient or
  shadow, never rotate it, never place it on a photograph without a solid backing shape.
- Never title case or capitalise it: `@dileepadev`, not `@DileepaDev`.

### 3.2 Reduced mark

For small square placements where the full lockup won't fit: the `@` alone, at full contrast,
centred on a Carbon or Paper field.

**The favicon and app icons are the portrait, not the mark.** The face is what people already
recognise across the platform's surfaces, and at 16px a glyph reads as a smudge where a face still
reads as a person. The reduced mark is for in-product square placements where a photograph would
be wrong.

**There is deliberately no SVG favicon, and there is not going to be one.** SEO and metadata
audit tools flag its absence as a tip, and the tip is sound in general and inapplicable here: the
identity is a photograph, and a photograph has no vector form. A vector mark in the browser tab
would put a second design there while every other surface - home screen, app icon, share sheet -
shows the face. A PNG base64'd inside an SVG wrapper satisfies the checker and nothing else.

> [!NOTE]
> **Exported assets** live in `dileepadev`'s `docs/brand/`: `logo/` (the `@dileepadev` lockup and
> the `@` mark, live-text and outlined, both themes), `covers/`, `banners/` and `og.png` all
> follow this guide. See `logo/README.md` and `covers/README.md` there.

### 3.3 Custom mark, if commissioned later

Brief: *the `@` drawn as a single continuous stroke - a ring that closes into its own `a`.* Avoid
a circuit-board motif, a brain, a neural-net diagram, or a robot - the three visual clichés of AI
branding, all three dated on arrival.

## 4. Quick reference

```markdown
FOUNDATION  Carbon          #050505   dark
            Paper           #F7F7F7   light
ACCENT      the text colour: Ink 100 #F1F1F1 on Carbon, Paper 900 #131313 on Paper
TEXT        --fg 18:1 · --fg-body 8.6:1 · --fg-muted 6.1:1 (dark)
STATES      success #23B888 / #087F5B · error #E5484D / #C4292E · warning #D97706 / #B45309

TYPE        Manrope (display + UI) · JetBrains Mono (code)
            Weights 400 / 500 / 700 - 700 for the display and <strong> only
            Body 17px · nothing below 13px

RULE        Contrast is the accent. No brand hue.
            Every text link carries an arrow: → on the site, ↗ off it.

LOGO        @dileepadev   - wordmark full contrast, "@" one step muted, both weight 500

TAGLINE     Building AI systems and the community around them.

PILLARS     Build · Teach · Ship
```

## 5. Portrait

The portrait is the one photograph the brand leads with (§3.2) - the face on the profile picture,
the profile rail and phone hero on `dileepa.dev`, the favicon set, and every platform crop derived
from it (LinkedIn, GitHub, Facebook, X, YouTube). This section covers the field it sits on.

| Token | Hex | Role |
| --- | --- | --- |
| `portrait-field` | `#D2D2D2` | Default background for every portrait crop. Reuses `paper-300` (§1.2) - no new token. |
| `portrait-on-dark` | `#F1F1F1` | Swap-in field on Carbon surfaces. Reuses `ink-100` (§1.2). |
| `portrait-on-light` | `#6A6A6A` | Swap-in field on Paper surfaces. Reuses `paper-400` (§1.2). |

**The favicon and app-icon set is the exception: it ships with a transparent field.** A browser
tab, a home screen and an installed app each draw their own background, and a filled `#D2D2D2`
square reads as a grey tile against every one of them that is not Paper.

**In the terminal** (`curl -L dileepa.dev`) the portrait is drawn in quadrant blocks on the
256-colour grey ramp, with the field cut out so the face sits on the reader's own terminal. It is
generated from the same photograph by `scripts/portrait-ascii.mjs` in `dileepa-dev`.

### Verified contrast

| Pairing | Ratio | Verdict |
| --- | --- | --- |
| `portrait-field` vs subject (hair/shirt) | 12.85:1 | AAA |
| `portrait-field` vs white/light platform chrome | ≈1.4:1 | Intentionally soft - a photo field, not a control's edge, so the 3:1 non-text floor doesn't apply here. |
| `portrait-field` vs dark platform chrome | ≈10–12:1 | AAA |
