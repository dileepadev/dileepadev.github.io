/**
 * The single read point for the build-time snapshot.
 *
 * Pages import from here rather than reaching for the JSON directly, so the
 * shape is described in one place and a field that moves breaks the build
 * instead of rendering as `undefined` on a live page.
 *
 * Nothing here calls the network. `scripts/fetch-github.mjs` writes
 * `src/data/snapshot.json`; this file only reads it.
 */

import data from "../data/snapshot.json";

export interface Meta {
  fetchedAt: string;
  login: string;
  source: string;
  durationMs: number;
  authenticated: boolean;
  partial: boolean;
  warnings: string[];
  rateLimit: { limit: number; remaining: number; resetAt: string } | null;
}

export interface Contributions {
  from: string;
  to: string;
  totalCommits: number;
  totalPullRequests: number;
  totalIssues: number;
  totalRepositories: number;
  privateContributions: number;
  calendarTotal: number;
  weeks: { date: string; count: number; weekday: number }[][];
}

export interface Language {
  name: string;
  bytes: number;
  repos: number;
  share: number;
}

export interface Repo {
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  isFork: boolean;
  isArchived: boolean;
  isTemplate: boolean;
  stars: number;
  forks: number;
  openIssues: number;
  size: number;
  primaryLanguage: string | null;
  languages: { name: string; bytes: number }[];
  topics: string[];
  license: string | null;
  defaultBranch: string;
  createdAt: string;
  pushedAt: string;
  updatedAt: string;
  hasPages: boolean;
  pages: {
    status: string | null;
    cname: string | null;
    htmlUrl: string | null;
    buildType: string | null;
    httpsEnforced: boolean | null;
    sourceBranch: string | null;
  } | null;
}

export interface Run {
  repo: string;
  id: number;
  name: string | null;
  workflow: string | null;
  runNumber: number;
  event: string;
  status: string;
  conclusion: string | null;
  branch: string | null;
  sha: string | null;
  createdAt: string;
  startedAt: string;
  updatedAt: string;
  durationMs: number | null;
  url: string;
}

export interface CiEntry {
  repo: string;
  url: string;
  runs: number;
  successRate: number | null;
  medianDurationMs: number | null;
  lastRun: Run | null;
  workflows: string[];
}

export interface LiveSite {
  repo: string;
  url: string;
  homepage: string | null;
  hasPages: boolean;
  cname: string | null;
  status: string | null;
  buildType: string | null;
  lastDeployedAt: string | null;
  pushedAt: string;
}

export interface Release {
  repo: string;
  tag: string;
  name: string | null;
  publishedAt: string;
  prerelease: boolean;
  url: string;
}

export interface ActivityEvent {
  kind: "release" | "run" | "deployment";
  repo: string;
  at: string;
  title: string | null;
  detail: string | null;
  state: string;
  url: string | null;
}

export interface Totals {
  repos: number;
  ownedRepos: number;
  forks: number;
  archived: number;
  stars: number;
  languages: number;
  releases: number;
  workflowRuns: number;
  deployments: number;
  liveSites: number;
  reposWithCi: number;
}

export interface Snapshot {
  meta: Meta;
  profile: {
    login: string;
    name: string | null;
    bio: string | null;
    company: string | null;
    location: string | null;
    blog: string | null;
    avatarUrl: string;
    htmlUrl: string;
    publicRepos: number;
    followers: number;
    following: number;
    createdAt: string;
  } | null;
  contributions: Contributions | null;
  totals: Totals;
  languages: Language[];
  repos: Repo[];
  ci: CiEntry[];
  live: LiveSite[];
  releases: Release[];
  activity: ActivityEvent[];
}

export const snapshot = data as unknown as Snapshot;

export const {
  meta,
  profile,
  contributions,
  totals,
  languages,
  repos,
  ci,
  live,
  releases,
  activity,
} = snapshot;

/** The account's own GitHub profile — used for the source links in the footer. */
export const GITHUB_USER = `https://github.com/${meta.login}`;
