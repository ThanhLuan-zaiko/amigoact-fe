// Pure helpers for numbered lists. Each page has its own URL: ?page=N.

export const PAGE_SIZE = 20;
// The backend accepts offsets up to 100000.
const MAX_PAGE = Math.floor(100_000 / PAGE_SIZE) + 1;
// Pages shown on each side of the current one.
const SIBLINGS = 1;

// Anything that is not a whole number from 1 up means the first page.
export function parsePage(value: unknown): number {
  const page = typeof value === "string" ? Number(value) : 1;
  return Number.isInteger(page) && page > 0 ? Math.min(page, MAX_PAGE) : 1;
}

export function pageOffset(value: unknown): number {
  return (parsePage(value) - 1) * PAGE_SIZE;
}

export function lastPage(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

// The first page has no parameter, so it keeps the plain URL of the list.
export function pageHref(path: string, page: number): string {
  if (page <= 1) {
    return path;
  }
  return `${path}${path.includes("?") ? "&" : "?"}page=${page}`;
}

// First, last, and the pages around the current one. "gap" marks skipped pages.
export function pageNumbers(current: number, last: number): (number | "gap")[] {
  const pages: (number | "gap")[] = [];
  for (let page = 1; page <= last; page += 1) {
    if (page === 1 || page === last || Math.abs(page - current) <= SIBLINGS) {
      pages.push(page);
    } else if (pages.at(-1) !== "gap") {
      pages.push("gap");
    }
  }
  return pages;
}
