import { TAG_LIMIT, TAG_NAME_MAX } from "./posts";

export type TagSuggestion = { name: string; slug: string; count: number };

// The same slug the backend makes: no accents, lowercase ASCII words joined by
// hyphens. Two names with one slug are one tag. Empty when no letter or digit is left.
export function tagSlug(name: string): string {
  return name
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .normalize("NFKD")
    .replace(/[^\x20-\x7e]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, TAG_NAME_MAX)
    .replace(/-+$/, "");
}

// Adds one typed name. A name without letters or digits, a name with the slug of a
// chosen tag, or a name past the limit is left out.
export function addTag(tags: string[], raw: string): string[] {
  const name = raw.trim().replace(/\s+/g, " ").slice(0, TAG_NAME_MAX).trim();
  const slug = tagSlug(name);
  if (!slug || tags.length >= TAG_LIMIT) {
    return tags;
  }
  if (tags.some((tag) => tagSlug(tag) === slug)) {
    return tags;
  }
  return [...tags, name];
}

// Typed or pasted text with commas: every finished part becomes a tag, and the
// text after the last comma stays in the box.
export function takeFinishedTags(
  tags: string[],
  text: string,
): { tags: string[]; draft: string } {
  const parts = text.split(",");
  const draft = parts.pop() ?? "";
  let next = tags;
  for (const part of parts) {
    next = addTag(next, part);
  }
  return { tags: next, draft: next.length >= TAG_LIMIT ? "" : draft };
}

// The value the form sends. Text still in the box counts, so a tag typed without
// pressing Enter is not lost.
export function tagFieldValue(tags: string[], draft: string): string {
  const typed = draft.trim();
  return (typed ? [...tags, typed] : tags).join(", ");
}

// Suggestions not chosen yet. When the typed text is new, the first row creates it.
export function suggestionRows(
  suggestions: TagSuggestion[],
  tags: string[],
  draft: string,
): { name: string; count: number | null }[] {
  const chosen = new Set(tags.map(tagSlug));
  const rows: { name: string; count: number | null }[] = suggestions
    .filter((item) => !chosen.has(item.slug))
    .map((item) => ({ name: item.name, count: item.count }));
  const typed = draft.trim();
  const slug = tagSlug(typed);
  const known = suggestions.some((item) => item.slug === slug);
  if (slug && !known && !chosen.has(slug)) {
    rows.unshift({ name: typed, count: null });
  }
  return rows;
}
