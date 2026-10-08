import { apiBaseUrl, apiFetch, apiUpload } from "../core/api.ts";

export type OrgKind = "organization" | "club" | "group" | "business";

export interface DashboardOrg {
  id: string;
  name: string;
  slug: string;
  description: string;
  kind: OrgKind;
  member_count: number;
  event_count: number;
  owner_id: string | null;
  tax_code: string | null;
  legal_rep_name: string | null;
  legal_rep_id: string | null;
  legal_rep_position: string | null;
  legal_status: string;
  status: string;
  deleted_at: string | null;
  created_at: string;
}

export interface CreateOrgInput {
  name: string;
  slug: string;
  description: string;
  kind: OrgKind;
  tax_code?: string;
  legal_rep_name?: string;
  legal_rep_id?: string;
  legal_rep_position?: string;
}

export async function listMyOrgs(includeDeleted = false): Promise<DashboardOrg[]> {
  return apiFetch<DashboardOrg[]>(
    includeDeleted ? "/orgs/mine?include_deleted=true" : "/orgs/mine",
  );
}

export interface UpdateOrgInput {
  name: string;
  description: string;
}

export async function updateOrg(id: string, input: UpdateOrgInput): Promise<DashboardOrg> {
  return apiFetch<DashboardOrg>(`/orgs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function softDeleteOrg(id: string): Promise<DashboardOrg> {
  return apiFetch<DashboardOrg>(`/orgs/${id}`, { method: "DELETE" });
}

export async function hardDeleteOrg(id: string): Promise<void> {
  await apiFetch<unknown>(`/orgs/${id}?hard=true`, { method: "DELETE" });
}

export async function restoreOrg(id: string): Promise<DashboardOrg> {
  return apiFetch<DashboardOrg>(`/orgs/${id}/restore`, { method: "POST" });
}

export interface OrgMedia {
  id: string;
  org_id: string;
  kind: string;
  mime: string;
  size_bytes: number;
  file_url: string;
  created_at: string;
}

export function orgMediaUrl(fileUrl: string): string {
  return `${apiBaseUrl()}${fileUrl}`;
}

export async function listOrgMedia(orgId: string): Promise<OrgMedia[]> {
  return apiFetch<OrgMedia[]>(`/orgs/${orgId}/media`);
}

export async function uploadOrgMedia(orgId: string, file: File): Promise<OrgMedia> {
  const form = new FormData();
  form.append("file", file, file.name);
  return apiUpload<OrgMedia>(`/orgs/${orgId}/media`, form);
}

export async function deleteOrgMedia(orgId: string, mediaId: string): Promise<void> {
  await apiFetch<unknown>(`/orgs/${orgId}/media/${mediaId}`, { method: "DELETE" });
}

export async function createOrg(input: CreateOrgInput): Promise<DashboardOrg> {
  return apiFetch<DashboardOrg>("/orgs", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      description: input.description,
      legal_rep_position: input.legal_rep_position || undefined,
    }),
  });
}
