import { apiBaseUrl, apiFetch } from "../core/api.ts";

export type OrgKind = "organization" | "club" | "group" | "business";
export type JoinPolicy = "invite" | "open";
export type PublicOrgSort = "newest" | "name" | "members";

export interface PublicOrg {
  id: string;
  name: string;
  slug: string;
  description: string;
  kind: OrgKind;
  member_count: number;
  join_policy: JoinPolicy;
  city: string | null;
  country: string | null;
  verified_at: string | null;
  logo_url: string | null;
  cover_url: string | null;
  created_at: string;
}

export interface BucketCount {
  bucket: string;
  count: number;
}

export interface PublicOrgPage {
  items: PublicOrg[];
  total: number;
  counts: BucketCount[];
}

export interface PublicOrgParams {
  q?: string;
  kind?: OrgKind;
  sort?: PublicOrgSort;
  limit?: number;
  offset?: number;
}

export async function listPublicOrgs(
  params: PublicOrgParams = {},
): Promise<PublicOrgPage> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.kind) search.set("kind", params.kind);
  if (params.sort) search.set("sort", params.sort);
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const query = search.toString();
  return apiFetch<PublicOrgPage>(`/orgs${query ? `?${query}` : ""}`);
}

export function orgMediaUrl(fileUrl: string): string {
  const path = fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`;
  return `${apiBaseUrl()}${path}`;
}

export interface PublicOrgActivity {
  id: string;
  slug: string;
  title: string;
  status: string;
  city: string | null;
  start_at: string | null;
}

export interface PublicOrgDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  kind: OrgKind;
  member_count: number;
  join_policy: JoinPolicy;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  legal_status: string;
  legal_name: string | null;
  license_number: string | null;
  tax_code: string | null;
  verified_at: string | null;
  logo_url: string | null;
  cover_url: string | null;
  gallery: string[];
  activity_count: number;
  activities: PublicOrgActivity[];
  created_at: string;
}

export async function fetchPublicOrg(
  slug: string,
): Promise<PublicOrgDetail> {
  return apiFetch<PublicOrgDetail>(`/orgs/${encodeURIComponent(slug)}`);
}

export interface OrgMembership {
  org_id: string;
  user_id: string;
  status: string;
}

export async function joinOrg(orgId: string): Promise<OrgMembership> {
  return apiFetch<OrgMembership>(`/orgs/${orgId}/members/join`, {
    method: "POST",
  });
}
