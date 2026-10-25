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
}

export const EVENTS_PAGE_SIZE = 12;

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
    q: (search.get("q") ?? "").trim(),
    category: search.get("category") ?? "",
    tag: search.get("tag") ?? "",
    city: (search.get("city") ?? "").trim(),
    mode: MODES.includes(mode) ? mode : "",
    open: search.get("open") === "1",
    sort: search.get("sort") === "published" ? "published" : "start",
    from: validDay(search.get("from")),
    to: validDay(search.get("to")),
    page: Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1,
    reg: MY_STATUSES.includes(reg) ? reg : "",
  };
}

// Local calendar day to the UTC instant of its first moment.
export function localDayStart(day: string, offsetDays = 0): string | undefined {
  if (!LOCAL_DAY.test(day)) return undefined;
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date + offsetDays).toISOString();
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

// Query for the public browse feed; the page cursor is offset-based.
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
    ["starts_to", localDayStart(filters.to, 1)],
  ]);
  if (filters.open) query.registration_open = "true";
  return query;
}

// Query for the signed-in view: its own filters, no time window.
export function toMineQuery(filters: EventsFilters): Record<string, string> {
  return withValues({
    limit: String(EVENTS_PAGE_SIZE),
    offset: String((filters.page - 1) * EVENTS_PAGE_SIZE),
  }, [
    ["q", filters.q],
    ["category_id", filters.category],
    ["tag", filters.tag],
    ["city", filters.city],
    ["mode", filters.mode],
    ["my_status", filters.reg],
  ]);
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
  page: null,
};

export function hasNarrowing(filters: EventsFilters): boolean {
  return Boolean(
    filters.q || filters.category || filters.tag || filters.city ||
      filters.mode || filters.open || filters.from || filters.to ||
      filters.reg,
  );
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
