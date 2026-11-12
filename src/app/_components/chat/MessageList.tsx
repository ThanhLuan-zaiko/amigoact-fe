"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FiChevronDown, FiChevronsUp } from "react-icons/fi";
import {
  type ChatResult,
  type ChatRoom,
  continuesGroup,
  messageDay,
  messageRights,
} from "@/lib/chat";
import type { RoomCache } from "@/lib/chatEvents";
import { chipButton, mutedText } from "../ui";
import MessageBubble, { type BubbleHandlers } from "./MessageBubble";

type MessageListProps = BubbleHandlers & {
  room: ChatRoom;
  cache: RoomCache;
  viewerId: string;
  onLoadOlder: () => Promise<ChatResult> | null;
};

// Within this many pixels of the bottom, a new message scrolls the list down.
const STICK_DISTANCE = 120;
// Within this many pixels of the top, the next older page loads by itself.
const OLDER_DISTANCE = 80;

// Oldest at the top, newest at the bottom, with a chip for each new day.
export default function MessageList({
  room,
  cache,
  viewerId,
  onLoadOlder,
  ...handlers
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // The height before an older page was added, so the view stays on the same message.
  const anchorRef = useRef<number | null>(null);
  const stickRef = useRef(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [away, setAway] = useState(false);
  const { items } = cache;
  const oldestId = items[0]?.id;
  const newestId = items.at(-1)?.id;
  const newestMine = items.at(-1)?.author_id === viewerId;
  const group = room.kind !== "dm";

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

  // Pictures finish loading after the first scroll and make the list taller. A reader who
  // was at the bottom stays there.
  const listRef = useRef<HTMLOListElement>(null);
  const hasItems = items.length > 0;
  useEffect(() => {
    const box = scrollRef.current;
    const list = listRef.current;
    if (!box || !list || !hasItems) {
      return;
    }
    const observer = new ResizeObserver(() => {
      if (stickRef.current && anchorRef.current === null) {
        box.scrollTop = box.scrollHeight;
      }
    });
    observer.observe(list);
    observer.observe(box);
    return () => observer.disconnect();
  }, [hasItems]);

  async function loadOlder() {
    if (loadingOlder) {
      return;
    }
    const run = onLoadOlder();
    if (!run) {
      return;
    }
    anchorRef.current = scrollRef.current?.scrollHeight ?? null;
    setLoadingOlder(true);
    const result = await run;
    setLoadingOlder(false);
    if (!result.ok) {
      anchorRef.current = null;
    }
  }

  function onScroll() {
    const box = scrollRef.current;
    if (!box) {
      return;
    }
    const fromBottom = box.scrollHeight - box.scrollTop - box.clientHeight;
    stickRef.current = fromBottom < STICK_DISTANCE;
    setAway(fromBottom > STICK_DISTANCE * 3);
    if (box.scrollTop < OLDER_DISTANCE && cache.nextBefore) {
      loadOlder();
    }
  }

  function toBottom() {
    const box = scrollRef.current;
    box?.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex h-full flex-col overflow-y-auto px-2 py-3 sm:px-4"
      >
        {cache.nextBefore ? (
          <button
            type="button"
            onClick={loadOlder}
            disabled={loadingOlder}
            className={`${chipButton} mb-3 self-center disabled:opacity-50`}
          >
            <FiChevronsUp aria-hidden="true" />
            {loadingOlder ? "Đang tải…" : "Tin cũ hơn"}
          </button>
        ) : null}
        {items.length === 0 ? (
          <p className={`${mutedText} m-auto px-4 text-center`}>
            Chưa có tin nhắn nào. Hãy gửi lời chào đầu tiên!
          </p>
        ) : (
          <ol
            ref={listRef}
            aria-label="Tin nhắn"
            className="mt-auto flex flex-col"
          >
            {items.map((message, index) => {
              const previous = items[index - 1];
              const day = messageDay(message.created_at);
              const newDay =
                !previous || messageDay(previous.created_at) !== day;
              return (
                <Fragment key={message.id}>
                  {newDay ? (
                    <li aria-hidden="true" className="my-3 flex justify-center">
                      <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        {day}
                      </span>
                    </li>
                  ) : null}
                  <MessageBubble
                    message={message}
                    compact={!newDay && continuesGroup(previous, message)}
                    mine={message.author_id === viewerId}
                    group={group}
                    rights={messageRights(message, room, viewerId)}
                    {...handlers}
                  />
                </Fragment>
              );
            })}
          </ol>
        )}
      </div>
      {away ? (
        <button
          type="button"
          onClick={toBottom}
          aria-label="Xuống tin mới nhất"
          title="Xuống tin mới nhất"
          className="absolute right-4 bottom-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-teal-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-teal-400"
        >
          <FiChevronDown aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
