import type { OrgListParams } from "./api.ts";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  myOrgs: (includeDeleted = false, params: OrgListParams = {}) =>
    [...dashboardKeys.all, "orgs", includeDeleted, params] as const,
  orgMedia: (orgId: string) => [...dashboardKeys.all, "media", orgId] as const,
};
