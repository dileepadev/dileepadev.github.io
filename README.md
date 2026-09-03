# dileepadev.github.io

The public build log — a static dashboard over everything publicly visible about the
[`dileepadev`](https://github.com/dileepadev) GitHub account. Repositories, commits, workflow
runs, releases, deployments and languages, rendered as pages a visitor can read in thirty
seconds.

It answers a question a profile page cannot: _what is actually being built, and is it moving?_

**Live at [dileepadev.github.io](https://dileepadev.github.io).**

## What it shows

| View           | What it answers                                                            |
| -------------- | -------------------------------------------------------------------------- |
| `/`            | Headline numbers, the contribution calendar, languages, recent activity    |
| `/repos`       | Every public repository — searchable, filterable by language and live site |
| `/activity`    | A chronological build log: releases, workflow runs, deployments, by day    |
| `/ci`          | Workflow health per repository: last run, success rate, median duration    |
| `/deployments` | The live sites — GitHub Pages and hosts elsewhere                          |

Every page states when its data was last fetched. A dashboard that hides its own staleness is
lying.

**It does not lead with stars.** The account has three of them. Leading with a stars tile
invites exactly the wrong comparison and undersells 1,800+ commits and 30+ live deployments, so
the headline is volume of work: commits, repositories, deployments, languages. There are no
streak flames, trophies or rank badges.

## Data

**Everything is fetched at build time and baked into static output.** There are no runtime API
calls, no client-side fetching and no secrets in the browser. A visitor loads HTML.

`scripts/fetch-github.mjs` writes `src/data/snapshot.json`; every page reads that file and
nothing else. If a number is on a page, it came from a field in the snapshot.

### Sources

| Data                                                 | Endpoint                               | Auth    |
| ---------------------------------------------------- | -------------------------------------- | ------- |
| Repo list, stars, languages, `has_pages`, `homepage` | `GET /users/dileepadev/repos`          | none    |
| Contribution calendar, commit/PR/issue totals        | GraphQL `user.contributionsCollection` | token   |
| Language byte counts, batched across all repos       | GraphQL `repositories.languages`       | token   |
| Workflow runs                                        | `GET /repos/{o}/{r}/actions/runs`      | none    |
| Deployments                                          | `GET /repos/{o}/{r}/deployments`       | none    |
| Releases                                             | `GET /repos/{o}/{r}/releases`          | none    |
| Pages status, CNAME, build type                      | `GET /repos/{o}/{r}/pages`             | **PAT** |

The Pages endpoint returns **404 without admin on the repository**, which `GITHUB_TOKEN` does
not have for other repositories. It is therefore **enrichment, never a dependency** — the
deployments view runs on `has_pages` and `homepage`, both already on the public repo object, and
simply gains CNAME and build-status detail when a PAT is present.

### Auth

Use a token for rate-limit headroom regardless: unauthenticated is 60 requests/hour, which
cannot survey 56 repositories. `GITHUB_TOKEN` in Actions gives 5,000/hour and covers everything
but `/pages`. A fine-grained, **read-only** PAT stored as `PAGES_TOKEN` covers the rest.

Locally the script falls back to `gh auth token`, so `npm run fetch` works without exporting
anything.

### It degrades, never fails

A rate limit, a 404, a deleted repo or a dead endpoint produces a **partial snapshot and a
logged warning** — never a failed build. Pages render what they have and say plainly what is
missing; a banner appears when `meta.partial` is set. When the hourly budget is exhausted the
script stops immediately rather than sleeping until the window resets.

A dashboard showing yesterday's numbers is worth more than one that went offline because an
endpoint moved.

### History

Each refresh writes a dated headline record to `data/history/YYYY-MM-DD.json`. This is the one
thing the GitHub API cannot give back: **it has no memory.** Snapshots turn point-in-time
numbers into trend lines and cost a few KB a day.

Historical snapshots are never rewritten — the first refresh of a day writes the file and later
ones leave it alone.

### Refresh

`.github/workflows/refresh-data.yml` runs every 6 hours, on `workflow_dispatch`, and when the
fetch script itself changes. It commits as `chore(data): refresh snapshot` so the scheduled
commits stay filterable from human ones. That commit lands on `main`, which triggers the deploy.

The refresh and the publish are deliberately two workflows: a GitHub outage can then fail a data
refresh without touching a deploy.

## Local development

```bash
npm install
npm run fetch    # refresh src/data/snapshot.json from the live API
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run check    # astro check
npm run format   # prettier
```

The build reads the committed snapshot and never calls the API, so it works offline.

To exercise the degraded path:

```bash
GITHUB_API_BASE=https://127.0.0.1:9 npm run fetch && npm run build
```

## Stack

Astro 7 + Tailwind CSS 4.3, matching `links-dileepa-dev`. Node 22+, npm. Deploys to GitHub Pages
from `main` via Actions.

Brand tokens are **vendored** from `dileepadev/docs/brand/brand-tokens.css` into
`src/styles/brand-tokens.css` — copied, never hot-linked, because `raw.githubusercontent.com`
serves CSS as `text/plain` and browsers refuse to apply it. The only local change is the removal
of the font `@import`, which is invalid inside a CSS `@layer`; the fonts load from a `<link>` in
the layout instead.

**This repo hosts no brand assets.** They live in `dileepadev/docs/brand/` and only there.

## Image migration — in progress

Through v1 this repository was an image host: preview screenshots for 26 projects, hot-linked
from READMEs across the account.

> [!WARNING]
> **Every `images/` path is hot-linked from a README, and GitHub Pages cannot issue redirects.**
> Deleting a file breaks an image somewhere with no error, no build failure and no notification.

Because of that, `images/` and `assets/` moved to **`public/images/` and `public/assets/`** when
this repo became an Astro build. Astro publishes only what is under `public/`, so the move keeps
every existing URL alive byte for byte — `dileepadev.github.io/images/<project>/preview.png`
still resolves. The deploy workflow fails the build if `dist/images` ever comes back empty.

The previews still need to move out to the repositories they document. Per project:

1. Copy the asset into the repository it documents.
2. Update that repo's README to the new path.
3. Search every repository for the old `dileepadev.github.io/images/...` URL and update each hit.
4. Only once no reference remains, remove the file here.

**Do not batch step 4.** Retiring one project's images at a time is slower and recoverable;
deleting `images/` wholesale is neither.

| Status                            | Count |
| --------------------------------- | ----- |
| Project folders still hosted here | 26    |
| Migrated out                      | 0     |

## Documentation

- [AGENTS.md](AGENTS.md) — canonical rules for this repository
- [TODO.md](TODO.md) — this repo's slice of the v2.0.0 roadmap
- [CHANGELOG.md](CHANGELOG.md)
- Platform roadmap: [`dileepadev/TODO.md`](https://github.com/dileepadev/dileepadev/blob/main/TODO.md)

## License

[MIT](LICENSE)
