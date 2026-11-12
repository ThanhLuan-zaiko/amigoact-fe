"use client";

import { useState, useTransition } from "react";
import {
  FiBookmark,
  FiCornerUpLeft,
  FiMoreHorizontal,
  FiTrash2,
} from "react-icons/fi";
import {
  type ChatAttachment,
  type ChatMessage,
  type ChatResult,
  type MessageRights,
  messageTime,
} from "@/lib/chat";
import ConfirmDialog from "../ConfirmDialog";
import ChatAvatar from "./ChatAvatar";
import MediaAlbum from "./MediaAlbum";
import MessageEditor from "./MessageEditor";
import MessageTools, { toolButton } from "./MessageTools";

export type BubbleHandlers = {
  onReply: (message: ChatMessage) => void;
  onEdit: (message: ChatMessage, body: string) => Promise<boolean>;
  onDelete: (message: ChatMessage) => Promise<ChatResult>;
  onReact: (message: ChatMessage, emoji: string) => Promise<boolean>;
  onPin: (message: ChatMessage) => Promise<boolean>;
  onOpenMedia: (
    files: ChatAttachment[],
    index: number,
    caption: string,
  ) => void;
};

type MessageBubbleProps = BubbleHandlers & {
  message: ChatMessage;
  // True when it follows a message of the same person, so the name and picture are not repeated.
  compact: boolean;
  mine: boolean;
  // Names and pictures help in a group. A direct message has only two people.
  group: boolean;
  rights: MessageRights;
};

// One message as a bubble: own messages on the right with a teal tint, others on the left.
export default function MessageBubble({
  message,
  compact,
  mine,
  group,
  rights,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onPin,
  onOpenMedia,
}: MessageBubbleProps) {
  const [editing, setEditing] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const showAuthor = group && !mine && !compact;
  const files = message.attachments;

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
      className={`group flex items-start gap-2 ${mine ? "flex-row-reverse" : ""} ${compact ? "mt-0.5" : "mt-3"}`}
    >
      {group && !mine ? (
        <div className="w-9 shrink-0">
          {compact ? null : (
            <ChatAvatar name={message.author_name} url={null} size="sm" />
          )}
        </div>
      ) : null}
      <div
        className={`flex max-w-[85%] min-w-0 flex-col gap-1 sm:max-w-[70%] ${mine ? "items-end" : "items-start"}`}
      >
        <div
          className={`flex min-w-0 flex-col gap-1.5 rounded-xl ${files.length > 0 ? "w-72 p-1 sm:w-80" : "px-3 py-2"} ${
            mine
              ? "bg-teal-50 dark:bg-teal-950/40"
              : "bg-slate-100 dark:bg-slate-800/60"
          } ${message.pinned ? "border border-teal-700 dark:border-teal-400" : ""}`}
        >
          {showAuthor ? (
            <p
              className={`text-sm font-semibold text-teal-700 dark:text-teal-400 ${files.length > 0 ? "px-2 pt-1" : ""}`}
            >
              {message.author_name || "Thành viên"}
            </p>
          ) : null}
          {message.reply_to ? (
            <p
              className={`flex min-w-0 items-start gap-1.5 rounded-md border-l-2 border-teal-700 bg-white/60 px-2 py-1 text-xs text-slate-600 dark:border-teal-400 dark:bg-slate-950/40 dark:text-slate-400 ${files.length > 0 ? "mx-1" : ""}`}
            >
              <FiCornerUpLeft aria-hidden="true" className="mt-0.5 shrink-0" />
              <span className="min-w-0">
                <span className="block font-semibold text-slate-800 dark:text-slate-200">
                  {message.reply_to.author_name}
                </span>
                <span className="line-clamp-2 break-words">
                  {message.reply_to.body || "Ảnh hoặc video"}
                </span>
              </span>
            </p>
          ) : null}
          <MediaAlbum
            files={files}
            onOpen={(index) => onOpenMedia(files, index, message.body)}
          />
          {editing ? (
            <div className={files.length > 0 ? "px-2 pb-1" : ""}>
              <MessageEditor
                initial={message.body}
                files={files.length}
                onCancel={() => setEditing(false)}
                onSave={async (body) => {
                  const ok = await onEdit(message, body);
                  if (ok) {
                    setEditing(false);
                  }
                  return ok;
                }}
              />
            </div>
          ) : (
            <p
              className={`text-[15px] leading-relaxed break-words whitespace-pre-wrap text-slate-900 dark:text-slate-100 ${files.length > 0 ? "px-2 pb-1" : ""}`}
            >
              {message.body}
              <span className="float-right mt-1.5 ml-3 inline-flex items-center gap-1 text-[11px] leading-none text-slate-500 dark:text-slate-400">
                {message.pinned ? (
                  <FiBookmark
                    aria-label="Đã ghim"
                    className="text-teal-700 dark:text-teal-400"
                  />
                ) : null}
                {message.edited_at ? <span>đã sửa</span> : null}
                <time dateTime={message.created_at}>
                  {messageTime(message.created_at)}
                </time>
                {mine ? <span className="sr-only">(bạn)</span> : null}
              </span>
            </p>
          )}
        </div>
        <MessageTools
          message={message}
          open={toolsOpen}
          rights={rights}
          onReply={() => {
            setToolsOpen(false);
            onReply(message);
          }}
          onReact={(emoji) => onReact(message, emoji)}
          onEdit={() => {
            setToolsOpen(false);
            setEditing(true);
          }}
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
        className={`${toolButton} shrink-0 self-center border-transparent lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100 ${toolsOpen ? "lg:opacity-100" : ""}`}
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
            Tin nhắn bị xóa hẳn cho mọi người, kèm ảnh, video, ghim và cảm xúc.
            Không hoàn tác được.
          </p>
        </ConfirmDialog>
      ) : null}
    </li>
  );
}
