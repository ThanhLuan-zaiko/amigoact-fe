import { activityDayKey } from "./calendar.ts";
import type { MyActivityItem } from "./feed-api.ts";

// Pure helpers for the cross-org events feed. Filters travel in the URL so
// every view is deep-linkable; this file stays free of React.

export interface FeedFilters {
  org: string | null;
  status: string | null;
  tag: string | null;
  day: string | null;
  q: string;
  trash: boolean;
}

export function readFilters(params: URLSearchParams): FeedFilters {
  return {
    org: params.get("org"),
    status: params.get("status"),
    tag: params.get("tag"),
    day: params.get("day"),
    // Kept raw so the search box can hold a trailing space while typing.
    q: params.get("q") ?? "",
    trash: params.get("trash") === "1",
  };
}

// Case- and accent-insensitive text for search, so a title typed without
// diacritics still matches the accented original.
// The stroked d letters have no NFD decomposition, so they are mapped by
// code point; the source stays ASCII.
const STROKED_D = new RegExp(String.fromCharCode(0x0110, 0x0111), "g");

function foldText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(STROKED_D, "d")
    .toLowerCase();
}

export function applyFilters(
  items: MyActivityItem[],
  filters: FeedFilters,
): MyActivityItem[] {
  const needle = foldText(filters.q.trim());
  return items.filter(
    (item) =>
      (filters.org === null || item.org_id === filters.org) &&
      (filters.status === null || item.status === filters.status) &&
      (filters.tag === null ||
        item.tags.some((tag) => tag.slug === filters.tag)) &&
      (filters.day === null || activityDayKey(item) === filters.day) &&
      (needle === "" || foldText(item.title).includes(needle)),
  );
}

export interface FeedGroups {
  live: MyActivityItem[];
  upcoming: MyActivityItem[];
  past: MyActivityItem[];
}

const CLOSED = new Set(["completed", "cancelled"]);

function startTime(item: MyActivityItem): number {
  return item.start_at === null ? Number.NaN : Date.parse(item.start_at);
}

// Orders by start time. Rows without a start always sort last.
function byStart(
  a: MyActivityItem,
  b: MyActivityItem,
  direction: 1 | -1,
): number {
  const x = startTime(a);
  const y = startTime(b);
  if (Number.isNaN(x) || Number.isNaN(y)) return Number(Number.isNaN(x)) - Number(Number.isNaN(y));
  return direction * (x - y);
}

// Live: ongoing. Upcoming: open (draft or published) with a start still
// ahead. Past: everything else, including rows without a start. Live and
// upcoming run soonest first; past runs most recent first.
export function groupByTime(items: MyActivityItem[], now: Date): FeedGroups {
  const groups: FeedGroups = { live: [], upcoming: [], past: [] };
  for (const item of items) {
    const start = startTime(item);
    if (item.status === "ongoing") {
      groups.live.push(item);
    } else if (
      !CLOSED.has(item.status) &&
      !Number.isNaN(start) &&
      start >= now.getTime()
    ) {
      groups.upcoming.push(item);
    } else {
      groups.past.push(item);
    }
  }
  groups.live.sort((a, b) => byStart(a, b, 1));
  groups.upcoming.sort((a, b) => byStart(a, b, 1));
  groups.past.sort((a, b) => byStart(a, b, -1));
  return groups;
}

export interface FeedSummaryCounts {
  total: number;
  live: number;
  upcoming: number;
  drafts: number;
}

export function summarize(items: MyActivityItem[], now: Date): FeedSummaryCounts {
  const groups = groupByTime(items, now);
  return {
    total: items.length,
    live: groups.live.length,
    upcoming: groups.upcoming.length,
    drafts: items.filter((item) => item.status === "draft").length,
  };
}

export function countBy(
  items: MyActivityItem[],
  key: (item: MyActivityItem) => string,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const value = key(item);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}
