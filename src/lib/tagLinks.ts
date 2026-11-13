import { postPath } from "./posts";
import { tagSlug } from "./tagInput";

// The ?tag= value of a page address, as a slug. Anything without a letter or
// digit is ignored, so a broken link shows the whole feed.
export function readTag(value: string | string[] | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }
  return tagSlug(value) || null;
}

// Where a tag chip on a post leads: that organization's posts with the tag.
export function orgTagHref(orgSlug: string, tag: string): string {
  return `${postPath(orgSlug)}?${new URLSearchParams({ tag: tagSlug(tag) })}`;
}

// Where a popular tag leads: the home feed with the tag, narrowed to the viewer's
// organizations when mine is set.
export function feedTagHref(tag: string, mine = false): string {
  const query = new URLSearchParams(mine ? { scope: "mine" } : {});
  query.set("tag", tagSlug(tag));
  return `/?${query}`;
}

// The name to show for a slug in the address. Posts on the page carry the names
// people typed; the slug is shown when none of them has the tag.
export function tagLabel(slug: string, posts: { tags: string[] }[]): string {
  for (const post of posts) {
    const name = post.tags.find((tag) => tagSlug(tag) === slug);
    if (name) {
      return name;
    }
  }
  return slug;
}

// A query string for a list address. Empty values are left out.
export function listQuery(values: Record<string, string | null>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value) {
      query.set(key, value);
    }
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}
