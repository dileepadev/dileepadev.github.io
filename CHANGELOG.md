# Changelog

All notable changes to this repository are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] — 2026-09-03

The repository stops being an image host and becomes the public build log: a static dashboard
over the account's public GitHub data.

### Added

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

### Changed

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

### Fixed

- **`role="list"` on `BarChart` and `ColumnChart`'s column list.** `list-style: none` strips the
  implicit list role in Chromium, orphaning every `<li>` — caught by a Lighthouse accessibility
  run against the deployed site (96, not the 100 measured locally pre-deploy). `BarChart` had
  briefly gone through `aria-hidden` on each row instead; that was reverted before it shipped,
  since `/ci`'s rows carry a real `href` per repository and hiding the row would have hidden that
  link from a screen reader too.

### Removed

- The v1 landing page: `index.html`, `styles.css`, `script.js`.
- The Jekyll-oriented `.gitignore`, replaced with the Astro one.

### Notes

- **GitHub Pages is now built from GitHub Actions.** Switched from the legacy branch-root source,
  which served the repository tree rather than the Astro build, ahead of merging `feat/v2.0.0` —
  see [#2](https://github.com/dileepadev/dileepadev.github.io/pull/2). No custom domain; the site
  stays on `dileepadev.github.io`.
- Lighthouse against the deployed site: accessibility 100 (after the fix above), best practices
  100, SEO 100, every run. Performance held 96–98 on `/repos`, `/ci`, `/activity`, `/deployments`;
  `/` swung 83–98 across five runs from this environment, tracking network jitter to the
  render-blocking Google Fonts request rather than anything the site does. Treat as unsettled
  until confirmed from a stable network — see `TODO.md`.
- Project preview images are still hosted here. They move out one repository at a time — see the
  image migration section in [README.md](README.md).

[2.0.0]: https://github.com/dileepadev/dileepadev.github.io/releases/tag/v2.0.0
