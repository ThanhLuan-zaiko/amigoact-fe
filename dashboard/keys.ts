export const dashboardKeys = {
  all: ["dashboard"] as const,
  myOrgs: (includeDeleted = false) =>
    [...dashboardKeys.all, "orgs", includeDeleted] as const,
  orgMedia: (orgId: string) => [...dashboardKeys.all, "media", orgId] as const,
};
