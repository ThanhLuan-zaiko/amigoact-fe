import type { ReactElement } from "react";
import { FiX } from "react-icons/fi";
import type { ChatAttachment } from "../api.ts";

interface ChatPendingChipsProps {
  items: ChatAttachment[];
  onRemove: (mediaId: string) => void;
}

// Staged uploads sitting above the composer, before they are sent.
export function ChatPendingChips({
  items,
  onRemove,
}: ChatPendingChipsProps): ReactElement {
  return (
    <div className="mb-1.5 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item.media_id}
          className="flex max-w-[180px] items-center gap-1 rounded-full border border-zinc-200 px-2.5 py-1 text-xs dark:border-zinc-700"
        >
          <span className="truncate">{item.name}</span>
          <button
            type="button"
            aria-label={`Bỏ ${item.name}`}
            onClick={() => onRemove(item.media_id)}
          >
            <FiX className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </span>
      ))}
    </div>
  );
}
