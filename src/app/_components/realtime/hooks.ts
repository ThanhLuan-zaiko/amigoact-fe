"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import { type RealtimeData, wantsRefresh } from "@/lib/realtime";
import type { RealtimeClient, RealtimeStatus, TopicMessage } from "./client";

export const RealtimeContext = createContext<RealtimeClient | null>(null);

const noStatus = () => () => {};
const idle = (): RealtimeStatus => "idle";
// Several events in a burst, for example approve then members, reload the page once.
const REFRESH_DELAY_MS = 150;

export function useRealtimeStatus(): RealtimeStatus {
  const client = useContext(RealtimeContext);
  return useSyncExternalStore(
    client?.subscribeStatus ?? noStatus,
    client?.getStatus ?? idle,
    idle,
  );
}

// Listens to every topic in the list. The handler may change on every render.
export function useTopics(
  topics: readonly string[],
  handler: (message: TopicMessage, topic: string) => void,
): void {
  const client = useContext(RealtimeContext);
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });
  const key = topics.join(",");
  useEffect(() => {
    if (!client || !key) {
      return;
    }
    const stops = key
      .split(",")
      .map((topic) =>
        client.listen(topic, (message) => handlerRef.current(message, topic)),
      );
    return () => {
      for (const stop of stops) {
        stop();
      }
    };
  }, [client, key]);
}

// Called after every (re)connect, with first true for the first one since the page loaded.
export function useRealtimeOpen(handler: (first: boolean) => void): void {
  const client = useContext(RealtimeContext);
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });
  useEffect(() => {
    if (!client) {
      return;
    }
    return client.onOpen((first) => handlerRef.current(first));
  }, [client]);
}

// Reloads the server-rendered page when one of these events arrives on the topic, and after a
// reconnect, since events may have been missed. Pass orgId to ignore other organizations.
export function useLiveRefresh(
  topic: string | null,
  types: readonly string[],
  orgId?: string,
): void {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function refreshSoon() {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => router.refresh(), REFRESH_DELAY_MS);
  }

  useEffect(() => () => clearTimeout(timer.current), []);
  useTopics(topic ? [topic] : [], ({ kind, data }) => {
    if (
      kind === "revoked" ||
      wantsRefresh(data as RealtimeData, types, orgId)
    ) {
      refreshSoon();
    }
  });
  useRealtimeOpen((first) => {
    if (!first && topic) {
      refreshSoon();
    }
  });
}
