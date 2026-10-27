// URL state for /events. Every filter lives in the query string so a view
// can be shared and survives a reload. Defaults stay out of the URL.

export type EventsTab = "upcoming" | "live" | "past" | "mine";

export interface EventsFilters {
  tab: EventsTab;
  q: string;
  category: string;
  tag: string;
  city: string;
  mode: string;
  open: boolean;
  sort: string;
  from: string;
  to: string;
  page: number;
  reg: string;
  org: string;
  cursor: string;
}

export const EVENTS_PAGE_SIZE = 12;
// Backend caps (docs/EVENTS.md): search 100 and city 80 characters, tag 60,
// organization 80, and offset 500. MAX_PAGE is the last page whose offset
// stays within 500.
const QUERY_MAX = 100;
const TAG_MAX = 60;
const CITY_MAX = 80;
const ORG_MAX = 80;
const CURSOR_MAX = 512;
const MAX_PAGE = Math.floor(500 / EVENTS_PAGE_SIZE) + 1;

const TABS: readonly EventsTab[] = ["upcoming", "live", "past", "mine"];
const MODES: readonly string[] = ["online", "offline"];
const MY_STATUSES: readonly string[] = [
  "pending",
  "approved",
  "waitlisted",
  "attended",
  "rejected",
  "cancelled",
];
const LOCAL_DAY = /^\d{4}-\d{2}-\d{2}$/;

function validDay(value: string | null): string {
  return value !== null && LOCAL_DAY.test(value) ? value : "";
}

export function readFilters(search: URLSearchParams): EventsFilters {
  const rawTab = search.get("tab") ?? "upcoming";
  const tab = (TABS as readonly string[]).includes(rawTab)
    ? (rawTab as EventsTab)
    : "upcoming";
  const pageNumber = Number.parseInt(search.get("page") ?? "1", 10);
  const mode = search.get("mode") ?? "";
  const reg = search.get("reg") ?? "";
  return {
    tab,
    q: (search.get("q") ?? "").trim().slice(0, QUERY_MAX),
    category: search.get("category") ?? "",
    tag: (search.get("tag") ?? "").slice(0, TAG_MAX),
    city: (search.get("city") ?? "").trim().slice(0, CITY_MAX),
    mode: MODES.includes(mode) ? mode : "",
    open: search.get("open") === "1",
    sort: search.get("sort") === "published" ? "published" : "start",
    from: validDay(search.get("from")),
    to: validDay(search.get("to")),
    page:
      Number.isInteger(pageNumber) && pageNumber > 0
        ? Math.min(pageNumber, MAX_PAGE)
        : 1,
    reg: MY_STATUSES.includes(reg) ? reg : "",
    org: (search.get("org") ?? "").trim().slice(0, ORG_MAX),
    cursor: (search.get("cursor") ?? "").slice(0, CURSOR_MAX),
  };
}

// Local calendar day to the UTC instant of its first moment.
export function localDayStart(day: string, offsetDays = 0): string | undefined {
  if (!LOCAL_DAY.test(day)) return undefined;
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date + offsetDays).toISOString();
}

// True when the end date falls before the start date. The feed then drops
// the end bound, and the date field shows an error.
export function isRangeReversed(filters: EventsFilters): boolean {
  return filters.from !== "" && filters.to !== "" && filters.to < filters.from;
}

function phaseFor(tab: EventsTab): string {
  if (tab === "live") return "ongoing";
  if (tab === "past") return "past";
  return "upcoming";
}

function withValues(
  query: Record<string, string>,
  entries: Array<[string, string | undefined]>,
): Record<string, string> {
  for (const [key, value] of entries) {
    if (value) query[key] = value;
  }
  return query;
}

function endBound(filters: EventsFilters): string | undefined {
  return isRangeReversed(filters) ? undefined : localDayStart(filters.to, 1);
}

// Query for the public browse feed. Paging is offset-based inside the window
// that the cursor names.
export function toPublicQuery(filters: EventsFilters): Record<string, string> {
  const query = withValues({
    phase: phaseFor(filters.tab),
    limit: String(EVENTS_PAGE_SIZE),
    offset: String((filters.page - 1) * EVENTS_PAGE_SIZE),
  }, [
    ["q", filters.q],
    ["category_id", filters.category],
    ["tag", filters.tag],
    ["city", filters.city],
    ["mode", filters.mode],
    ["sort", filters.sort === "published" ? "published" : undefined],
    ["starts_from", localDayStart(filters.from)],
    ["starts_to", endBound(filters)],
    ["org", filters.org],
    ["cursor", filters.cursor],
  ]);
  if (filters.open) query.registration_open = "true";
  return query;
}

// Query for the signed-in view: its own filters and time window, no cursor.
export function toMineQuery(filters: EventsFilters): Record<string, string> {
  const query = withValues({
    limit: String(EVENTS_PAGE_SIZE),
    offset: String((filters.page - 1) * EVENTS_PAGE_SIZE),
  }, [
    ["q", filters.q],
    ["category_id", filters.category],
    ["tag", filters.tag],
    ["city", filters.city],
    ["mode", filters.mode],
    ["my_status", filters.reg],
    ["starts_from", localDayStart(filters.from)],
    ["starts_to", endBound(filters)],
  ]);
  if (filters.open) query.registration_open = "true";
  return query;
}

// Every filter back to its default; the paging key goes too.
export const CLEARED_FILTERS: Record<string, null> = {
  q: null,
  category: null,
  tag: null,
  city: null,
  mode: null,
  open: null,
  from: null,
  to: null,
  reg: null,
  sort: null,
  org: null,
  page: null,
  cursor: null,
};

// The organization scope narrows only the public tabs; the signed-in view
// ignores it, so it does not count there.
export function hasNarrowing(filters: EventsFilters): boolean {
  return Boolean(
    filters.q || filters.category || filters.tag || filters.city ||
      filters.mode || filters.open || filters.from || filters.to ||
      filters.reg || (filters.tab !== "mine" && filters.org),
  );
}

// How many filters are set, for the mobile filter button.
export function activeFilterCount(filters: EventsFilters): number {
  return [
    Boolean(filters.q),
    Boolean(filters.category),
    Boolean(filters.tag),
    Boolean(filters.city),
    Boolean(filters.mode),
    filters.open,
    Boolean(filters.from || filters.to),
    Boolean(filters.reg),
    filters.sort === "published",
    filters.tab !== "mine" && Boolean(filters.org),
  ].filter(Boolean).length;
}

// Lower-case and strip diacritics, so a query typed without accents finds
// accented names. Mirrors the backend fold_search_text. The regex uses a
// Unicode property (Mn = combining marks); the stroked d is replaced by
// char code, which keeps this file ASCII-only.
export function foldText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .replaceAll(String.fromCharCode(272), "d")
    .replaceAll(String.fromCharCode(273), "d")
    .toLowerCase();
}

// Patch the query string. Null or empty values remove the key.
export function patchParams(
  current: URLSearchParams,
  patch: Record<string, string | null>,
): URLSearchParams {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
  }
  return next;
}
