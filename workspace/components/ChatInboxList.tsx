import { useEffect } from "react";
import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import {
  FiCornerDownRight,
  FiHash,
  FiVolumeX,
} from "react-icons/fi";
import { Avatar } from "../../core/components/Avatar.tsx";
import type { InboxRoom } from "../api.ts";
import { formatInboxTime } from "../messages.tsx";

const ROW =
  "flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-zinc-50 " +
  "focus-visible:outline-2 focus-visible:-outline-offset-2 " +
  "focus-visible:outline-zinc-500 dark:hover:bg-zinc-900 " +
  "dark:focus-visible:outline-zinc-400";

const UNREAD_DISC =
  "flex h-[22px] min-w-[22px] shrink-0 items-center justify-center " +
  "rounded-full bg-zinc-900 px-1.5 text-xs font-bold text-white " +
  "dark:bg-zinc-100 dark:text-zinc-950";

// Preview line: org context prefixes non-general rooms (a merged inbox
// mixes communities, so dm/activity rows name their org like Telegram
// folder labels); group rooms lead with the author, dm rows just text.
function previewOf(
  room: InboxRoom,
  parent: InboxRoom | undefined,
): string {
  const body = (room.last_body ?? "").replace(/\s+/g, " ").trim();
  const base =
    body === ""
      ? "Chưa có tin nhắn"
      : room.kind === "dm"
        ? body
        : `${room.last_author_name ?? "?"}: ${body}`;
  // Sub-thread rows name their parent room (more useful context than
  // the org alone); top rooms keep the org prefix.
  if (room.parent_room_id !== null) {
    return `${parent?.title ?? room.org_name} · ${base}`;
  }
  return room.kind === "general" ? base : `${room.org_name} · ${base}`;
}

interface ChatInboxListProps {
  items: InboxRoom[];
  activeRoomId: string | null;
  /** Room row target: keeps the current query params (org filter). */
  makeTo: (room: InboxRoom) => string;
}

// Telegram conversation rows: avatar, title + clock, one-line preview +
// unread disc. Shared by the right rail (lg+) and the phone list screen.
export function ChatInboxList({
  items,
  activeRoomId,
  makeTo,
}: ChatInboxListProps): ReactElement {
  const byId = new Map(items.map((room) => [room.room_id, room]));
  useEffect(() => {
    if (activeRoomId === null) return;
    const node = document.querySelector(
      `[data-inbox-id="${CSS.escape(activeRoomId)}"]`,
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [activeRoomId]);
  return (
    <ul aria-label="Danh sách cuộc trò chuyện">
      {items.map((room) => {
        const active = room.room_id === activeRoomId;
        // Sub-thread rooms get the nested marker instead of the
        // channel hash so rows read as "child of {parent}".
        const isThread = room.parent_room_id !== null;
        const parent =
          room.parent_room_id !== null
            ? byId.get(room.parent_room_id)
            : undefined;
        return (
          <li key={room.room_id}>
            <Link
              to={makeTo(room)}
              data-inbox-id={room.room_id}
              aria-current={active ? "page" : undefined}
              className={`${ROW} ${
                active
                  ? "border-l-[3px] border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-900"
                  : "border-l-[3px] border-transparent"
              }`}
            >
              {room.kind === "channel" ? (
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                  aria-hidden="true"
                >
                  {isThread ? (
                    <FiCornerDownRight className="h-5 w-5" />
                  ) : (
                    <FiHash className="h-5 w-5" />
                  )}
                </span>
              ) : (
                <Avatar
                  name={room.title}
                  src={room.avatar_url}
                  size="md"
                />
              )}
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
                    {room.title}
                  </span>
                  <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                    {formatInboxTime(room.last_at ?? room.sort_at)}
                  </span>
                </span>
                <span className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-sm text-zinc-500 dark:text-zinc-400">
                    {previewOf(room, parent)}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {room.muted && (
                      <FiVolumeX
                        className="h-4 w-4 text-zinc-400 dark:text-zinc-500"
                        aria-label="Đã tắt thông báo"
                      />
                    )}
                    {room.unread > 0 && (
                      <span
                        className={`${UNREAD_DISC} ${
                          room.muted
                            ? "bg-zinc-300 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                            : ""
                        }`}
                        aria-label={`${room.unread} tin chưa đọc`}
                      >
                        {room.unread > 99 ? "99+" : room.unread}
                      </span>
                    )}
                  </span>
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
