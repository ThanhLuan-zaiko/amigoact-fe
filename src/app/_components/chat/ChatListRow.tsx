import { badgeText, type ChatRoom } from "@/lib/chat";
import { listTime, previewLine } from "@/lib/messenger";
import ChatAvatar from "./ChatAvatar";

type ChatListRowProps = {
  room: ChatRoom;
  // "Lan đang nhập…" replaces the last message while someone types.
  typing: string | null;
  active: boolean;
  viewerId: string;
  onSelect: (roomId: string) => void;
};

// One conversation: picture, name, the last message and its time, and the unread count.
export default function ChatListRow({
  room,
  typing,
  active,
  viewerId,
  onSelect,
}: ChatListRowProps) {
  const unread = room.unread > 0;
  const channel =
    room.kind === "channel" ? (room.restricted ? "restricted" : "open") : null;
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(room.room_id)}
        aria-current={active ? "true" : undefined}
        className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-teal-700 dark:focus-visible:outline-teal-400 ${
          active
            ? "border-teal-700 bg-teal-50 dark:border-teal-400 dark:bg-teal-950/40"
            : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/60"
        }`}
      >
        <ChatAvatar name={room.name} url={room.avatar_url} channel={channel} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-baseline gap-2">
            <span
              className={`min-w-0 flex-1 truncate text-sm text-slate-900 dark:text-slate-100 ${unread ? "font-bold" : "font-semibold"}`}
            >
              {room.name}
              {room.kind !== "org" ? (
                <span className="font-normal text-slate-500 dark:text-slate-400">
                  {" "}
                  · {room.org.name}
                </span>
              ) : null}
            </span>
            {room.last_message ? (
              <time
                dateTime={room.last_message.created_at}
                className={`shrink-0 text-xs ${unread ? "font-semibold text-teal-700 dark:text-teal-400" : "text-slate-500 dark:text-slate-400"}`}
              >
                {listTime(room.last_message.created_at)}
              </time>
            ) : null}
          </span>
          <span className="flex items-center gap-2">
            {typing ? (
              <span className="min-w-0 flex-1 truncate text-sm text-teal-700 dark:text-teal-400">
                {typing}
              </span>
            ) : (
              <span
                className={`min-w-0 flex-1 truncate text-sm ${unread ? "text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"}`}
              >
                {previewLine(room, viewerId)}
              </span>
            )}
            {unread ? (
              <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-teal-700 px-1.5 py-0.5 text-xs leading-none font-bold text-white dark:bg-teal-400 dark:text-teal-950">
                <span className="sr-only">Chưa đọc: </span>
                {badgeText(room.unread)}
              </span>
            ) : null}
          </span>
        </span>
      </button>
    </li>
  );
}
