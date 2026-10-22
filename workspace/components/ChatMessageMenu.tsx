import { useRef, useState } from "react";
import type { ReactElement } from "react";
import {
  FiCopy,
  FiCornerUpLeft,
  FiEdit2,
  FiMoreHorizontal,
  FiPaperclip,
  FiTrash2,
} from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { useDismiss } from "../../core/dismiss.ts";
import type { ChatMessage } from "../api.ts";

const ITEM =
  "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm " +
  "text-zinc-800 transition-colors hover:bg-zinc-100 " +
  "dark:text-zinc-200 dark:hover:bg-zinc-900";

// Fixed palette mirrored by the backend allowlist.
const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

interface ChatMessageMenuProps {
  message: ChatMessage;
  mine: boolean;
  canManage: boolean;
  // Last bubbles open the panel upward so it never clips the composer.
  openUp: boolean;
  onReply: (message: ChatMessage) => void;
  onEdit: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  onReact: (emoji: string) => void;
  // Managers can pin the message into the room's pinned bar.
  onPin?: (messageId: string) => void;
}

// Telegram message context menu: copy, reply, edit (author), delete
// (author or chat:manage). Triggered by a hover "..." beside the bubble.
export function ChatMessageMenu({
  message,
  mine,
  canManage,
  openUp,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onPin,
}: ChatMessageMenuProps): ReactElement {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = (): void => setOpen(false);

  useDismiss(open, rootRef, close, triggerRef);

  function copy(): void {
    close();
    void navigator.clipboard?.writeText(message.body).catch(() => undefined);
  }

  return (
    <span
      ref={rootRef}
      className={
        "relative self-center opacity-0 transition-opacity " +
        "group-hover:opacity-100 focus-within:opacity-100 " +
        (mine ? "order-first" : "order-last")
      }
    >
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Tùy chọn tin nhắn"
        icon={<FiMoreHorizontal className="h-4 w-4" aria-hidden="true" />}
      />
      {open && (
        <div
          role="menu"
          aria-label="Tùy chọn tin nhắn"
          className={
            "absolute z-50 w-44 overflow-hidden rounded-xl border " +
            "border-zinc-200 bg-white py-1 dark:border-zinc-800 " +
            "dark:bg-zinc-950 " +
            (openUp ? "bottom-full mb-1" : "top-full mt-1") +
            (mine ? " right-0" : " left-0")
          }
        >
          <div className="flex gap-0.5 border-b border-zinc-200 px-2 py-1.5 dark:border-zinc-800">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                aria-label={`Thả cảm xúc ${emoji}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-base transition-transform hover:scale-110 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                onClick={() => {
                  close();
                  onReact(emoji);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
          {message.body !== "" && (
            <button type="button" role="menuitem" className={ITEM} onClick={copy}>
              <FiCopy className="h-4 w-4 shrink-0" aria-hidden="true" />
              Sao chép
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            className={ITEM}
            onClick={() => {
              close();
              onReply(message);
            }}
          >
            <FiCornerUpLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            Trả lời
          </button>
          {canManage && onPin !== undefined && (
            <button
              type="button"
              role="menuitem"
              className={ITEM}
              onClick={() => {
                close();
                onPin(message.message_id);
              }}
            >
              <FiPaperclip className="h-4 w-4 shrink-0" aria-hidden="true" />
              Ghim tin nhắn
            </button>
          )}
          {mine && message.body !== "" && (
            <button
              type="button"
              role="menuitem"
              className={ITEM}
              onClick={() => {
                close();
                onEdit(message);
              }}
            >
              <FiEdit2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              Chỉnh sửa
            </button>
          )}
          {(mine || canManage) && (
            <button
              type="button"
              role="menuitem"
              className={`${ITEM} text-red-600 dark:text-red-400`}
              onClick={() => {
                close();
                onDelete(message.message_id);
              }}
            >
              <FiTrash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              Xóa
            </button>
          )}
        </div>
      )}
    </span>
  );
}
