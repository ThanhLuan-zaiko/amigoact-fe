import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiCornerDownRight,
  FiHash,
  FiInfo,
} from "react-icons/fi";
import { Avatar } from "../../core/components/Avatar.tsx";
import { Button } from "../../core/components/Button.tsx";
import { chatRoomHref } from "../inbox-tab.ts";

interface ChatPanelHeaderProps {
  title: string;
  avatarUrl?: string | null;
  subtitle: string | null;
  isChannel: boolean;
  // Sub-thread rooms show a "in {parent}" link back to the parent room.
  parentRoom?: { room_id: string; title: string } | null;
  // Two-screen flow (<lg): back returns to the inbox list.
  onBack?: () => void;
  onInfo: () => void;
}

// Pinned conversation header: back chevron, avatar/hash avatar, title
// + subtitle (or parent-room link for sub-threads), info button.
export function ChatPanelHeader({
  title,
  avatarUrl,
  subtitle,
  isChannel,
  parentRoom = null,
  onBack,
  onInfo,
}: ChatPanelHeaderProps): ReactElement {
  return (
    <header className="flex shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-2 py-2 dark:border-zinc-800 dark:bg-zinc-950">
      {onBack !== undefined && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Quay lại danh sách trò chuyện"
          icon={<FiArrowLeft className="h-5 w-5" aria-hidden="true" />}
        />
      )}
      {isChannel ? (
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          aria-hidden="true"
        >
          <FiHash className="h-5 w-5" />
        </span>
      ) : (
        <Avatar name={title} src={avatarUrl ?? null} size="md" />
      )}
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
          {isChannel ? `# ${title}` : title}
        </h2>
        {parentRoom !== null ? (
          <Link
            to={chatRoomHref(parentRoom.room_id, "all")}
            className="flex items-center gap-1 truncate text-xs text-zinc-500 transition-colors hover:text-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-400 dark:hover:text-zinc-200 dark:focus-visible:outline-zinc-400"
          >
            <FiCornerDownRight className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">trong {parentRoom.title}</span>
          </Link>
        ) : subtitle !== null ? (
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        ) : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onInfo}
        aria-label="Thông tin phòng"
        icon={<FiInfo className="h-5 w-5" aria-hidden="true" />}
      />
    </header>
  );
}
