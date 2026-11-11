"use client";

import { useEffect, useRef, useState } from "react";
import {
  deleteChatMessage,
  editChatMessage,
  loadMessages,
  loadRooms,
  markRoomRead,
  openDirectMessage,
  pollChat,
  sendChatMessage,
  setPin,
  setReaction,
} from "@/app/_actions/chat";
import {
  attempt,
  buildRooms,
  type ChatChannel,
  type ChatDm,
  type ChatMessage,
  type ChatResult,
  type ChatViewer,
  chatPath,
  type MessagePage,
  pickRoom,
  type UnreadItem,
  unreadMap,
} from "@/lib/chat";
import {
  applyFrame,
  type CacheMap,
  type ChatFrame,
  mergeMessages,
  needsReadMark,
  patchCache,
  replaceMessage,
  toggleReaction,
  unreadAfterFrame,
  withNewestPage,
  withOlderPage,
} from "@/lib/chatEvents";
import { useInterval } from "./useInterval";

export type ChatStateOptions = {
  slug: string;
  general: { id: string; name: string };
  viewer: ChatViewer;
  channels: ChatChannel[];
  dms: ChatDm[];
  unread: UnreadItem[];
  initialRoomId: string | null;
  initialPage: MessagePage | null;
  // True when the list and the open room show side by side (xl and wider).
  wide: boolean;
};

const ROOMS_REFRESH_MS = 60_000;

// Rooms, unread counts and loaded messages of the chat page, and the actions that change them.
export function useChatState(options: ChatStateOptions) {
  const { slug, general, viewer, wide } = options;
  const [channels, setChannels] = useState(options.channels);
  const [dms, setDms] = useState(options.dms);
  const [unread, setUnread] = useState(() => unreadMap(options.unread));
  const [selectedId, setSelectedId] = useState(options.initialRoomId);
  const [notice, setNotice] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [caches, setCaches] = useState<CacheMap>(() => {
    const { initialPage, initialRoomId } = options;
    return initialPage
      ? withNewestPage({}, initialRoomId ?? general.id, initialPage)
      : {};
  });
  const markedRef = useRef<Record<string, string>>({});
  const openedRef = useRef(false);

  const rooms = buildRooms(general, channels, dms);
  const room = pickRoom(rooms, selectedId);
  const paneVisible = wide || selectedId !== null;
  const cache = caches[room.id];
  const newestId = cache?.items.at(-1)?.id;

  function patchRoom(
    roomId: string,
    change: (items: ChatMessage[]) => ChatMessage[],
  ) {
    setCaches((previous) => patchCache(previous, roomId, change));
  }

  function storeNewest(roomId: string, page: MessagePage) {
    setCaches((previous) => withNewestPage(previous, roomId, page));
  }

  function selectRoom(roomId: string | null) {
    setSelectedId(roomId);
    setNotice(null);
    setLoadError(null);
    window.history.replaceState(null, "", chatPath(slug, roomId));
  }

  async function refreshRooms() {
    const result = await attempt(() => loadRooms(slug));
    if (result.ok) {
      setChannels(result.data.channels);
      setDms(result.data.dms);
      setUnread(unreadMap(result.data.unread));
    }
  }

  async function refreshRoom(roomId: string) {
    const result = await attempt(() => loadMessages(roomId, null));
    if (result.ok) {
      storeNewest(roomId, result.data);
      setLoadError(null);
    } else {
      setLoadError(result.error);
    }
  }

  // A room opened for the first time loads its newest page.
  const roomId = room.id;
  const loaded = cache !== undefined;
  const latestRef = useRef(refreshRoom);
  useEffect(() => {
    latestRef.current = refreshRoom;
  });
  useEffect(() => {
    if (!loaded) {
      latestRef.current(roomId);
    }
  }, [roomId, loaded]);

  // The open room is read up to its newest message, and its unread count clears.
  useEffect(() => {
    if (
      !paneVisible ||
      !needsReadMark(markedRef.current[roomId] ?? null, newestId)
    ) {
      return;
    }
    markedRef.current[roomId] = newestId;
    setUnread((previous) => ({ ...previous, [roomId]: 0 }));
    attempt(() => markRoomRead(roomId, newestId));
  }, [roomId, newestId, paneVisible]);

  // New channels and direct messages from other people have no socket event, so look again now and then.
  useInterval(refreshRooms, ROOMS_REFRESH_MS);

  function handleFrame(frame: ChatFrame) {
    if (
      frame.kind === "created" ||
      frame.kind === "updated" ||
      frame.kind === "deleted"
    ) {
      patchRoom(frame.roomId, (items) => applyFrame(items, frame));
      setUnread((previous) =>
        unreadAfterFrame(
          previous,
          frame,
          paneVisible ? roomId : null,
          viewer.userId,
        ),
      );
      return;
    }
    if (frame.kind === "revoked") {
      setChannels((previous) => previous.filter((c) => c.id !== frame.roomId));
      setDms((previous) =>
        previous.filter((dm) => dm.room_id !== frame.roomId),
      );
      if (frame.roomId === roomId) {
        selectRoom(null);
        setNotice("Bạn không còn quyền vào phòng này.");
      }
    }
  }

  // After a reconnect, fetch what the socket missed. The first connect follows the server render.
  function handleOpen() {
    if (!openedRef.current) {
      openedRef.current = true;
      return;
    }
    refreshRoom(roomId);
    refreshRooms();
  }

  async function poll() {
    const result = await attempt(() => pollChat(slug, roomId));
    if (result.ok) {
      storeNewest(roomId, result.data.page);
      const counts = unreadMap(result.data.unread);
      if (paneVisible) {
        counts[roomId] = 0;
      }
      setUnread(counts);
    }
  }

  async function loadOlder(): Promise<ChatResult> {
    const before = cache?.nextBefore;
    if (!before) {
      return { ok: true, data: null };
    }
    const result = await attempt(() => loadMessages(roomId, before));
    if (!result.ok) {
      return result;
    }
    setCaches((previous) => withOlderPage(previous, roomId, result.data));
    return { ok: true, data: null };
  }

  async function send(
    body: string,
    replyToId: string | null,
  ): Promise<ChatResult> {
    const target = roomId;
    const result = await attempt(() =>
      sendChatMessage(target, body, replyToId),
    );
    if (!result.ok) {
      return result;
    }
    patchRoom(target, (items) => mergeMessages(items, [result.data]));
    return { ok: true, data: null };
  }

  async function edit(message: ChatMessage, body: string): Promise<ChatResult> {
    const result = await attempt(() => editChatMessage(message.id, body));
    if (!result.ok) {
      return result;
    }
    patchRoom(message.room_id, (items) => replaceMessage(items, result.data));
    return { ok: true, data: null };
  }

  async function remove(message: ChatMessage): Promise<ChatResult> {
    const result = await attempt(() => deleteChatMessage(message.id));
    if (result.ok) {
      patchRoom(message.room_id, (items) =>
        items.filter((m) => m.id !== message.id),
      );
    }
    return result;
  }

  // The reaction flips at once and flips back if the server refuses it.
  async function react(
    message: ChatMessage,
    emoji: string,
  ): Promise<ChatResult> {
    const on = !message.reactions.some((r) => r.emoji === emoji && r.mine);
    patchRoom(message.room_id, (items) => {
      const current = items.find((m) => m.id === message.id);
      return current
        ? replaceMessage(items, toggleReaction(current, emoji))
        : items;
    });
    const result = await attempt(() => setReaction(message.id, emoji, on));
    if (!result.ok) {
      patchRoom(message.room_id, (items) => replaceMessage(items, message));
    }
    return result;
  }

  async function pin(message: ChatMessage): Promise<ChatResult> {
    const on = !message.pinned;
    const result = await attempt(() => setPin(message.room_id, message.id, on));
    if (result.ok) {
      patchRoom(message.room_id, (items) => {
        const current = items.find((m) => m.id === message.id);
        return current
          ? replaceMessage(items, { ...current, pinned: on })
          : items;
      });
    }
    return result;
  }

  async function openDm(userId: string): Promise<ChatResult> {
    const result = await attempt(() => openDirectMessage(slug, userId));
    if (!result.ok) {
      return result;
    }
    const dm = result.data;
    setDms((previous) =>
      previous.some((item) => item.room_id === dm.room_id)
        ? previous
        : [...previous, dm],
    );
    selectRoom(dm.room_id);
    return { ok: true, data: null };
  }

  return {
    rooms,
    room,
    selectedId,
    paneVisible,
    unread,
    cache,
    notice,
    loadError,
    selectRoom,
    retry: () => refreshRoom(roomId),
    handleFrame,
    handleOpen,
    poll,
    loadOlder,
    send,
    edit,
    remove,
    react,
    pin,
    openDm,
  };
}

export type ChatState = ReturnType<typeof useChatState>;
