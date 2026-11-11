"use client";

import { useState } from "react";
import type { IconType } from "react-icons";
import {
  FiBookmark,
  FiCornerUpLeft,
  FiEdit2,
  FiSmile,
  FiTrash2,
} from "react-icons/fi";
import { type ChatMessage, type MessageRights, QUICK_EMOJI } from "@/lib/chat";

type MessageToolsProps = {
  message: ChatMessage;
  // Opened with the "more" button of the message.
  open: boolean;
  rights: MessageRights;
  onReply: () => void;
  onReact: (emoji: string) => void;
  onEdit: () => void;
  onPin: () => void;
  onDelete: () => void;
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:focus-visible:outline-teal-400";

export const toolButton = `inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition-colors hover:border-teal-700 hover:text-teal-700 ${focusRing} dark:border-slate-800 dark:text-slate-400 dark:hover:border-teal-400 dark:hover:text-teal-400`;

// Red only on the delete button, the one action here that cannot be undone.
const deleteButton = `inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-red-700 transition-colors hover:border-red-700 ${focusRing} dark:border-slate-800 dark:text-red-400 dark:hover:border-red-400`;

function chipClass(mine: boolean): string {
  return `inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-sm transition-colors disabled:cursor-default ${focusRing} ${
    mine
      ? "border-teal-700 bg-teal-50 text-teal-700 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-400"
      : "border-slate-200 text-slate-700 hover:border-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-400"
  }`;
}

function Tool({
  label,
  icon: Icon,
  onClick,
  className = toolButton,
  pressed,
}: {
  label: string;
  icon: IconType;
  onClick: () => void;
  className?: string;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={className}
    >
      <Icon aria-hidden="true" />
    </button>
  );
}

// Reactions under a message, and its tools.
export default function MessageTools({
  message,
  open,
  rights,
  onReply,
  onReact,
  onEdit,
  onPin,
  onDelete,
}: MessageToolsProps) {
  const [picking, setPicking] = useState(false);
  const pinLabel = message.pinned ? "Bỏ ghim" : "Ghim tin nhắn";

  return (
    <div className="flex flex-col gap-1.5">
      {message.reactions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {message.reactions.map((reaction) => (
            <button
              key={reaction.emoji}
              type="button"
              disabled={!rights.react}
              onClick={() => onReact(reaction.emoji)}
              aria-pressed={reaction.mine}
              aria-label={`${reaction.emoji} ${reaction.count} người${reaction.mine ? ", có bạn" : ""}`}
              title={reaction.mine ? "Bỏ cảm xúc" : "Thêm cảm xúc"}
              className={chipClass(reaction.mine)}
            >
              <span aria-hidden="true">{reaction.emoji}</span>
              <span aria-hidden="true" className="text-xs font-semibold">
                {reaction.count}
              </span>
            </button>
          ))}
        </div>
      ) : null}
      <div
        className={`${open ? "flex" : "hidden"} flex-wrap items-center gap-1.5`}
      >
        {rights.reply ? (
          <Tool label="Trả lời" icon={FiCornerUpLeft} onClick={onReply} />
        ) : null}
        {rights.react ? (
          <Tool
            label="Chọn cảm xúc"
            icon={FiSmile}
            pressed={picking}
            onClick={() => setPicking((value) => !value)}
          />
        ) : null}
        {rights.edit ? (
          <Tool label="Sửa tin nhắn" icon={FiEdit2} onClick={onEdit} />
        ) : null}
        {rights.pin ? (
          <Tool
            label={pinLabel}
            icon={FiBookmark}
            pressed={message.pinned}
            onClick={onPin}
          />
        ) : null}
        {rights.delete ? (
          <Tool
            label="Xóa tin nhắn"
            icon={FiTrash2}
            onClick={onDelete}
            className={deleteButton}
          />
        ) : null}
      </div>
      {picking && rights.react ? (
        <div className="flex flex-wrap gap-1.5">
          {QUICK_EMOJI.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onReact(emoji);
                setPicking(false);
              }}
              aria-label={`Thả ${emoji}`}
              title={`Thả ${emoji}`}
              className={chipClass(
                message.reactions.some((r) => r.emoji === emoji && r.mine),
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
