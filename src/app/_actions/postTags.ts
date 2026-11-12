"use server";

import { authedFetch } from "@/lib/auth";
import type { TagSuggestion } from "@/lib/tagInput";

// Posts and activities share one tag catalog per organization, but each form
// suggests the tags its own kind uses most.
export type TagSource = "post" | "activity";

const ENDPOINTS: Record<TagSource, string> = {
  post: "post-tags",
  activity: "activity-tags",
};

// Tags already used in the organization, most used first, for a form.
// Any failure gives an empty list: suggestions are a help, not a requirement.
export async function searchTags(
  slug: string,
  source: TagSource,
  query: string,
): Promise<TagSuggestion[]> {
  const params = new URLSearchParams({ q: query.slice(0, 40), limit: "8" });
  const result = await authedFetch<{ items: TagSuggestion[] }>(
    `/organizations/${encodeURIComponent(slug)}/${ENDPOINTS[source]}?${params}`,
    { method: "GET" },
  );
  return result.ok ? result.data.items : [];
}
