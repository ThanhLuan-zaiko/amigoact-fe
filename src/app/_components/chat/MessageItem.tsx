"use client";

import { useState, useTransition } from "react";
import {
  FiBookmark,
  FiCornerUpLeft,
  FiMoreHorizontal,
  FiTrash2,
} from "react-icons/fi";
import {
  type ChatMessage,
  type ChatResult,
  type MessageRights,
  messageTime,
} from "@/lib/chat";
import { initials } from "@/lib/organizations";
import ConfirmDialog from "../ConfirmDialog";
import MessageEditor from "./MessageEditor";
import MessageTools, { toolButton } from "./MessageTools";

type MessageItemProps = {
  message: ChatMessage;
  // True when it follows a message of the same person, so the name and time are not repeated.
  compact: boolean;
  mine: boolean;
  rights: MessageRights;
  onReply: (message: ChatMessage) => void;
  onEdit: (message: ChatMessage, body: string) => Promise<boolean>;
  onDelete: (message: ChatMessage) => Promise<ChatResult>;
  onReact: (message: ChatMessage, emoji: string) => Promise<boolean>;
  onPin: (message: ChatMessage) => Promise<boolean>;
};

export default function MessageItem({
  message,
  compact,
  mine,
  rights,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onPin,
}: MessageItemProps) {
  const [editing, setEditing] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function confirmDelete() {
    startTransition(async () => {
      const result = await onDelete(message);
      if (result.ok) {
        setConfirming(false);
      } else {
        setDeleteError(result.error);
      }
    });
  }

  return (
    <li
      className={`group flex gap-3 rounded-md px-2 hover:bg-slate-50 dark:hover:bg-slate-900/60 ${compact ? "py-0.5" : "mt-2 py-1"} ${message.pinned ? "border-l-2 border-teal-700 dark:border-teal-400" : ""}`}
    >
      <div className="w-9 shrink-0">
        {compact ? null : (
          <div
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-xs font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300"
          >
            {initials(message.author_name) || "?"}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {compact ? null : (
          <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {message.author_name || "Thành viên"}
              {mine ? <span className="sr-only"> (bạn)</span> : null}
            </span>
            <time
              dateTime={message.created_at}
              className="text-xs text-slate-500 dark:text-slate-400"
            >
              {messageTime(message.created_at)}
            </time>
          </p>
        )}
        {message.reply_to ? (
          <p className="flex min-w-0 items-start gap-1.5 border-l-2 border-slate-300 pl-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <FiCornerUpLeft aria-hidden="true" className="mt-0.5 shrink-0" />
            <span className="min-w-0 truncate">
              <span className="font-semibold">
                {message.reply_to.author_name}:
              </span>{" "}
              {message.reply_to.body || "Tin nhắn gốc đã bị xóa."}
            </span>
          </p>
        ) : null}
        {editing ? (
          <MessageEditor
            initial={message.body}
            onCancel={() => setEditing(false)}
            onSave={async (body) => {
              const ok = await onEdit(message, body);
              if (ok) {
                setEditing(false);
              }
              return ok;
            }}
          />
        ) : (
          <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap text-slate-800 dark:text-slate-200">
            {message.body}
            {message.edited_at ? (
              <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
                (đã sửa)
              </span>
            ) : null}
            {message.pinned ? (
              <FiBookmark
                aria-label="Đã ghim"
                className="ml-1 inline text-xs text-teal-700 dark:text-teal-400"
              />
            ) : null}
          </p>
        )}
        <MessageTools
          message={message}
          open={toolsOpen}
          rights={rights}
          onReply={() => onReply(message)}
          onReact={(emoji) => onReact(message, emoji)}
          onEdit={() => setEditing(true)}
          onPin={() => onPin(message)}
          onDelete={() => setConfirming(true)}
        />
      </div>
      {/* The tools sit behind this button on every screen, so touch and keyboard users reach them. */}
      <button
        type="button"
        onClick={() => setToolsOpen((value) => !value)}
        aria-label={toolsOpen ? "Ẩn thao tác" : "Thao tác với tin nhắn"}
        title={toolsOpen ? "Ẩn thao tác" : "Thao tác với tin nhắn"}
        aria-expanded={toolsOpen}
        className={`${toolButton} self-start border-transparent xl:opacity-0 xl:group-hover:opacity-100 xl:focus-visible:opacity-100 ${toolsOpen ? "xl:opacity-100" : ""}`}
      >
        <FiMoreHorizontal aria-hidden="true" />
      </button>
      {/* Mounted only while asking, so a long list holds one dialog at most. */}
      {confirming ? (
        <ConfirmDialog
          open
          title="Xóa tin nhắn?"
          confirmLabel="Xóa hẳn"
          confirmIcon={<FiTrash2 aria-hidden="true" />}
          pending={pending}
          error={deleteError}
          onConfirm={confirmDelete}
          onClose={() => {
            setConfirming(false);
            setDeleteError(undefined);
          }}
        >
          <p>
            Tin nhắn bị xóa hẳn cho mọi người, kèm ghim và cảm xúc. Không hoàn
            tác được.
          </p>
        </ConfirmDialog>
      ) : null}
    </li>
  );
}
