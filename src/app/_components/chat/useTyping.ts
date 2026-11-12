"use client";

import { useRef, useState } from "react";
import type { ChatFrame } from "@/lib/chatEvents";
import { roomTopic } from "@/lib/realtime";
import {
  addTypist,
  dropTypist,
  pruneTyping,
  TYPING_SEND_MS,
  type TypingMap,
} from "@/lib/typing";
import { useRealtimeTyping } from "../realtime/hooks";
import { useInterval } from "./useInterval";

const PRUNE_MS = 1_000;

// Who is typing in each room, from socket events, and the viewer's own signal.
export function useTyping(viewerId: string) {
  const [typing, setTyping] = useState<TypingMap>({});
  const sentRef = useRef<Record<string, number>>({});
  const sendTyping = useRealtimeTyping();

  // Old signals fade out. The timer runs only while someone is shown.
  useInterval(
    () => setTyping((current) => pruneTyping(current, Date.now())),
    Object.keys(typing).length > 0 ? PRUNE_MS : null,
  );

  function onFrame(frame: ChatFrame) {
    if (frame.kind === "typing" && frame.userId !== viewerId) {
      setTyping((current) =>
        addTypist(current, frame.roomId, frame.userId, frame.name, Date.now()),
      );
    } else if (frame.kind === "created") {
      setTyping((current) =>
        dropTypist(current, frame.roomId, frame.message.author_id),
      );
    } else if (frame.kind === "revoked") {
      setTyping((current) => {
        const { [frame.roomId]: _gone, ...rest } = current;
        return rest;
      });
    }
  }

  // Called on every keystroke; the signal leaves at most once per TYPING_SEND_MS per room.
  function typed(roomId: string) {
    const now = Date.now();
    if (now - (sentRef.current[roomId] ?? 0) < TYPING_SEND_MS) {
      return;
    }
    sentRef.current[roomId] = now;
    sendTyping(roomTopic(roomId));
  }

  // After sending, the next keystroke signals again at once.
  function sent(roomId: string) {
    delete sentRef.current[roomId];
  }

  return { typing, onFrame, typed, sent };
}
