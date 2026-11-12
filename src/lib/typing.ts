// Who is typing in which room. Pure, so bun tests cover it.
// The socket carries a "typing" event at most every two seconds per person and room;
// a person stays shown for a few seconds after the last one, or until their message lands.
import type { RoomKind } from "./chat";

// How long a signal keeps someone shown, and how often the composer sends one.
export const TYPING_SHOW_MS = 6_000;
export const TYPING_SEND_MS = 3_000;

export type Typist = { userId: string; name: string; until: number };
export type TypingMap = Record<string, Typist[]>;

export function addTypist(
  map: TypingMap,
  roomId: string,
  userId: string,
  name: string,
  now: number,
): TypingMap {
  const others = (map[roomId] ?? []).filter((item) => item.userId !== userId);
  return {
    ...map,
    [roomId]: [...others, { userId, name, until: now + TYPING_SHOW_MS }],
  };
}

// A message from the person ends their typing at once.
export function dropTypist(
  map: TypingMap,
  roomId: string,
  userId: string,
): TypingMap {
  const current = map[roomId];
  if (!current?.some((item) => item.userId === userId)) {
    return map;
  }
  const rest = current.filter((item) => item.userId !== userId);
  const next = { ...map, [roomId]: rest };
  if (rest.length === 0) {
    delete next[roomId];
  }
  return next;
}

// Removes people whose last signal is too old. Returns the same map when nothing changed.
export function pruneTyping(map: TypingMap, now: number): TypingMap {
  let changed = false;
  const next: TypingMap = {};
  for (const [roomId, typists] of Object.entries(map)) {
    const alive = typists.filter((item) => item.until > now);
    changed ||= alive.length !== typists.length;
    if (alive.length > 0) {
      next[roomId] = alive;
    }
  }
  return changed ? next : map;
}

function shortName(name: string): string {
  return name.trim().split(/\s+/).at(-1) || "Ai đó";
}

// "đang nhập…" in a direct message, "Lan đang nhập…", "Lan và Bình đang nhập…",
// or "Lan và 2 người khác đang nhập…" in a group. Null when nobody types.
export function typingText(
  typists: Typist[] | undefined,
  kind: RoomKind,
): string | null {
  if (!typists || typists.length === 0) {
    return null;
  }
  if (kind === "dm") {
    return "đang nhập…";
  }
  const [first, second] = typists.map((item) => shortName(item.name));
  if (typists.length === 1) {
    return `${first} đang nhập…`;
  }
  if (typists.length === 2) {
    return `${first} và ${second} đang nhập…`;
  }
  return `${first} và ${typists.length - 1} người khác đang nhập…`;
}
