import { apiFetch } from "../core/api.ts";

export type PostKind = "announcement" | "discussion";
export type PostStatus = "published" | "draft";

// Typed article blocks; mirrors posts/blocks.py. Media blocks only carry
// an org asset id, resolved to a URL through OrgPost.media at read time.
export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string; level: 2 | 3 }
  | { type: "quote"; text: string; cite: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "image"; asset_id: string; caption: string }
  | { type: "video"; asset_id: string; caption: string }
  | { type: "divider" };

export type BlockType = ArticleBlock["type"];

export interface OrgPostMedia {
  asset_id: string;
  file_url: string;
  mime: string;
}

export interface OrgPost {
  post_id: string;
  org_id: string;
  author_id: string;
  author_name: string;
  kind: PostKind;
  status: PostStatus;
  title: string;
  body: string;
  blocks: ArticleBlock[];
  cover_media_id: string | null;
  pinned_at: string | null;
  edited_at: string | null;
  published_at: string | null;
  deleted_at: string | null;
  media: OrgPostMedia[];
  comment_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface PostPage {
  items: OrgPost[];
  pinned: OrgPost[];
  total: number;
  viewer_role: string;
  viewer_permissions: string[];
}

export interface PostListParams {
  limit?: number;
  page?: number;
  kind?: PostKind;
}

export interface CreatePostInput {
  kind: PostKind;
  status?: PostStatus;
  title: string;
  body?: string;
  blocks?: ArticleBlock[];
  cover_media_id?: string | null;
  media_ids?: string[];
}

export interface UpdatePostInput {
  title: string;
  body?: string;
  blocks?: ArticleBlock[];
  cover_media_id?: string | null;
  kind?: PostKind;
}

export interface OrgComment {
  comment_id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  body: string;
  created_at: string | null;
}

export interface CommentPage {
  items: OrgComment[];
  next_cursor: string | null;
}

export function qs(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const raw = search.toString();
  return raw ? `?${raw}` : "";
}

function pageQuery(params: PostListParams): string {
  return qs({
    limit: params.limit !== undefined ? String(params.limit) : undefined,
    page: params.page !== undefined && params.page > 1
      ? String(params.page)
      : undefined,
    kind: params.kind,
  });
}

export function listPosts(
  orgId: string,
  params: PostListParams = {},
): Promise<PostPage> {
  return apiFetch<PostPage>(`/orgs/${orgId}/posts${pageQuery(params)}`);
}

export function listDraftPosts(
  orgId: string,
  params: PostListParams = {},
): Promise<PostPage> {
  return apiFetch<PostPage>(`/orgs/${orgId}/posts/drafts${pageQuery(params)}`);
}

export function listTrashPosts(
  orgId: string,
  params: PostListParams = {},
): Promise<PostPage> {
  return apiFetch<PostPage>(`/orgs/${orgId}/posts/trash${pageQuery(params)}`);
}

export function getPost(orgId: string, postId: string): Promise<OrgPost> {
  return apiFetch<OrgPost>(`/orgs/${orgId}/posts/${postId}`);
}

export function createPost(orgId: string, input: CreatePostInput): Promise<OrgPost> {
  return apiFetch<OrgPost>(`/orgs/${orgId}/posts`, {
    method: "POST",
    body: JSON.stringify({ ...input, media_ids: input.media_ids ?? [] }),
  });
}

export function updatePost(
  orgId: string,
  postId: string,
  input: UpdatePostInput,
): Promise<OrgPost> {
  return apiFetch<OrgPost>(`/orgs/${orgId}/posts/${postId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

function postAction(orgId: string, postId: string, action: string): Promise<OrgPost> {
  return apiFetch<OrgPost>(`/orgs/${orgId}/posts/${postId}/${action}`, {
    method: "POST",
  });
}

export function publishPost(orgId: string, postId: string): Promise<OrgPost> {
  return postAction(orgId, postId, "publish");
}

export function unpublishPost(orgId: string, postId: string): Promise<OrgPost> {
  return postAction(orgId, postId, "unpublish");
}

export function restorePost(orgId: string, postId: string): Promise<OrgPost> {
  return postAction(orgId, postId, "restore");
}

export function setPostPinned(
  orgId: string,
  postId: string,
  pinned: boolean,
): Promise<OrgPost> {
  return postAction(orgId, postId, pinned ? "pin" : "unpin");
}

// Soft delete moves the post to the trash; hard=true erases it for good.
export function deletePost(
  orgId: string,
  postId: string,
  hard = false,
): Promise<void> {
  return apiFetch<unknown>(
    `/orgs/${orgId}/posts/${postId}${hard ? "?hard=true" : ""}`,
    { method: "DELETE" },
  ).then(() => undefined);
}

export function listComments(
  orgId: string,
  postId: string,
  params: { limit?: number; cursor?: string } = {},
): Promise<CommentPage> {
  return apiFetch<CommentPage>(
    `/orgs/${orgId}/posts/${postId}/comments${qs({
      limit: params.limit !== undefined ? String(params.limit) : undefined,
      cursor: params.cursor,
    })}`,
  );
}

export function addComment(
  orgId: string,
  postId: string,
  body: string,
): Promise<OrgComment> {
  return apiFetch<OrgComment>(
    `/orgs/${orgId}/posts/${postId}/comments`,
    { method: "POST", body: JSON.stringify({ body }) },
  );
}

export function deleteComment(
  orgId: string,
  postId: string,
  commentId: string,
): Promise<void> {
  return apiFetch<unknown>(
    `/orgs/${orgId}/posts/${postId}/comments/${commentId}`,
    { method: "DELETE" },
  ).then(() => undefined);
}
