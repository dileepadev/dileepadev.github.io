/**
 * Formatting helpers. These shape how a value reads; they never invent one.
 * Every number rendered on a page traces back to a field in the snapshot.
 */

/** Thousands separators, and nothing else. `null` reads as an em dash. */
export function num(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value))
    return "—";
  return value.toLocaleString("en-US");
}

/** An absolute date, unambiguous in any locale: `2 Sep 2026`. */
export function date(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** `2026-09-02 14:25` — for the fetched-at line, where precision is the point. */
export function dateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.toISOString().slice(0, 10)} ${d.toISOString().slice(11, 16)} UTC`;
}

/**
 * Coarse relative time. Deliberately coarse: this is a static page, so a
 * "3 minutes ago" baked at build time is wrong within the hour, while
 * "today" and "3 days ago" stay true for as long as the page is served.
 */
export function since(iso: string | null | undefined): string {
  if (!iso) return "—";
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return "—";

  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days < 0) return date(iso);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/** A workflow duration: `34s`, `4m 12s`, `1h 03m`. */
export function duration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || !Number.isFinite(ms) || ms < 0)
    return "—";
  const total = Math.round(ms / 1000);
  if (total < 60) return `${total}s`;
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  if (minutes < 60) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

/** Bytes as a short human figure — language totals run to tens of megabytes. */
export function bytes(value: number | null | undefined): string {
  if (!value || !Number.isFinite(value)) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let n = value;
  let unit = 0;
  while (n >= 1024 && unit < units.length - 1) {
    n /= 1024;
    unit += 1;
  }
  return `${n < 10 && unit > 0 ? n.toFixed(1) : Math.round(n)} ${units[unit]}`;
}

/** The host, for showing a deployed URL as the thing people recognise. */
export function host(url: string | null | undefined): string {
  if (!url) return "—";
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Host plus path, which is what actually identifies a project site. Every
 * project page on this account is served from the same `dileepadev.github.io`
 * host, so the host alone labels fourteen cards identically.
 */
export function siteLabel(url: string | null | undefined): string {
  if (!url) return "—";
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, "");
    return `${parsed.host.replace(/^www\./, "")}${path}`;
  } catch {
    return url;
  }
}

/**
 * The CSS class for a run state. Neutral is the common case: passing, idle and
 * completed states carry no colour at all. Only a failure and an in-flight run
 * take one, and both are functional states rather than brand ones.
 */
export function stateClass(state: string | null | undefined): string {
  switch (state) {
    case "failure":
    case "timed_out":
    case "startup_failure":
      return "status status--failure";
    case "in_progress":
    case "queued":
    case "requested":
    case "waiting":
    case "pending":
      return "status status--progress";
    default:
      return "status";
  }
}

/** Run conclusions come back in snake_case; a table column is not the place for it. */
export function stateLabel(state: string | null | undefined): string {
  if (!state) return "unknown";
  return state.replace(/_/g, " ");
}

/**
 * Heatmap intensity, 0–4. Thresholds are relative to the busiest day in the
 * range rather than fixed counts, so the scale still reads on a quiet year.
 */
export function level(count: number, max: number): number {
  if (count <= 0) return 0;
  if (max <= 0) return 0;
  const ratio = count / max;
  if (ratio > 0.66) return 4;
  if (ratio > 0.33) return 3;
  if (ratio > 0.12) return 2;
  return 1;
}

/**
 * The fill for a language segment, by its rank in the list.
 *
 * GitHub ships a colour per language, and using them would put a dozen hues on
 * the page - the guide permits one accent and no second hue, anywhere. So rank
 * is carried by weight instead of by hue: one neutral, stepped down as the
 * share falls. It reads correctly in both themes from a single declaration,
 * because the mix resolves against whatever `--fg` currently is.
 */
export function langShade(index: number, total: number): string {
  const steps = Math.max(total, 1);
  const strength = 58 - (index / steps) * 44;
  return `color-mix(in srgb, var(--fg) ${Math.round(strength)}%, var(--bg-surface))`;
}
