// Pure helpers for the messenger page: the inbox list, its previews and the media album.
// No server or browser APIs, so bun tests cover them.
import type {
  ChatAttachment,
  ChatMessage,
  ChatRoom,
  LastMessage,
} from "./chat";
import type { ChatFrame } from "./chatEvents";

export type InboxFilter = "all" | "unread" | "groups" | "people";

export const INBOX_FILTERS: { value: InboxFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "unread", label: "Chưa đọc" },
  { value: "groups", label: "Nhóm" },
  { value: "people", label: "Cá nhân" },
];

const PREVIEW_MAX = 120;

// Lower case without Vietnamese marks, so "hau can" finds "Hậu cần".
export function foldText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function filterRooms(
  rooms: ChatRoom[],
  filter: InboxFilter,
  query: string,
): ChatRoom[] {
  const needle = foldText(query.trim());
  return rooms.filter((room) => {
    if (filter === "unread" && room.unread === 0) {
      return false;
    }
    if (filter === "groups" && room.kind === "dm") {
      return false;
    }
    if (filter === "people" && room.kind !== "dm") {
      return false;
    }
    return (
      !needle ||
      foldText(room.name).includes(needle) ||
      foldText(room.org.name).includes(needle)
    );
  });
}

export function attachmentKind(
  files: Pick<ChatAttachment, "kind">[],
): LastMessage["attachment_kind"] {
  const kinds = new Set(files.map((file) => file.kind));
  if (kinds.size === 0) {
    return null;
  }
  return kinds.size > 1 ? "mixed" : (files[0]?.kind ?? null);
}

export function lastMessageOf(message: ChatMessage): LastMessage {
  return {
    id: message.id,
    author_id: message.author_id,
    author_name: message.author_name,
    preview: message.body.split(/\s+/).join(" ").trim().slice(0, PREVIEW_MAX),
    attachment_kind: attachmentKind(message.attachments),
    attachment_count: message.attachments.length,
    created_at: message.created_at,
  };
}

const FILE_WORDS: Record<
  NonNullable<LastMessage["attachment_kind"]>,
  string
> = {
  image: "Ảnh",
  video: "Video",
  mixed: "Ảnh và video",
};

// "Bạn: Hẹn 8h nhé", "Lan: Ảnh (3)", or the text alone in a direct message from the other person.
export function previewLine(room: ChatRoom, viewerId: string): string {
  const last = room.last_message;
  if (!last) {
    return room.kind === "dm" ? "Bắt đầu trò chuyện" : "Chưa có tin nhắn";
  }
  let text = last.preview;
  if (!text && last.attachment_kind) {
    const word = FILE_WORDS[last.attachment_kind];
    text =
      last.attachment_count > 1 ? `${word} (${last.attachment_count})` : word;
  }
  if (last.author_id === viewerId) {
    return `Bạn: ${text}`;
  }
  if (room.kind === "dm") {
    return text;
  }
  const name = last.author_name.trim().split(/\s+/).at(-1) || "Thành viên";
  return `${name}: ${text}`;
}

const ZONE = "Asia/Ho_Chi_Minh";
const clock = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: ZONE,
});
const weekday = new Intl.DateTimeFormat("vi-VN", {
  weekday: "short",
  timeZone: ZONE,
});
const dateParts = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  timeZone: ZONE,
});

// Built from parts, because vi-VN writes a day and month without a year as "01-10".
function shortDate(date: Date, withYear: boolean): string {
  const part = (type: string) =>
    dateParts.formatToParts(date).find((item) => item.type === type)?.value;
  const text = `${part("day")}/${part("month")}`;
  return withYear ? `${text}/${part("year")}` : text;
}
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: ZONE });

const DAY_MS = 24 * 60 * 60 * 1000;

// Today shows the time, this week the weekday, this year the day and month, older the full date.
export function listTime(value: string, now: Date = new Date()): string {
  const date = new Date(value);
  const days = Math.round(
    (Date.parse(dayKey.format(now)) - Date.parse(dayKey.format(date))) / DAY_MS,
  );
  if (days <= 0) {
    return clock.format(date);
  }
  if (days < 7) {
    return weekday.format(date);
  }
  const sameYear =
    dayKey.format(now).slice(0, 4) === dayKey.format(date).slice(0, 4);
  return shortDate(date, !sameYear);
}

// Moves a room to the top, as a new message does in every messenger.
function toTop(rooms: ChatRoom[], room: ChatRoom): ChatRoom[] {
  return [room, ...rooms.filter((item) => item.room_id !== room.room_id)];
}

// What a socket frame changes in the inbox. Returns true in "stale" when the list should be
// fetched again, because the last message of a room was deleted.
export function inboxAfterFrame(
  rooms: ChatRoom[],
  frame: ChatFrame,
  activeId: string | null,
  viewerId: string,
): { rooms: ChatRoom[]; stale: boolean } {
  if (frame.kind === "revoked") {
    return {
      rooms: rooms.filter((room) => room.room_id !== frame.roomId),
      stale: false,
    };
  }
  if (
    frame.kind !== "created" &&
    frame.kind !== "updated" &&
    frame.kind !== "deleted"
  ) {
    return { rooms, stale: false };
  }
  const room = rooms.find((item) => item.room_id === frame.roomId);
  if (!room) {
    return { rooms, stale: frame.kind === "created" };
  }
  if (frame.kind === "created") {
    if (room.last_message && room.last_message.id >= frame.message.id) {
      return { rooms, stale: false };
    }
    const counts =
      frame.message.author_id !== viewerId && frame.roomId !== activeId;
    const next = {
      ...room,
      last_message: lastMessageOf(frame.message),
      unread: counts ? room.unread + 1 : room.unread,
    };
    return { rooms: toTop(rooms, next), stale: false };
  }
  if (frame.kind === "updated" && room.last_message?.id === frame.message.id) {
    const next = { ...room, last_message: lastMessageOf(frame.message) };
    return {
      rooms: rooms.map((item) => (item.room_id === room.room_id ? next : item)),
      stale: false,
    };
  }
  if (frame.kind === "deleted") {
    return { rooms, stale: room.last_message?.id === frame.messageId };
  }
  return { rooms, stale: false };
}

export function withUnread(
  rooms: ChatRoom[],
  roomId: string,
  unread: number,
): ChatRoom[] {
  return rooms.map((room) =>
    room.room_id === roomId && room.unread !== unread
      ? { ...room, unread }
      : room,
  );
}

export function totalUnread(rooms: ChatRoom[]): number {
  return rooms.reduce((total, room) => total + room.unread, 0);
}

// How an album lays out: up to four tiles, the first one wide when there are three,
// and a "+N" on the last tile for the files that do not fit.
export function albumTiles<T>(
  files: T[],
): { file: T; index: number; wide: boolean; more: number }[] {
  const shown = files.slice(0, 4);
  const hidden = files.length - shown.length;
  return shown.map((file, index) => ({
    file,
    index,
    wide: files.length === 3 && index === 0,
    more: index === shown.length - 1 ? hidden : 0,
  }));
}

export function fileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
