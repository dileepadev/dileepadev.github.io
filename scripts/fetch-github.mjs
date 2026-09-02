#!/usr/bin/env node
/**
 * Build-time fetch of everything the dashboard renders.
 *
 * Writes `src/data/snapshot.json`, which every page reads. Components never
 * call the API; if a number is on the page it came from this file.
 *
 * The governing rule is in AGENTS.md: **degrade, never fail the build.** A rate
 * limit, a 404, a deleted repo or a dead endpoint produces a partial snapshot
 * and a warning recorded in `meta.warnings` - it never throws. A dashboard
 * showing yesterday's numbers is worth more than one that went offline because
 * an endpoint moved.
 *
 * Everything written here is already public on GitHub. Before adding a field,
 * confirm that: the snapshot is committed, and this repository is public.
 *
 * Usage:
 *   node scripts/fetch-github.mjs
 *   GITHUB_TOKEN=... node scripts/fetch-github.mjs
 *   GITHUB_API_BASE=https://127.0.0.1:9 node scripts/fetch-github.mjs  # degraded-path test
 */

import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const LOGIN = "dileepadev";
const API = process.env.GITHUB_API_BASE ?? "https://api.github.com";
const GRAPHQL = `${API}/graphql`;

/** Recent workflow runs kept per repository. Enough for a success rate that
 *  means something, small enough that 56 repos stay a few hundred KB. */
const RUNS_PER_REPO = 20;
const RELEASES_PER_REPO = 10;
const DEPLOYMENTS_PER_REPO = 10;

/** Concurrent REST requests. GitHub's secondary rate limit punishes bursts far
 *  more than it punishes volume, so this stays low deliberately. */
const CONCURRENCY = 6;

const warnings = [];

function warn(scope, message) {
  const line = `${scope}: ${message}`;
  warnings.push(line);
  console.warn(`  ! ${line}`);
}

/**
 * Tripped when the hourly budget is spent. Once it is, every remaining request
 * returns its fallback immediately instead of waiting for the window to reset.
 *
 * Without this, a run with no token - 60 requests/hour against roughly 170
 * calls - spends the rest of the hour asleep in back-off. Degrading means
 * finishing with a partial snapshot now, not blocking a deploy until the
 * limit clears.
 */
let budgetExhausted = false;

/**
 * A token is not required, but 60 requests/hour cannot survey 56 repositories.
 * In Actions this is `GITHUB_TOKEN`; locally it falls back to the gh CLI so a
 * developer never has to export one by hand. The value is used and discarded -
 * it is never written to the snapshot.
 */
function resolveToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execFileSync("gh", ["auth", "token"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

const TOKEN = resolveToken();

function headers() {
  const h = {
    accept: "application/vnd.github+json",
    "user-agent": `${LOGIN}-build-log`,
    "x-github-api-version": "2022-11-28",
  };
  if (TOKEN) h.authorization = `Bearer ${TOKEN}`;
  return h;
}

/**
 * One REST call. Returns `fallback` on any failure rather than throwing, so a
 * single dead endpoint costs one field instead of the whole build.
 *
 * 403 and 429 are retried with backoff because both are usually the secondary
 * rate limit, which clears in seconds. 404 is not retried - it is an answer.
 */
async function rest(
  pathname,
  { fallback = null, scope = pathname, quiet404 = false } = {},
) {
  if (budgetExhausted) return fallback;

  const url = pathname.startsWith("http") ? pathname : `${API}${pathname}`;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    let res;
    try {
      res = await fetch(url, { headers: headers() });
    } catch (err) {
      if (attempt === 2) {
        warn(scope, `request failed - ${err.message}`);
        return fallback;
      }
      await sleep(500 * 2 ** attempt);
      continue;
    }

    if (res.ok) {
      try {
        return await res.json();
      } catch (err) {
        warn(scope, `response was not JSON - ${err.message}`);
        return fallback;
      }
    }

    if (res.status === 404) {
      // Expected for /pages without a PAT, and for repos with no releases.
      if (!quiet404) warn(scope, "404 - not found or not permitted");
      return fallback;
    }

    if (res.status === 403 || res.status === 429) {
      const remaining = res.headers.get("x-ratelimit-remaining");

      // The hourly budget is spent. Waiting for it costs up to an hour, so
      // stop here and let everything still queued fall back.
      if (remaining === "0") {
        const reset = Number(res.headers.get("x-ratelimit-reset"));
        // Requests in flight when the limit hits all land here; record the
        // condition once rather than once per racer.
        const alreadyTripped = budgetExhausted;
        budgetExhausted = true;
        if (!alreadyTripped)
          warn(
            "rate limit",
            `budget exhausted${
              Number.isFinite(reset) && reset
                ? ` until ${new Date(reset * 1000).toISOString()}`
                : ""
            } - remaining requests skipped, snapshot is partial${
              TOKEN ? "" : " (no token: the limit is 60 requests/hour)"
            }`,
          );
        return fallback;
      }

      // A secondary rate limit, which clears in seconds rather than an hour.
      if (attempt < 2) {
        await sleep(1000 * 2 ** attempt);
        continue;
      }
    }

    warn(scope, `HTTP ${res.status}`);
    return fallback;
  }

  return fallback;
}

async function graphql(query, scope) {
  if (!TOKEN) {
    warn(scope, "skipped - the GraphQL API requires a token");
    return null;
  }
  try {
    const res = await fetch(GRAPHQL, {
      method: "POST",
      headers: { ...headers(), "content-type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) {
      warn(scope, `HTTP ${res.status}`);
      return null;
    }
    const body = await res.json();
    if (body.errors?.length) {
      warn(scope, body.errors.map((e) => e.message).join("; "));
      return body.data ?? null;
    }
    return body.data ?? null;
  } catch (err) {
    warn(scope, `request failed - ${err.message}`);
    return null;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Runs `task` over `items` at a fixed width. Order of results matches input. */
async function mapPool(items, width, task) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from(
    { length: Math.min(width, items.length) },
    async () => {
      while (cursor < items.length) {
        const index = cursor++;
        results[index] = await task(items[index], index);
      }
    },
  );
  await Promise.all(workers);
  return results;
}

// ============================================================
// Sources
// ============================================================

async function fetchProfile() {
  const user = await rest(`/users/${LOGIN}`, { scope: "profile" });
  if (!user) return null;
  return {
    login: user.login,
    name: user.name,
    bio: user.bio,
    company: user.company,
    location: user.location,
    blog: user.blog,
    avatarUrl: user.avatar_url,
    htmlUrl: user.html_url,
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
    createdAt: user.created_at,
  };
}

/**
 * The contribution calendar and the commit/PR/issue totals. This is the one
 * dataset with no REST equivalent, and the only reason a token is needed for
 * anything beyond rate-limit headroom.
 *
 * `restrictedContributionsCount` is the aggregate of private work. It is a
 * count and nothing else - no repository name, no date, nothing identifying.
 */
async function fetchContributions() {
  const data = await graphql(
    `{
      user(login: "${LOGIN}") {
        contributionsCollection {
          startedAt
          endedAt
          totalCommitContributions
          totalPullRequestContributions
          totalIssueContributions
          totalRepositoryContributions
          restrictedContributionsCount
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays { date contributionCount weekday }
            }
          }
        }
      }
    }`,
    "contributions",
  );

  const c = data?.user?.contributionsCollection;
  if (!c) return null;

  return {
    from: c.startedAt,
    to: c.endedAt,
    totalCommits: c.totalCommitContributions,
    totalPullRequests: c.totalPullRequestContributions,
    totalIssues: c.totalIssueContributions,
    totalRepositories: c.totalRepositoryContributions,
    privateContributions: c.restrictedContributionsCount,
    calendarTotal: c.contributionCalendar.totalContributions,
    weeks: c.contributionCalendar.weeks.map((w) =>
      w.contributionDays.map((d) => ({
        date: d.date,
        count: d.contributionCount,
        weekday: d.weekday,
      })),
    ),
  };
}

/**
 * Per-repository language byte counts, batched. REST would need one
 * `/languages` call per repo - 56 requests for a pie chart. GraphQL returns
 * the whole set in one.
 */
async function fetchLanguageSizes() {
  const data = await graphql(
    `{
      user(login: "${LOGIN}") {
        repositories(first: 100, privacy: PUBLIC, ownerAffiliations: OWNER, isFork: false) {
          nodes {
            name
            languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
              edges { size node { name } }
            }
          }
        }
      }
    }`,
    "languages",
  );

  const nodes = data?.user?.repositories?.nodes;
  if (!nodes) return new Map();

  return new Map(
    nodes.map((repo) => [
      repo.name,
      repo.languages.edges.map((e) => ({
        name: e.node.name,
        bytes: e.size,
      })),
    ]),
  );
}

/**
 * The repository list. REST rather than GraphQL for one reason: `has_pages` is
 * not on the GraphQL Repository type, and it is what the deployments view runs
 * on when no PAT is present.
 */
async function fetchRepos() {
  const all = [];
  for (let page = 1; page <= 5; page += 1) {
    const batch = await rest(
      `/users/${LOGIN}/repos?per_page=100&page=${page}&sort=pushed`,
      {
        fallback: [],
        scope: "repos",
      },
    );
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

/**
 * Pages detail. This 404s without admin on the repository, which `GITHUB_TOKEN`
 * does not have for anything but this repo - so it is enrichment and never a
 * dependency. `has_pages` and `homepage` already carry the deployments view.
 */
async function fetchPagesDetail(repos) {
  const candidates = repos.filter((r) => r.has_pages);
  const details = await mapPool(candidates, CONCURRENCY, (repo) =>
    rest(`/repos/${LOGIN}/${repo.name}/pages`, {
      scope: `pages/${repo.name}`,
      quiet404: true,
    }),
  );

  const map = new Map();
  candidates.forEach((repo, i) => {
    const d = details[i];
    if (!d) return;
    map.set(repo.name, {
      status: d.status,
      cname: d.cname,
      htmlUrl: d.html_url,
      buildType: d.build_type,
      httpsEnforced: d.https_enforced,
      sourceBranch: d.source?.branch ?? null,
    });
  });

  if (candidates.length > 0 && map.size === 0) {
    warn(
      "pages",
      `no detail for ${candidates.length} Pages sites - falling back to has_pages`,
    );
  }
  return map;
}

async function fetchRuns(repoName) {
  const data = await rest(
    `/repos/${LOGIN}/${repoName}/actions/runs?per_page=${RUNS_PER_REPO}`,
    { scope: `runs/${repoName}`, quiet404: true },
  );
  const runs = data?.workflow_runs ?? [];
  return runs.map((run) => ({
    repo: repoName,
    id: run.id,
    name: run.name,
    workflow: run.path?.replace(/^\.github\/workflows\//, "") ?? null,
    runNumber: run.run_number,
    event: run.event,
    status: run.status,
    conclusion: run.conclusion,
    branch: run.head_branch,
    sha: run.head_sha?.slice(0, 7) ?? null,
    createdAt: run.created_at,
    startedAt: run.run_started_at ?? run.created_at,
    updatedAt: run.updated_at,
    durationMs: durationOf(run),
    url: run.html_url,
  }));
}

function durationOf(run) {
  const start = Date.parse(run.run_started_at ?? run.created_at);
  const end = Date.parse(run.updated_at);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start)
    return null;
  return end - start;
}

async function fetchReleases(repoName) {
  const data = await rest(
    `/repos/${LOGIN}/${repoName}/releases?per_page=${RELEASES_PER_REPO}`,
    { fallback: [], scope: `releases/${repoName}`, quiet404: true },
  );
  if (!Array.isArray(data)) return [];
  return data
    .filter((r) => !r.draft)
    .map((r) => ({
      repo: repoName,
      tag: r.tag_name,
      name: r.name,
      publishedAt: r.published_at,
      prerelease: r.prerelease,
      url: r.html_url,
    }));
}

async function fetchDeployments(repoName) {
  const data = await rest(
    `/repos/${LOGIN}/${repoName}/deployments?per_page=${DEPLOYMENTS_PER_REPO}`,
    { fallback: [], scope: `deployments/${repoName}`, quiet404: true },
  );
  if (!Array.isArray(data)) return [];
  return data.map((d) => ({
    repo: repoName,
    id: d.id,
    environment: d.environment,
    ref: d.ref,
    sha: d.sha?.slice(0, 7) ?? null,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  }));
}

async function fetchRateLimit() {
  const data = await rest("/rate_limit", { scope: "rate_limit" });
  const core = data?.resources?.core;
  if (!core) return null;
  return {
    limit: core.limit,
    remaining: core.remaining,
    resetAt: new Date(core.reset * 1000).toISOString(),
  };
}

// ============================================================
// Shaping
// ============================================================

/** Success rate over the runs we hold, counting only runs that finished. */
function successRate(runs) {
  const finished = runs.filter((r) => r.status === "completed" && r.conclusion);
  if (finished.length === 0) return null;
  const passed = finished.filter((r) => r.conclusion === "success").length;
  return Math.round((passed / finished.length) * 100);
}

function median(values) {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function rollUpLanguages(repos) {
  const totals = new Map();
  for (const repo of repos) {
    for (const lang of repo.languages) {
      const entry = totals.get(lang.name) ?? {
        name: lang.name,
        bytes: 0,
        repos: 0,
      };
      entry.bytes += lang.bytes;
      entry.repos += 1;
      totals.set(lang.name, entry);
    }
  }
  const list = [...totals.values()].sort((a, b) => b.bytes - a.bytes);
  const sum = list.reduce((acc, l) => acc + l.bytes, 0) || 1;
  return list.map((l) => ({
    ...l,
    share: Math.round((l.bytes / sum) * 1000) / 10,
  }));
}

/**
 * The activity feed: releases, workflow runs and deployments interleaved by
 * time. This repo's own refresh runs appear here, and that is deliberate -
 * AGENTS.md calls it the most honest entry in the log.
 */
function buildActivity({ releases, runs, deployments }, limit = 120) {
  const events = [
    ...releases.map((r) => ({
      kind: "release",
      repo: r.repo,
      at: r.publishedAt,
      title: r.name || r.tag,
      detail: r.tag,
      state: r.prerelease ? "prerelease" : "released",
      url: r.url,
    })),
    ...runs.map((r) => ({
      kind: "run",
      repo: r.repo,
      at: r.updatedAt ?? r.createdAt,
      title: r.name || r.workflow,
      detail: r.branch,
      state: r.status === "completed" ? (r.conclusion ?? "unknown") : r.status,
      url: r.url,
    })),
    ...deployments.map((d) => ({
      kind: "deployment",
      repo: d.repo,
      at: d.createdAt,
      title: d.environment,
      detail: d.ref,
      state: "deployed",
      url: null,
    })),
  ];

  return events
    .filter((e) => e.at && Number.isFinite(Date.parse(e.at)))
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, limit);
}

// ============================================================
// Main
// ============================================================

async function main() {
  const startedAt = Date.now();
  console.log(`Fetching public GitHub data for ${LOGIN}...`);
  if (!TOKEN) {
    warn(
      "auth",
      "no token - unauthenticated at 60 requests/hour, contributions unavailable",
    );
  }

  const [profile, contributions, languageSizes, rawRepos] = await Promise.all([
    fetchProfile(),
    fetchContributions(),
    fetchLanguageSizes(),
    fetchRepos(),
  ]);

  console.log(`  repositories: ${rawRepos.length}`);

  const pagesDetail = await fetchPagesDetail(rawRepos);

  const repos = rawRepos.map((r) => ({
    name: r.name,
    description: r.description,
    url: r.html_url,
    homepage: r.homepage || null,
    isFork: r.fork,
    isArchived: r.archived,
    isTemplate: r.is_template ?? false,
    stars: r.stargazers_count,
    forks: r.forks_count,
    watchers: r.subscribers_count ?? null,
    openIssues: r.open_issues_count,
    size: r.size,
    primaryLanguage: r.language,
    languages: languageSizes.get(r.name) ?? [],
    topics: r.topics ?? [],
    license: r.license?.spdx_id ?? null,
    defaultBranch: r.default_branch,
    createdAt: r.created_at,
    pushedAt: r.pushed_at,
    updatedAt: r.updated_at,
    hasPages: r.has_pages,
    pages: pagesDetail.get(r.name) ?? null,
  }));

  // Forks carry someone else's history; their runs and releases are not this
  // account's build log, so they stay out of the per-repo call budget.
  const owned = repos.filter((r) => !r.isFork);
  console.log(
    `  surveying ${owned.length} owned repositories for runs, releases, deployments`,
  );

  const [runsPerRepo, releasesPerRepo, deploymentsPerRepo] = await Promise.all([
    mapPool(owned, CONCURRENCY, (r) => fetchRuns(r.name)),
    mapPool(owned, CONCURRENCY, (r) => fetchReleases(r.name)),
    mapPool(owned, CONCURRENCY, (r) => fetchDeployments(r.name)),
  ]);

  const allRuns = runsPerRepo.flat();
  const releases = releasesPerRepo.flat();
  const deployments = deploymentsPerRepo.flat();

  const ci = owned
    .map((repo, i) => {
      const runs = runsPerRepo[i];
      return {
        repo: repo.name,
        url: repo.url,
        runs: runs.length,
        successRate: successRate(runs),
        medianDurationMs: median(runs.map((r) => r.durationMs)),
        lastRun: runs[0] ?? null,
        workflows: [...new Set(runs.map((r) => r.workflow).filter(Boolean))],
      };
    })
    .sort((a, b) => {
      // Repos with no CI sort last; among the rest, most recent run first.
      if (a.runs === 0 && b.runs === 0) return a.repo.localeCompare(b.repo);
      if (a.runs === 0) return 1;
      if (b.runs === 0) return -1;
      return Date.parse(b.lastRun.updatedAt) - Date.parse(a.lastRun.updatedAt);
    });

  const live = repos
    .filter((r) => r.hasPages || r.homepage)
    .map((r) => ({
      repo: r.name,
      url:
        r.pages?.htmlUrl ||
        r.homepage ||
        `https://${LOGIN}.github.io/${r.name}/`,
      homepage: r.homepage,
      hasPages: r.hasPages,
      cname: r.pages?.cname ?? null,
      status: r.pages?.status ?? null,
      buildType: r.pages?.buildType ?? null,
      lastDeployedAt:
        deployments
          .filter((d) => d.repo === r.name)
          .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0]
          ?.createdAt ?? null,
      pushedAt: r.pushedAt,
    }))
    .sort((a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt));

  const languages = rollUpLanguages(repos.filter((r) => !r.isFork));
  const activity = buildActivity({ releases, runs: allRuns, deployments });
  const rateLimit = await fetchRateLimit();

  const snapshot = {
    meta: {
      fetchedAt: new Date().toISOString(),
      login: LOGIN,
      source: "GitHub REST + GraphQL, public data only",
      durationMs: Date.now() - startedAt,
      authenticated: Boolean(TOKEN),
      partial: warnings.length > 0,
      warnings,
      rateLimit,
    },
    profile,
    contributions,
    totals: {
      repos: repos.length,
      ownedRepos: owned.length,
      forks: repos.filter((r) => r.isFork).length,
      archived: repos.filter((r) => r.isArchived).length,
      stars: repos.reduce((acc, r) => acc + r.stars, 0),
      languages: languages.length,
      releases: releases.length,
      workflowRuns: allRuns.length,
      deployments: deployments.length,
      liveSites: live.length,
      reposWithCi: ci.filter((c) => c.runs > 0).length,
    },
    languages,
    repos,
    ci,
    live,
    releases: releases.sort(
      (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
    ),
    activity,
  };

  await mkdir(path.join(ROOT, "src/data"), { recursive: true });
  const target = path.join(ROOT, "src/data/snapshot.json");
  await writeFile(target, `${JSON.stringify(snapshot, null, 2)}\n`);

  await writeHistory(snapshot);

  console.log(
    `\nWrote src/data/snapshot.json - ${snapshot.totals.repos} repos, ` +
      `${snapshot.totals.workflowRuns} runs, ${snapshot.totals.releases} releases, ` +
      `${warnings.length} warning(s), ${Math.round(snapshot.meta.durationMs / 100) / 10}s`,
  );
  if (warnings.length > 0) {
    console.log(
      "Snapshot is partial. The build continues - see meta.warnings.",
    );
  }
}

/**
 * A dated headline record. The GitHub API has no memory: totals can only ever
 * be read as of now, so a trend line exists only if it was written down. Kept
 * to headline numbers, which is what makes it a few KB a day rather than a
 * second copy of the snapshot.
 *
 * Never rewritten. The refresh runs four times a day; the first run of a day
 * writes the file and later runs leave it alone.
 */
async function writeHistory(snapshot) {
  const day = snapshot.meta.fetchedAt.slice(0, 10);
  const dir = path.join(ROOT, "data/history");
  const file = path.join(dir, `${day}.json`);

  if (existsSync(file)) {
    console.log(`  history: ${day}.json already exists - left untouched`);
    return;
  }

  await mkdir(dir, { recursive: true });
  const entry = {
    date: day,
    fetchedAt: snapshot.meta.fetchedAt,
    partial: snapshot.meta.partial,
    contributions: snapshot.contributions
      ? {
          totalCommits: snapshot.contributions.totalCommits,
          totalPullRequests: snapshot.contributions.totalPullRequests,
          totalIssues: snapshot.contributions.totalIssues,
          privateContributions: snapshot.contributions.privateContributions,
          calendarTotal: snapshot.contributions.calendarTotal,
        }
      : null,
    totals: snapshot.totals,
  };
  await writeFile(file, `${JSON.stringify(entry, null, 2)}\n`);
  console.log(`  history: wrote data/history/${day}.json`);
}

/**
 * The last line of defence for the build. Anything that escapes the per-request
 * handling above still must not take the site down: fall back to whatever
 * snapshot is already committed, and only fail if there has never been one.
 */
main().catch(async (err) => {
  console.error(`\nFetch failed outright: ${err.message}`);
  const existing = path.join(ROOT, "src/data/snapshot.json");
  if (existsSync(existing)) {
    try {
      const snapshot = JSON.parse(await readFile(existing, "utf8"));
      snapshot.meta.partial = true;
      snapshot.meta.warnings = [
        ...(snapshot.meta.warnings ?? []),
        `refresh aborted (${err.message}) - showing data from ${snapshot.meta.fetchedAt}`,
      ];
      await writeFile(existing, `${JSON.stringify(snapshot, null, 2)}\n`);
    } catch {
      // The existing snapshot is unreadable; leave it exactly as it is.
    }
    console.error("Keeping the committed snapshot. The build continues.");
    process.exit(0);
  }
  console.error("No snapshot exists to fall back to.");
  process.exit(1);
});
