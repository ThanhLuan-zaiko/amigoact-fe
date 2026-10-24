import type { InboxRoom } from "./api.ts";

export type InboxTab = "all" | "unread" | "threads";

function linkedActivityIds(items: InboxRoom[]): Set<string> {
  return new Set(
    items
      .map((room) => room.activity_id)
      .filter((id): id is string => id !== null),
  );
}

export function tabForRoom(room: InboxRoom): InboxTab {
  return room.kind === "channel" ? "threads" : "all";
}

export function parseInboxTab(value: string | null): InboxTab | null {
  if (value === "all" || value === "unread" || value === "threads") {
    return value;
  }
  return null;
}

export function chatRoomHref(roomId: string, folder?: InboxTab): string {
  const params = new URLSearchParams();
  params.set("room", roomId);
  if (folder !== undefined) params.set("inbox", folder);
  return `/manage/chat?${params.toString()}`;
}

export function roomOnTab(
  room: InboxRoom,
  tab: InboxTab,
  items: InboxRoom[],
): boolean {
  if (tab === "unread") return room.unread > 0;
  if (tab === "threads") return room.kind === "channel";
  const linked = linkedActivityIds(items);
  return (
    room.kind !== "channel" &&
    !(room.kind === "activity" && linked.has(room.room_id))
  );
}

export function filterInboxItems(
  items: InboxRoom[],
  tab: InboxTab,
  term: string,
): InboxRoom[] {
  let list = items;
  if (tab === "unread") {
    list = list.filter((room) => room.unread > 0);
  } else if (tab === "threads") {
    list = list.filter((room) => room.kind === "channel");
  } else {
    const linked = linkedActivityIds(items);
    list = list.filter(
      (room) =>
        room.kind !== "channel" &&
        !(room.kind === "activity" && linked.has(room.room_id)),
    );
  }
  const needle = term.trim().toLowerCase();
  if (needle === "") return list;
  return list.filter((room) =>
    `${room.title} ${room.org_name} ${room.last_body ?? ""}`
      .toLowerCase()
      .includes(needle),
  );
}
