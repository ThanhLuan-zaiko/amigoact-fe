"use client";

import { type ChatFrame, readFrame } from "@/lib/chatEvents";
import { ME, orgTopic, roomTopic, wantsRefresh } from "@/lib/realtime";
import {
  useRealtimeOpen,
  useRealtimeStatus,
  useTopics,
} from "../realtime/hooks";

export type SocketStatus = "connecting" | "live" | "offline";

type SocketOptions = {
  orgId: string;
  roomIds: string[];
  onFrame: (frame: ChatFrame) => void;
  // Called after every (re)connect, and when an event was too large to forward,
  // so the page can fetch what it missed.
  onOpen: () => void;
  // A channel or direct message was added or archived.
  onRoomsChanged: () => void;
};

// The chat's view of the app's one realtime socket: every room in the list as a topic, plus the
// organization and own topics for changes to the room list. See docs/realtime.md.
export function useChatSocket({
  orgId,
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
  useTopics([orgTopic(orgId), ME], ({ data }) => {
    if (wantsRefresh(data, ["rooms.changed"], orgId)) {
      onRoomsChanged();
    }
  });
  useRealtimeOpen(() => onOpen());
  return status === "idle" ? "connecting" : status;
}
