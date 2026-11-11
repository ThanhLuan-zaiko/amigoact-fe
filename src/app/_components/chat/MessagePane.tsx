"use client";

import { useState } from "react";
import {
  FiArchive,
  FiArrowLeft,
  FiBookmark,
  FiHash,
  FiLock,
  FiRefreshCw,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import {
  CHAT_MESSAGES,
  type ChatMessage,
  type ChatResult,
  type ChatViewer,
} from "@/lib/chat";
import { iconButton, mutedText, panel, sectionTitle } from "../ui";
import ChatComposer from "./ChatComposer";
import MessageList from "./MessageList";
import PinsPanel from "./PinsPanel";
import type { SocketStatus } from "./useChatSocket";
import type { ChatState } from "./useChatState";

type MessagePaneProps = {
  chat: ChatState;
  viewer: ChatViewer;
  status: SocketStatus;
  onBack: () => void;
};

const STATUS_TEXT: Record<SocketStatus, string> = {
  live: "Đang cập nhật trực tiếp",
  connecting: "Đang kết nối…",
  offline: "Mất kết nối trực tiếp, tự cập nhật mỗi 10 giây",
};

// Green means live. Amber means the page is falling back to polling.
const STATUS_DOT: Record<SocketStatus, string> = {
  live: "bg-green-700 dark:bg-green-400",
  connecting: "bg-slate-400 dark:bg-slate-500",
  offline: "bg-amber-700 dark:bg-amber-400",
};

export default function MessagePane({
  chat,
  viewer,
  status,
  onBack,
}: MessagePaneProps) {
  const { room, cache } = chat;
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [showPins, setShowPins] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const Icon =
    room.kind === "org"
      ? FiUsers
      : room.kind === "dm"
        ? FiUser
        : room.archived
          ? FiArchive
          : room.restricted
            ? FiLock
            : FiHash;

  // Runs a message action and shows its error under the header.
  async function run(action: Promise<ChatResult>): Promise<boolean> {
    const result = await action;
    setError(result.ok ? null : result.error);
    return result.ok;
  }

  const pinnedKey = (cache?.items ?? [])
    .filter((message) => message.pinned)
    .map((message) => message.id)
    .join(",");

  return (
    <section
      aria-label={`Phòng ${room.name}`}
      className={`${panel} flex min-w-0 flex-col`}
    >
      <header className="flex items-center gap-2 border-b border-slate-200 p-3 sm:px-4 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          aria-label="Về danh sách phòng"
          title="Về danh sách phòng"
          className={`${iconButton} xl:hidden`}
        >
          <FiArrowLeft aria-hidden="true" />
        </button>
        <Icon aria-hidden="true" className="shrink-0 text-slate-500" />
        <div className="min-w-0 flex-1">
          <h2 className={`${sectionTitle} truncate`}>{room.name}</h2>
          <p
            className={`${mutedText} flex items-center gap-1.5 truncate text-xs`}
          >
            <span
              aria-hidden="true"
              className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[status]}`}
            />
            <output>{STATUS_TEXT[status]}</output>
            {room.topic ? (
              <span className="truncate">· {room.topic}</span>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPins((value) => !value)}
          aria-label={showPins ? "Ẩn tin đã ghim" : "Xem tin đã ghim"}
          aria-pressed={showPins}
          title={showPins ? "Ẩn tin đã ghim" : "Xem tin đã ghim"}
          className={`${iconButton} ${showPins ? "border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400" : ""}`}
        >
          <FiBookmark aria-hidden="true" />
        </button>
      </header>
      {/* The key changes when a loaded message is pinned or unpinned, so the list loads again. */}
      {showPins ? <PinsPanel key={pinnedKey} roomId={room.id} /> : null}
      {error ? (
        <p
          role="alert"
          className="border-b border-slate-200 px-4 py-2 text-sm text-red-700 dark:border-slate-800 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}
      {cache ? (
        <MessageList
          room={room}
          cache={cache}
          viewer={viewer}
          onLoadOlder={() => run(chat.loadOlder())}
          onReply={setReplyTo}
          onEdit={(message, body) => run(chat.edit(message, body))}
          onDelete={(message) => chat.remove(message)}
          onReact={(message, emoji) => run(chat.react(message, emoji))}
          onPin={(message) => run(chat.pin(message))}
        />
      ) : (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6">
          <p className={mutedText}>{chat.loadError ?? "Đang tải tin nhắn…"}</p>
          {chat.loadError ? (
            <button
              type="button"
              onClick={chat.retry}
              aria-label="Tải lại"
              title="Tải lại"
              className={iconButton}
            >
              <FiRefreshCw aria-hidden="true" />
            </button>
          ) : null}
        </div>
      )}
      {room.archived ? (
        <p
          className={`${mutedText} flex items-center gap-2 border-t border-slate-200 p-4 dark:border-slate-800`}
        >
          <FiArchive aria-hidden="true" />
          {CHAT_MESSAGES.archived}
        </p>
      ) : (
        <ChatComposer
          roomName={room.name}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          onSend={async (body) => {
            const result = await chat.send(body, replyTo?.id ?? null);
            if (result.ok) {
              setReplyTo(null);
            }
            return result;
          }}
        />
      )}
    </section>
  );
}
