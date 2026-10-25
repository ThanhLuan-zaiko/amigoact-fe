export const activityKeys = {
  all: ["activities"] as const,
  discovery: () => [...activityKeys.all, "discovery"] as const,
  // Public /events browse feed. Lists, the signed-in view and the brief
  // map all sit under browseAll, so one invalidation refreshes every view.
  browseAll: () => [...activityKeys.all, "browse"] as const,
  browse: (params: Record<string, string>) =>
    [...activityKeys.browseAll(), "list", params] as const,
  browseMine: (params: Record<string, string>) =>
    [...activityKeys.browseAll(), "mine", params] as const,
  myBriefs: () => [...activityKeys.browseAll(), "my-briefs"] as const,
  tags: (query: string) =>
    [...activityKeys.all, "tags", query] as const,
  orgTags: (orgId: string, trash = false) =>
    [
      ...activityKeys.all,
      "org-tags",
      orgId,
      trash ? "trash" : "live",
    ] as const,
  ownedTags: (orgId: string) =>
    [...activityKeys.all, "owned-tags", orgId] as const,
  myTags: () => [...activityKeys.all, "my-tags"] as const,
  myTagPosts: (slug: string) =>
    [...activityKeys.all, "my-tag-posts", slug] as const,
  categories: (orgId?: string) =>
    [...activityKeys.all, "categories", orgId ?? "global"] as const,
  detail: (activityId: string) =>
    [...activityKeys.all, "detail", activityId] as const,
  bySlug: (orgId: string, slug: string) =>
    [...activityKeys.all, "by-slug", orgId, slug] as const,
  // Cross-org feed for /manage/events. Under `all`, so every activity
  // mutation already refreshes it.
  mine: (trash = false) =>
    [...activityKeys.all, "mine", trash ? "trash" : "live"] as const,
  orgList: (orgId: string, trash = false) =>
    [
      ...activityKeys.all,
      "org",
      orgId,
      trash ? "trash" : "live",
    ] as const,
  view: (orgId: string, activityId: string) =>
    [...activityKeys.all, "view", orgId, activityId] as const,
  form: (orgId: string, activityId: string) =>
    [...activityKeys.all, "form", orgId, activityId] as const,
  slots: (orgId: string, activityId: string) =>
    [...activityKeys.all, "slots", orgId, activityId] as const,
  media: (activityId: string) =>
    [...activityKeys.all, "media", activityId] as const,
};
