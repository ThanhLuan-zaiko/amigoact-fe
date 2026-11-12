// Pages under an organization's feed (a post, its edit form, a new post, drafts,
// trash) show a short header with a back button instead of the full header.

// Returns where the back button leads, or null when the full header belongs here.
export function feedBackHref(pathname: string, slug: string): string | null {
  const feed = `/organizations/${slug}/posts`;
  if (!pathname.startsWith(`${feed}/`)) {
    return null;
  }
  const rest = pathname.slice(feed.length + 1).replace(/\/+$/, "");
  if (rest === "") {
    return null;
  }
  const [first, second] = rest.split("/");
  // The edit form goes back to its post, everything else to the feed.
  return second === "edit" ? `${feed}/${first}` : feed;
}
