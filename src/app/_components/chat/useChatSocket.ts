"use client";

import { type ChatFrame, readFrame } from "@/lib/chatEvents";
import { ME, orgTopic, roomTopic } from "@/lib/realtime";
import {
  useRealtimeOpen,
  useRealtimeStatus,
  useTopics,
} from "../realtime/hooks";

export type SocketStatus = "connecting" | "live" | "offline";

type SocketOptions = {
  orgIds: string[];
  roomIds: string[];
  onFrame: (frame: ChatFrame) => void;
  // Called after every (re)connect, and when an event was too large to forward,
  // so the page can fetch what it missed.
  onOpen: () => void;
  // A channel or direct message was added or archived in one of the organizations.
  onRoomsChanged: () => void;
};

// The messenger's view of the app's one realtime socket: every conversation of the inbox as a
// topic, plus each organization and the viewer's own topic for changes to the list.
// See docs/realtime.md.
export function useChatSocket({
  orgIds,
  roomIds,
  onFrame,
  onOpen,
  onRoomsChanged,
}: SocketOptions): SocketStatus {
  const status = useRealtimeStatus();
  useTopics(roomIds.map(roomTopic), ({ data }) => {
    if (data.type === "resync") {
      onOpen();
      return;
    }
    const frame = readFrame(data);
    if (frame) {
      onFrame(frame);
    }
  });
  useTopics([...orgIds.map(orgTopic), ME], ({ data }) => {
    if (data.type === "resync" || data.type === "rooms.changed") {
      onRoomsChanged();
    }
  });
  useRealtimeOpen(() => onOpen());
  return status === "idle" ? "connecting" : status;
}
