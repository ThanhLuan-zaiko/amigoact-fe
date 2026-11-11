"use client";

import { useEffect, useRef, useState } from "react";
import { getSocketTicket } from "@/app/_actions/chat";
import {
  PING_INTERVAL_MS,
  reconnectDelay,
  attempt as safeCall,
} from "@/lib/chat";
import { type ChatFrame, parseFrame } from "@/lib/chatEvents";

export type SocketStatus = "connecting" | "live" | "offline";

// The backend closes a socket after 30 minutes with 4408, so a new ticket is fetched at once.
const EXPIRED_CLOSE = 4408;
// A socket that has not opened by then is given up, because a dropped connection can hang for minutes.
const OPEN_TIMEOUT_MS = 10_000;

type SocketOptions = {
  // Null when no socket address is configured. The page then polls only.
  url: string | null;
  roomIds: string[];
  onFrame: (frame: ChatFrame) => void;
  // Called after every (re)connect, so the page can fetch what it missed while offline.
  onOpen: () => void;
};

// Opens the chat socket with a one-time ticket from a Server Action, listens to every room in
// the list, and reconnects with backoff. The access token never reaches the browser.
export function useChatSocket({
  url,
  roomIds,
  onFrame,
  onOpen,
}: SocketOptions): SocketStatus {
  const [status, setStatus] = useState<SocketStatus>(
    url ? "connecting" : "offline",
  );
  const socketRef = useRef<WebSocket | null>(null);
  const subscribedRef = useRef(new Set<string>());
  const roomsRef = useRef(roomIds);
  const handlersRef = useRef({ onFrame, onOpen });

  useEffect(() => {
    handlersRef.current = { onFrame, onOpen };
  });

  // Keep the subscriptions in step with the room list, for example after a new direct message.
  const roomKey = roomIds.join(",");
  useEffect(() => {
    const wanted = roomKey ? roomKey.split(",") : [];
    roomsRef.current = wanted;
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }
    const subscribed = subscribedRef.current;
    for (const id of wanted) {
      if (!subscribed.has(id)) {
        socket.send(JSON.stringify({ op: "subscribe", room_id: id }));
        subscribed.add(id);
      }
    }
    for (const id of [...subscribed]) {
      if (!wanted.includes(id)) {
        socket.send(JSON.stringify({ op: "unsubscribe", room_id: id }));
        subscribed.delete(id);
      }
    }
  }, [roomKey]);

  useEffect(() => {
    if (!url) {
      return;
    }
    let stopped = false;
    let attempt = 0;
    // True while a ticket is on its way, so a retry cannot open a second socket.
    let connecting = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let pingTimer: ReturnType<typeof setInterval> | undefined;
    let openTimer: ReturnType<typeof setTimeout> | undefined;

    function scheduleRetry(delay: number) {
      clearTimeout(retryTimer);
      retryTimer = setTimeout(connect, delay);
    }

    async function connect() {
      if (stopped || socketRef.current || connecting) {
        return;
      }
      connecting = true;
      // After a failure the page stays "offline" while it retries, since it is polling meanwhile.
      setStatus((current) => (current === "offline" ? current : "connecting"));
      const ticket = await safeCall(getSocketTicket);
      connecting = false;
      if (stopped) {
        return;
      }
      if (!ticket.ok) {
        setStatus("offline");
        scheduleRetry(reconnectDelay(attempt++));
        return;
      }
      const socket = new WebSocket(
        `${url}?ticket=${encodeURIComponent(ticket.data)}`,
      );
      socketRef.current = socket;
      openTimer = setTimeout(() => socket.close(), OPEN_TIMEOUT_MS);
      socket.onopen = () => {
        clearTimeout(openTimer);
        attempt = 0;
        subscribedRef.current = new Set(roomsRef.current);
        for (const id of roomsRef.current) {
          socket.send(JSON.stringify({ op: "subscribe", room_id: id }));
        }
        pingTimer = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ op: "ping" }));
          }
        }, PING_INTERVAL_MS);
        setStatus("live");
        handlersRef.current.onOpen();
      };
      socket.onmessage = (event) => {
        const frame =
          typeof event.data === "string" ? parseFrame(event.data) : null;
        if (frame?.kind === "revoked") {
          subscribedRef.current.delete(frame.roomId);
        }
        if (frame) {
          handlersRef.current.onFrame(frame);
        }
      };
      socket.onclose = (event) => {
        clearTimeout(openTimer);
        clearInterval(pingTimer);
        socketRef.current = null;
        subscribedRef.current = new Set();
        if (stopped) {
          return;
        }
        setStatus("offline");
        scheduleRetry(
          event.code === EXPIRED_CLOSE ? 0 : reconnectDelay(attempt++),
        );
      };
    }

    // Coming back online or to the tab retries at once instead of waiting out the backoff.
    function retryNow() {
      if (!socketRef.current && !connecting && !document.hidden) {
        attempt = 0;
        scheduleRetry(0);
      }
    }

    connect();
    window.addEventListener("online", retryNow);
    document.addEventListener("visibilitychange", retryNow);
    return () => {
      stopped = true;
      clearTimeout(retryTimer);
      clearTimeout(openTimer);
      clearInterval(pingTimer);
      window.removeEventListener("online", retryNow);
      document.removeEventListener("visibilitychange", retryNow);
      socketRef.current?.close(1000);
      socketRef.current = null;
    };
  }, [url]);

  return url ? status : "offline";
}
