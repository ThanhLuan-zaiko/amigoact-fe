import { describe, expect, test } from "bun:test";
import {
  attempt,
  badgeText,
  CHAT_MESSAGES,
  type ChatMessage,
  type ChatRoom,
  chatError,
  continuesGroup,
  isRoomId,
  MESSAGE_MAX,
  messageRights,
  messengerPath,
  reconnectDelay,
  textLength,
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
    attachments: [],
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
    room_id: GENERAL,
    kind: "org",
    name: "Đội A",
    topic: null,
    restricted: false,
    org: { id: GENERAL, slug: "doi-a", name: "Đội A", logo_url: null },
    avatar_url: null,
    peer_id: null,
    can_manage: false,
    unread: 0,
    last_message: null,
    ...overrides,
  };
}

describe("messageRights", () => {
  const managed = room({ can_manage: true });

  test("the author edits and deletes their own message", () => {
    const rights = messageRights(message(), room(), ME);
    expect(rights.edit).toBe(true);
    expect(rights.delete).toBe(true);
    expect(rights.pin).toBe(false);
  });

  test("a member cannot edit or delete another person's message", () => {
    const rights = messageRights(message({ author_id: OTHER }), room(), ME);
    expect(rights).toMatchObject({ edit: false, delete: false, reply: true });
  });

  test("a manager deletes and pins in org rooms but never edits others", () => {
    const rights = messageRights(message({ author_id: OTHER }), managed, ME);
    expect(rights).toMatchObject({ edit: false, delete: true, pin: true });
  });

  test("in a direct message only the author deletes, and either person pins", () => {
    const dm = room({ kind: "dm", can_manage: true });
    const theirs = messageRights(message({ author_id: OTHER }), dm, ME);
    expect(theirs).toMatchObject({ delete: false, pin: true, edit: false });
    expect(messageRights(message(), dm, ME).delete).toBe(true);
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

  test("the badge caps at 99+", () => {
    expect(badgeText(120)).toBe("99+");
    expect(badgeText(7)).toBe("7");
  });

  test("isRoomId and messengerPath", () => {
    expect(isRoomId(GENERAL)).toBe(true);
    expect(isRoomId("../etc")).toBe(false);
    expect(messengerPath(GENERAL)).toBe(`/messages?room=${GENERAL}`);
    expect(messengerPath(null)).toBe("/messages");
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
