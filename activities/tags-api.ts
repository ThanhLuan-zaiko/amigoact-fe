import { apiFetch } from "../core/api.ts";

export interface PublicTag {
  name: string;
  slug: string;
}

export interface OwnedTag {
  name: string;
  slug: string;
  org_id: string;
  org_name: string;
}

export interface OrgTag {
  id: string;
  name: string;
  slug: string;
  activity_count: number;
  post_count: number;
  created_at: string;
  deleted_at: string | null;
}

export interface OrgTagPage {
  items: OrgTag[];
  can_manage: boolean;
  trash_count: number;
}

export function searchPublicTags(
  query: string,
  limit = 8,
): Promise<PublicTag[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (query.trim()) params.set("q", query.trim());
  return apiFetch<PublicTag[]>(`/tags?${params}`);
}

export interface MyTag {
  name: string;
  slug: string;
  post_count: number;
  created_at: string;
  // Present on GET /me/tags so picking a tag does not wait on another request.
  posts?: MyTagPost[];
}

export interface MyTagPost {
  post_id: string;
  org_id: string;
  title: string;
  draft: boolean;
  cover_url: string | null;
}

export function listMyTags(): Promise<MyTag[]> {
  return apiFetch<MyTag[]>("/me/tags");
}

export function createMyTag(name: string): Promise<MyTag> {
  return apiFetch<MyTag>("/me/tags", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function renameMyTag(slug: string, name: string): Promise<MyTag> {
  return apiFetch<MyTag>(`/me/tags/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export function deleteMyTag(slug: string): Promise<void> {
  return apiFetch<void>(`/me/tags/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
}

export function listMyTagPosts(slug: string): Promise<MyTagPost[]> {
  return apiFetch<MyTagPost[]>(
    `/me/tags/${encodeURIComponent(slug)}/posts`,
  );
}

export function listOwnedTags(orgId: string): Promise<OwnedTag[]> {
  return apiFetch<OwnedTag[]>(
    `/orgs/${encodeURIComponent(orgId)}/tags/owned`,
  );
}

export function listOrgTags(
  orgId: string,
  trash = false,
): Promise<OrgTagPage> {
  return apiFetch<OrgTagPage>(
    `/orgs/${encodeURIComponent(orgId)}/tags${trash ? "?trash=1" : ""}`,
  );
}

export function createOrgTag(
  orgId: string,
  name: string,
): Promise<OrgTag> {
  return apiFetch<OrgTag>(`/orgs/${encodeURIComponent(orgId)}/tags`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function renameOrgTag(
  orgId: string,
  slug: string,
  name: string,
): Promise<OrgTag> {
  return apiFetch<OrgTag>(
    `/orgs/${encodeURIComponent(orgId)}/tags/${encodeURIComponent(slug)}`,
    { method: "PATCH", body: JSON.stringify({ name }) },
  );
}

export function mergeOrgTag(
  orgId: string,
  slug: string,
  into: string,
): Promise<OrgTag> {
  return apiFetch<OrgTag>(
    `/orgs/${encodeURIComponent(orgId)}/tags/${encodeURIComponent(slug)}/merge`,
    { method: "POST", body: JSON.stringify({ into }) },
  );
}

export function softDeleteOrgTag(
  orgId: string,
  slug: string,
): Promise<OrgTag> {
  return apiFetch<OrgTag>(
    `/orgs/${encodeURIComponent(orgId)}/tags/${encodeURIComponent(slug)}`,
    { method: "DELETE" },
  );
}

export function hardDeleteOrgTag(
  orgId: string,
  slug: string,
): Promise<void> {
  return apiFetch<void>(
    `/orgs/${encodeURIComponent(orgId)}/tags/${encodeURIComponent(slug)}?hard=1`,
    { method: "DELETE" },
  );
}

export function restoreOrgTag(
  orgId: string,
  slug: string,
): Promise<OrgTag> {
  return apiFetch<OrgTag>(
    `/orgs/${encodeURIComponent(orgId)}/tags/${encodeURIComponent(slug)}/restore`,
    { method: "POST" },
  );
}
