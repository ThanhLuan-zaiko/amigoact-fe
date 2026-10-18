import { useState } from "react";
import type { ReactElement } from "react";
import { Avatar } from "../../core/components/Avatar.tsx";
import { AvatarStack } from "../../core/components/AvatarStack.tsx";
import { Modal } from "../../core/components/Modal.tsx";
import type { ChatReadEntry } from "../api.ts";
import { seenReaders } from "../chat-seen.ts";
import { formatTime } from "../messages.tsx";

interface ChatSeenByProps {
  readers: ChatReadEntry[];
  authorId: string;
  messageId: string;
}

// Seen-by count + avatar stack under the sender's latest bubble in group
// rooms. The row opens the full readers list (names + read times, newest
// first) so large rooms stay browsable; names also live in aria-label.
export function ChatSeenBy({
  readers,
  authorId,
  messageId,
}: ChatSeenByProps): ReactElement | null {
  const [open, setOpen] = useState(false);
  const seen = [...seenReaders(readers, authorId, messageId)].sort(
    (a, b) => (b.last_read_at ?? "").localeCompare(a.last_read_at ?? ""),
  );
  if (seen.length === 0) return null;
  const names = seen.map((reader) => reader.user_name).join(", ");
  return (
    <>
      <div className="flex justify-end px-1 pb-1">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Đã xem bởi ${seen.length} người: ${names}`}
          title={names}
          className="flex items-center gap-1.5 rounded-md px-1 py-0.5 text-[11px] text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          Đã xem · {seen.length}
          <AvatarStack
            items={seen.map((reader) => ({
              name: reader.user_name,
              src: reader.avatar_url,
            }))}
          />
        </button>
      </div>
      <Modal
        open={open}
        title={`Đã xem bởi ${seen.length} người`}
        onClose={() => setOpen(false)}
      >
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {seen.map((reader) => (
            <li
              key={reader.user_id}
              className="flex items-center gap-3 px-1 py-2.5"
            >
              <Avatar
                name={reader.user_name}
                src={reader.avatar_url}
                size="sm"
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                {reader.user_name}
              </span>
              <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                {formatTime(reader.last_read_at)}
              </span>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}
