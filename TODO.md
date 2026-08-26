# TODO

This file tracks tasks, improvements, and features planned for upcoming updates or releases of
this repository.

> [!NOTE]
> This is this repository's slice of the v2.0.0 migration. The cross-repository roadmap lives in
> [`dileepadev/TODO.md`](https://github.com/dileepadev/dileepadev/blob/main/TODO.md), and the full
> scope for this repo is in
> [issue #1](https://github.com/dileepadev/dileepadev.github.io/issues/1).

## v2.0.0 — public build log

Repurposing this repository from an image host into a static dashboard over the account's public
GitHub data. Architecture and rules are in [AGENTS.md](AGENTS.md).

**This repo hosts no brand assets.** They live in `dileepadev/docs/brand/` and only there.

### Foundation

- [ ] Scaffold Astro 7 + Tailwind CSS 4.3, matching `links-dileepa-dev`
- [ ] Vendor `brand-tokens.css` from `dileepadev/docs/brand/` into `src/styles/`, recording the source
- [ ] Manrope + JetBrains Mono, weights 400/500/700 only
- [ ] Base layout, header with the `dileepadev /.` lockup, reduced-mark favicon
- [ ] Theme toggle matching the platform's storage key (`dileepa-theme`)
- [ ] Replace the v1 `index.html`, `styles.css`, `script.js`
- [ ] Pages deploy workflow for the Astro build

### Data layer

- [ ] `scripts/fetch-github.mjs` — build-time fetch, writes `src/data/snapshot.json`
- [ ] GraphQL for repo metadata and `user.contributionsCollection`
- [ ] REST per-repo for workflow runs, deployments, releases
- [ ] Pages detail from `has_pages` + `homepage`; treat `GET /repos/{o}/{r}/pages` as **optional**
      enrichment — it 404s without a PAT and must never be a hard dependency
- [ ] **Degrade, never fail the build** — a rate limit, 404, or deleted repo yields a partial
      snapshot plus a logged warning
- [ ] Confirm every snapshot field is already public before writing it
- [ ] Commit a dated snapshot to `data/history/YYYY-MM-DD.json` on each refresh
- [ ] Scheduled workflow: every 6h + `workflow_dispatch` + push to `main`
- [ ] Commit refreshes as `chore(data): refresh snapshot` so they can be filtered

### Views

- [ ] `/` — headline numbers, contribution heatmap, recent activity
- [ ] `/repos` — all public repos, sortable and filterable by language, activity, Pages
- [ ] `/activity` — chronological build log: releases, workflow runs, deployments
- [ ] `/ci` — workflow health per repo: last run, success rate, duration
- [ ] `/deployments` — live Pages sites, with links
- [ ] Every page states when its data was last fetched

### Content rules

- [ ] **Do not lead with stars** — lead with commits, repositories, deployments, languages
- [ ] Private contributions as an aggregate count only
- [ ] Status colour: neutral for passing and idle, `--error` for failures, `--warning` for
      in-progress, emerald for **one** headline figure per page
- [ ] No streak flames, trophies, or rank badges
- [ ] Empty and zero states say so plainly

### Image migration — one project at a time

> [!WARNING]
> Every `images/` path is hot-linked from a README, and GitHub Pages cannot issue redirects.
> Deleting a file breaks an image somewhere with no error and no notification.

Per project:

- [ ] Copy the asset into the repository it documents
- [ ] Update that repo's README to the new path
- [ ] Grep every repository for the old `dileepadev.github.io/images/...` URL and update each hit
- [ ] Only once no reference remains, remove the file here

Known consumers to start from:

- [ ] `dileepa-dev` → `images/dileepa-dev/preview-1.3.0.png`
- [ ] `blog-dileepa-dev` → `images/blog-dileepa-dev/preview.png`
- [ ] Audit the remaining 24 project folders for external references

**Do not batch the removal step.** Nothing here is exempt — once the previews are gone, this repo
keeps no assets on behalf of another repository.

### Testing

- [ ] `npm run build` clean
- [ ] Fetch script run against the live API; snapshot has every field the pages read
- [ ] **Build succeeds with a deliberately broken endpoint** — partial snapshot, warning, still deploys
- [ ] Builds successfully **without** a PAT, falling back to `has_pages`
- [ ] Both themes; 375px width
- [ ] Lighthouse ≥ 95 across performance, accessibility, best practices, SEO

### Documentation and release

- [ ] Rewrite `README.md` — what the dashboard shows, data sources, refresh, migration status
- [ ] Add `CHANGELOG.md`
- [ ] Record version `2.0.0`
- [ ] Close [issue #1](https://github.com/dileepadev/dileepadev.github.io/issues/1)

## Later

- [ ] Trend charts once `data/history/` has enough snapshots to be worth plotting
- [ ] Per-repository detail pages, if the repos view starts feeling cramped
