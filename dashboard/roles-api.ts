import { apiFetch } from "../core/api.ts";
import type { OrgRoleList } from "./members-api.ts";

// Owner-only: the full custom-role order, most senior first.
export async function reorderOrgRoles(
  orgId: string,
  roleIds: string[],
): Promise<OrgRoleList> {
  return apiFetch<OrgRoleList>(`/orgs/${orgId}/roles/order`, {
    method: "PUT",
    body: JSON.stringify({ role_ids: roleIds }),
  });
}

// Owner-only: replaces the permissions every active member holds.
export async function setMemberDefaults(
  orgId: string,
  permissions: string[],
): Promise<{ permissions: string[] }> {
  return apiFetch<{ permissions: string[] }>(
    `/orgs/${orgId}/roles/member-defaults`,
    { method: "PUT", body: JSON.stringify({ permissions }) },
  );
}
