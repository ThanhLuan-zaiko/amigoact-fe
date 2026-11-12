import { describe, expect, test } from "bun:test";
import type { ChatMessage } from "./chat";
import {
  applyFrame,
  type ChatFrame,
  mergeMessages,
  mergeNewestPage,
  needsReadMark,
  parseFrame,
  patchCache,
  toggleReaction,
  unreadAfterFrame,
  withNewestPage,
  withOlderPage,
} from "./chatEvents";

const ROOM = "0190a000-0000-7000-8000-000000000001";
const ME = "0190a000-0000-7000-8000-0000000000aa";
const OTHER = "0190a000-0000-7000-8000-0000000000bb";

function id(n: number): string {
  return `0190a000-0000-7000-8000-${String(n).padStart(12, "0")}`;
}

function message(n: number, overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: id(n),
    room_id: ROOM,
    author_id: OTHER,
    author_name: "Bình",
    body: `tin ${n}`,
    attachments: [],
    reply_to: null,
    reactions: [],
    pinned: false,
    edited_at: null,
    created_at: "2026-11-10T03:00:00Z",
    ...overrides,
  };
}

describe("parseFrame", () => {
  test("reads message events", () => {
    const text = JSON.stringify({
      type: "message.created",
      room_id: ROOM,
      message: message(1),
    });
    expect(parseFrame(text)).toEqual({
      kind: "created",
      roomId: ROOM,
      message: message(1),
    });
    expect(
      parseFrame(
        JSON.stringify({
          type: "message.deleted",
          room_id: ROOM,
          message_id: id(1),
        }),
      ),
    ).toEqual({ kind: "deleted", roomId: ROOM, messageId: id(1) });
  });

  test("reads op replies", () => {
    expect(parseFrame('{"op":"pong"}')).toEqual({ kind: "pong" });
    expect(parseFrame(`{"op":"revoked","room_id":"${ROOM}"}`)).toEqual({
      kind: "revoked",
      roomId: ROOM,
    });
    expect(parseFrame('{"op":"error","code":"room_not_found"}')).toEqual({
      kind: "error",
      code: "room_not_found",
    });
  });

  test("ignores broken or unknown frames", () => {
    expect(parseFrame("not json")).toBeNull();
    expect(parseFrame("42")).toBeNull();
    expect(parseFrame('{"type":"message.created","room_id":"r"}')).toBeNull();
    expect(parseFrame('{"type":"typing"}')).toBeNull();
  });
});

describe("mergeMessages and mergeNewestPage", () => {
  test("keeps messages oldest first without duplicates", () => {
    const merged = mergeMessages(
      [message(1), message(3)],
      [message(2), { ...message(3), body: "sửa" }],
    );
    expect(merged.map((m) => m.body)).toEqual(["tin 1", "tin 2", "sửa"]);
  });

  test("a newest page drops messages deleted in its range and keeps older ones", () => {
    const current = [message(1), message(2), message(3), message(4)];
    const page = { items: [message(4), message(2)], next_before: id(2) };
    expect(mergeNewestPage(current, page).map((m) => m.id)).toEqual([
      id(1),
      id(2),
      id(4),
    ]);
  });

  test("a page without next_before is the whole history", () => {
    const page = { items: [message(5)], next_before: null };
    expect(mergeNewestPage([message(1)], page).map((m) => m.id)).toEqual([
      id(5),
    ]);
    expect(
      mergeNewestPage([message(1)], { items: [], next_before: null }),
    ).toEqual([]);
  });
});

describe("applyFrame", () => {
  test("adds created messages and removes deleted ones", () => {
    const created: ChatFrame = {
      kind: "created",
      roomId: ROOM,
      message: message(2),
    };
    const afterCreate = applyFrame([message(1)], created);
    expect(afterCreate.map((m) => m.id)).toEqual([id(1), id(2)]);
    const deleted: ChatFrame = {
      kind: "deleted",
      roomId: ROOM,
      messageId: id(1),
    };
    expect(applyFrame(afterCreate, deleted).map((m) => m.id)).toEqual([id(2)]);
  });

  test("an update keeps the viewer's own reaction flags, which events leave out", () => {
    const local = message(1, {
      reactions: [{ emoji: "👍", count: 1, mine: true }],
    });
    const frame: ChatFrame = {
      kind: "updated",
      roomId: ROOM,
      message: message(1, {
        reactions: [
          { emoji: "👍", count: 2, mine: false },
          { emoji: "🎉", count: 1, mine: false },
        ],
      }),
    };
    expect(applyFrame([local], frame)[0].reactions).toEqual([
      { emoji: "👍", count: 2, mine: true },
      { emoji: "🎉", count: 1, mine: false },
    ]);
  });

  test("an update for a message that is not loaded is skipped", () => {
    const frame: ChatFrame = {
      kind: "updated",
      roomId: ROOM,
      message: message(9),
    };
    expect(applyFrame([message(1)], frame)).toEqual([message(1)]);
  });
});

describe("toggleReaction", () => {
  test("adds, joins and removes the viewer's reaction", () => {
    const added = toggleReaction(message(1), "👍");
    expect(added.reactions).toEqual([{ emoji: "👍", count: 1, mine: true }]);
    const removed = toggleReaction(added, "👍");
    expect(removed.reactions).toEqual([]);
    const joined = toggleReaction(
      message(1, { reactions: [{ emoji: "🎉", count: 2, mine: false }] }),
      "🎉",
    );
    expect(joined.reactions).toEqual([{ emoji: "🎉", count: 3, mine: true }]);
  });
});

describe("unread and read marks", () => {
  const created: ChatFrame = {
    kind: "created",
    roomId: ROOM,
    message: message(1),
  };

  test("a message from someone else in another room adds one unread", () => {
    expect(unreadAfterFrame({}, created, null, ME)).toEqual({ [ROOM]: 1 });
    expect(unreadAfterFrame({ [ROOM]: 2 }, created, "other", ME)).toEqual({
      [ROOM]: 3,
    });
  });

  test("the open room and the viewer's own messages add nothing", () => {
    expect(unreadAfterFrame({}, created, ROOM, ME)).toEqual({});
    const mine: ChatFrame = {
      ...created,
      message: message(1, { author_id: ME }),
    };
    expect(unreadAfterFrame({}, mine, null, ME)).toEqual({});
  });

  test("the read mark only moves forward", () => {
    expect(needsReadMark(null, id(1))).toBe(true);
    expect(needsReadMark(id(2), id(3))).toBe(true);
    expect(needsReadMark(id(3), id(2))).toBe(false);
    expect(needsReadMark(id(3), undefined)).toBe(false);
  });
});

describe("room caches", () => {
  test("patchCache leaves an unloaded room alone", () => {
    const caches = { [ROOM]: { items: [message(1)], nextBefore: null } };
    expect(patchCache(caches, "other", () => [])).toBe(caches);
    expect(patchCache(caches, ROOM, () => [])[ROOM].items).toEqual([]);
  });

  test("withNewestPage keeps the cursor of older pages already loaded", () => {
    const first = withNewestPage({}, ROOM, {
      items: [message(3), message(2)],
      next_before: id(2),
    });
    expect(first[ROOM].nextBefore).toBe(id(2));
    const older = withOlderPage(first, ROOM, {
      items: [message(1)],
      next_before: null,
    });
    expect(older[ROOM].items.map((m) => m.id)).toEqual([id(1), id(2), id(3)]);
    const polled = withNewestPage(older, ROOM, {
      items: [message(4), message(3)],
      next_before: id(3),
    });
    expect(polled[ROOM].nextBefore).toBeNull();
    expect(polled[ROOM].items.map((m) => m.id)).toEqual([
      id(1),
      id(2),
      id(3),
      id(4),
    ]);
  });
});
