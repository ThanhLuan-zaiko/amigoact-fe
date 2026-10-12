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
  getChatUnread,
  listChatMessages,
  listDmRooms,
  markChatRead,
  openDmRoom,
  sendChatMessage,
  type ChatPage,
  type DmRoom,
  type DmRoomPage,
  type ReadState,
  type ChatMessage,
} from "./api.ts";
import { workspaceKeys } from "./keys.ts";

// Board (posts/comments) hooks live in board-hooks.ts; re-exported so
// existing imports from ./hooks.ts keep working.
export * from "./board-hooks.ts";

const CHAT_PAGE_SIZE = 30;

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

async function invalidateChat(
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: [...workspaceKeys.all, "chat"],
  });
  await queryClient.invalidateQueries({
    queryKey: [...workspaceKeys.all, "chat-unread"],
  });
}

export function useSendChatMessage(
  roomId: string,
): UseMutationResult<ChatMessage, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => sendChatMessage(roomId, body),
    onSuccess: () => invalidateChat(queryClient),
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
