import { useState } from "react";
import type { ReactElement } from "react";
import { FiChevronDown, FiChevronUp, FiPaperclip, FiX } from "react-icons/fi";
import type { ChatMessage } from "../api.ts";

interface ChatPinnedBarProps {
  // Every pin of the room, oldest pin first (server order).
  pinned: ChatMessage[];
  // Managers see the unpin affordance; everyone else just sees the bar.
  canManage: boolean;
  onUnpin: (messageId: string) => void;
  onJump: (messageId: string) => void;
}

function pinPreview(pinned: ChatMessage): string {
  return pinned.body !== "" ? pinned.body : "Đính kèm tệp";
}

// Telegram pinned strip: shows one pin at a time (newest first) and
// cycles to the next on each tap; the stacked lines mirror the pin
// count. The chevron expands a list of every pin for direct access.
export function ChatPinnedBar({
  pinned,
  canManage,
  onUnpin,
  onJump,
}: ChatPinnedBarProps): ReactElement {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const count = pinned.length;
  const index = count === 0 ? 0 : step % count;
  const current = pinned[count - 1 - index];

  if (current === undefined) {
    return <></>;
  }

  function cycle(): void {
    onJump(current.message_id);
    if (count > 1) setStep((s) => s + 1);
  }

  return (
    <div className="shrink-0 border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 px-4 py-1.5">
        <div
          className="flex w-1 shrink-0 flex-col justify-center gap-[3px]"
          aria-hidden="true"
        >
          {pinned.map((pin, i) => (
            <span
              key={pin.message_id}
              className={`h-[3px] rounded-full ${
                count - 1 - i === index
                  ? "bg-zinc-700 dark:bg-zinc-300"
                  : "bg-zinc-300 dark:bg-zinc-600"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={cycle}
          className="min-w-0 flex-1 border-l-2 border-zinc-400 pl-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-500"
        >
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Tin nhắn đã ghim
            {count > 1 && ` · ${index + 1}/${count}`} ·{" "}
            {current.author_name}
          </p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {pinPreview(current)}
          </p>
        </button>
        {count > 1 && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={
              open ? "Thu gọn danh sách ghim" : "Xem tất cả tin ghim"
            }
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            {open ? (
              <FiChevronUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <FiChevronDown className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}
        {canManage && (
          <button
            type="button"
            onClick={() => onUnpin(current.message_id)}
            aria-label="Bỏ ghim tin nhắn"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <FiX className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      {open && (
        <ul className="max-h-40 overflow-y-auto border-t border-zinc-200 dark:border-zinc-800">
          {[...pinned].reverse().map((pin) => (
            <li key={pin.message_id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onJump(pin.message_id);
                }}
                className="flex min-w-0 flex-1 items-center gap-2 px-4 py-1.5 text-left hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-zinc-500 dark:hover:bg-zinc-800"
              >
                <FiPaperclip
                  className="h-3.5 w-3.5 shrink-0 rotate-90 text-zinc-400 dark:text-zinc-500"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {pin.author_name}
                  </span>
                  <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {pinPreview(pin)}
                  </span>
                </span>
              </button>
              {canManage && (
                <button
                  type="button"
                  onClick={() => onUnpin(pin.message_id)}
                  aria-label={`Bỏ ghim tin của ${pin.author_name}`}
                  className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-zinc-500 dark:text-zinc-500 dark:hover:bg-zinc-700"
                >
                  <FiX className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
