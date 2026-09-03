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

### Foundation ✅

- [x] Scaffold Astro 7 + Tailwind CSS 4.3, matching `links-dileepa-dev`
- [x] Vendor `brand-tokens.css` from `dileepadev/docs/brand/` into `src/styles/`, recording the source
- [x] Manrope + JetBrains Mono, weights 400/500/700 only — mono is the majority face here
- [x] Base layout, header with the `dileepadev /.` lockup, favicon
- [x] **The favicon is the portrait, not the reduced mark** — matching `dileepa-dev` and
      `links-dileepa-dev`, per brand guide §3.2. This line previously said the mark
- [x] Theme toggle matching the platform's storage key (`dileepa-theme`)
- [x] Replace the v1 `index.html`, `styles.css`, `script.js` — deleted
- [x] Pages deploy workflow for the Astro build — `.github/workflows/deploy.yml`
- [x] **`images/` and `assets/` moved under `public/`.** Astro publishes only what is in
      `public/`, so without this the switch to an Actions build would have stopped serving every
      hot-linked project preview — silently, with no failing build. Every URL is unchanged

### Data layer ✅

- [x] `scripts/fetch-github.mjs` — build-time fetch, writes `src/data/snapshot.json`
- [x] GraphQL for `user.contributionsCollection` and batched per-repo language byte counts.
      **Repo metadata comes from REST**, not GraphQL: `has_pages` is not on the GraphQL
      Repository type, and it is what the deployments view runs on without a PAT
- [x] REST per-repo for workflow runs, deployments, releases — 56 repos × 3 calls, inside the
      documented budget
- [x] Pages detail from `has_pages` + `homepage`; `GET /repos/{o}/{r}/pages` is **optional**
      enrichment, requested quietly and falling back without failing
- [x] **Degrade, never fail the build** — verified by running the whole fetch against a dead
      host: partial snapshot, five warnings, exit 0, site still builds and says what is missing
- [x] **Stop when the hourly budget is exhausted** rather than sleeping until it resets. Not in
      the original plan: an unauthenticated run is 60 requests against ~170 calls, and the
      back-off alone took the fetch from 0.4s to minutes
- [x] Confirm every snapshot field is already public before writing it — the token is used and
      discarded, never written; private work appears only as `restrictedContributionsCount`
- [x] Commit a dated snapshot to `data/history/YYYY-MM-DD.json` on each refresh — headline
      figures only, and never rewritten once the day's file exists
- [x] Scheduled workflow: every 6h + `workflow_dispatch` + push when the fetch script changes
- [x] Commit refreshes as `chore(data): refresh snapshot` so they can be filtered, and only when
      something actually changed

### Views ✅

- [x] `/` — headline numbers, contribution heatmap, languages, recent activity
- [x] `/repos` — all public repos, searchable and filterable by language and live site, sortable
- [x] `/activity` — chronological build log grouped by day: releases, workflow runs, deployments
- [x] `/ci` — workflow health per repo: last run, success rate, median duration
- [x] `/deployments` — live Pages sites and hosts elsewhere, with links
- [x] Every page states when its data was last fetched
- [x] Rebranded 404
- [x] **Navbar and dropdowns ported from `dileepa-dev`** so the two surfaces share one navbar —
      pill links, Explore dropdown, mobile Pages/Explore menu, active dot, outside-press and
      Escape to close. No scroll-spy: this site has pages, not homepage sections
- [x] **Fetched time in both UTC and the visitor's local zone.** Local time is a per-visitor
      value, so it is filled in on the client; the UTC reading is in the markup either way
- [x] **Charts** — contributions by month and language share on `/`, repositories created per
      month on `/repos`, workflow success rate on `/ci`. HTML and CSS, no charting library
- [x] `/activity` carries stat tiles rather than an events-per-week chart. The obvious chart
      would lie: the snapshot keeps only 20 runs per repository, so older weeks are truncated
      and would render as a decline that never happened

### Content rules ✅

- [x] **Do not lead with stars** — the headline is commits, repositories, deployments, languages.
      Stars appear once, as a sortable column on `/repos`
- [x] Private contributions as an aggregate count only
- [x] Status colour: neutral for passing and idle, `--error` for failures, `--warning` for
      in-progress, emerald for **one** headline figure per page — verified in a browser, where
      two violations turned up that no build would have caught: fourteen emerald "built" dots on
      `/deployments`, and GitHub's per-language colours putting a dozen second hues on `/`.
      Language share is a stepped neutral ramp now
- [x] No streak flames, trophies, or rank badges
- [x] Empty and zero states say so plainly — including the 36 repositories with no workflows,
      listed rather than omitted

### Image migration — one project at a time

> [!WARNING]
> Every `images/` path is hot-linked from a README, and GitHub Pages cannot issue redirects.
> Deleting a file breaks an image somewhere with no error and no notification.

Per project:

- [x] Copy the asset into the repository it documents
- [x] Update that repo's README to the new path
- [x] Grep every repository for the old `dileepadev.github.io/images/...` URL and update each hit
- [x] Only once no reference remains, remove the file here

Known consumers to start from:

- [x] `dileepa-dev` → `images/dileepa-dev/preview-1.3.0.png`
- [x] `blog-dileepa-dev` → `images/blog-dileepa-dev/preview.png`
- [x] Audit the remaining 24 project folders for external references

**Do not batch the removal step.** Nothing here is exempt — once the previews are gone, this repo
keeps no assets on behalf of another repository.

### Testing

- [x] `npm run build` clean; `astro check` reports 0 errors, 0 warnings, 0 hints
- [x] Fetch script run against the live API; snapshot has every field the pages read —
      56 repos, 183 runs, 39 releases, 97 deployments, 0 warnings
- [x] **Build succeeds with a deliberately broken endpoint** — `GITHUB_API_BASE` pointed at a
      dead host: partial snapshot, warnings recorded, exit 0, all six pages built
- [x] Builds **without** a PAT, falling back to `has_pages` — `/pages` is requested quietly and
      its absence costs only CNAME and build-status detail
- [x] Both themes and 375px, checked in a real browser rather than inferred from the CSS
- [x] Lighthouse: **accessibility 100, best practices 100, SEO 100**
- [ ] **Lighthouse performance ≥ 95 — not verifiable from this environment.** Measured 84 and 71
      on two runs against a local server, and both are dominated by one artefact: the 1.3 KB
      Google Fonts stylesheet took 7,445 ms to arrive. The site's own payload is 102 KB across
      9 requests, every local asset under 11 ms, with TBT 0 ms and CLS 0. Re-run against the
      deployed site before treating this as a real number
- [ ] If it does fall short in production, the single lever is the render-blocking Google Fonts
      request. Self-hosting (`@fontsource`) removes the third-party origin entirely — **but it
      would diverge from `dileepa-dev` and `links-dileepa-dev`, which both load the same
      `<link>`**, so it is a platform decision rather than a local one

### Documentation and release

- [x] Rewrite `README.md` — what the dashboard shows, data sources, refresh, migration status
- [x] Add `CHANGELOG.md`
- [x] Record version `2.0.0` — in `package.json` and `CHANGELOG.md`
- [x] Update `AGENTS.md` — the layout table described a repo that did not exist yet
- [x] **Switch the Pages source from the legacy branch build to GitHub Actions.** Was
      `build_type: "legacy"`, serving the repository tree instead of the Astro build. Switched via
      the API to `"workflow"`; `cname` stays `null` — no custom domain, by decision
- [x] **Actions-bot push to `main` — checked, not actually blocked.** `main` carries no branch
      protection and no ruleset (`protected: false`, empty ruleset list), and `refresh-data.yml`
      already declares `permissions: contents: write`, which overrides the repo's read-only
      default. This line previously assumed protection that was never configured
- [ ] Add the optional `PAGES_TOKEN` secret (fine-grained, read-only) if the deployments view
      should show CNAME and build status. Everything works without it — needs a PAT minted by
      hand (Settings → Developer settings → Fine-grained tokens), then `gh secret set`
- [ ] **Merge `feat/v2.0.0` into `main`.** 16 commits, 175 files. The Pages source switch has no
      effect until this lands — `main` still serves the v1 site
- [ ] Tag `v2.0.0`
- [ ] Close [issue #1](https://github.com/dileepadev/dileepadev.github.io/issues/1)

## Later

- [ ] Trend charts once `data/history/` has enough snapshots to be worth plotting
- [ ] Per-repository detail pages, if the repos view starts feeling cramped
