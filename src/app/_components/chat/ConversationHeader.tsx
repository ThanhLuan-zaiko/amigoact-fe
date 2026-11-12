import Link from "next/link";
import { FiArrowLeft, FiBookmark, FiExternalLink } from "react-icons/fi";
import type { ChatRoom } from "@/lib/chat";
import { iconButton } from "../ui";
import ChatAvatar from "./ChatAvatar";
import type { SocketStatus } from "./useChatSocket";

type ConversationHeaderProps = {
  room: ChatRoom;
  typing: string | null;
  status: SocketStatus;
  showPins: boolean;
  onBack: () => void;
  onTogglePins: () => void;
};

const STATUS_TEXT: Record<SocketStatus, string> = {
  live: "Trực tiếp",
  connecting: "Đang kết nối…",
  offline: "Mất kết nối, tự cập nhật mỗi 10 giây",
};

// Green means live. Amber means the page is falling back to polling.
const STATUS_DOT: Record<SocketStatus, string> = {
  live: "bg-green-700 dark:bg-green-400",
  connecting: "bg-slate-400 dark:bg-slate-500",
  offline: "bg-amber-700 dark:bg-amber-400",
};

function subtitle(room: ChatRoom): string {
  if (room.kind === "dm") {
    return `Nhắn riêng · ${room.org.name}`;
  }
  if (room.kind === "channel") {
    return room.topic ? `${room.org.name} · ${room.topic}` : room.org.name;
  }
  return "Phòng chung của tổ chức";
}

export default function ConversationHeader({
  room,
  typing,
  status,
  showPins,
  onBack,
  onTogglePins,
}: ConversationHeaderProps) {
  const channel =
    room.kind === "channel" ? (room.restricted ? "restricted" : "open") : null;
  return (
    <header className="flex items-center gap-2 border-b border-slate-200 px-2 py-2 sm:px-3 dark:border-slate-800">
      <button
        type="button"
        onClick={onBack}
        aria-label="Về danh sách"
        title="Về danh sách"
        className={`${iconButton} border-transparent lg:hidden`}
      >
        <FiArrowLeft aria-hidden="true" />
      </button>
      <ChatAvatar name={room.name} url={room.avatar_url} channel={channel} />
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
          {room.name}
        </h2>
        <p className="flex items-center gap-1.5 truncate text-xs text-slate-500 dark:text-slate-400">
          <span
            aria-hidden="true"
            title={STATUS_TEXT[status]}
            className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[status]}`}
          />
          <output className="sr-only">{STATUS_TEXT[status]}</output>
          {typing ? (
            <span className="truncate text-teal-700 dark:text-teal-400">
              {typing}
            </span>
          ) : (
            <span className="truncate">
              {status === "offline" ? STATUS_TEXT.offline : subtitle(room)}
            </span>
          )}
        </p>
      </div>
      <Link
        href={`/org/${encodeURIComponent(room.org.slug)}`}
        aria-label={`Trang ${room.org.name}`}
        title={`Trang ${room.org.name}`}
        className={`${iconButton} border-transparent`}
      >
        <FiExternalLink aria-hidden="true" />
      </Link>
      <button
        type="button"
        onClick={onTogglePins}
        aria-label={showPins ? "Ẩn tin đã ghim" : "Xem tin đã ghim"}
        aria-pressed={showPins}
        title={showPins ? "Ẩn tin đã ghim" : "Xem tin đã ghim"}
        className={`${iconButton} ${showPins ? "border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400" : "border-transparent"}`}
      >
        <FiBookmark aria-hidden="true" />
      </button>
    </header>
  );
}
