import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import {
  chatChannel,
  membersChannel,
  notificationsChannel,
  postsChannel,
  sendTypingPing,
  subscribeChannel,
} from "../core/realtime.ts";
import { pushToast } from "../core/toast.ts";
import { postEventToast } from "./messages.tsx";
import { workspaceKeys } from "./keys.ts";

const TYPING_MIN_INTERVAL_MS = 2_000;
let lastTypingSent = 0;

// Live board: post/comment changes on posts:{orgId} invalidate the board
// and thread caches; other actors' writes surface as a quiet toast.
export function useBoardRealtime(orgId: string | null, selfId?: string): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (orgId === null) return undefined;
    return subscribeChannel(postsChannel(orgId), (payload) => {
      const action = payload["action"];
      if (typeof action !== "string") return;
      void queryClient.invalidateQueries({
        queryKey: [...workspaceKeys.all, "posts"],
      });
      void queryClient.invalidateQueries({
        queryKey: [...workspaceKeys.all, "comments"],
      });
      const actorId = payload["actor_id"];
      if (actorId === selfId) return;
      const message = postEventToast(action, null);
      if (message !== null) pushToast({ tone: "info", title: message });
    });
  }, [orgId, selfId, queryClient]);
}

// Live room: message fan-out on chat:{roomId} refreshes history and the
// badge; "typing" payloads never touch the cache - they bubble up to the
// caller as ephemeral UI state.
export function useChatRealtime(
  roomId: string | null,
  selfId: string | undefined,
  onTyping?: (userId: string) => void,
): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (roomId === null) return undefined;
    return subscribeChannel(chatChannel(roomId), (payload) => {
      const action = payload["action"];
      if (action === "typing") {
        const userId = payload["user_id"];
        if (typeof userId === "string" && userId !== selfId) {
          onTyping?.(userId);
        }
        return;
      }
      if (
        action !== "message.created" &&
        action !== "message.deleted" &&
        action !== "message.edited" &&
        action !== "message.reacted" &&
        // dm read receipt: the peer's pointer moved, repaint the checks.
        action !== "message.read" &&
        // Pinned bar: the slot changed, repaint the header strip.
        action !== "message.pinned" &&
        action !== "message.unpinned"
      ) {
        return;
      }
      void queryClient.invalidateQueries({
        queryKey: workspaceKeys.chat(roomId),
      });
      void queryClient.invalidateQueries({
        queryKey: workspaceKeys.chatUnread(roomId),
      });
      // Sends/edits/deletes change the shared-item index; reaction, read
      // and pin frames never touch it.
      if (
        action === "message.created" ||
        action === "message.deleted" ||
        action === "message.edited"
      ) {
        void queryClient.invalidateQueries({
          queryKey: [...workspaceKeys.all, "chat-media", roomId],
        });
      }
    });
  }, [roomId, selfId, onTyping, queryClient]);
}

// Subscribe budget: the server caps subscribe.v1 frames at 20/min, and
// every members:{org} join also ships a presence snapshot. Beyond this
// many orgs the extra rooms simply wait for the next inbox refetch.
const INBOX_CHANNEL_CAP = 12;

function isInboxEvent(payload: Record<string, unknown>): boolean {
  return payload["scope"] === "chat-inbox";
}

// Live inbox: scope:"chat-inbox" hints land on notifications:{user} for
// dm rooms (both participants) and on members:{org} for group rooms, so
// the merged list refreshes without polling. The payload carries no
// "action" key, leaving roster/presence/notification handlers untouched.
export function useChatInboxRealtime(
  userId: string | undefined,
  orgIds: string[],
): void {
  const queryClient = useQueryClient();
  const joined = orgIds.slice(0, INBOX_CHANNEL_CAP).join(",");
  useEffect(() => {
    if (userId === undefined) return undefined;
    const invalidate = (payload: Record<string, unknown>): void => {
      if (!isInboxEvent(payload)) return;
      void queryClient.invalidateQueries({
        queryKey: workspaceKeys.chatInbox(),
      });
    };
    const orgChannels = joined === "" ? [] : joined.split(",");
    const unsubscribers = [
      subscribeChannel(notificationsChannel(userId), invalidate),
      ...orgChannels.map((orgId) =>
        subscribeChannel(membersChannel(orgId), invalidate),
      ),
    ];
    return () => {
      for (const unsubscribe of unsubscribers) unsubscribe();
    };
  }, [userId, joined, queryClient]);
}

// Throttled typing.v1 emitter: at most one frame per couple of seconds
// while the composer is non-empty.
export function sendChatTyping(roomId: string): void {
  const now = Date.now();
  if (now - lastTypingSent < TYPING_MIN_INTERVAL_MS) return;
  lastTypingSent = now;
  sendTypingPing(chatChannel(roomId));
}

// Ephemeral typing roster: each user_id expires a few seconds after its
// last ping unless a fresh frame renews it. Pure UI state - never cached.
export function useTypingUsers(timeoutMs = 4_000): {
  typingIds: string[];
  noteTyping: (userId: string) => void;
} {
  const [expiry, setExpiry] = useState<Record<string, number>>({});
  const noteTyping = useCallback(
    (userId: string) => {
      setExpiry((prev) => ({ ...prev, [userId]: Date.now() + timeoutMs }));
    },
    [timeoutMs],
  );
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setExpiry((prev) => {
        const alive = Object.entries(prev).filter(([, until]) => until > now);
        return alive.length === Object.keys(prev).length
          ? prev
          : Object.fromEntries(alive);
      });
    }, 1_000);
    return () => clearInterval(timer);
  }, []);
  return { typingIds: Object.keys(expiry), noteTyping };
}
