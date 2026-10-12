import { apiFetch } from "../core/api.ts";

export type PostKind = "announcement" | "discussion";

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
  title: string;
  body: string;
  pinned_at: string | null;
  edited_at: string | null;
  media: OrgPostMedia[];
  comment_count: number;
  created_at: string | null;
}

export interface PostPage {
  items: OrgPost[];
  pinned: OrgPost[];
  next_cursor: string | null;
  viewer_role: string;
  viewer_permissions: string[];
}

export interface PostListParams {
  limit?: number;
  cursor?: string;
  kind?: PostKind;
}

export interface CreatePostInput {
  kind: PostKind;
  title: string;
  body: string;
  media_ids?: string[];
}

export interface UpdatePostInput {
  title: string;
  body: string;
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

export interface ChatMessage {
  message_id: string;
  room_id: string;
  author_id: string;
  author_name: string;
  body: string;
  created_at: string | null;
}

export interface ChatPage {
  items: ChatMessage[];
  next_cursor: string | null;
  unread: number;
  last_read_message_id: string | null;
}

export interface ReadState {
  last_read_message_id: string;
  last_read_at: string | null;
}

export interface DmRoom {
  room_id: string;
  org_id: string;
  peer_id: string;
  peer_name: string;
  created_at: string | null;
}

export interface DmRoomPage {
  items: DmRoom[];
}

function qs(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const raw = search.toString();
  return raw ? `?${raw}` : "";
}

export function listPosts(
  orgId: string,
  params: PostListParams = {},
): Promise<PostPage> {
  return apiFetch<PostPage>(
    `/orgs/${orgId}/posts${qs({
      limit: params.limit !== undefined ? String(params.limit) : undefined,
      cursor: params.cursor,
      kind: params.kind,
    })}`,
  );
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

export function deletePost(orgId: string, postId: string): Promise<void> {
  return apiFetch<unknown>(`/orgs/${orgId}/posts/${postId}`, {
    method: "DELETE",
  }).then(() => undefined);
}

export function setPostPinned(
  orgId: string,
  postId: string,
  pinned: boolean,
): Promise<OrgPost> {
  return apiFetch<OrgPost>(
    `/orgs/${orgId}/posts/${postId}/${pinned ? "pin" : "unpin"}`,
    { method: "POST" },
  );
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

export function listChatMessages(
  roomId: string,
  params: { limit?: number; cursor?: string } = {},
): Promise<ChatPage> {
  return apiFetch<ChatPage>(
    `/chat/rooms/${roomId}/messages${qs({
      limit: params.limit !== undefined ? String(params.limit) : undefined,
      cursor: params.cursor,
    })}`,
  );
}

export function sendChatMessage(roomId: string, body: string): Promise<ChatMessage> {
  return apiFetch<ChatMessage>(`/chat/rooms/${roomId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export function deleteChatMessage(roomId: string, messageId: string): Promise<void> {
  return apiFetch<unknown>(`/chat/rooms/${roomId}/messages/${messageId}`, {
    method: "DELETE",
  }).then(() => undefined);
}

export function markChatRead(roomId: string, messageId: string): Promise<ReadState> {
  return apiFetch<ReadState>(`/chat/rooms/${roomId}/read`, {
    method: "POST",
    body: JSON.stringify({ message_id: messageId }),
  });
}

export function getChatUnread(roomId: string): Promise<{ unread: number }> {
  return apiFetch<{ unread: number }>(`/chat/rooms/${roomId}/unread`);
}

export function listDmRooms(orgId: string): Promise<DmRoomPage> {
  return apiFetch<DmRoomPage>(`/orgs/${orgId}/chat/dm`);
}

export function openDmRoom(orgId: string, peerId: string): Promise<DmRoom> {
  return apiFetch<DmRoom>(`/orgs/${orgId}/chat/dm`, {
    method: "POST",
    body: JSON.stringify({ peer_id: peerId }),
  });
}
