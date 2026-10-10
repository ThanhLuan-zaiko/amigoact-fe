export const activityKeys = {
  all: ["activities"] as const,
  discovery: () => [...activityKeys.all, "discovery"] as const,
  feed: (status: string, categoryId?: string) =>
    [...activityKeys.all, "feed", status, categoryId ?? "all"] as const,
  categories: (orgId?: string) =>
    [...activityKeys.all, "categories", orgId ?? "global"] as const,
  detail: (activityId: string) =>
    [...activityKeys.all, "detail", activityId] as const,
  bySlug: (orgId: string, slug: string) =>
    [...activityKeys.all, "by-slug", orgId, slug] as const,
  orgList: (orgId: string) =>
    [...activityKeys.all, "org", orgId] as const,
  view: (orgId: string, activityId: string) =>
    [...activityKeys.all, "view", orgId, activityId] as const,
};
