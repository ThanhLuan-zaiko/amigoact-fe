import {
  MANAGE_LABEL,
  MANAGE_LINKS,
  MANAGE_ROOT,
  MORE_LINKS,
  PRIMARY_LINKS,
  ROUTE_TITLES,
  type NavEntry,
} from "./nav.tsx";

export interface PageMeta {
  title: string;
  /** Caption under the title, e.g. the dashboard for workspace sections. */
  section: string | null;
  /** Fallback target of the back arrow; null on top-level pages. */
  back: string | null;
}

function matches(pathname: string, entry: NavEntry): boolean {
  if (pathname === entry.to) return true;
  return !entry.end && entry.to !== "/" && pathname.startsWith(`${entry.to}/`);
}

// The entry owning the route: exact match first, then the longest prefix,
// so nested routes such as /manage/events/:org/:id resolve to their section.
export function activeEntry(
  pathname: string,
  entries: readonly NavEntry[],
): NavEntry | null {
  let best: NavEntry | null = null;
  for (const entry of entries) {
    if (!matches(pathname, entry)) continue;
    if (pathname === entry.to) return entry;
    if (best === null || entry.to.length > best.to.length) best = entry;
  }
  return best;
}

// Sticky center-header copy for the current route: X shows the section
// title there and swaps in a back arrow on detail pages.
export function pageMeta(pathname: string): PageMeta {
  const exact = ROUTE_TITLES[pathname];
  if (exact !== undefined) {
    return { title: exact.title, section: null, back: exact.parent ?? null };
  }
  const manage = activeEntry(pathname, MANAGE_LINKS);
  const entry =
    manage ?? activeEntry(pathname, [...PRIMARY_LINKS, ...MORE_LINKS]);
  if (entry !== null) {
    const inWorkspace =
      manage !== null || entry.to === `${MANAGE_ROOT}/settings`;
    return {
      title: entry.label,
      section: inWorkspace ? MANAGE_LABEL : null,
      back: pathname === entry.to ? null : entry.to,
    };
  }
  const prefix = Object.keys(ROUTE_TITLES)
    .filter((key) => pathname.startsWith(`${key}/`))
    .sort((a, b) => b.length - a.length)[0];
  if (prefix !== undefined) {
    const route = ROUTE_TITLES[prefix];
    return { title: route.title, section: null, back: route.parent ?? prefix };
  }
  return { title: "AmigoACT", section: null, back: null };
}
