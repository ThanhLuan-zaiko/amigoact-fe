// True when the pathname is the href itself or a page inside it. The home link only matches "/".
// "Tổ chức của tôi" (/organizations) covers the owner's organization pages too,
// because owners see them at /organizations/<slug>; everyone else is on /org/<slug>.
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
