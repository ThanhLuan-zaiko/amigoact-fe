import { describe, expect, test } from "bun:test";
import {
  attempt,
  badgeText,
  buildRooms,
  CHAT_MESSAGES,
  type ChatMessage,
  type ChatRoom,
  chatError,
  chatPath,
  continuesGroup,
  isRoomId,
  MESSAGE_MAX,
  messageRights,
  pickRoom,
  reconnectDelay,
  textLength,
  unreadMap,
  unreadTotal,
  validateMessage,
} from "./chat";

const GENERAL = "0190a000-0000-7000-8000-000000000001";
const ME = "0190a000-0000-7000-8000-0000000000aa";
const OTHER = "0190a000-0000-7000-8000-0000000000bb";

function message(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "0190a000-0000-7000-8000-000000000100",
    room_id: GENERAL,
    author_id: ME,
    author_name: "Lan",
    body: "Xin chào",
    reply_to: null,
    reactions: [],
    pinned: false,
    edited_at: null,
    created_at: "2026-11-10T03:00:00Z",
    ...overrides,
  };
}

function room(overrides: Partial<ChatRoom> = {}): ChatRoom {
  return {
    id: GENERAL,
    kind: "org",
    name: "Phòng chung",
    topic: null,
    archived: false,
    restricted: false,
    ...overrides,
  };
}

describe("buildRooms", () => {
  const channel = (name: string, extra: object = {}) => ({
    id: `id-${name}`,
    name,
    topic: null,
    visibility: "open",
    archived: false,
    created_at: "2026-11-01T00:00:00Z",
    ...extra,
  });

  test("puts the general room first, then channels, then direct messages", () => {
    const rooms = buildRooms(
      { id: GENERAL, name: "Phòng chung" },
      [channel("Hậu cần")],
      [{ room_id: "dm-1", peer_id: OTHER, peer_name: "Bình" }],
    );
    expect(rooms.map((r) => r.kind)).toEqual(["org", "channel", "dm"]);
    expect(rooms[2].name).toBe("Bình");
  });

  test("orders open channels before restricted ones and archived ones last", () => {
    const rooms = buildRooms(
      { id: GENERAL, name: "Phòng chung" },
      [
        channel("Cũ", { archived: true }),
        channel("Ban điều hành", { visibility: "restricted" }),
        channel("Truyền thông"),
        channel("Âm thanh"),
      ],
      [],
    );
    expect(rooms.slice(1).map((r) => r.name)).toEqual([
      "Âm thanh",
      "Truyền thông",
      "Ban điều hành",
      "Cũ",
    ]);
    expect(rooms[3].restricted).toBe(true);
    expect(rooms[4].archived).toBe(true);
  });

  test("pickRoom falls back to the general room for an unknown ID", () => {
    const rooms = buildRooms({ id: GENERAL, name: "Phòng chung" }, [], []);
    expect(pickRoom(rooms, "nope").id).toBe(GENERAL);
    expect(pickRoom(rooms, null).id).toBe(GENERAL);
  });
});

describe("messageRights", () => {
  const member = { userId: ME, canManage: false };
  const manager = { userId: ME, canManage: true };

  test("the author edits and deletes their own message", () => {
    const rights = messageRights(message(), room(), member);
    expect(rights.edit).toBe(true);
    expect(rights.delete).toBe(true);
    expect(rights.pin).toBe(false);
  });

  test("a member cannot edit or delete another person's message", () => {
    const rights = messageRights(message({ author_id: OTHER }), room(), member);
    expect(rights).toMatchObject({ edit: false, delete: false, reply: true });
  });

  test("a manager deletes and pins in org rooms but never edits others", () => {
    const rights = messageRights(
      message({ author_id: OTHER }),
      room(),
      manager,
    );
    expect(rights).toMatchObject({ edit: false, delete: true, pin: true });
  });

  test("in a direct message only the author deletes, and either person pins", () => {
    const dm = room({ kind: "dm" });
    const theirs = messageRights(message({ author_id: OTHER }), dm, manager);
    expect(theirs).toMatchObject({ delete: false, pin: true, edit: false });
    expect(messageRights(message(), dm, member).delete).toBe(true);
  });

  test("an archived channel can be read but not written to", () => {
    const archived = room({ kind: "channel", archived: true });
    const rights = messageRights(message(), archived, manager);
    expect(rights).toMatchObject({
      edit: false,
      reply: false,
      react: false,
      delete: true,
    });
  });
});

describe("validateMessage", () => {
  test("refuses empty and whitespace-only text", () => {
    expect(validateMessage("")).toBe(CHAT_MESSAGES.empty);
    expect(validateMessage("  \n ")).toBe(CHAT_MESSAGES.empty);
  });

  test("allows line breaks and refuses other control characters", () => {
    expect(validateMessage("dòng 1\ndòng 2")).toBeNull();
    expect(validateMessage("a\u0000b")).toBe(CHAT_MESSAGES.invalid);
  });

  test("counts an emoji as one character like the backend", () => {
    expect(textLength("👍")).toBe(1);
    expect(validateMessage("👍".repeat(MESSAGE_MAX))).toBeNull();
    expect(validateMessage("a".repeat(MESSAGE_MAX + 1))).toBe(
      CHAT_MESSAGES.tooLong,
    );
  });
});

describe("chatError", () => {
  test("translates known codes and issue types", () => {
    expect(chatError("channel_archived")).toBe(CHAT_MESSAGES.archived);
    expect(chatError("validation_error", [{ type: "string_too_long" }])).toBe(
      CHAT_MESSAGES.tooLong,
    );
  });

  test("falls back to a general message", () => {
    expect(chatError("something_new")).toContain("Đã có lỗi");
  });
});

describe("small helpers", () => {
  test("reconnectDelay doubles up to 30 seconds", () => {
    expect([0, 1, 2, 10].map(reconnectDelay)).toEqual([
      1000, 2000, 4000, 30_000,
    ]);
  });

  test("unread counts add up and the badge caps at 99+", () => {
    const unread = unreadMap([
      { room_id: "a", count: 3 },
      { room_id: "b", count: 120 },
    ]);
    expect(unreadTotal(unread, ["a", "b", "c"])).toBe(123);
    expect(badgeText(120)).toBe("99+");
    expect(badgeText(7)).toBe("7");
  });

  test("isRoomId and chatPath", () => {
    expect(isRoomId(GENERAL)).toBe(true);
    expect(isRoomId("../etc")).toBe(false);
    expect(chatPath("doi-a", GENERAL)).toBe(`/org/doi-a/chat?room=${GENERAL}`);
    expect(chatPath("doi-a", null)).toBe("/org/doi-a/chat");
  });

  test("continuesGroup joins close messages of one author only", () => {
    const first = message();
    const soon = message({ id: "x2", created_at: "2026-11-10T03:02:00Z" });
    const late = message({ id: "x3", created_at: "2026-11-10T03:30:00Z" });
    expect(continuesGroup(first, soon)).toBe(true);
    expect(continuesGroup(first, late)).toBe(false);
    expect(continuesGroup(first, { ...soon, author_id: OTHER })).toBe(false);
    expect(
      continuesGroup(first, {
        ...soon,
        reply_to: { id: first.id, author_name: "Lan", body: "Xin chào" },
      }),
    ).toBe(false);
    expect(continuesGroup(undefined, first)).toBe(false);
  });
});

describe("attempt", () => {
  test("turns a thrown Server Action call into a network failure", async () => {
    const failed = await attempt(async () => {
      throw new TypeError("Failed to fetch");
    });
    expect(failed).toMatchObject({ ok: false, code: "network_error" });
    const passed = await attempt(async () => ({ ok: true, data: 1 }));
    expect(passed).toEqual({ ok: true, data: 1 });
  });
});
