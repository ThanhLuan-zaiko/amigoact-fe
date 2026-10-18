import { apiFetch, apiUpload } from "../core/api.ts";
import { qs } from "./board-api.ts";
import type { ChannelKind, ChannelPostPolicy } from "./channel-api.ts";

// Board (posts/comments) contracts live in board-api.ts; channels in
// channel-api.ts and the shared-media index in media-api.ts - all
// re-exported so existing imports from ./api.ts keep working.
export * from "./board-api.ts";
export * from "./channel-api.ts";
export * from "./media-api.ts";

export interface ChatAttachment {
  media_id: string;
  url: string;
  mime: string;
  name: string;
  size_bytes: number;
}

export interface ChatReaction {
  emoji: string;
  count: number;
  mine: boolean;
}

export interface ChatMention {
  user_id: string;
  name: string;
}

export interface ChatMessage {
  message_id: string;
  room_id: string;
  author_id: string;
  author_name: string;
  author_avatar_url: string | null;
  body: string;
  created_at: string | null;
  reply_to_id: string | null;
  reply_to_author: string | null;
  reply_to_body: string | null;
  edited_at: string | null;
  attachments: ChatAttachment[];
  reactions: ChatReaction[];
  mentions: ChatMention[];
}

export interface ChatPage {
  items: ChatMessage[];
  next_cursor: string | null;
  unread: number;
  last_read_message_id: string | null;
  // dm-only peer read pointer: drives the sender's double-check receipt.
  peer_last_read_message_id: string | null;
  // The room's pinned messages, oldest pin first + the caller's mute.
  pinned: ChatMessage[];
  muted: boolean;
}

export interface ReadState {
  last_read_message_id: string;
  last_read_at: string | null;
}

// One member's read pointer: the group "seen by" receipt entries.
export interface ChatReadEntry {
  user_id: string;
  user_name: string;
  avatar_url: string | null;
  last_read_message_id: string;
  last_read_at: string | null;
}

export interface ChatReadsPage {
  items: ChatReadEntry[];
}

export function listChatReads(roomId: string): Promise<ChatReadsPage> {
  return apiFetch<ChatReadsPage>(`/chat/rooms/${roomId}/reads`);
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

export type InboxRoomKind = "general" | "activity" | "dm" | "channel";

// One Telegram-style inbox row: room identity plus last-message preview.
export interface InboxRoom {
  room_id: string;
  kind: InboxRoomKind;
  org_id: string;
  org_name: string;
  // Public org slug: the info panel builds /orgs/{slug} share links.
  org_slug: string;
  title: string;
  peer_id: string | null;
  avatar_url: string | null;
  last_message_id: string | null;
  last_body: string | null;
  last_author_name: string | null;
  last_at: string | null;
  unread: number;
  sort_at: string | null;
  peer_last_seen_at: string | null;
  // Muted rooms keep their unread count but the badge total skips them.
  muted: boolean;
  // Channel rows only: composer gate + display label.
  post_policy: ChannelPostPolicy | null;
  channel_kind: ChannelKind | null;
  // Sub-thread rows only: the room it hangs under + linked activity.
  parent_room_id: string | null;
  activity_id: string | null;
}

export interface ChatInbox {
  items: InboxRoom[];
}

export function listChatInbox(): Promise<ChatInbox> {
  return apiFetch<ChatInbox>("/chat/inbox");
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

export interface SendChatInput {
  body: string;
  reply_to_id?: string | null;
  attachment_ids?: string[];
}

export function sendChatMessage(
  roomId: string,
  input: SendChatInput,
): Promise<ChatMessage> {
  return apiFetch<ChatMessage>(`/chat/rooms/${roomId}/messages`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function editChatMessage(
  roomId: string,
  messageId: string,
  body: string,
): Promise<ChatMessage> {
  return apiFetch<ChatMessage>(
    `/chat/rooms/${roomId}/messages/${messageId}`,
    { method: "PATCH", body: JSON.stringify({ body }) },
  );
}

export function uploadChatAttachment(
  roomId: string,
  file: File,
): Promise<ChatAttachment> {
  const form = new FormData();
  form.append("file", file);
  return apiUpload<ChatAttachment>(
    `/chat/rooms/${roomId}/attachments`,
    form,
  );
}

export function deleteChatMessage(roomId: string, messageId: string): Promise<void> {
  return apiFetch<unknown>(`/chat/rooms/${roomId}/messages/${messageId}`, {
    method: "DELETE",
  }).then(() => undefined);
}

export function toggleChatReaction(
  roomId: string,
  messageId: string,
  emoji: string,
): Promise<ChatMessage> {
  return apiFetch<ChatMessage>(
    `/chat/rooms/${roomId}/messages/${messageId}/reactions`,
    { method: "PUT", body: JSON.stringify({ emoji }) },
  );
}

export function pinChatMessage(
  roomId: string,
  messageId: string,
): Promise<void> {
  return apiFetch<unknown>(
    `/chat/rooms/${roomId}/pins/${messageId}`,
    { method: "PUT" },
  ).then(() => undefined);
}

export function unpinChatMessage(
  roomId: string,
  messageId: string,
): Promise<void> {
  return apiFetch<unknown>(
    `/chat/rooms/${roomId}/pins/${messageId}`,
    { method: "DELETE" },
  ).then(() => undefined);
}

export function setChatMute(roomId: string, muted: boolean): Promise<void> {
  return apiFetch<unknown>(`/chat/rooms/${roomId}/mute`, {
    method: muted ? "PUT" : "DELETE",
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

// Named channels live in channel-api.ts (re-exported above).
