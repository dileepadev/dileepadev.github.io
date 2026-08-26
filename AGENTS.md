# AGENTS.md

Canonical instructions for AI coding agents working in this repository.

> This file is the **single source of truth**. `CLAUDE.md` and
> `.github/copilot-instructions.md` intentionally contain only tool-specific notes and point
> back here. Add shared rules **here only** — duplicating them causes drift and contradictory
> guidance.

## What this is

`dileepadev.github.io` is the **public build log** — a static dashboard over everything publicly
visible about the `dileepadev` GitHub account. Repositories, commits, workflow runs, releases,
deployments, issues, and languages, rendered as one page a visitor can read in thirty seconds.

It answers a question a profile page cannot: *what is actually being built, and is it moving?*

Served from GitHub Pages at `https://dileepadev.github.io`.

### What it was, and why it changed

Through v1 this repo was an image host — preview screenshots for 26 projects, hot-linked from
READMEs across the account, plus a two-line landing page. That is a filesystem, not a website,
and it wasted the one repository GitHub deploys for free with no configuration.

v2.0.0 repurposes it. Project preview images move out to the repositories they belong to (see
**Image migration** below); what stays is the dashboard.

**This repo hosts nothing for other repositories.** Brand assets — the guide, the canonical token
sheet, logo lockups, favicons, banners — live in `dileepadev/docs/brand/` and only there. Like
every other frontend, this one vendors the token sheet into its own styles.

Issue **#1** holds the full scope. The cross-repository roadmap lives in `dileepadev/TODO.md`.

Version: none today; the target is `2.0.0`.

## Layout

Almost none of this exists yet. v1 was three files at the root.

| Path | Status |
| --- | --- |
| `index.html`, `styles.css`, `script.js` | **v1. Replaced** by the Astro build |
| `images/<project>/` | **v1. Migrating out** — 26 project folders, hot-linked externally |
| `assets/` | **v1.** `github-mark.svg`, `github-mark-white.svg` |
| `src/pages/` | Planned. Overview, repos, activity, CI, deployments |
| `src/components/` | Planned. Stat tiles, tables, heatmap, activity rows |
| `scripts/fetch-github.mjs` | Planned. Build-time data fetch |
| `src/data/snapshot.json` | Planned. Generated — the current state, committed |
| `data/history/YYYY-MM-DD.json` | Planned. Daily snapshots — the time series |

## Toolchain

- Astro 7 + Tailwind CSS 4.3, matching `links-dileepa-dev`. Node 22+, npm.
- `npm run dev` · `npm run build` · `npm run preview`
- Deploys to GitHub Pages from `main` via Actions.

> The v1 rule *"do not add a bundler"* is retired. It was correct for an image host and is wrong
> for a data-rendering site. Astro is the choice because it matches the platform's other static
> site and gives the design system and token setup for free.

## Data

**Everything is fetched at build time and baked into static output.** There are no runtime API
calls, no client-side fetching, and no secrets in the browser. A visitor loads HTML.

### Sources

| Data | Endpoint | Auth |
| --- | --- | --- |
| Repo list, stars, languages, `has_pages`, `homepage` | `GET /users/dileepadev/repos` | none |
| Contribution calendar, commit/PR/issue totals | GraphQL `user.contributionsCollection` | token |
| Workflow runs | `GET /repos/{o}/{r}/actions/runs` | none |
| Deployments | `GET /repos/{o}/{r}/deployments` | none |
| Releases | `GET /repos/{o}/{r}/releases` | none |
| Pages status, CNAME, build type | `GET /repos/{o}/{r}/pages` | **PAT** |

Verified against the live API. Everything except the Pages endpoint reads unauthenticated;
`/pages` returns **404** without admin on the repo, which `GITHUB_TOKEN` does not have for other
repositories.

**The Pages endpoint is therefore optional, not required.** `has_pages` and `homepage` are
already on the public repo object, so the deployments view works without a PAT and simply gains
CNAME and build-status detail when one is present. Do not make a PAT a hard dependency for the
site to build.

### Auth

Use a token for rate-limit headroom regardless — unauthenticated is 60 requests/hour, which
cannot survey 56 repositories. `GITHUB_TOKEN` in Actions gives 5,000/hour and covers everything
but `/pages`. A fine-grained, **read-only** PAT with metadata access across owned repos unlocks
the rest.

### Budget

~56 public repos. Batch repo metadata through GraphQL in one or two queries; use REST per-repo
only for runs, deployments, and releases. That is roughly 170 REST calls per refresh against a
5,000/hour ceiling — comfortable, but do not add a fourth per-repo call without checking.

### Refresh

Scheduled every 6 hours, plus `workflow_dispatch`, plus push to `main`. Every page states when
its data was last fetched — a dashboard that hides its own staleness is lying.

### History

Each successful fetch commits a dated snapshot to `data/history/`. This is the one thing the
GitHub API cannot give back: **it has no memory.** Snapshots turn point-in-time numbers into
trend lines, and they cost a few KB a day.

Never rewrite a historical snapshot. If a fetch produces bad data, add a correction — do not
edit the past.

## Coding standards

- Match the style already in the file you're editing.
- Astro components and plain CSS. No UI framework — this renders tables and numbers.
- All data access goes through `scripts/fetch-github.mjs`. Components read the snapshot; they
  never call the API.
- **The fetch script must degrade, never fail the build.** A rate limit, a 404, or a deleted
  repo produces a partial snapshot and a logged warning. A dashboard that goes offline because
  one endpoint moved is worse than one showing yesterday's numbers.
- Every number on the page traces to a field in the snapshot. No computed-in-template figures
  that cannot be checked against the source.
- Comments explain *why*, not *what*.

## Brand rules — v2.0.0

Tokens come from `dileepadev/docs/brand/brand-tokens.css`.

- Emerald is the only accent. No second hue.
- Never Emerald Deep on Carbon. Never Emerald Bright on Paper.
- Manrope (UI) and JetBrains Mono. Weights **400, 500, 700 only**.
- Sentence case throughout.
- The `dileepadev /.` lockup in the header; the reduced `/.` mark as the favicon.

Vendor the token sheet from `dileepadev/docs/brand/brand-tokens.css` into `src/styles/`. Do not
hot-link it — `raw.githubusercontent.com` serves CSS as `text/plain` and browsers refuse to apply
it. Copy the *file*; never copy values out of it into components.

### Two rules this site will test

**Mono is the workhorse here.** Counts, dates, durations, SHAs, run numbers, repo names — all of
it is data, which is exactly what guide §2.3 reserves mono for. Prose and headings stay Manrope.
This is the one surface in the platform where mono is the majority face, and that is correct.

**Status colour is the trap.** A dashboard invites a traffic-light palette, and the brand permits
exactly one accent. The resolution:

- Passing, completed, and idle states are **neutral** — `--fg-muted`. The common case needs no
  colour.
- Failure uses `--error`. In-progress may use `--warning`. Both are *functional* states under
  guide §1.3, permitted precisely because they are not brand.
- **Emerald marks one thing per page** — the single headline number, or the current live state.
  Not every green check.

Fifty green ticks in emerald is not brand compliance; it is the accent diluted until it signals
nothing. Colour the exceptions, not the norm.

## Content and voice

The numbers are the argument. Do not editorialise them.

- **Do not lead with stars.** The account has 3. A "stars" hero tile invites exactly the wrong
  comparison and undersells 1,743 commits and 15 live deployments. Lead with volume of work:
  commits, repositories, deployments, languages.
- Report private contributions as a count only — `restrictedContributionsCount` is available and
  gives a truthful total without leaking anything.
- No growth-hacking framing. No "🔥 streak", no trophies, no rank badges.
- Empty and zero states say so plainly. A repo with no CI says "no workflows", not nothing.

The voice rules in `dileepadev/docs/brand/voice.md` apply to every string, including column
headers and tooltips.

## Image migration

Project previews move to the repositories they document — `images/burgerplus-web/preview.png`
becomes an asset inside `burgerplus-web`.

> [!WARNING]
> **Every one of these paths is hot-linked from a README, and GitHub Pages cannot issue
> redirects.** Deleting a file breaks an image in someone's README with no error, no build
> failure, and no notification.

The order:

1. Copy the asset into its own repository.
2. Update the README there to reference the new path.
3. **Search every repository for the old `dileepadev.github.io/images/...` URL** and update each
   hit, including READMEs, issues, and the `dileepadev/docs/` tree.
4. Only once no reference remains, remove the file here.

Do not batch step 4. Retiring one project's images at a time is slower and recoverable;
deleting `images/` wholesale is neither.

**Nothing here is exempt.** Once the previews are gone, this repo keeps no assets on behalf of
another repository. If something needs to be linked from elsewhere, it belongs in
`dileepadev/docs/brand/`, not here.

## Testing

No test suite. Before calling a change done:

- `npm run build` clean.
- Run the fetch script against the live API and check the snapshot has the fields the page reads.
- **Test the degraded path** — run a build with a deliberately broken endpoint and confirm the
  site still builds and says what is missing.
- Both themes, and 375px width. Data tables are where narrow layouts break first.
- If any `images/` path was touched, verify every reference to it across the account.

## Docs

- `README.md` explains what the dashboard shows, where the data comes from, how to refresh it,
  and the image migration status.
- [`TODO.md`](TODO.md) is this repo's slice of the v2.0.0 roadmap. Keep it current.
- `CHANGELOG.md` is new in v2.0.0.
- Document any new data source in the table above in the same commit that adds it.

## Git workflow

This repository does not carry the guideline documents the application repos do. The
conventions still apply:

- Branches: `feat/x`, `fix/x`, `docs/x`, `chore/x`. `main` is protected and deploys to Pages.
- Commits: `<type>(<scope>): <short message> (<issue refs>)` — types `feat`, `fix`, `docs`,
  `style`, `refactor`, `perf`, `test`, `chore`. v2.0.0 work traces to `refs #1`.
- The scheduled data refresh commits as `chore(data): refresh snapshot`. Keep it distinguishable
  from human commits — it will be the majority of the log.

**Pushing to `main` publishes immediately.** There is no preview environment.

## Secrets

- If a PAT is used for the Pages endpoint, it is **fine-grained and read-only**. It never needs
  write access to anything.
- Store it as a repository secret. Never in a workflow file, never in the snapshot, never in
  build output.
- **The snapshot is committed and public.** Before adding a field to it, confirm the value is
  already public on GitHub. The fetch script must never write a token, an email, or anything
  from a private repository beyond aggregate counts.

## Gotchas

- **Never rename or delete an existing image without auditing references first.** See **Image
  migration**. This is the failure mode that produces no error anywhere.
- **The Pages API 404s without a PAT.** That is permission, not a missing site. Fall back to
  `has_pages`.
- **`GITHUB_TOKEN` is scoped to this repository.** It reads other repos' public data fine, but
  has no admin anywhere else.
- **The API has no memory.** Anything you want a trend for must be snapshotted; you cannot ask
  for it retroactively.
- **The dashboard reports on itself.** Its own workflow runs and deployments appear in its own
  activity feed. Expect that, and do not filter it out — it is the most honest entry in the log.
- **A scheduled commit is still a commit.** The refresh will dominate this repo's history and
  will show up in the contribution calendar it renders. Use a consistent commit prefix so it can
  be filtered in the activity view.
