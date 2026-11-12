"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadInbox,
  loadMessages,
  markRoomRead,
  openDirectMessage,
  pollMessenger,
} from "@/app/_actions/chat";
import {
  attempt,
  type ChatMessage,
  type ChatResult,
  type ChatRoom,
  type MessagePage,
  messengerPath,
} from "@/lib/chat";
import {
  applyFrame,
  type CacheMap,
  type ChatFrame,
  needsReadMark,
  patchCache,
  withNewestPage,
} from "@/lib/chatEvents";
import { inboxAfterFrame, lastMessageOf, withUnread } from "@/lib/messenger";
import { useInterval } from "./useInterval";
import { messageActions } from "./useMessageActions";
import { useTyping } from "./useTyping";

export type MessengerOptions = {
  viewerId: string;
  rooms: ChatRoom[];
  initialRoomId: string | null;
  initialPage: MessagePage | null;
};

const INBOX_REFRESH_MS = 60_000;

// The inbox, the open conversation and the loaded messages of the messenger page.
export function useMessenger(options: MessengerOptions) {
  const { viewerId } = options;
  const [rooms, setRooms] = useState(options.rooms);
  const [selectedId, setSelectedId] = useState(options.initialRoomId);
  const [notice, setNotice] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [caches, setCaches] = useState<CacheMap>(() => {
    const { initialPage, initialRoomId } = options;
    return initialPage && initialRoomId
      ? withNewestPage({}, initialRoomId, initialPage)
      : {};
  });
  const markedRef = useRef<Record<string, string>>({});
  const openedRef = useRef(false);
  const typist = useTyping(viewerId);

  const room = rooms.find((item) => item.room_id === selectedId) ?? null;
  const roomId = room?.room_id ?? null;
  const cache = roomId ? caches[roomId] : undefined;
  const newestId = cache?.items.at(-1)?.id;

  function patchRoom(
    id: string,
    change: (items: ChatMessage[]) => ChatMessage[],
  ) {
    setCaches((previous) => patchCache(previous, id, change));
  }

  // A sent message tops the list at once, before its socket event comes back.
  function onSent(message: ChatMessage) {
    typist.sent(message.room_id);
    setRooms((previous) => {
      const target = previous.find((item) => item.room_id === message.room_id);
      return target
        ? [
            { ...target, last_message: lastMessageOf(message) },
            ...previous.filter((item) => item !== target),
          ]
        : previous;
    });
  }

  function selectRoom(id: string | null) {
    setSelectedId(id);
    setNotice(null);
    setLoadError(null);
    window.history.replaceState(null, "", messengerPath(id));
  }

  async function refreshInbox() {
    const result = await attempt(() => loadInbox());
    if (result.ok) {
      setRooms(roomId ? withUnread(result.data, roomId, 0) : result.data);
    }
  }

  async function refreshRoom(id: string) {
    const result = await attempt(() => loadMessages(id, null));
    if (result.ok) {
      setCaches((previous) => withNewestPage(previous, id, result.data));
      setLoadError(null);
    } else {
      setLoadError(result.error);
    }
  }

  // A conversation opened for the first time loads its newest page.
  const loaded = cache !== undefined;
  const latestRef = useRef(refreshRoom);
  useEffect(() => {
    latestRef.current = refreshRoom;
  });
  useEffect(() => {
    if (roomId && !loaded) {
      latestRef.current(roomId);
    }
  }, [roomId, loaded]);

  // The open conversation is read up to its newest message, and its count clears.
  useEffect(() => {
    if (
      !roomId ||
      !needsReadMark(markedRef.current[roomId] ?? null, newestId)
    ) {
      return;
    }
    markedRef.current[roomId] = newestId;
    setRooms((previous) => withUnread(previous, roomId, 0));
    attempt(() => markRoomRead(roomId, newestId));
  }, [roomId, newestId]);

  // rooms.changed reloads the list at once; this catches what a dropped socket missed.
  useInterval(refreshInbox, INBOX_REFRESH_MS);

  function handleFrame(frame: ChatFrame) {
    typist.onFrame(frame);
    if (
      frame.kind !== "created" &&
      frame.kind !== "updated" &&
      frame.kind !== "deleted" &&
      frame.kind !== "revoked"
    ) {
      return;
    }
    if (frame.kind !== "revoked") {
      patchRoom(frame.roomId, (items) => applyFrame(items, frame));
    }
    const { stale } = inboxAfterFrame(rooms, frame, roomId, viewerId);
    setRooms(
      (previous) => inboxAfterFrame(previous, frame, roomId, viewerId).rooms,
    );
    if (stale) {
      refreshInbox();
    }
    if (frame.kind === "revoked" && frame.roomId === roomId) {
      selectRoom(null);
      setNotice("Bạn không còn quyền vào cuộc trò chuyện này.");
    }
  }

  // After a reconnect, fetch what the socket missed. The first connect follows the server render.
  function handleOpen() {
    if (!openedRef.current) {
      openedRef.current = true;
      return;
    }
    if (roomId) {
      refreshRoom(roomId);
    }
    refreshInbox();
  }

  async function poll() {
    const result = await attempt(() => pollMessenger(roomId));
    if (!result.ok) {
      return;
    }
    const { rooms: next, page } = result.data;
    setRooms(roomId ? withUnread(next, roomId, 0) : next);
    if (roomId && page) {
      setCaches((previous) => withNewestPage(previous, roomId, page));
    }
  }

  async function openDm(slug: string, userId: string): Promise<ChatResult> {
    const result = await attempt(() => openDirectMessage(slug, userId));
    if (!result.ok) {
      return result;
    }
    const inbox = await attempt(() => loadInbox());
    if (inbox.ok) {
      setRooms(inbox.data);
    }
    selectRoom(result.data.room_id);
    return { ok: true, data: null };
  }

  const actions = messageActions(patchRoom, setCaches, onSent);

  return {
    rooms,
    typing: typist.typing,
    typed: () => roomId && typist.typed(roomId),
    room,
    cache,
    notice,
    loadError,
    selectRoom,
    retry: () => roomId && refreshRoom(roomId),
    handleFrame,
    handleOpen,
    refreshInbox,
    poll,
    openDm,
    loadOlder: () =>
      roomId ? actions.loadOlder(roomId, cache?.nextBefore) : null,
    send: (body: string, replyToId: string | null, files: string[]) =>
      roomId
        ? actions.send(roomId, body, replyToId, files)
        : Promise.resolve<ChatResult>({ ok: true, data: null }),
    edit: actions.edit,
    remove: actions.remove,
    react: actions.react,
    pin: actions.pin,
  };
}

export type MessengerState = ReturnType<typeof useMessenger>;
