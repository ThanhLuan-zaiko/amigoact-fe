import { describe, expect, test } from "bun:test";
import type { ChatAttachment, ChatMessage, ChatRoom } from "./chat";
import {
  albumTiles,
  attachmentKind,
  fileSize,
  filterRooms,
  foldText,
  inboxAfterFrame,
  lastMessageOf,
  listTime,
  previewLine,
  totalUnread,
  withUnread,
} from "./messenger";

const ME = "0190a000-0000-7000-8000-0000000000aa";
const OTHER = "0190a000-0000-7000-8000-0000000000bb";

function id(n: number): string {
  return `0190a000-0000-7000-8000-${String(n).padStart(12, "0")}`;
}

function room(n: number, overrides: Partial<ChatRoom> = {}): ChatRoom {
  return {
    room_id: id(n),
    kind: "org",
    name: `Phòng ${n}`,
    topic: null,
    restricted: false,
    org: { id: id(900), slug: "doi-a", name: "Đội Xanh", logo_url: null },
    avatar_url: null,
    peer_id: null,
    can_manage: false,
    unread: 0,
    last_message: null,
    ...overrides,
  };
}

function file(kind: "image" | "video", n = 1): ChatAttachment {
  return {
    id: id(500 + n),
    url: `/media/${id(500 + n)}/file`,
    kind,
    mime: kind === "video" ? "video/mp4" : "image/png",
    size_bytes: 2048,
    name: null,
  };
}

function message(n: number, overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: id(n),
    room_id: id(1),
    author_id: OTHER,
    author_name: "Trần Bình",
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

describe("filterRooms", () => {
  const rooms = [
    room(1, { name: "Hậu cần", unread: 2 }),
    room(2, { kind: "dm", name: "Lan" }),
    room(3, { kind: "channel", name: "Truyền thông" }),
  ];

  test("filters by kind and unread", () => {
    expect(filterRooms(rooms, "people", "").map((r) => r.name)).toEqual([
      "Lan",
    ]);
    expect(filterRooms(rooms, "groups", "")).toHaveLength(2);
    expect(filterRooms(rooms, "unread", "").map((r) => r.name)).toEqual([
      "Hậu cần",
    ]);
  });

  test("search ignores Vietnamese marks and matches the organization", () => {
    expect(filterRooms(rooms, "all", "hau can")).toHaveLength(1);
    expect(filterRooms(rooms, "all", "doi xanh")).toHaveLength(3);
    expect(foldText("Đồng Tháp")).toBe("dong thap");
  });
});

describe("previews", () => {
  test("files without text become a word and a count", () => {
    const last = lastMessageOf(
      message(5, { body: "", attachments: [file("image"), file("image", 2)] }),
    );
    expect(last.attachment_kind).toBe("image");
    expect(previewLine(room(1, { last_message: last }), ME)).toBe(
      "Bình: Ảnh (2)",
    );
  });

  test("own messages say Bạn, and a direct message shows the text alone", () => {
    const mine = lastMessageOf(message(5, { author_id: ME, body: "Ok\nnhé" }));
    expect(previewLine(room(1, { last_message: mine }), ME)).toBe(
      "Bạn: Ok nhé",
    );
    const theirs = lastMessageOf(message(6));
    expect(previewLine(room(2, { kind: "dm", last_message: theirs }), ME)).toBe(
      "tin 6",
    );
    expect(previewLine(room(3), ME)).toBe("Chưa có tin nhắn");
  });

  test("attachmentKind names one kind or mixed", () => {
    expect(attachmentKind([])).toBeNull();
    expect(attachmentKind([file("video")])).toBe("video");
    expect(attachmentKind([file("video"), file("image")])).toBe("mixed");
  });
});

describe("listTime", () => {
  const now = new Date("2026-11-12T10:00:00+07:00");

  test("today shows the time, older days a weekday or a date", () => {
    expect(listTime("2026-11-12T08:05:00+07:00", now)).toBe("08:05");
    expect(listTime("2026-11-10T08:05:00+07:00", now)).not.toContain("/");
    expect(listTime("2026-10-01T08:05:00+07:00", now)).toBe("01/10");
    expect(listTime("2025-10-01T08:05:00+07:00", now)).toBe("01/10/25");
  });
});

describe("inboxAfterFrame", () => {
  const rooms = [
    room(1, { last_message: lastMessageOf(message(10)) }),
    room(2, { last_message: lastMessageOf(message(11)) }),
  ];

  test("a new message moves its room to the top and counts when unseen", () => {
    const frame = {
      kind: "created" as const,
      roomId: id(2),
      message: message(20, { room_id: id(2) }),
    };
    const result = inboxAfterFrame(rooms, frame, null, ME);
    expect(result.rooms.map((r) => r.room_id)).toEqual([id(2), id(1)]);
    expect(result.rooms[0].unread).toBe(1);
    expect(result.rooms[0].last_message?.preview).toBe("tin 20");
    expect(inboxAfterFrame(rooms, frame, id(2), ME).rooms[0].unread).toBe(0);
  });

  test("an old or own message does not count", () => {
    const own = {
      kind: "created" as const,
      roomId: id(1),
      message: message(21, { author_id: ME }),
    };
    expect(inboxAfterFrame(rooms, own, null, ME).rooms[0].unread).toBe(0);
    const old = {
      kind: "created" as const,
      roomId: id(1),
      message: message(5),
    };
    expect(inboxAfterFrame(rooms, old, null, ME).rooms).toBe(rooms);
  });

  test("deleting the last message or an unknown room asks for a refresh", () => {
    const gone = { kind: "deleted" as const, roomId: id(1), messageId: id(10) };
    expect(inboxAfterFrame(rooms, gone, null, ME).stale).toBe(true);
    const unknown = {
      kind: "created" as const,
      roomId: id(99),
      message: message(30),
    };
    expect(inboxAfterFrame(rooms, unknown, null, ME).stale).toBe(true);
  });

  test("revoked removes the room", () => {
    const result = inboxAfterFrame(
      rooms,
      { kind: "revoked", roomId: id(1) },
      null,
      ME,
    );
    expect(result.rooms.map((r) => r.room_id)).toEqual([id(2)]);
  });
});

describe("small helpers", () => {
  test("unread counts", () => {
    const rooms = [room(1, { unread: 3 }), room(2, { unread: 4 })];
    expect(totalUnread(rooms)).toBe(7);
    expect(totalUnread(withUnread(rooms, id(1), 0))).toBe(4);
  });

  test("albumTiles shows four tiles, the first wide for three, and +N", () => {
    expect(albumTiles([1, 2, 3]).map((t) => t.wide)).toEqual([
      true,
      false,
      false,
    ]);
    const six = albumTiles([1, 2, 3, 4, 5, 6]);
    expect(six).toHaveLength(4);
    expect(six[3].more).toBe(2);
  });

  test("fileSize", () => {
    expect(fileSize(2048)).toBe("2 KB");
    expect(fileSize(5 * 1024 * 1024)).toBe("5,0 MB");
  });
});
