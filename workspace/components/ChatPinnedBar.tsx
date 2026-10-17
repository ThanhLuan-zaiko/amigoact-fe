import type { ReactElement } from "react";
import { FiPaperclip, FiX } from "react-icons/fi";
import type { ChatMessage } from "../api.ts";

interface ChatPinnedBarProps {
  pinned: ChatMessage;
  // Managers see the unpin affordance; everyone else just sees the bar.
  canManage: boolean;
  onUnpin: () => void;
}

// Telegram pinned strip under the room header: the room's single pinned
// slot rendered as a quote, with a dismiss affordance for managers.
export function ChatPinnedBar({
  pinned,
  canManage,
  onUnpin,
}: ChatPinnedBarProps): ReactElement {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
      <FiPaperclip
        className="h-4 w-4 shrink-0 rotate-90 text-zinc-500 dark:text-zinc-400"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1 border-l-2 border-zinc-400 pl-2 dark:border-zinc-500">
        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          Tin nhắn đã ghim · {pinned.author_name}
        </p>
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {pinned.body !== "" ? pinned.body : "Đính kèm tệp"}
        </p>
      </div>
      {canManage && (
        <button
          type="button"
          onClick={onUnpin}
          aria-label="Bỏ ghim tin nhắn"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <FiX className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
