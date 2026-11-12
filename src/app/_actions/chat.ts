"use server";

import { authedFetch } from "@/lib/auth";
import type { ApiResult } from "@/lib/backend";
import {
  type ChatDm,
  type ChatMessage,
  type ChatResult,
  chatError,
  isRoomId,
  type MessagePage,
  type UnreadItem,
  validateMessage,
} from "@/lib/chat";
import { type ChatStart, messagesPath } from "@/lib/chatApi";

// Every chat call from the browser goes through these actions, so the access token stays in its
// httpOnly cookie. Arguments come from the browser and are checked before they reach a path.

function fail(code: string, error = chatError(code)): ChatResult<never> {
  return { ok: false, code, error };
}

function done<T>(result: ApiResult<T>): ChatResult<T> {
  return result.ok
    ? { ok: true, data: result.data }
    : fail(result.code, chatError(result.code, result.issues));
}

function idsValid(...ids: unknown[]): boolean {
  return ids.every(isRoomId);
}

function chatBase(slug: string): string {
  return `/organizations/${encodeURIComponent(slug)}/chat`;
}

export async function loadMessages(
  roomId: string,
  before: string | null,
): Promise<ChatResult<MessagePage>> {
  if (!idsValid(roomId) || (before !== null && !isRoomId(before))) {
    return fail("room_not_found");
  }
  return done(
    await authedFetch<MessagePage>(messagesPath(roomId, before), {
      method: "GET",
    }),
  );
}

// The polling fallback: the newest page of the open room and every unread count, in one round trip.
export async function pollChat(
  slug: string,
  roomId: string,
): Promise<ChatResult<{ page: MessagePage; unread: UnreadItem[] }>> {
  if (!idsValid(roomId)) {
    return fail("room_not_found");
  }
  const [page, unread] = await Promise.all([
    authedFetch<MessagePage>(messagesPath(roomId), { method: "GET" }),
    authedFetch<{ items: UnreadItem[] }>(`${chatBase(slug)}/unread`, {
      method: "GET",
    }),
  ]);
  if (!page.ok) {
    return done(page);
  }
  if (!unread.ok) {
    return done(unread);
  }
  return { ok: true, data: { page: page.data, unread: unread.data.items } };
}

// Channels and direct messages again, after a room was revoked or a new direct message arrived.
export async function loadRooms(slug: string): Promise<ChatResult<ChatStart>> {
  const [channels, dms, unread] = await Promise.all([
    authedFetch<{ items: ChatStart["channels"] }>(
      `${chatBase(slug)}/channels`,
      {
        method: "GET",
      },
    ),
    authedFetch<{ items: ChatDm[] }>(`${chatBase(slug)}/dms`, {
      method: "GET",
    }),
    authedFetch<{ items: UnreadItem[] }>(`${chatBase(slug)}/unread`, {
      method: "GET",
    }),
  ]);
  if (!channels.ok) {
    return done(channels);
  }
  if (!dms.ok) {
    return done(dms);
  }
  if (!unread.ok) {
    return done(unread);
  }
  return {
    ok: true,
    data: {
      channels: channels.data.items,
      dms: dms.data.items,
      unread: unread.data.items,
    },
  };
}

export async function sendChatMessage(
  roomId: string,
  body: string,
  replyToId: string | null,
): Promise<ChatResult<ChatMessage>> {
  const problem = validateMessage(body);
  if (problem) {
    return fail("validation_error", problem);
  }
  if (!idsValid(roomId) || (replyToId !== null && !isRoomId(replyToId))) {
    return fail("room_not_found");
  }
  return done(
    await authedFetch<ChatMessage>(
      `/rooms/${encodeURIComponent(roomId)}/messages`,
      {
        body: replyToId
          ? { body: body.trim(), reply_to_id: replyToId }
          : { body: body.trim() },
      },
    ),
  );
}

export async function editChatMessage(
  messageId: string,
  body: string,
): Promise<ChatResult<ChatMessage>> {
  const problem = validateMessage(body);
  if (problem) {
    return fail("validation_error", problem);
  }
  if (!idsValid(messageId)) {
    return fail("message_not_found");
  }
  return done(
    await authedFetch<ChatMessage>(
      `/messages/${encodeURIComponent(messageId)}`,
      { method: "PATCH", body: { body: body.trim() } },
    ),
  );
}

// The backend deletes a message for good, with its pins and reactions.
export async function deleteChatMessage(
  messageId: string,
): Promise<ChatResult> {
  if (!idsValid(messageId)) {
    return fail("message_not_found");
  }
  const result = await authedFetch(
    `/messages/${encodeURIComponent(messageId)}`,
    { method: "DELETE" },
  );
  return result.ok ? { ok: true, data: null } : done(result);
}

export async function setReaction(
  messageId: string,
  emoji: string,
  on: boolean,
): Promise<ChatResult> {
  if (!idsValid(messageId)) {
    return fail("message_not_found");
  }
  const text = emoji.trim();
  if (!text || [...text].length > 16) {
    return fail("validation_error");
  }
  const path = `/messages/${encodeURIComponent(messageId)}/reactions`;
  const result = on
    ? await authedFetch(path, { body: { emoji: text } })
    : await authedFetch(`${path}/${encodeURIComponent(text)}`, {
        method: "DELETE",
      });
  return result.ok ? { ok: true, data: null } : done(result);
}

export async function setPin(
  roomId: string,
  messageId: string,
  on: boolean,
): Promise<ChatResult> {
  if (!idsValid(roomId, messageId)) {
    return fail("message_not_found");
  }
  const result = await authedFetch(
    `/rooms/${encodeURIComponent(roomId)}/pins/${encodeURIComponent(messageId)}`,
    { method: on ? "POST" : "DELETE" },
  );
  return result.ok ? { ok: true, data: null } : done(result);
}

export async function loadPins(
  roomId: string,
): Promise<ChatResult<ChatMessage[]>> {
  if (!idsValid(roomId)) {
    return fail("room_not_found");
  }
  const result = await authedFetch<{ items: ChatMessage[] }>(
    `/rooms/${encodeURIComponent(roomId)}/pins`,
    { method: "GET" },
  );
  return result.ok ? { ok: true, data: result.data.items } : done(result);
}

export async function markRoomRead(
  roomId: string,
  messageId: string,
): Promise<ChatResult> {
  if (!idsValid(roomId, messageId)) {
    return fail("message_not_found");
  }
  const result = await authedFetch(
    `/rooms/${encodeURIComponent(roomId)}/read`,
    { body: { message_id: messageId } },
  );
  return result.ok ? { ok: true, data: null } : done(result);
}

export async function openDirectMessage(
  slug: string,
  userId: string,
): Promise<ChatResult<ChatDm>> {
  if (!idsValid(userId)) {
    return fail("not_a_member");
  }
  return done(
    await authedFetch<ChatDm>(`${chatBase(slug)}/dms`, {
      body: { user_id: userId },
    }),
  );
}
