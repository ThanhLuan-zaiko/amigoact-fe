// Pure helpers for the organization chat. No server or browser APIs, so bun tests cover them.

export const MESSAGE_MAX = 2000;
export const PAGE_SIZE = 50;
// Polling is the fallback when the socket is down. The socket carries the live updates.
export const POLL_INTERVAL_MS = 10_000;
export const PING_INTERVAL_MS = 25_000;
export const QUICK_EMOJI = ["👍", "❤️", "😂", "🎉", "😮", "🙏"];

export type ReactionCount = { emoji: string; count: number; mine: boolean };

export type ReplyPreview = { id: string; author_name: string; body: string };

export type ChatMessage = {
  id: string;
  room_id: string;
  author_id: string;
  author_name: string;
  body: string;
  reply_to: ReplyPreview | null;
  reactions: ReactionCount[];
  pinned: boolean;
  edited_at: string | null;
  created_at: string;
};

export type MessagePage = { items: ChatMessage[]; next_before: string | null };

export type ChatChannel = {
  id: string;
  name: string;
  topic: string | null;
  visibility: string;
  archived: boolean;
  created_at: string;
};

export type ChatDm = { room_id: string; peer_id: string; peer_name: string };

export type UnreadItem = { room_id: string; count: number };

export type RoomKind = "org" | "channel" | "dm";

export type ChatRoom = {
  id: string;
  kind: RoomKind;
  name: string;
  topic: string | null;
  archived: boolean;
  restricted: boolean;
};

export type ChatViewer = { userId: string; canManage: boolean };

export type MessageRights = {
  reply: boolean;
  react: boolean;
  edit: boolean;
  delete: boolean;
  pin: boolean;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isRoomId(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function chatPath(slug: string, roomId?: string | null): string {
  const base = `/org/${encodeURIComponent(slug)}/chat`;
  return roomId ? `${base}?room=${encodeURIComponent(roomId)}` : base;
}

// The general room first, then open channels before restricted ones, archived channels last,
// then direct messages by the other person's name.
export function buildRooms(
  general: { id: string; name: string },
  channels: ChatChannel[],
  dms: ChatDm[],
): ChatRoom[] {
  const channelRooms = channels
    .map(
      (channel): ChatRoom => ({
        id: channel.id,
        kind: "channel",
        name: channel.name,
        topic: channel.topic,
        archived: channel.archived,
        restricted: channel.visibility === "restricted",
      }),
    )
    .sort(
      (a, b) =>
        Number(a.archived) - Number(b.archived) ||
        Number(a.restricted) - Number(b.restricted) ||
        a.name.localeCompare(b.name, "vi"),
    );
  const dmRooms = [...dms]
    .sort((a, b) => a.peer_name.localeCompare(b.peer_name, "vi"))
    .map(
      (dm): ChatRoom => ({
        id: dm.room_id,
        kind: "dm",
        name: dm.peer_name,
        topic: null,
        archived: false,
        restricted: false,
      }),
    );
  const generalRoom: ChatRoom = {
    id: general.id,
    kind: "org",
    name: general.name,
    topic: null,
    archived: false,
    restricted: false,
  };
  return [generalRoom, ...channelRooms, ...dmRooms];
}

// Unknown or missing rooms fall back to the general room, which is always first.
export function pickRoom(rooms: ChatRoom[], wanted: unknown): ChatRoom {
  return rooms.find((room) => room.id === wanted) ?? rooms[0];
}

export function unreadMap(items: UnreadItem[]): Record<string, number> {
  return Object.fromEntries(items.map((item) => [item.room_id, item.count]));
}

export function unreadTotal(
  unread: Record<string, number>,
  roomIds: string[],
): number {
  return roomIds.reduce((total, id) => total + (unread[id] ?? 0), 0);
}

export function badgeText(count: number): string {
  return count > 99 ? "99+" : String(count);
}

// Mirrors the backend rules in amigoact-be/src/chat: only the author edits, nothing is written
// to an archived channel, managers moderate org rooms, and in a direct message only the author
// deletes while either person pins.
export function messageRights(
  message: ChatMessage,
  room: ChatRoom,
  viewer: ChatViewer,
): MessageRights {
  const mine = message.author_id === viewer.userId;
  const writable = !room.archived;
  const moderator = room.kind === "dm" ? false : viewer.canManage;
  return {
    reply: writable,
    react: writable,
    edit: mine && writable,
    delete: mine || moderator,
    pin: room.kind === "dm" ? true : viewer.canManage,
  };
}

export const CHAT_MESSAGES = {
  empty: "Hãy nhập nội dung tin nhắn.",
  tooLong: `Tin nhắn tối đa ${MESSAGE_MAX} ký tự.`,
  invalid: "Tin nhắn có ký tự không hợp lệ.",
  archived: "Kênh đã lưu trữ, chỉ đọc được.",
  loadFailed: "Không tải được tin nhắn. Vui lòng thử lại.",
};

// Control characters except tab and line breaks. The backend refuses them, and NUL crashes PostgreSQL.
// biome-ignore lint/suspicious/noControlCharactersInRegex: the pattern exists to find control characters.
const CONTROL_PATTERN = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

// Counts code points like the backend, so an emoji counts as one character.
export function textLength(value: string): number {
  return [...value].length;
}

export function validateMessage(body: string): string | null {
  const text = body.trim();
  if (!text) {
    return CHAT_MESSAGES.empty;
  }
  if (CONTROL_PATTERN.test(text)) {
    return CHAT_MESSAGES.invalid;
  }
  return textLength(text) > MESSAGE_MAX ? CHAT_MESSAGES.tooLong : null;
}

const ERROR_TEXT: Record<string, string> = {
  room_not_found:
    "Không tìm thấy phòng chat này, hoặc bạn không còn quyền vào.",
  channel_archived: CHAT_MESSAGES.archived,
  message_not_found: "Tin nhắn này không còn nữa.",
  message_forbidden: "Bạn không có quyền làm việc này với tin nhắn.",
  not_in_room: "Tin được trả lời không còn trong phòng này.",
  not_a_member: "Người này không còn là thành viên của tổ chức.",
  self_dm: "Bạn không thể nhắn tin cho chính mình.",
  organization_forbidden: "Chỉ thành viên mới dùng được chat.",
  rate_limited: "Bạn gửi quá nhiều tin. Vui lòng đợi một lúc rồi thử lại.",
  network_error: "Không kết nối được máy chủ. Vui lòng thử lại.",
  string_too_long: CHAT_MESSAGES.tooLong,
  string_too_short: CHAT_MESSAGES.empty,
  text_invalid: CHAT_MESSAGES.invalid,
};

export function chatError(code: string, issues: { type: string }[] = []) {
  for (const issue of issues) {
    const text = ERROR_TEXT[issue.type];
    if (text) {
      return text;
    }
  }
  return ERROR_TEXT[code] ?? "Đã có lỗi xảy ra. Vui lòng thử lại.";
}

// 1 s, 2 s, 4 s ... up to 30 s between reconnect attempts.
export function reconnectDelay(attempt: number): number {
  return Math.min(30_000, 1000 * 2 ** Math.max(0, attempt));
}

const timeFormat = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
});

const dayFormat = new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function messageTime(value: string): string {
  return timeFormat.format(new Date(value));
}

export function messageDay(value: string): string {
  return dayFormat.format(new Date(value));
}

const GROUP_GAP_MS = 5 * 60 * 1000;

// A message joins the one before it when the same person wrote it on the same day, within
// five minutes and not as a reply, so the name and time are shown once.
export function continuesGroup(
  previous: ChatMessage | undefined,
  message: ChatMessage,
): boolean {
  if (!previous || previous.author_id !== message.author_id) {
    return false;
  }
  if (message.reply_to) {
    return false;
  }
  if (messageDay(previous.created_at) !== messageDay(message.created_at)) {
    return false;
  }
  const gap =
    new Date(message.created_at).getTime() -
    new Date(previous.created_at).getTime();
  return gap >= 0 && gap < GROUP_GAP_MS;
}

// What a chat Server Action returns to the client. The error is already in Vietnamese.
export type ChatResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: string };

// A Server Action call throws when the network or the dev server is down. The chat turns that
// into an ordinary failure, so a dropped connection shows a message instead of the error page.
export async function attempt<T>(
  run: () => Promise<ChatResult<T>>,
): Promise<ChatResult<T>> {
  try {
    return await run();
  } catch {
    return {
      ok: false,
      code: "network_error",
      error: chatError("network_error"),
    };
  }
}
