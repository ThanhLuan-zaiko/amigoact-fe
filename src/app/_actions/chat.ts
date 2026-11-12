"use server";

import { authedFetch } from "@/lib/auth";
import type { ApiResult } from "@/lib/backend";
import {
  ATTACHMENT_MAX,
  type ChatContact,
  type ChatMessage,
  type ChatResult,
  type ChatRoom,
  chatError,
  isRoomId,
  type MessagePage,
  validateMessage,
} from "@/lib/chat";
import { messagesPath } from "@/lib/chatApi";

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

export async function loadInbox(): Promise<ChatResult<ChatRoom[]>> {
  const result = await authedFetch<{ items: ChatRoom[] }>("/chat/inbox", {
    method: "GET",
  });
  return result.ok ? { ok: true, data: result.data.items } : done(result);
}

// The polling fallback: the inbox and the newest page of the open room, in one round trip.
// Next.js runs the Server Actions of a page one at a time, so they share one call.
export async function pollMessenger(
  roomId: string | null,
): Promise<ChatResult<{ rooms: ChatRoom[]; page: MessagePage | null }>> {
  if (roomId !== null && !idsValid(roomId)) {
    return fail("room_not_found");
  }
  const [inbox, page] = await Promise.all([
    authedFetch<{ items: ChatRoom[] }>("/chat/inbox", { method: "GET" }),
    roomId
      ? authedFetch<MessagePage>(messagesPath(roomId), { method: "GET" })
      : null,
  ]);
  if (!inbox.ok) {
    return done(inbox);
  }
  if (page && !page.ok) {
    return done(page);
  }
  return {
    ok: true,
    data: { rooms: inbox.data.items, page: page ? page.data : null },
  };
}

export async function loadContacts(): Promise<ChatResult<ChatContact[]>> {
  const result = await authedFetch<{ items: ChatContact[] }>("/chat/contacts", {
    method: "GET",
  });
  return result.ok ? { ok: true, data: result.data.items } : done(result);
}

// Files are uploaded through /media/upload first; only their ids travel here.
export async function sendChatMessage(
  roomId: string,
  body: string,
  replyToId: string | null,
  attachmentIds: string[] = [],
): Promise<ChatResult<ChatMessage>> {
  const problem = validateMessage(body, attachmentIds.length);
  if (problem) {
    return fail("validation_error", problem);
  }
  if (attachmentIds.length > ATTACHMENT_MAX || !idsValid(...attachmentIds)) {
    return fail("media_not_found");
  }
  if (!idsValid(roomId) || (replyToId !== null && !isRoomId(replyToId))) {
    return fail("room_not_found");
  }
  return done(
    await authedFetch<ChatMessage>(
      `/rooms/${encodeURIComponent(roomId)}/messages`,
      {
        body: {
          body: body.trim(),
          ...(replyToId ? { reply_to_id: replyToId } : {}),
          ...(attachmentIds.length > 0
            ? { attachment_ids: attachmentIds }
            : {}),
        },
      },
    ),
  );
}

export async function editChatMessage(
  messageId: string,
  body: string,
  files = 0,
): Promise<ChatResult<ChatMessage>> {
  const problem = validateMessage(body, files);
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

const SLUG = /^[A-Za-z0-9-]{1,80}$/;

// Opens (or finds) the direct message with a member of one organization.
export async function openDirectMessage(
  slug: string,
  userId: string,
): Promise<ChatResult<{ room_id: string }>> {
  if (!idsValid(userId) || !SLUG.test(slug)) {
    return fail("not_a_member");
  }
  return done(
    await authedFetch<{ room_id: string }>(
      `/organizations/${encodeURIComponent(slug)}/chat/dms`,
      { body: { user_id: userId } },
    ),
  );
}
