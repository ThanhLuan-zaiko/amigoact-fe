// An organization's pages have two addresses, chosen by who is looking:
// - its owner sees /organizations/<slug>/..., next to "Tổ chức của tôi";
// - everyone else sees /org/<slug>/....
// The pages exist once, under /org/[slug]. proxy.ts redirects a viewer to the
// address that fits them and rewrites /organizations/<slug>/... to /org/... .
// /organizations itself and /organizations/new are not organization pages.

export const OWNER_PREFIX = "/organizations";
export const PUBLIC_PREFIX = "/org";

export type OrgRoute = {
  // True when the address uses the owner prefix.
  ownerAddress: boolean;
  slug: string;
  // The rest of the path after the slug, starting with "/" or empty.
  rest: string;
};

const ROUTE = /^\/(organizations|org)\/([^/]+)(\/.*)?$/;

export function parseOrgRoute(pathname: string): OrgRoute | null {
  const match = ROUTE.exec(pathname);
  if (!match) {
    return null;
  }
  const ownerAddress = match[1] === "organizations";
  if (ownerAddress && match[2] === "new") {
    return null;
  }
  return { ownerAddress, slug: match[2], rest: match[3] ?? "" };
}

export function orgAddress(route: OrgRoute, owner: boolean): string {
  return `${owner ? OWNER_PREFIX : PUBLIC_PREFIX}/${route.slug}${route.rest}`;
}

// The address the pages are built at, so protected-page rules match both forms.
export function pagePath(pathname: string): string {
  const route = parseOrgRoute(pathname);
  return route ? orgAddress(route, false) : pathname;
}

export type OrgDecision =
  | { kind: "redirect"; path: string }
  | { kind: "rewrite"; path: string }
  | { kind: "none" };

export function orgDecision(pathname: string, owner: boolean): OrgDecision {
  const route = parseOrgRoute(pathname);
  if (!route) {
    return { kind: "none" };
  }
  if (route.ownerAddress !== owner) {
    return { kind: "redirect", path: orgAddress(route, owner) };
  }
  return route.ownerAddress
    ? { kind: "rewrite", path: orgAddress(route, false) }
    : { kind: "none" };
}

// Moves an /org/... link onto the owner address when the viewer is already on
// it, so client code built on /org paths keeps the address the viewer sees.
// The query and hash are kept.
export function keepAddress(currentPathname: string, href: string): string {
  const current = parseOrgRoute(currentPathname);
  const cut = href.search(/[?#]/);
  const path = cut === -1 ? href : href.slice(0, cut);
  const tail = cut === -1 ? "" : href.slice(cut);
  const target = parseOrgRoute(path);
  if (!current?.ownerAddress || !target || target.slug !== current.slug) {
    return href;
  }
  return `${orgAddress(target, true)}${tail}`;
}

// The base of an organization's links for a viewer who may own it.
export function orgBase(slug: string, owner: boolean): string {
  return `${owner ? OWNER_PREFIX : PUBLIC_PREFIX}/${encodeURIComponent(slug)}`;
}
