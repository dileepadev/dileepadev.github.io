# Changelog

All notable changes to this project are documented in this file.

Changes are organized into the following categories:

- **Added:** New features or functionality introduced to the project.
- **Changed:** Modifications to existing functionality that do not add new features.
- **Fixed:** Bug fixes that resolve issues or correct unintended behavior.
- **Removed:** Features or components that have been removed from the project.

## [Unreleased]

Unreleased changes go here.

## [v2.0.0] - 2026-09-03

> [!NOTE]
> The repository stops being an image host and becomes the public build log: a static dashboard over the account's public GitHub data.
>
> - **GitHub Pages is now built from GitHub Actions.** Switched from the legacy branch-root source, which served the repository tree rather than the Astro build, ahead of merging `feat/v2.0.0` — see [#2](https://github.com/dileepadev/dileepadev.github.io/pull/2). No custom domain; the site stays on `dileepadev.github.io`.
>
> - Lighthouse against the deployed site: accessibility 100 (after the fixes above), best
>   practices 100, SEO 100, every run. Performance, from PageSpeed Insights (Google's own network,
>   authoritative over this environment's earlier, noisier local readings): desktop 99, mobile 91 —
>   both "good," mobile short of the ≥ 95 target, tracking the same render-blocking Google Fonts
>   and layout-CSS requests. See `TODO.md` for why that's not being chased further right now.
> - Project preview images are still hosted here. They move out one repository at a time — see the
>   image migration section in [README.md](README.md).

### Added - v2.0.0

- **Astro 7 + Tailwind CSS 4.3** build, matching `links-dileepa-dev`. Node 22+, npm.
- **`scripts/fetch-github.mjs`** — build-time fetch writing `src/data/snapshot.json`. GraphQL for
  the contribution calendar and batched language byte counts; REST for repositories, workflow
  runs, deployments and releases.
- **Five views** — `/` (headline numbers, contribution calendar, languages, recent activity),
  `/repos`, `/activity`, `/ci`, `/deployments`, plus a rebranded 404.
- **Dated history** at `data/history/YYYY-MM-DD.json`. The GitHub API has no memory, so a trend
  only exists if it was written down. Existing files are never rewritten.
- **`.github/workflows/refresh-data.yml`** — refreshes the snapshot every 6 hours, on
  `workflow_dispatch`, and when the fetch script changes. Commits as
  `chore(data): refresh snapshot`, and only when something actually changed.
- **`.github/workflows/deploy.yml`** — builds and publishes to GitHub Pages from `main`. Fails
  the build if `dist/images` is empty, which would silently 404 every hot-linked project preview.
- **Charts**, built from the brand tokens in HTML and CSS — no charting library and no SVG
  viewBox, so labels stay real text at every width. `ColumnChart` (contributions by month on `/`,
  repositories created per month on `/repos`) and `BarChart` (language share on `/`, workflow
  success rate on `/ci`). Every mark in a chart is one neutral; the accent marks meaning and
  `--error` marks a genuinely bad rate, never merely the smallest bar.
- **Navbar ported from `dileepa-dev`** — the floating pill, pill-shaped links with the accent on
  the current page, an Explore dropdown with a rotating chevron, and the mobile menu with its
  Pages / Explore sections, divider and active dot. Both dropdowns close on an outside press and
  on Escape. Explore carries the other platform surfaces (main site, blog, links, API, GitHub),
  since the build log otherwise has no route out to them.
- **The fetched timestamp reads twice**: the UTC instant, server-rendered, plus the same instant
  in the visitor's own zone, filled in on the client because only the browser knows where the
  reader is. Without JavaScript the UTC reading stands alone and no empty separator appears.
- Theme toggle with the platform storage key `dileepa-theme`, applied before first paint.
- Prettier, `astro check`, and a `check` script.

### Changed - v2.0.0

- **`images/` → `public/images/` and `assets/` → `public/assets/`.** Astro publishes only what is
  under `public/`, so this move is what keeps every hot-linked
  `dileepadev.github.io/images/<project>/preview.png` URL resolving after the switch to an
  Actions build. No URL changes.
- Brand tokens vendored from `dileepadev/docs/brand/brand-tokens.css` into
  `src/styles/brand-tokens.css`. The only local change is the removal of the font `@import`,
  invalid inside a CSS `@layer`; the fonts load from a `<link>` in the layout.
- Favicon set is the portrait, matching `dileepa-dev` and `links-dileepa-dev`.
- Language shares are drawn as a stepped neutral ramp rather than GitHub's per-language colours.
  The guide permits one accent and no second hue; a dozen language colours is a dozen second
  hues.
- Status colour follows the platform rule: passing, completed and idle are **neutral**, failures
  use `--error`, in-progress uses `--warning`, and emerald marks **one** figure per page.
- `README.md` rewritten — what the dashboard shows, where the data comes from, how it refreshes,
  and the image migration status.
- **The repos view's filter and sort controls are the dropdowns from `dileepa-dev`**, not native
  `<select>` elements. A native select draws its menu with the operating system's own chrome,
  which no brand token can reach — on Carbon it opened as a white OS list beside a dark page, and
  it looked nothing like the same control on `dileepa.dev`. Replaced with a button and listbox
  built from the same tokens as the rest of the page (`src/components/Dropdown.astro`), ported
  from `FilterSelect` and `SortSelect`: filter iconography and an active dot for the two filters,
  sort iconography for sort, a rotating chevron, a check on the selected row, and per-option
  counts. Keyboard and dismissal behaviour match the navbar's dropdowns — arrows with wraparound,
  Enter or Space to choose, Escape and outside press to close, focus returned to the trigger.
  Both variants sit at `--control-h`, so they line up with the search input beside them.
- **Every workflow action moved to a Node 24 major.** GitHub is forcing Node 20 actions onto the
  Node 24 runtime and warning on each run. `actions/checkout` and `actions/setup-node` v4 → v7 in
  both workflows; `actions/configure-pages` v5 → v6, `actions/upload-pages-artifact` v3 → v5 and
  `actions/deploy-pages` v4 → v5 in the deploy. The one behaviour change that mattered:
  `upload-pages-artifact` stopped bundling dotfiles at v4, which would have dropped `.nojekyll`
  from the tarball with no error — `include-hidden-files: true` restores it. `setup-node`'s v6
  automatic npm caching does not engage here, since `package.json` declares no `packageManager`
  field, and the pinned `node-version` is unaffected: the deprecation is about the runtime the
  action itself runs on, not the Node the build uses.

### Fixed - v2.0.0

- **`role="list"` on `BarChart` and `ColumnChart`'s column list.** `list-style: none` strips the
  implicit list role in Chromium, orphaning every `<li>` — caught by a Lighthouse accessibility
  run against the deployed site (96, not the 100 measured locally pre-deploy). `BarChart` had
  briefly gone through `aria-hidden` on each row instead; that was reverted before it shipped,
  since `/ci`'s rows carry a real `href` per repository and hiding the row would have hidden that
  link from a screen reader too.
- **Contrast failure on the active nav link.** `.nav-link.is-active` composited `--brand` on
  `--surface-hover` rather than the plain page background — 4.312:1 in light theme, under the
  4.5:1 AA floor (`--brand` alone measures 5.0:1). Caught by PageSpeed Insights' desktop run,
  which measures light theme by default; every earlier check happened to run dark, where the
  much larger emerald-bright margin hides it. Fixed by removing the background from both
  `.nav-link.is-active` and `.nav-mobile-link.is-active`, which also brings the rule back in line
  with design-system.md §Navigation ("colour only, never a weight change") — the background was
  never part of that spec. The identical rule exists verbatim in `dileepa-dev`, this navbar's
  origin; out of scope for this repository, not touched here.

### Removed - v2.0.0

- The v1 landing page: `index.html`, `styles.css`, `script.js`.
- The Jekyll-oriented `.gitignore`, replaced with the Astro one.

<!-- e.g., -->
<!-- Unreleased -->
<!-- v2.0.0 -->
<!-- v1.1.0 -->
<!-- v1.0.0 -->
<!-- v0.0.1 -->

[Unreleased]: https://github.com/dileepadev/dileepadev.github.io/branches
[v2.0.0]: https://github.com/dileepadev/dileepadev.github.io/releases/tag/v2.0.0
