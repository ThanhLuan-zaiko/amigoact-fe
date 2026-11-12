// Pages that send visitors without a session to the login page (see src/proxy.ts).
// Pages still check the user themselves with requireUser.

// Writing, editing, drafts and the trash of an organization's posts need a login.
// Reading the feed and a public post does not.
const PROTECTED_POST_PAGES = [
  /^\/org\/[^/]+\/posts\/(new|drafts|trash)$/,
  // Chat is for members only.
  /^\/org\/[^/]+\/chat$/,
  /^\/org\/[^/]+\/posts\/[^/]+\/edit$/,
  // Creating activities, their drafts and their trash are for managers.
  /^\/org\/[^/]+\/activities\/(new|drafts|trash)$/,
];

// Certificate templates are for managers. The public verify page stays open.
const PROTECTED_CERTIFICATE_PAGES = [/^\/org\/[^/]+\/certificates(\/.*)?$/];

export function isProtected(pathname: string): boolean {
  if (
    [...PROTECTED_POST_PAGES, ...PROTECTED_CERTIFICATE_PAGES].some((pattern) =>
      pattern.test(pathname),
    )
  ) {
    return true;
  }
  return (
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/organizations" ||
    pathname === "/organizations/new" ||
    pathname === "/compose" ||
    pathname === "/drafts" ||
    pathname === "/activities" ||
    pathname === "/hours" ||
    pathname === "/messages" ||
    pathname === "/certificates"
  );
}
