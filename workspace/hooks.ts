import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type UseMutationResult,
  type UseQueryResult,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ApiError } from "../core/api.ts";
import {
  deleteChatMessage,
  editChatMessage,
  getChatUnread,
  listChatInbox,
  listChatMessages,
  listDmRooms,
  listSharedMedia,
  listSharedMediaAuthors,
  markChatRead,
  openDmRoom,
  pinChatMessage,
  sendChatMessage,
  setChatMute,
  toggleChatReaction,
  unpinChatMessage,
  uploadChatAttachment,
  type ChatAttachment,
  type ChatPage,
  type ChatInbox,
  type DmRoom,
  type DmRoomPage,
  type ReadState,
  type ChatMessage,
  type SendChatInput,
  type SharedMediaAuthorsPage,
  type SharedMediaKind,
  type SharedMediaPage,
} from "./api.ts";
import { workspaceKeys } from "./keys.ts";

// Board (posts/comments) hooks live in board-hooks.ts; re-exported so
// existing imports from ./hooks.ts keep working.
export * from "./board-hooks.ts";

const CHAT_PAGE_SIZE = 30;
const MEDIA_PAGE_SIZE = 30;

// Org selection shared by every workspace view: ?org= deep link, falling
// back to the first org once the picker data arrives.
export function useWorkspaceOrg(orgItems: { id: string }[]): {
  orgId: string | null;
  selectOrg: (id: string) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const orgParam = searchParams.get("org");
  const orgId =
    orgParam !== null && orgItems.some((item) => item.id === orgParam)
      ? orgParam
      : (orgItems[0]?.id ?? null);
  // Deep-link hygiene: once the membership list lands, drop or rewrite a
  // missing/unknown ?org= so the URL always names the rendered org.
  useEffect(() => {
    if (orgId !== null && orgParam !== orgId) {
      const next = new URLSearchParams(searchParams);
      next.set("org", orgId);
      setSearchParams(next, { replace: true });
    }
  }, [orgParam, orgId, searchParams, setSearchParams]);
  return {
    orgId,
    selectOrg: (id: string) => {
      const next = new URLSearchParams(searchParams);
      next.set("org", id);
      setSearchParams(next, { replace: true });
    },
  };
}

export function useChatMessages(
  roomId: string | null,
): UseInfiniteQueryResult<InfiniteData<ChatPage>, ApiError> {
  return useInfiniteQuery({
    queryKey: workspaceKeys.chat(roomId),
    queryFn: ({ pageParam }) =>
      listChatMessages(roomId as string, {
        limit: CHAT_PAGE_SIZE,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: roomId !== null,
  });
}

export function useChatUnread(
  roomId: string | null,
): UseQueryResult<{ unread: number }, ApiError> {
  return useQuery({
    queryKey: workspaceKeys.chatUnread(roomId),
    queryFn: () => getChatUnread(roomId as string),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: roomId !== null,
  });
}

export function useChatInbox(
  enabled = true,
): UseQueryResult<ChatInbox, ApiError> {
  return useQuery({
    queryKey: workspaceKeys.chatInbox(),
    queryFn: listChatInbox,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled,
  });
}

// Total unread across every room: the nav badge on "Tro chuyen". Muted
// rooms keep their row counter but stay out of the global badge.
export function useChatUnreadTotal(enabled = true): number {
  const inbox = useChatInbox(enabled);
  return (inbox.data?.items ?? []).reduce(
    (total, room) => total + (room.muted ? 0 : room.unread),
    0,
  );
}

async function invalidateChat(
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: [...workspaceKeys.all, "chat"],
  });
  await queryClient.invalidateQueries({
    queryKey: [...workspaceKeys.all, "chat-unread"],
  });
  await queryClient.invalidateQueries({
    queryKey: [...workspaceKeys.all, "chat-media"],
  });
  await queryClient.invalidateQueries({
    queryKey: workspaceKeys.chatInbox(),
  });
}

// Room info panel tabs: one infinite list per (kind, sender filter).
export function useSharedMedia(
  roomId: string | null,
  kind: SharedMediaKind,
  authorId: string | null,
  enabled = true,
): UseInfiniteQueryResult<InfiniteData<SharedMediaPage>, ApiError> {
  return useInfiniteQuery({
    queryKey: workspaceKeys.chatMedia(roomId, kind, authorId ?? undefined),
    queryFn: ({ pageParam }) =>
      listSharedMedia(roomId as string, kind, {
        limit: MEDIA_PAGE_SIZE,
        cursor: pageParam,
        authorId: authorId ?? undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: enabled && roomId !== null,
  });
}

// Option list for the sender filter: everyone who still has indexed
// items in the room (empty while nothing was ever shared).
export function useSharedMediaAuthors(
  roomId: string | null,
  enabled = true,
): UseQueryResult<SharedMediaAuthorsPage, ApiError> {
  return useQuery({
    queryKey: workspaceKeys.chatMediaAuthors(roomId),
    queryFn: () => listSharedMediaAuthors(roomId as string),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: enabled && roomId !== null,
  });
}

export function useSendChatMessage(
  roomId: string,
): UseMutationResult<ChatMessage, ApiError, SendChatInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendChatInput) => sendChatMessage(roomId, input),
    onSuccess: () => invalidateChat(queryClient),
  });
}

export function useEditChatMessage(
  roomId: string,
): UseMutationResult<ChatMessage, ApiError, { messageId: string; body: string }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, body }) =>
      editChatMessage(roomId, messageId, body),
    onSuccess: () => invalidateChat(queryClient),
  });
}

export function useUploadChatAttachment(
  roomId: string,
): UseMutationResult<ChatAttachment, ApiError, File> {
  return useMutation({
    mutationFn: (file: File) => uploadChatAttachment(roomId, file),
  });
}

export function useDeleteChatMessage(
  roomId: string,
): UseMutationResult<void, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => deleteChatMessage(roomId, messageId),
    onSuccess: () => invalidateChat(queryClient),
  });
}

export function useToggleReaction(
  roomId: string,
): UseMutationResult<
  ChatMessage,
  ApiError,
  { messageId: string; emoji: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, emoji }) =>
      toggleChatReaction(roomId, messageId, emoji),
    onSuccess: () => invalidateChat(queryClient),
  });
}

export function usePinMessage(
  roomId: string,
): UseMutationResult<void, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => pinChatMessage(roomId, messageId),
    onSuccess: () => invalidateChat(queryClient),
  });
}

export function useUnpinMessage(
  roomId: string,
): UseMutationResult<void, ApiError, void> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => unpinChatMessage(roomId),
    onSuccess: () => invalidateChat(queryClient),
  });
}

export function useMuteRoom(
  roomId: string,
): UseMutationResult<void, ApiError, boolean> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (muted: boolean) => setChatMute(roomId, muted),
    onSuccess: () => invalidateChat(queryClient),
  });
}

export function useMarkChatRead(
  roomId: string,
): UseMutationResult<ReadState, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => markChatRead(roomId, messageId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...workspaceKeys.all, "chat-unread"],
      });
    },
  });
}

export function useDmRooms(
  orgId: string | null,
): UseQueryResult<DmRoomPage, ApiError> {
  return useQuery({
    queryKey: workspaceKeys.dmRooms(orgId),
    queryFn: () => listDmRooms(orgId as string),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: orgId !== null,
  });
}

export function useOpenDm(
  orgId: string,
): UseMutationResult<DmRoom, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (peerId: string) => openDmRoom(orgId, peerId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...workspaceKeys.all, "dm-rooms"],
      });
    },
  });
}
