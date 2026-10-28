import { ApiError, apiBaseUrl, apiFetch, apiUpload } from "../core/api.ts";

export type OrgKind = "organization" | "club" | "group" | "business";
export type JoinPolicy = "invite" | "open" | "review";

export interface DashboardOrg {
  id: string;
  name: string;
  slug: string;
  description: string;
  kind: OrgKind;
  member_count: number;
  event_count: number;
  owner_id: string | null;
  join_policy: JoinPolicy;
  tax_code: string | null;
  legal_rep_name: string | null;
  legal_rep_id: string | null;
  legal_rep_position: string | null;
  legal_status: string;
  status: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  legal_name: string | null;
  license_number: string | null;
  is_personal: boolean;
  logo_media_id: string | null;
  cover_media_id: string | null;
  verified_at: string | null;
  previous_slug: string | null;
  deleted_at: string | null;
  created_at: string;
}

export interface CreateOrgInput {
  name: string;
  slug: string;
  description: string;
  kind: OrgKind;
  join_policy?: JoinPolicy;
  tax_code?: string;
  legal_rep_name?: string;
  legal_rep_id?: string;
  legal_rep_position?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  legal_name?: string;
  license_number?: string;
}

export type OrgSortParam = "newest" | "name" | "members";

export interface OrgListParams {
  q?: string;
  status?: string;
  sort?: OrgSortParam;
  limit?: number;
  offset?: number;
}

export interface BucketCount {
  bucket: string;
  count: number;
}

export interface OrgListPage {
  items: DashboardOrg[];
  total: number;
  counts: BucketCount[];
}

export async function listMyOrgs(
  includeDeleted = false,
  params: OrgListParams = {},
): Promise<OrgListPage> {
  const search = new URLSearchParams();
  if (includeDeleted) search.set("include_deleted", "true");
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.sort) search.set("sort", params.sort);
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset) search.set("offset", String(params.offset));
  const query = search.toString();
  return apiFetch<OrgListPage>(`/orgs/mine${query ? `?${query}` : ""}`);
}

export interface UpdateOrgInput {
  name: string;
  description: string;
  join_policy?: JoinPolicy;
  tax_code?: string | null;
  legal_rep_name?: string | null;
  legal_rep_id?: string | null;
  legal_rep_position?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  legal_name?: string | null;
  license_number?: string | null;
  is_personal?: boolean;
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

export type MediaRole = "gallery" | "cover" | "logo";

export interface OrgMedia {
  id: string;
  org_id: string;
  kind: string;
  role: MediaRole;
  mime: string;
  size_bytes: number;
  file_url: string;
  uploader_id: string | null;
  original_name: string | null;
  upload_status: string;
  created_at: string;
  updated_at: string | null;
}

export function orgMediaUrl(fileUrl: string): string {
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) return fileUrl;
  const path = fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`;
  return `${apiBaseUrl()}${path}`;
}

// Narrow picker accept list to the backend allowlist.
export const MEDIA_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm";

export async function listOrgMedia(orgId: string): Promise<OrgMedia[]> {
  return apiFetch<OrgMedia[]>(`/orgs/${orgId}/media`);
}

export async function uploadOrgMedia(
  orgId: string,
  file: File,
  role: MediaRole = "gallery",
): Promise<OrgMedia> {
  const form = new FormData();
  form.append("role", role);
  form.append("file", file, file.name);
  return apiUpload<OrgMedia>(`/orgs/${orgId}/media`, form);
}

export async function setOrgMediaRole(
  orgId: string,
  mediaId: string,
  role: MediaRole,
): Promise<OrgMedia> {
  return apiFetch<OrgMedia>(`/orgs/${orgId}/media/${mediaId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function replaceOrgMediaFile(
  orgId: string,
  mediaId: string,
  file: File,
): Promise<OrgMedia> {
  const form = new FormData();
  form.append("file", file, file.name);
  return apiUpload<OrgMedia>(`/orgs/${orgId}/media/${mediaId}/file`, form, "PUT");
}

export async function downloadOrgMedia(item: OrgMedia): Promise<File> {
  const response = await fetch(orgMediaUrl(item.file_url), { credentials: "include" });
  if (!response.ok) {
    throw new ApiError(response.status, {
      code: "REQUEST_FAILED",
      message: `Media download failed (${response.status})`,
    });
  }
  const blob = await response.blob();
  const name = item.original_name ?? `media-${item.id}`;
  return new File([blob], name, { type: item.mime || blob.type });
}

export async function deleteOrgMedia(orgId: string, mediaId: string): Promise<void> {
  await apiFetch<unknown>(`/orgs/${orgId}/media/${mediaId}`, { method: "DELETE" });
}

export async function deleteAllOrgMedia(orgId: string): Promise<void> {
  await apiFetch<unknown>(`/orgs/${orgId}/media`, { method: "DELETE" });
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
