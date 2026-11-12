"use client";

import {
  deleteChatMessage,
  editChatMessage,
  loadMessages,
  sendChatMessage,
  setPin,
  setReaction,
} from "@/app/_actions/chat";
import { attempt, type ChatMessage, type ChatResult } from "@/lib/chat";
import {
  type CacheMap,
  mergeMessages,
  replaceMessage,
  toggleReaction,
  withOlderPage,
} from "@/lib/chatEvents";

type Patch = (
  roomId: string,
  change: (items: ChatMessage[]) => ChatMessage[],
) => void;

type Setter = (change: (previous: CacheMap) => CacheMap) => void;

const OK: ChatResult = { ok: true, data: null };

// The things a person does to messages. Each one updates the loaded room when the server agrees.
export function messageActions(
  patchRoom: Patch,
  setCaches: Setter,
  onSent: (message: ChatMessage) => void,
) {
  async function loadOlder(
    roomId: string,
    before: string | null | undefined,
  ): Promise<ChatResult> {
    if (!before) {
      return OK;
    }
    const result = await attempt(() => loadMessages(roomId, before));
    if (!result.ok) {
      return result;
    }
    setCaches((previous) => withOlderPage(previous, roomId, result.data));
    return OK;
  }

  async function send(
    roomId: string,
    body: string,
    replyToId: string | null,
    attachmentIds: string[],
  ): Promise<ChatResult> {
    const result = await attempt(() =>
      sendChatMessage(roomId, body, replyToId, attachmentIds),
    );
    if (!result.ok) {
      return result;
    }
    patchRoom(roomId, (items) => mergeMessages(items, [result.data]));
    onSent(result.data);
    return OK;
  }

  async function edit(message: ChatMessage, body: string): Promise<ChatResult> {
    const result = await attempt(() =>
      editChatMessage(message.id, body, message.attachments.length),
    );
    if (!result.ok) {
      return result;
    }
    patchRoom(message.room_id, (items) => replaceMessage(items, result.data));
    return OK;
  }

  async function remove(message: ChatMessage): Promise<ChatResult> {
    const result = await attempt(() => deleteChatMessage(message.id));
    if (result.ok) {
      patchRoom(message.room_id, (items) =>
        items.filter((item) => item.id !== message.id),
      );
    }
    return result;
  }

  // The reaction flips at once and flips back if the server refuses it.
  async function react(
    message: ChatMessage,
    emoji: string,
  ): Promise<ChatResult> {
    const on = !message.reactions.some((r) => r.emoji === emoji && r.mine);
    patchRoom(message.room_id, (items) => {
      const current = items.find((item) => item.id === message.id);
      return current
        ? replaceMessage(items, toggleReaction(current, emoji))
        : items;
    });
    const result = await attempt(() => setReaction(message.id, emoji, on));
    if (!result.ok) {
      patchRoom(message.room_id, (items) => replaceMessage(items, message));
    }
    return result;
  }

  async function pin(message: ChatMessage): Promise<ChatResult> {
    const on = !message.pinned;
    const result = await attempt(() => setPin(message.room_id, message.id, on));
    if (result.ok) {
      patchRoom(message.room_id, (items) => {
        const current = items.find((item) => item.id === message.id);
        return current
          ? replaceMessage(items, { ...current, pinned: on })
          : items;
      });
    }
    return result;
  }

  return { loadOlder, send, edit, remove, react, pin };
}
