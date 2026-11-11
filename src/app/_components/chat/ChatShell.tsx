"use client";

import { useSyncExternalStore } from "react";
import { POLL_INTERVAL_MS } from "@/lib/chat";
import MessagePane from "./MessagePane";
import RoomList, { type Person } from "./RoomList";
import { useChatSocket } from "./useChatSocket";
import { type ChatStateOptions, useChatState } from "./useChatState";
import { useInterval } from "./useInterval";

type ChatShellProps = Omit<ChatStateOptions, "wide"> & {
  socketUrl: string | null;
  people: Person[];
};

// Tailwind's xl breakpoint, where the list and the open room sit side by side.
const WIDE_QUERY = "(min-width: 80rem)";

function subscribeWide(onChange: () => void) {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useWide(): boolean {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE_QUERY).matches,
    () => false,
  );
}

// A phone shows the room list or the open room. From xl the two sit side by side.
export default function ChatShell({
  socketUrl,
  people,
  ...options
}: ChatShellProps) {
  const wide = useWide();
  const chat = useChatState({ ...options, wide });
  const status = useChatSocket({
    url: socketUrl,
    roomIds: chat.rooms.map((room) => room.id),
    onFrame: chat.handleFrame,
    onOpen: chat.handleOpen,
  });
  // Polling covers the time the socket is down or not configured.
  useInterval(chat.poll, status === "live" ? null : POLL_INTERVAL_MS);

  const showList = chat.selectedId === null;

  return (
    <div className="flex flex-col gap-4">
      {chat.notice ? (
        <output className="block rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-700 dark:bg-sky-950/40 dark:text-sky-400">
          {chat.notice}
        </output>
      ) : null}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[20rem_minmax(0,1fr)] xl:items-start">
        <div className={showList ? "" : "hidden xl:block"}>
          <RoomList
            rooms={chat.rooms}
            activeId={chat.paneVisible ? chat.room.id : null}
            unread={chat.unread}
            people={people}
            onSelect={chat.selectRoom}
            onOpenDm={chat.openDm}
          />
        </div>
        <div className={showList ? "hidden xl:block" : ""}>
          <MessagePane
            key={chat.room.id}
            chat={chat}
            viewer={options.viewer}
            status={status}
            onBack={() => chat.selectRoom(null)}
          />
        </div>
      </div>
    </div>
  );
}
