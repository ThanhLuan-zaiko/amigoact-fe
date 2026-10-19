export const activityKeys = {
  all: ["activities"] as const,
  discovery: () => [...activityKeys.all, "discovery"] as const,
  feed: (status: string, categoryId?: string, tag?: string) =>
    [
      ...activityKeys.all,
      "feed",
      status,
      categoryId ?? "all",
      tag ?? "all",
    ] as const,
  tags: (query: string) =>
    [...activityKeys.all, "tags", query] as const,
  orgTags: (orgId: string, trash = false) =>
    [
      ...activityKeys.all,
      "org-tags",
      orgId,
      trash ? "trash" : "live",
    ] as const,
  categories: (orgId?: string) =>
    [...activityKeys.all, "categories", orgId ?? "global"] as const,
  detail: (activityId: string) =>
    [...activityKeys.all, "detail", activityId] as const,
  bySlug: (orgId: string, slug: string) =>
    [...activityKeys.all, "by-slug", orgId, slug] as const,
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
