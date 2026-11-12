"use client";

import { FiMessageCircle } from "react-icons/fi";
import { POLL_INTERVAL_MS } from "@/lib/chat";
import { mutedText } from "../ui";
import ChatList from "./ChatList";
import Conversation from "./Conversation";
import { useChatSocket } from "./useChatSocket";
import { useInterval } from "./useInterval";
import { type MessengerOptions, useMessenger } from "./useMessenger";

// The messenger fills the space under the header. A phone shows the list or the open
// conversation; from lg the two sit side by side in one panel, like a desktop messenger.
export default function Messenger(options: MessengerOptions) {
  const chat = useMessenger(options);
  const orgIds = [...new Set(chat.rooms.map((room) => room.org.id))];
  const status = useChatSocket({
    orgIds,
    roomIds: chat.rooms.map((room) => room.room_id),
    onFrame: chat.handleFrame,
    onOpen: chat.handleOpen,
    onRoomsChanged: chat.refreshInbox,
  });
  // Polling covers the time the socket is down or not configured.
  useInterval(chat.poll, status === "live" ? null : POLL_INTERVAL_MS);
  const open = chat.room !== null;

  return (
    <div className="flex h-[calc(100dvh-11rem)] min-h-[26rem] flex-col gap-2 sm:h-[calc(100dvh-11.5rem)] md:h-[calc(100dvh-7rem)]">
      {chat.notice ? (
        <output className="block rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-700 dark:bg-sky-950/40 dark:text-sky-400">
          {chat.notice}
        </output>
      ) : null}
      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-xl border border-slate-200 lg:grid-cols-[20rem_minmax(0,1fr)] 2xl:grid-cols-[24rem_minmax(0,1fr)] dark:border-slate-800">
        <div
          className={`min-h-0 lg:block lg:border-r lg:border-slate-200 dark:lg:border-slate-800 ${open ? "hidden" : "block"}`}
        >
          <ChatList
            rooms={chat.rooms}
            typing={chat.typing}
            activeId={chat.room?.room_id ?? null}
            viewerId={options.viewerId}
            onSelect={chat.selectRoom}
            onOpenDm={chat.openDm}
          />
        </div>
        <div className={`min-h-0 ${open ? "block" : "hidden lg:block"}`}>
          {chat.room ? (
            <Conversation
              key={chat.room.room_id}
              chat={chat}
              viewerId={options.viewerId}
              status={status}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <span
                aria-hidden="true"
                className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 text-2xl text-slate-500 dark:border-slate-800 dark:text-slate-400"
              >
                <FiMessageCircle />
              </span>
              <p className={mutedText}>
                Chọn một cuộc trò chuyện để bắt đầu nhắn tin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
