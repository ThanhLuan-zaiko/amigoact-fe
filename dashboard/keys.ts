import type { MemberListParams, OrgListParams } from "./api.ts";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  myOrgs: (includeDeleted = false, params: OrgListParams = {}) =>
    [...dashboardKeys.all, "orgs", includeDeleted, params] as const,
  orgMedia: (orgId: string) => [...dashboardKeys.all, "media", orgId] as const,
  members: (orgId: string | null, params: MemberListParams = {}) =>
    [...dashboardKeys.all, "members", orgId, params] as const,
  myMemberships: (status?: string) =>
    [...dashboardKeys.all, "memberships", status ?? "all"] as const,
};
