import type { OrgListParams } from "./api.ts";
import type { MemberListParams } from "./members-api.ts";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  myOrgs: (includeDeleted = false, params: OrgListParams = {}) =>
    [...dashboardKeys.all, "orgs", includeDeleted, params] as const,
  orgMedia: (orgId: string) => [...dashboardKeys.all, "media", orgId] as const,
  members: (orgId: string | null, params: MemberListParams = {}) =>
    [...dashboardKeys.all, "members", orgId, params] as const,
  skillMatches: (orgId: string | null, skillId: string | null) =>
    [...dashboardKeys.all, "skill-matches", orgId, skillId] as const,
  roles: (orgId: string | null) =>
    [...dashboardKeys.all, "roles", orgId] as const,
  campuses: (orgId: string | null) =>
    [...dashboardKeys.all, "campuses", orgId] as const,
  departments: (orgId: string | null) =>
    [...dashboardKeys.all, "departments", orgId] as const,
  presence: (orgId: string | null) =>
    [...dashboardKeys.all, "presence", orgId] as const,
  myMemberships: (status?: string) =>
    [...dashboardKeys.all, "memberships", status ?? "all"] as const,
};
