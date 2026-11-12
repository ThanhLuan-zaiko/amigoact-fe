"use client";

import { type DragEvent, useState } from "react";
import { FiImage, FiRefreshCw } from "react-icons/fi";
import type { ChatAttachment, ChatMessage, ChatResult } from "@/lib/chat";
import { typingText } from "@/lib/typing";
import { iconButton, mutedText } from "../ui";
import ChatComposer from "./ChatComposer";
import ConversationHeader from "./ConversationHeader";
import MediaViewer from "./MediaViewer";
import MessageList from "./MessageList";
import PinsPanel from "./PinsPanel";
import { useAttachments } from "./useAttachments";
import type { SocketStatus } from "./useChatSocket";
import type { MessengerState } from "./useMessenger";

type ConversationProps = {
  chat: MessengerState;
  viewerId: string;
  status: SocketStatus;
};

type Viewing = { files: ChatAttachment[]; index: number; caption: string };

// The open conversation: header, pinned messages, the messages, and the composer.
// Files dropped anywhere on it join the composer.
export default function Conversation({
  chat,
  viewerId,
  status,
}: ConversationProps) {
  const { room, cache } = chat;
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [showPins, setShowPins] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [viewing, setViewing] = useState<Viewing | null>(null);
  const attachments = useAttachments();

  if (!room) {
    return null;
  }

  // Runs a message action and shows its error under the header.
  async function run(action: Promise<ChatResult>): Promise<boolean> {
    const result = await action;
    setError(result.ok ? null : result.error);
    return result.ok;
  }

  function hasFiles(event: DragEvent) {
    return Array.from(event.dataTransfer.types).includes("Files");
  }

  function onDrop(event: DragEvent<HTMLElement>) {
    if (!hasFiles(event)) {
      return;
    }
    event.preventDefault();
    setDragging(false);
    attachments.add(Array.from(event.dataTransfer.files));
  }

  const pinnedKey = (cache?.items ?? [])
    .filter((message) => message.pinned)
    .map((message) => message.id)
    .join(",");

  return (
    <section
      aria-label={`Trò chuyện với ${room.name}`}
      onDragOver={(event) => {
        if (hasFiles(event)) {
          event.preventDefault();
          setDragging(true);
        }
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setDragging(false);
        }
      }}
      onDrop={onDrop}
      className="relative flex h-full min-h-0 min-w-0 flex-col"
    >
      <ConversationHeader
        room={room}
        typing={typingText(chat.typing[room.room_id], room.kind)}
        status={status}
        showPins={showPins}
        onBack={() => chat.selectRoom(null)}
        onTogglePins={() => setShowPins((value) => !value)}
      />
      {/* The key changes when a loaded message is pinned or unpinned, so the list loads again. */}
      {showPins ? <PinsPanel key={pinnedKey} roomId={room.room_id} /> : null}
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
          viewerId={viewerId}
          onLoadOlder={chat.loadOlder}
          onReply={setReplyTo}
          onEdit={(message, body) => run(chat.edit(message, body))}
          onDelete={(message) => chat.remove(message)}
          onReact={(message, emoji) => run(chat.react(message, emoji))}
          onPin={(message) => run(chat.pin(message))}
          onOpenMedia={(files, index, caption) =>
            setViewing({ files, index, caption })
          }
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-6">
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
      <ChatComposer
        roomName={room.name}
        replyTo={replyTo}
        attachments={attachments}
        onCancelReply={() => setReplyTo(null)}
        onTyping={chat.typed}
        onSend={async (body, ids) => {
          const result = await chat.send(body, replyTo?.id ?? null, ids);
          if (result.ok) {
            setReplyTo(null);
          }
          return result;
        }}
      />
      {dragging ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-2 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-teal-700 bg-white/90 text-teal-700 dark:border-teal-400 dark:bg-slate-950/90 dark:text-teal-400"
        >
          <FiImage className="text-3xl" />
          <p className="text-sm font-semibold">Thả ảnh hoặc video để gửi</p>
        </div>
      ) : null}
      {viewing ? (
        <MediaViewer
          files={viewing.files}
          start={viewing.index}
          caption={viewing.caption}
          onClose={() => setViewing(null)}
        />
      ) : null}
    </section>
  );
}
