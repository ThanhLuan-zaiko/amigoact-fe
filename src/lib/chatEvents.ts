// Socket frames and how they change the local list of messages. Pure, so bun tests cover them.
import type { ChatMessage, ReactionCount } from "./chat";

export type ChatFrame =
  | { kind: "created" | "updated"; roomId: string; message: ChatMessage }
  | { kind: "deleted"; roomId: string; messageId: string }
  | { kind: "revoked"; roomId: string }
  | { kind: "subscribed"; roomId: string }
  | { kind: "error"; code: string }
  | { kind: "pong" };

type Raw = Record<string, unknown>;

function isMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") {
    return false;
  }
  const message = value as Raw;
  return (
    typeof message.id === "string" &&
    typeof message.room_id === "string" &&
    typeof message.author_id === "string" &&
    typeof message.body === "string" &&
    typeof message.created_at === "string" &&
    Array.isArray(message.reactions)
  );
}

// Unknown or malformed frames give null and are ignored, so a newer backend cannot break the page.
export function parseFrame(text: string): ChatFrame | null {
  try {
    return readFrame(JSON.parse(text));
  } catch {
    return null;
  }
}

// The same, for a frame the realtime client already parsed.
export function readFrame(data: unknown): ChatFrame | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const frame = data as Raw;
  const roomId = typeof frame.room_id === "string" ? frame.room_id : null;
  if (frame.type === "message.created" || frame.type === "message.updated") {
    if (!roomId || !isMessage(frame.message)) {
      return null;
    }
    const kind = frame.type === "message.created" ? "created" : "updated";
    return { kind, roomId, message: frame.message };
  }
  if (frame.type === "message.deleted") {
    return roomId && typeof frame.message_id === "string"
      ? { kind: "deleted", roomId, messageId: frame.message_id }
      : null;
  }
  if (frame.op === "revoked" || frame.op === "subscribed") {
    return roomId ? { kind: frame.op, roomId } : null;
  }
  if (frame.op === "error") {
    return { kind: "error", code: String(frame.code ?? "") };
  }
  return frame.op === "pong" ? { kind: "pong" } : null;
}

// Message IDs are UUIDv7, so their text order is their time order.
export function compareIds(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

// Oldest first. A message from the server replaces the local copy with the same ID.
export function mergeMessages(
  current: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  const byId = new Map(current.map((message) => [message.id, message]));
  for (const message of incoming) {
    byId.set(message.id, message);
  }
  return [...byId.values()].sort((a, b) => compareIds(a.id, b.id));
}

// Socket events carry no "mine" flags, because every listener gets the same copy. The viewer's
// own flags are kept from the local copy for the emoji that are still there.
export function keepMyReactions(
  previous: ReactionCount[],
  next: ReactionCount[],
): ReactionCount[] {
  const mine = new Set(
    previous.filter((reaction) => reaction.mine).map((r) => r.emoji),
  );
  return next.map((reaction) => ({
    ...reaction,
    mine: mine.has(reaction.emoji),
  }));
}

export function applyFrame(
  messages: ChatMessage[],
  frame: ChatFrame,
): ChatMessage[] {
  if (frame.kind === "deleted") {
    return messages.filter((message) => message.id !== frame.messageId);
  }
  if (frame.kind !== "created" && frame.kind !== "updated") {
    return messages;
  }
  const previous = messages.find((message) => message.id === frame.message.id);
  if (!previous) {
    // An update for a message that is not loaded (an older page) is skipped.
    return frame.kind === "created"
      ? mergeMessages(messages, [frame.message])
      : messages;
  }
  const merged = {
    ...frame.message,
    reactions: keepMyReactions(previous.reactions, frame.message.reactions),
  };
  return mergeMessages(messages, [merged]);
}

// The viewer's reaction flips at once, before the server answers.
export function toggleReaction(
  message: ChatMessage,
  emoji: string,
): ChatMessage {
  const existing = message.reactions.find((r) => r.emoji === emoji);
  if (existing?.mine) {
    const reactions = message.reactions
      .map((r) =>
        r.emoji === emoji ? { ...r, count: r.count - 1, mine: false } : r,
      )
      .filter((r) => r.count > 0);
    return { ...message, reactions };
  }
  if (existing) {
    const reactions = message.reactions.map((r) =>
      r.emoji === emoji ? { ...r, count: r.count + 1, mine: true } : r,
    );
    return { ...message, reactions };
  }
  return {
    ...message,
    reactions: [...message.reactions, { emoji, count: 1, mine: true }],
  };
}

export function replaceMessage(
  messages: ChatMessage[],
  next: ChatMessage,
): ChatMessage[] {
  return messages.map((message) => (message.id === next.id ? next : message));
}

// A new message from someone else in a room the viewer is not looking at adds one unread.
export function unreadAfterFrame(
  unread: Record<string, number>,
  frame: ChatFrame,
  activeRoomId: string | null,
  viewerId: string,
): Record<string, number> {
  if (frame.kind !== "created" || frame.roomId === activeRoomId) {
    return unread;
  }
  if (frame.message.author_id === viewerId) {
    return unread;
  }
  return { ...unread, [frame.roomId]: (unread[frame.roomId] ?? 0) + 1 };
}

// The read position only moves forward, like on the backend.
export function needsReadMark(
  lastMarked: string | null,
  newestId: string | undefined,
): newestId is string {
  return (
    newestId !== undefined && (lastMarked === null || newestId > lastMarked)
  );
}

// The newest page from the server replaces the local messages in its range, so a message that
// was deleted while the socket was down disappears. Older loaded messages stay. A page without
// next_before is the whole history.
export function mergeNewestPage(
  current: ChatMessage[],
  page: { items: ChatMessage[]; next_before: string | null },
): ChatMessage[] {
  const items = [...page.items].sort((a, b) => compareIds(a.id, b.id));
  if (page.next_before === null || items.length === 0) {
    return items;
  }
  const oldest = items[0].id;
  return [...current.filter((message) => message.id < oldest), ...items];
}

// The loaded messages of each room, keyed by room ID. nextBefore points at the next older page.
export type RoomCache = { items: ChatMessage[]; nextBefore: string | null };
export type CacheMap = Record<string, RoomCache>;

type Page = { items: ChatMessage[]; next_before: string | null };

// A room that is not loaded stays unloaded, so an event cannot create a half-filled room.
export function patchCache(
  caches: CacheMap,
  roomId: string,
  change: (items: ChatMessage[]) => ChatMessage[],
): CacheMap {
  const current = caches[roomId];
  return current
    ? { ...caches, [roomId]: { ...current, items: change(current.items) } }
    : caches;
}

// Older pages already loaded keep their cursor. A page without next_before is the whole history.
export function withNewestPage(
  caches: CacheMap,
  roomId: string,
  page: Page,
): CacheMap {
  const current = caches[roomId];
  const nextBefore =
    page.next_before === null
      ? null
      : current
        ? current.nextBefore
        : page.next_before;
  const items = mergeNewestPage(current?.items ?? [], page);
  return { ...caches, [roomId]: { items, nextBefore } };
}

export function withOlderPage(
  caches: CacheMap,
  roomId: string,
  page: Page,
): CacheMap {
  const items = mergeMessages(caches[roomId]?.items ?? [], page.items);
  return { ...caches, [roomId]: { items, nextBefore: page.next_before } };
}
