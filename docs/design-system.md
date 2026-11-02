# Design system

The component and token contract every frontend in the platform implements.

**Canonical token sheet:** [`brand-tokens.css`](brand-tokens.css) (brand tokens v2.1.0)
**Brand guide:** [`brand-guide.md`](brand-guide.md)

Applies to `dileepa-dev`, `admin-dileepa-dev`, `links-dileepa-dev`, and the static page in
`dileepadev.github.io`.

## 1. The one rule about tokens

**Import the token sheet. Never copy values out of it.**

If you are typing a `#` followed by six hex digits in a component, you are creating the drift
this document exists to prevent. Every colour comes from a semantic variable - `--bg`, `--fg`,
`--fg-body`, `--fg-muted`, `--brand`, `--brand-fill`, `--on-brand`, `--bg-surface`, `--bg-raised`,
`--border`, `--border-strong`, `--border-input`, `--success`, `--error`, `--warning`, plus the
derived interaction tokens (`--surface-hover`, `--raised-hover`, `--brand-fill-hover`,
`--brand-fill-active`, `--ring`). The raw palette (`--ink-700`, `--paper-200`,
…) exists so the semantic layer can be defined once; components never reference it directly.

This matters because the semantic layer is what flips between themes. `--brand` is near-white in
one theme and near-black in the other; a component that reaches past it into `--ink-100` is
invisible in light mode.

### Per-framework wiring

| Repo | How |
| --- | --- |
| `dileepa-dev`, `admin-dileepa-dev` | Vendor into `app/brand-tokens.css`, import into `app/globals.css`, expose through Tailwind 4 `@theme` |
| `links-dileepa-dev` | Vendor into `src/styles/`, import into `global.css`, expose through Tailwind 4 `@theme` |
| `dileepadev.github.io` | Same as the links repo |

Fonts load from Google Fonts in the token sheet's `@import`. Next.js apps should replace that
with `next/font` for Manrope and JetBrains Mono and keep everything else identical - and record
that one change in the vendored copy's header.

**Import it into a cascade layer, not unlayered.** Any framework that also loads Tailwind must
declare the layer order up front and import the token sheet into a named layer that sits *before*
Tailwind's `components`/`utilities` layers:

```css
@layer theme, base, brand, components, utilities;

@import "tailwindcss";
@import "./brand-tokens.css" layer(brand);
```

A bare `@import "./brand-tokens.css";`, with no `layer(...)`, loads the sheet **unlayered** - and
unlayered CSS beats every layered rule regardless of source order or specificity. It happened on
`dileepa-dev`: the sheet's base rules beat every Tailwind utility that should have overridden
them, silently. The sheet belongs in a layer.

## 2. Colour

**Governing rule:** contrast is the accent. There is no brand hue. Emphasis comes from contrast,
weight and fill; colour appears only to report a state.

### 2.1 Brand colours

| Role | Name | Hex | Token |
| --- | --- | --- | --- |
| Foundation (dark) | Carbon | `#050505` | `--bg` (dark) |
| Foundation (light) | Paper | `#F7F7F7` | `--bg` (light) |
| Accent on dark | Ink 100 | `#F1F1F1` | `--brand`, `--brand-fill`, `--fg` (dark) |
| Accent on light | Paper 900 | `#131313` | `--brand`, `--brand-fill`, `--fg` (light) |

`--on-brand` is the foundation of the theme - text on a filled button is Carbon on Ink 100, Paper
on Paper 900.

### 2.2 Neutrals and edges

**Dark ramp:**

| Token | Hex | Use |
| --- | --- | --- |
| `ink-900` | `#050505` | Page foundation; a card sitting on a panel |
| `ink-800` | `#0D0D0D` | Panel / section surface |
| `ink-700` | `#141414` | Raised surface, code blocks |
| `ink-600` | `#1F1F1F` | Structural rules - list-row dividers, hairlines |
| `ink-500` | `#2E2E2E` | Component edges - buttons, selects, toggles, interactive chips |
| - | `#5B5B5B` | Form-field edges only (`--border-input`) |
| `ink-400` | `#8D8D8D` | `--fg-muted` (6.1:1) - dates, names, labels |
| - | `#A8A8A8` | `--fg-body` (8.6:1) - running text |
| `ink-100` | `#F1F1F1` | `--fg` (18.0:1) - titles; the accent |

**Light ramp:**

| Token | Hex | Use |
| --- | --- | --- |
| `paper-0` | `#FFFFFF` | Raised cards |
| `paper-50` | `#F7F7F7` | Page foundation |
| `paper-200` | `#E3E3E3` | Structural rules |
| `paper-300` | `#D2D2D2` | Component edges |
| - | `#8F8F8F` | Form-field edges only (`--border-input`) |
| `paper-400` | `#6A6A6A` | `--fg-muted` (5.0:1) |
| - | `#4F4F4F` | `--fg-body` (7.6:1) |
| `paper-900` | `#131313` | `--fg` (17.3:1); the accent |

**Edges mark what you can press.** The edge rule, in full:

| Element | Edge |
| --- | --- |
| Form fields - inputs, textareas, search | `--border-input` (3:1, WCAG 1.4.11: a field's edge is its only signal) |
| Buttons, selects, filter triggers, toggles, interactive chips and badges | `--border-strong` |
| Labels - badges, chips and pills that only describe | **none** |
| Structural rules between rows | `--border` |
| Panels and cards | a surface step, not an edge (§8) |

An outlined label looked like a control. Now an edge means "this does something".

### 2.3 Functional colours

Interface states, not brand. Never in content, graphics or decoration.

| State | Hex (dark / light) | Note |
| --- | --- | --- |
| Success | `#23B888` / `#087F5B` | A copy confirmation's tick, a sent message |
| Error | `#E5484D` / `#C4292E` | 5.2:1 / 5.3:1. Field errors, failed actions |
| Warning | `#D97706` / `#B45309` | UI states only, never a brand accent |

Toasts use the theme: `--bg-surface`, a `--border` hairline, `--radius-tile`, Small text.

### 2.4 Links

**An anchor's default colour is `inherit`, not `--brand`.** A link reads as part of its text until
its component states otherwise.

**Every text link carries an arrow.** `.text-link` - item, card and post titles, inline mentions -
ends in `→` for a page on the site; any `target="_blank"` link ends in `↗`. With no link colour in
the palette, the arrow is what tells a reader an event title opens the event; without it, visitors
did not click titles. On hover the text, arrow included, steps down to `--fg-muted`. Exceptions:

- **Navigation chips and buttons** carry no arrow - their shape already says they act.
- **Long-form prose** (`.prose a`) is underlined at the accent instead, because an arrow after
  every inline link breaks the sentence. An external prose link still takes its `↗`.
- Social icons, `.view-all` ("All posts" - its own arrow icon) and `.no-external` opt out.

### 2.5 Verified contrast

| Pairing | Ratio | Verdict |
| --- | --- | --- |
| `--fg` on Carbon / on panel | 18.0:1 / 17.2:1 | AAA |
| `--fg-body` on Carbon | 8.6:1 | AAA |
| `--fg-muted` on Carbon | 6.1:1 | AA |
| `--fg` on Paper | 17.3:1 | AAA |
| `--fg-body` on Paper | 7.6:1 | AAA |
| `--fg-muted` on Paper | 5.0:1 | AA |
| `--on-brand` on `--brand-fill` (dark / light) | 18.0:1 / 17.3:1 | AAA |
| `--border-input` on `--bg` (both themes) | 3.0:1 | WCAG 1.4.11 floor |
| `--error` on its page (dark / light) | 5.2:1 / 5.3:1 | AA |
| `--warning` on its page (dark / light) | 6.4:1 / 4.7:1 | AA |

**Forbidden:** an edge or surface step used as text - `ink-500` on Carbon (1.5:1), `paper-300` on
Paper (1.4:1).

### 2.6 Proportion

```text
Neutrals          ████████████████████████████████████████  85%
Full-contrast ink ██████████████                             14%
Functional        ▌                                            1%
```

**Audit method:** count the full-contrast elements on one viewport. Titles and one filled primary
action are expected; when body text, labels and metadata are at full contrast too, nothing is.

## 3. Typography

### 3.1 The faces

| Role | Typeface | Source | Why |
| --- | --- | --- | --- |
| Display + UI | **Manrope** | Google Fonts, weights 400/500/700 | Geometric enough to read as engineering, warm enough to carry a human side |
| Code + data | **JetBrains Mono** | Google Fonts, weights 400/500 | Legible at small sizes, pairs cleanly with Manrope |
| Fallback | system-ui | - | Both fonts are self-hostable; fallback is rarely needed |

Two families. No third.

### 3.2 Scale

| Level | Token | Size / line-height | Weight | Tracking | Use |
| --- | --- | --- | --- | --- | --- |
| Display | `--text-display` | `clamp(2.75rem, 1.4rem + 4.4vw, 5rem)` / 1.02 | 700 | `-0.04em` | Hero statement, once per page |
| H1 | `--text-h1` | `clamp(2.25rem, 1.65rem + 2vw, 3.5rem)` / 1.06 | 500 | `-0.04em` | Page title |
| H2 | `--text-h2` | 1.75rem (28px) / 1.2 | 500 | `-0.02em` | Section |
| Lead | `--text-lead` | `clamp(1.25rem, 1.05rem + 0.75vw, 1.625rem)` / 1.35 | 400 | 0 | A section's opening sentence |
| H3 | `--text-h3` | 1.1875rem (19px) / 1.35 | 500 | 0 (`-0.02em` on titles) | Subsection, card and item titles |
| Body | `--text-body` | 1.0625rem (17px) / 1.65 | 400 | 0 | Running text |
| Small | `--text-small` | 0.9375rem (15px) / 1.55 | 400 | 0 | Captions, metadata, button labels |
| Label | `--text-label` | 0.8125rem (13px) / 1.45 | 500 | `0.01em` | Badges, chips, dates |

The display and H1 are fluid, so there is no mobile override. **13px is the floor** - nothing on
any surface is set smaller.

**Colour of text by role:** titles take `--fg`; paragraphs (descriptions, intros, card text, the
post body) take `--fg-body`; dates, names, labels and captions take `--fg-muted`.

### 3.3 Weights

**400, 500, 700 only. No 600.** 400 for reading, 500 for everything scanned or acted on - every
heading from H1 down, labels, buttons, the nav - and 700 for exactly two things: the display line
and `<strong>`. With headings at 500, size carries rank; 700 at the very top is what separates the
display from the H1 beneath it.

### 3.4 Rules

- **Sentence case everywhere.** Title Case is for proper nouns, including the role `AI Engineer`.
- Body copy caps at ~68 characters per line (`p { max-width: 68ch }`); a paragraph used as layout
  opts out explicitly (`max-w-none`).
- Never set body text in mono. Mono is for code, dates, figures and identifiers.

## 4. Spacing, sizing & shape

### 4.1 Space scale

`--space-1` (4px) through `--space-16` (64px), on a 4px grid: 1, 2, 3, 4, 5, 6, 8, 10, 12, 16.

### 4.2 Shape - fixed, capsule, concentric

After Apple's shape system, every corner follows one of three rules:

**Fixed** - a constant radius, for containers and marks:

| Token | Value | Use |
| --- | --- | --- |
| `--radius-panel` | 32px | A page panel, the profile rail, the footer, the mobile menu |
| `--radius-tile` | 22px | A card on a panel, a menu, a toast |
| `--radius-block` | 12px | Media and blocks inside a card - an image, code, an icon well |
| `--radius-inline` | 6px | A mark inside text - inline code, a key |

**Capsule** - half the height, for every control: a button, a field, search, a select, a toggle, a
nav item, a chip, a badge (`--radius-pill`). An icon alone is a circle. A field's corner is
`--radius-field`, fixed at half the control height (20px), so a one-line field is a capsule and a
textarea keeps the same end radius as it grows.

**Concentric** - the parent's radius less the inset, for anything nested tight inside another
shape: a row 6px inside a menu takes `--radius-row` (the tile's 22px less 6px). A capsule inside a
capsule is concentric by construction.

A person is a circle.

### 4.3 Control height

**One control height: `--control-h`, 40px.** Buttons, fields, search, selects and toggles sit on
the same baseline in every theme, because height - not padding - is what's fixed.

### 4.4 Borders & motion

`--hairline: 1px`. `--dur: 160ms`, `--ease: cubic-bezier(0.4, 0, 0.2, 1)` for every state change
in the system - Tailwind's default transition is pointed at the same pair, so a utility-styled
element and a hand-written one hover at one speed. See §9.1 for the few longer motions.

## 5. Visual hierarchy & design principles

When a new pattern has no token yet, reason from these:

1. **Contrast is the accent.** Full-contrast ink marks what most deserves attention - a title, the
   one primary action, the current item. Everything else sits a step down.
2. **Three text steps, three jobs.** `--fg` leads, `--fg-body` is read, `--fg-muted` is glanced
   at. A paragraph at `--fg` competes with its heading; a label at `--fg-body` reads as prose.
3. **Size ranks headings; 700 is the exception.** Every heading is 500. Reach for size or position
   before weight.
4. **An edge means it acts.** Controls have edges; labels don't; panels and cards are surface
   steps.
5. **Every state reduces to one formula** (§9). A new component reuses it.
6. **Mono means "this is data".**

## 6. Components

The contract. Same behaviour across every surface; framework is an implementation detail.

### Buttons

| Variant | Background (rest → hover → active) | Text | Edge |
| --- | --- | --- | --- |
| Primary | `--brand-fill` → `--brand-fill-hover` (86% toward `--bg`) → `--brand-fill-active` (76%) | `--on-brand` | none |
| Secondary | transparent → `--surface-hover` → `--raised-hover` | `--fg` | `--border-strong` |

Small (15px) at weight 500, height `--control-h`, padding `0 var(--space-5)`, a capsule. The fill
is the text colour, so a primary button and a heading read as one ink. Its hover steps ease toward
the background - mixing toward `--fg` would change nothing. Disabled: 50% opacity, `not-allowed`,
hover suppressed. Destructive actions take `--error` as the fill. **One filled primary per
surface.**

### Panels and cards

**Panels** - every page section, the rail and the footer - are `--bg-surface` with a
`--border-strong` hairline, `--radius-panel`, padding `--panel-pad`
(`clamp(var(--space-6), 0.5rem + 3vw, var(--space-12))`), stacked with `--space-6` between them.

**Cards** sit one step *down* on a panel: `--bg` background, no edge, `--radius-tile`,
`--space-6` padding - objects in the panel, not holes cut in it. A tile card is a meta row (dates
or status on the left, one pill on the right), the title as the card's only link, up to three lines
of `--fg-body` description, then a foot of chips. **A card is not a link; its title is.**

### Section headings

A section opens on its heading (`clamp(2rem, 1.35rem + 2.2vw, 3rem)`, weight 500, `-0.03em`,
balanced) and a lead paragraph in `--fg-muted`. In its top-right corner sits the section's
**app-icon tile**: a 7.5rem square at a 1.75rem radius, a faint top-lit gradient of `--fg` into
`--bg-surface`, an inner highlight and a soft drop shadow, holding one Lucide icon at 4rem, stroke
1.5 - over a faint dot field. It is the one decorated element in the system, and it marks which
section you are in at a glance.

Subsection titles are a `<span>` (not a heading - it keeps `h2` → `h3` contiguous) at the H3 size,
`--fg`, with a 16px Lucide icon before them and a Small `--fg-muted` note beneath.

### Page headings

An index or detail page opens on its **path capsule** (`home / blog`, each segment a link, mono
Label in a `--bg` pill), then the `<h1>`, a **count badge** at the right ("22 Posts"), then the lead
paragraph. Nothing else: no extra label repeating the page name between the path and the title.

### Badges, chips and pills

All capsules, at `--text-label` weight 500. **A chip or badge that only labels has no edge;** one
that acts - a tag link, a filter - takes `--border-strong`; on hover it lifts to `--surface-hover`, its
edge turns `--brand` and its text steps to `--fg`. One filled badge per surface, at most. Inside a card, chips sit on
`--bg-surface`; on a panel, on `--bg`.

### Status dots

An 8px dot in `--brand` before "Open to work", "Current", "Upcoming" - the colour is the ink, not
a hue. It pulses slowly (2s, a soft ring growing out of it) to say "live", and holds still under
reduced motion.

### Date stamp

An event's meta row leads with its date as a stamp: the day at the H2 size, a hairline, then the
month at `--fg` over the year at `--fg-muted`, both Small - on `--bg-surface` at the block radius.

### Lists

**Roles** (`/work`) are one tile per role: the date range as a mono pill, the title at the H3 size,
the organisation, a `--fg-body` description. **Courses** (`/education`) are a two-up grid of the
same tile. **Item lists** (posts, projects, events on index pages) are rows separated by `--border`
hairlines: content on the left, a right-aligned metadata column; one column below 720px.

### Forms

Inputs, textareas and search: `--bg-surface`, `--border-input`, `--radius-field`, height
`--control-h` for one line. Labels above the field (Small, 500, `--fg`); required fields carry a
`*` in `--brand`.

**Focus is the edge itself:** the border turns to `--brand` and an inset 1px shadow of the same
colour thickens it to 2px - one line, no halo, nothing moves.

**Validation messages are the system's, not the browser's.** Forms are `noValidate`; the rules stay
the browser's (`required`, `type="email"`, read through the constraint validation API). On submit,
each failure is written under its field - Small, `--error`, led by an alert icon - the field takes
an `--error` edge (kept on hover; a 2px `--error` edge on focus) and `aria-invalid`, the message is
tied to it with `aria-describedby`, and focus moves to the first failure. A message clears as soon
as its field is acceptable; fields are not checked before the first submit. Copy names what to do:
"Enter your name.", "Enter an email address like <jane@example.com>."

Browser autofill overrides colours and must be defeated:

```css
input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px var(--bg-surface) inset;
  -webkit-text-fill-color: var(--fg);
}
```

### Selects, filters and sort

Capsule triggers at `--control-h` with `--border-strong`, a leading icon and a trailing chevron.
An unfiltered filter reads **"Status: All"** - the label already names the dimension, so the value
does not repeat it; the menu keeps "All types" as its first option, where it stands alone. Menus
float on `--bg-raised` at `--radius-tile`, rows at `--radius-row`, and open with a short scale-and-
fade. An open trigger, like a focused field, draws a 2px `--brand` edge. Keyboard: arrows, Enter,
Space, Escape.

### Navigation

**At 1024px and up: the profile rail.** A sticky 21rem panel beside the content - portrait, name,
role and status, a full-width primary "Get in touch", then the navigation as one flowing list of
capsule chips (Home, About, Work, Education, Contact, then the index pages), then social icons.
One list, not groups: separate groups each wrapped on their own and stranded a chip beside a hole.
On a long reading page (a post, `/brand`) the rail becomes that page's table of contents.

**Below 1024px: the floating nav.** A 60px capsule on `--bg-surface` with `--shadow-nav` - the one
floating element, and the one shadow - holding the lockup, the theme toggle and a menu button. The
menu groups links as **About me** (About, Work, Education, Contact) and **Explore** (Projects,
Blog, Events, Gallery, Videos, Communities) - the same two names the footer uses.

A link to a homepage section is current while that section is in view; a link to a page is current
while it is open. Current is shown by colour and fill, never by a weight change (that shifted
neighbours by a pixel while scrolling).

### Logo lockup

**`@dileepadev`** - the mark `@` and the wordmark `dileepadev`, both Manrope 500 at
`--track-tight`, the `@` in `--fg-muted` and the wordmark in `--fg`, set against each other with
no gap. Flex siblings; the lockup never shrinks or wraps.

```html
<a class="lockup" href="/" aria-label="dileepadev - home">
  <span class="mark" aria-hidden="true">@</span>
  <span class="wordmark">dileepadev</span>
</a>
```

Black and white only; never outlined, gradiented, rotated or on a photograph without a backing.

### Copy buttons

One behaviour everywhere: on success the button's icon becomes a tick in `--success` that grows in
at the hover timing, its label reads "Copied", for two seconds; a screen reader hears "Copied to
clipboard" from one polite live region; a failure is said once, in a toast, never swallowed. No
success toast - the feedback is where the reader is already looking.

### Back to top

A 40px circle, bottom right, shown once the reader is 400px down. Its edge is a **reading-progress
ring**: the hairline track in `--border-strong`, and a 2px arc in `--fg` that fills clockwise from
twelve o'clock as the page is read, moving exactly with the scroll (no transition).

### Keep exploring

A short page ends by pointing on rather than on the footer: a hairline, a "Keep exploring" title at
the H3 size, and three tile cards to related pages, named and described from the site's page list.

### Gallery and image viewer

A grid of 4:3 photographs at `--radius-block`. Captions sit over a fixed dark scrim on hover and
focus - never themed, because the photograph isn't. The viewer opens at the page-transition pace:
the backdrop fades, the photo fades in a beat later rising from 96%; closing reverses it in 200ms.

### Footer

A panel. Below 1024px it shows the lockup, tagline, socials and two link columns - **About me**
and **Explore** - with mono `--fg` titles. At 1024px and up it keeps only the legal row (the rail
already carries the rest): the copyright, the `curl` hint (a mono capsule that copies the terminal
command), and the meta links - Profile, Brand, Privacy, Terms, Sitemap, Source, the version.

## 6.1 Photographs

Photographs appear in three places on `dileepa.dev`: **the portrait** (the rail, the phone hero,
the profile), **event photographs** (the gallery and each event) and **video thumbnails** on
`/videos`. That is the whole budget.

- A video thumbnail is 16:9 at `--radius-block`, beside the video's title in a list row - never a
  grid of thumbnails, so the title and date still lead. Its length sits on the picture on a fixed
  dark scrim, and the thumbnail link stays out of the tab order: the title is the one link.
- Blog posts carry no banner.
- Logos, tool marks and project covers are not photographs and aren't counted.
- A portrait sits on its field (`#D2D2D2`) or on `--bg-surface`; never a cut-out on the page.

## 7. Icons

**Interface icons (Lucide)**, `lucide-react`, across every control. 16px (`h-4 w-4`) in controls,
14px inline with text; the section app-icon tiles draw them at 4rem with stroke 1.5. Section icons
are literal, and only the two homepage sections carry one: a person for About, speech bubbles for
Contact.

**Brand & social glyphs**: GitHub, LinkedIn, X, YouTube, Instagram, Facebook - hand-authored
inline SVGs (24×24, `fill="currentColor"`), `--fg-muted` at rest, `--fg` on hover.

**Pillar marks** (`docs/brand/icons/`): the six marks drawn for the former About cards. No surface
uses them; they stay in the repository as assets, recoloured
through `currentColor` if they are ever used again.

**Every decorative icon carries `aria-hidden="true"`;** the accessible name comes from the visible
text or the control's `aria-label`.

## 8. Backgrounds, shadows & effects

**Depth is a surface step.** `--bg` → `--bg-surface` → `--bg-raised`, and a card on a panel steps
back down to `--bg`. No shadow at rest, hover or focus on cards, buttons, chips or fields.

**Sanctioned exceptions, each for a reason:**

- The floating nav's `--shadow-nav` - the one element genuinely floating over content.
- The section app-icon tile's top-lit gradient and soft shadow - the one decorated mark (§6).
- The faint dot field behind section corners - texture at the panel's edge, never behind text.
- The gallery caption scrim - a fixed black gradient for legibility over a photograph.

**No glow, no hue gradient, ever.**

## 9. States - hover, active, focus, disabled

| State | Bordered / transparent control | Filled (primary) | Text link |
| --- | --- | --- | --- |
| Rest | `--bg-surface` or transparent, `--border-strong` | `--brand-fill` | inherit, with its arrow |
| Hover | background → `--surface-hover` | → `--brand-fill-hover` | text steps to `--fg-muted` |
| Active | background → `--raised-hover` | → `--brand-fill-active` | - |
| Focus, a control with no edge change | the 3px `--ring` (`--brand` at 32%) | same | 3px ring |
| Focus, a field | border → `--brand` + inset 1px: one 2px edge, no ring | - | - |
| Disabled | 50% opacity, `not-allowed`, hover suppressed | same | - |

Never the hard outline and the soft ring together.

### 9.1 Motion

Every state change uses `--dur` (160ms) and `--ease`. Beyond that, motion only answers a person's
action or marks something live:

| Motion | Timing |
| --- | --- |
| Page change - the old page fades out, the new fades in a beat later rising 6px | 160ms out; 280ms in after 100ms |
| Image viewer open / close | 220ms backdrop, 300ms photo after 60ms / 200ms |
| Menu open | a short scale-and-fade at `--dur` |
| Copy tick | grows in from 60% at `--dur` |
| Field error | fades in, rising 2px, at `--dur` |
| Status dot | a soft 2s pulse, while live |
| Back-to-top ring | follows the scroll, no transition |

No fade-up-on-scroll for sections, no parallax, no bounce. **`prefers-reduced-motion: reduce`**
swaps every view transition instantly and stops every animation.

## 10. Layout & responsive behaviour

**The shell.** Content sits in a `min(100% - var(--space-10), 1320px)` column. At 1024px and up,
the profile rail (21rem, sticky) sits beside a column of **panels**; below it the rail hides and
the floating nav takes over. Panels are named size containers (`container: section`), so grids
inside them split on the panel's width, not the window's - the rail takes 360px of a wide window,
and window breakpoints laid out three columns in a 540px panel.

**Pages.** The homepage is the front door: the hero (with the newest post, talk and video), About
and Contact. Work and Education are pages beside Projects, Blog, Events, Communities, Videos and
the Gallery; old section links (`/#work`) redirect to their pages.

**Breakpoints:** 1024px switches rail and floating nav; 720px collapses item lists to one column.
Inside panels, container queries on the panel's own width do the rest.

**The flexible column always gets `min-width: 0`** - a grid track's automatic minimum is its
content's min-content width, and a code block or table pushes a sidebar layout past its container
without it.

## 11. Theming

Dark is the default:

```css
:root, [data-theme="dark"]  { /* Carbon foundation, Ink 100 accent */ }
[data-theme="light"]        { /* Paper foundation, Paper 900 accent */ }
@media (prefers-color-scheme: light) {
  :root:not([data-theme]) { /* system light, no explicit choice */ }
}
```

An explicit choice wins over the system preference. Persist it under one storage key across every
surface - `dileepa-theme`. The theme switch reveals the new theme from the toggle outward and is
instant under reduced motion. **Two exceptions always use Paper:** the resume and anything printed.

## 12. Admin-specific patterns

`admin-dileepa-dev` carries surfaces the public site doesn't. They are recorded here so the
platform keeps one contract; apply the v2.1.0 tokens when they are next touched.

**Tables.** Header cells mono, weight 400, `--fg-muted`, sentence case. Body cells `--fg`,
top-aligned. Rows separate with a `--border` rule and hover to `--bg-raised`. A wide table scrolls
inside its own box (`overflow-x: auto`, `--border-strong` edge, `--radius-tile`).

**Fields.** Label above, control, then hint and error below - one component, so a field can't ship
without its error slot. Controls follow §6 Forms exactly, including the system's own validation
messages.

**Repeatable field groups** - speakers, photos, links. Each row is a tile (`--bg-surface`,
`--border-strong`, `--radius-tile`) with a mono header carrying the row number and a Remove
control. The index in a field name is a row identity, not a position.

**Empty states** say what would appear and how to make it appear, and carry the action.

**Destructive confirmations** name the thing being destroyed - "Delete this event?" - never "Are
you sure?" The confirm button names the action and takes `--error`. Focus opens on Cancel.

**Toasts** follow §2.3; only an error varies, by its border.

## 13. Non-negotiables

A change that violates any of these is a bug, not a style preference.

1. **No brand hue.** The accent is the text colour. Colour appears only as a state.
2. **No hard-coded hex in components.**
3. **Weights 400, 500, 700 only** - 700 for the display and `<strong>`.
4. **Two families only** - Manrope and JetBrains Mono.
5. **Nothing below 13px.**
6. **Sentence case everywhere.**
7. **Never set body text in mono.**
8. **Paragraphs in `--fg-body`, metadata in `--fg-muted`, titles in `--fg`.**
9. **An edge means it acts** - no edges on labels.
10. **Corners follow fixed, capsule or concentric** - no invented radius.
11. **Every text link carries its arrow;** prose links are underlined.
12. **One filled primary action per surface.**
13. **The token sheet is imported into a cascade layer, never unlayered.**

## 14. Review checklist

- [ ] No hard-coded hex - every colour resolves through a semantic token
- [ ] No hue except a state (success, error, warning)
- [ ] Weights 400 / 500 / 700 only, 700 only on the display and `<strong>`
- [ ] No text below 13px; paragraphs in `--fg-body`
- [ ] Sentence case throughout
- [ ] Corners: fixed for containers, capsule for controls, concentric when nested
- [ ] Edges only on things that act; fields on `--border-input`
- [ ] Text links carry their arrow; focus is one edge on fields, the ring elsewhere
- [ ] State changes at `--dur` / `--ease`; nothing animates under reduced motion
- [ ] Checked in **both** themes, at 390px and at 1024px+, with no horizontal scroll
- [ ] Keyboard-reachable in a sensible order, `:focus-visible` everywhere
