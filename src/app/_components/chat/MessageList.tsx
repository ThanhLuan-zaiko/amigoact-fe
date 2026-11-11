"use client";

import { Fragment, useLayoutEffect, useRef, useState } from "react";
import { FiChevronsUp } from "react-icons/fi";
import {
  type ChatMessage,
  type ChatResult,
  type ChatRoom,
  type ChatViewer,
  continuesGroup,
  messageDay,
  messageRights,
} from "@/lib/chat";
import type { RoomCache } from "@/lib/chatEvents";
import { chipButton, mutedText } from "../ui";
import MessageItem from "./MessageItem";

type MessageListProps = {
  room: ChatRoom;
  cache: RoomCache;
  viewer: ChatViewer;
  onLoadOlder: () => Promise<boolean>;
  onReply: (message: ChatMessage) => void;
  onEdit: (message: ChatMessage, body: string) => Promise<boolean>;
  onDelete: (message: ChatMessage) => Promise<ChatResult>;
  onReact: (message: ChatMessage, emoji: string) => Promise<boolean>;
  onPin: (message: ChatMessage) => Promise<boolean>;
};

// Within this many pixels of the bottom, a new message scrolls the list down.
const STICK_DISTANCE = 120;

// Oldest at the top, newest at the bottom, with a line for each new day.
export default function MessageList({
  room,
  cache,
  viewer,
  onLoadOlder,
  ...handlers
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // The height before an older page was added, so the view stays on the same message.
  const anchorRef = useRef<number | null>(null);
  const stickRef = useRef(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const { items } = cache;
  const oldestId = items[0]?.id;
  const newestId = items.at(-1)?.id;
  const newestMine = items.at(-1)?.author_id === viewer.userId;

  // An older page keeps the view on the same message. A new message scrolls down when the
  // reader was already at the bottom, or when the reader sent it.
  useLayoutEffect(() => {
    const box = scrollRef.current;
    if (!box || oldestId === undefined || newestId === undefined) {
      return;
    }
    if (anchorRef.current !== null) {
      box.scrollTop += box.scrollHeight - anchorRef.current;
      anchorRef.current = null;
      return;
    }
    if (stickRef.current || newestMine) {
      box.scrollTop = box.scrollHeight;
    }
  }, [oldestId, newestId, newestMine]);

  function onScroll() {
    const box = scrollRef.current;
    if (box) {
      stickRef.current =
        box.scrollHeight - box.scrollTop - box.clientHeight < STICK_DISTANCE;
    }
  }

  async function loadOlder() {
    anchorRef.current = scrollRef.current?.scrollHeight ?? null;
    setLoadingOlder(true);
    const ok = await onLoadOlder();
    setLoadingOlder(false);
    if (!ok) {
      anchorRef.current = null;
    }
  }

  return (
    <div
      ref={scrollRef}
      onScroll={onScroll}
      className="flex h-[60dvh] min-h-72 flex-col overflow-y-auto px-2 py-3 sm:px-3 xl:h-[calc(100dvh-24rem)] xl:min-h-96"
    >
      {cache.nextBefore ? (
        <button
          type="button"
          onClick={loadOlder}
          disabled={loadingOlder}
          className={`${chipButton} mb-3 self-center disabled:opacity-50`}
        >
          <FiChevronsUp aria-hidden="true" />
          Tin cũ hơn
        </button>
      ) : null}
      {items.length === 0 ? (
        <p className={`${mutedText} m-auto px-4 text-center`}>
          Chưa có tin nhắn nào. Hãy gửi lời chào đầu tiên!
        </p>
      ) : (
        <ol aria-label="Tin nhắn" className="mt-auto flex flex-col">
          {items.map((message, index) => {
            const previous = items[index - 1];
            const day = messageDay(message.created_at);
            const newDay = !previous || messageDay(previous.created_at) !== day;
            return (
              <Fragment key={message.id}>
                {newDay ? (
                  <li
                    aria-hidden="true"
                    className="my-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400"
                  >
                    <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                    {day}
                    <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  </li>
                ) : null}
                <MessageItem
                  message={message}
                  compact={!newDay && continuesGroup(previous, message)}
                  mine={message.author_id === viewer.userId}
                  rights={messageRights(message, room, viewer)}
                  {...handlers}
                />
              </Fragment>
            );
          })}
        </ol>
      )}
    </div>
  );
}
