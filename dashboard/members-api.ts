import { apiFetch } from "../core/api.ts";
import type { BucketCount } from "./api.ts";

export type MemberStatus =
  | "active"
  | "applied"
  | "invited"
  | "suspended"
  | "left"
  | "revoked";
export type MemberSortParam = "newest" | "name" | "role";

export interface DashboardMember {
  user_id: string;
  org_id: string;
  full_name: string;
  avatar_url: string | null;
  email: string | null;
  // "owner" pseudo-role, the system "admin", then sorted custom role names.
  roles: string[];
  status: MemberStatus;
  invited_by: string | null;
  invited_by_name: string | null;
  joined_at: string;
}

export interface MemberListParams {
  q?: string;
  status?: string;
  sort?: MemberSortParam;
  limit?: number;
  offset?: number;
}

export interface MemberListPage {
  items: DashboardMember[];
  total: number;
  counts: BucketCount[];
  // Primary display role for the viewer (owner > admin > first custom).
  viewer_role: string;
  // Effective permission codes the viewer holds inside this org.
  viewer_permissions: string[];
  // Seniority of the viewer's top custom role; null = not limited (owner,
  // or no ranked role). Roles at or above it are off limits.
  viewer_ceiling: number | null;
}

export interface MyMembership {
  org_id: string;
  org_name: string;
  org_slug: string;
  roles: string[];
  status: MemberStatus;
  invited_by_name: string | null;
  joined_at: string;
}

export interface MembershipPage {
  items: MyMembership[];
  total: number;
}

export async function listOrgMembers(
  orgId: string,
  params: MemberListParams = {},
): Promise<MemberListPage> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.sort) search.set("sort", params.sort);
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const query = search.toString();
  return apiFetch<MemberListPage>(
    `/orgs/${orgId}/members${query ? `?${query}` : ""}`,
  );
}

export async function inviteMember(
  orgId: string,
  email: string,
  role = "member",
): Promise<DashboardMember> {
  return apiFetch<DashboardMember>(`/orgs/${orgId}/members`, {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
}

export interface UpdateMemberInput {
  // Legacy single-role toggle (admin only); prefer `roles` for the set.
  role?: "member" | "admin";
  // Full role replacement: every custom role name the member should hold.
  roles?: string[];
  status?: "active" | "suspended";
}

export async function updateMember(
  orgId: string,
  userId: string,
  input: UpdateMemberInput,
): Promise<DashboardMember> {
  return apiFetch<DashboardMember>(`/orgs/${orgId}/members/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function removeMember(orgId: string, userId: string): Promise<void> {
  await apiFetch<unknown>(`/orgs/${orgId}/members/${userId}`, {
    method: "DELETE",
  });
}

// Withdraws a pending invite only; lands on "revoked", not "left".
export async function revokeInvitation(
  orgId: string,
  userId: string,
): Promise<void> {
  await apiFetch<unknown>(`/orgs/${orgId}/members/${userId}/invitation`, {
    method: "DELETE",
  });
}

export async function joinOrg(orgId: string): Promise<DashboardMember> {
  return apiFetch<DashboardMember>(`/orgs/${orgId}/members/join`, {
    method: "POST",
  });
}

export async function acceptInvite(orgId: string): Promise<DashboardMember> {
  return apiFetch<DashboardMember>(`/orgs/${orgId}/members/me/accept`, {
    method: "POST",
  });
}

export async function declineInvite(orgId: string): Promise<DashboardMember> {
  return apiFetch<DashboardMember>(`/orgs/${orgId}/members/me/decline`, {
    method: "POST",
  });
}

export async function listMyMemberships(status?: string): Promise<MembershipPage> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<MembershipPage>(`/orgs/memberships/mine${query}`);
}

export interface SkillMatch {
  user_id: string;
  full_name: string;
  level: number;
}

// Coordinator matching: org members holding one skill, best first.
export async function listSkillMatches(
  orgId: string,
  skillId: string,
  minLevel?: number,
): Promise<SkillMatch[]> {
  const search = new URLSearchParams({ skill_id: skillId });
  if (minLevel !== undefined) search.set("min_level", String(minLevel));
  return apiFetch<SkillMatch[]>(
    `/orgs/${orgId}/members/by-skill?${search.toString()}`,
  );
}

// ---- Org custom roles (RBAC) ----

export interface OrgRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  member_count: number;
  is_system: boolean;
  // Colour key from `colors` on the list response ("" = default).
  color: string;
  // Seniority inside the org: higher outranks lower.
  position: number;
}

export interface OrgRoleList {
  items: OrgRole[];
  // Every permission code a custom role may carry.
  assignable_permissions: string[];
  // Baseline every active member holds, and the codes the owner may pick.
  member_defaults: string[];
  baseline_permissions: string[];
  colors: string[];
}

export interface CreateOrgRoleInput {
  name: string;
  description?: string;
  permissions: string[];
  color?: string;
}

export interface UpdateOrgRoleInput {
  name?: string;
  description?: string;
  permissions?: string[];
  color?: string;
}

export async function listOrgRoles(orgId: string): Promise<OrgRoleList> {
  return apiFetch<OrgRoleList>(`/orgs/${orgId}/roles`);
}

export async function createOrgRole(
  orgId: string,
  input: CreateOrgRoleInput,
): Promise<OrgRole> {
  return apiFetch<OrgRole>(`/orgs/${orgId}/roles`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateOrgRole(
  orgId: string,
  roleId: string,
  input: UpdateOrgRoleInput,
): Promise<OrgRole> {
  return apiFetch<OrgRole>(`/orgs/${orgId}/roles/${roleId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteOrgRole(orgId: string, roleId: string): Promise<void> {
  await apiFetch<unknown>(`/orgs/${orgId}/roles/${roleId}`, {
    method: "DELETE",
  });
}

export interface ApplicationFile {
  media_id: string;
  name: string;
  mime: string;
  size_bytes: number;
}

export interface ApplicationAnswer {
  question_id: string;
  label: string;
  answer: string;
  // True when the applicant typed their own answer under "Khác".
  is_other: boolean;
  file: ApplicationFile | null;
}

export interface MemberApplication {
  user_id: string;
  submitted_at: string;
  answers: ApplicationAnswer[];
}

export async function getMemberApplication(
  orgId: string,
  userId: string,
): Promise<MemberApplication> {
  return apiFetch<MemberApplication>(
    `/orgs/${orgId}/members/${userId}/application`,
  );
}

export async function approveMember(
  orgId: string,
  userId: string,
): Promise<DashboardMember> {
  return apiFetch<DashboardMember>(`/orgs/${orgId}/members/${userId}/approve`, {
    method: "POST",
  });
}

export async function rejectMember(
  orgId: string,
  userId: string,
): Promise<DashboardMember> {
  return apiFetch<DashboardMember>(`/orgs/${orgId}/members/${userId}/reject`, {
    method: "POST",
  });
}
