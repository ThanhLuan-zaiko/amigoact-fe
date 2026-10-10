import { apiFetch } from "../core/api.ts";

export interface AdminStatus {
  is_admin: boolean;
}

export interface AdminOrgItem {
  id: string;
  name: string;
  slug: string;
  kind: string;
  status: string;
  legal_status: string;
  tax_code: string | null;
  legal_rep_name: string | null;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  verified_at: string | null;
  created_at: string;
}

export interface AdminOrgPage {
  items: AdminOrgItem[];
  total: number;
}

export interface AdminUserItem {
  user_id: string;
  full_name: string;
  email: string;
}

export async function getAdminStatus(): Promise<AdminStatus> {
  return apiFetch<AdminStatus>("/admin/me");
}

export async function listAdminOrgs(
  status = "pending",
): Promise<AdminOrgPage> {
  return apiFetch<AdminOrgPage>(`/admin/orgs?status=${status}`);
}

export async function verifyOrg(id: string): Promise<AdminOrgItem> {
  return apiFetch<AdminOrgItem>(`/admin/orgs/${id}/verify`, {
    method: "POST",
  });
}

export async function rejectOrg(
  id: string,
  reason: string,
): Promise<AdminOrgItem> {
  return apiFetch<AdminOrgItem>(`/admin/orgs/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function listAdmins(): Promise<AdminUserItem[]> {
  return apiFetch<AdminUserItem[]>("/admin/admins");
}

export async function grantAdmin(email: string): Promise<void> {
  return apiFetch<void>("/admin/admins", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function revokeAdmin(userId: string): Promise<void> {
  return apiFetch<void>(`/admin/admins/${userId}`, { method: "DELETE" });
}
