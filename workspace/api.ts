import { apiFetch } from "../core/api.ts";
import { qs } from "./board-api.ts";

// Board (posts/comments) contracts live in board-api.ts; re-exported so
// existing imports from ./api.ts keep working.
export * from "./board-api.ts";

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
