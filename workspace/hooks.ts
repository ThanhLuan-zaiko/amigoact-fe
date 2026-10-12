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
  addComment,
  createPost,
  deleteChatMessage,
  deleteComment,
  deletePost,
  getChatUnread,
  listChatMessages,
  listComments,
  listDmRooms,
  listPosts,
  markChatRead,
  openDmRoom,
  sendChatMessage,
  setPostPinned,
  updatePost,
  type ChatPage,
  type CommentPage,
  type CreatePostInput,
  type DmRoom,
  type DmRoomPage,
  type OrgComment,
  type OrgPost,
  type PostKind,
  type PostListParams,
  type PostPage,
  type ReadState,
  type ChatMessage,
  type UpdatePostInput,
} from "./api.ts";
import { workspaceKeys } from "./keys.ts";

const POST_PAGE_SIZE = 15;
const COMMENT_PAGE_SIZE = 20;
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

export function useOrgPosts(
  orgId: string | null,
  kind?: PostKind,
): UseInfiniteQueryResult<InfiniteData<PostPage>, ApiError> {
  const params: PostListParams = { limit: POST_PAGE_SIZE, kind };
  return useInfiniteQuery({
    queryKey: workspaceKeys.posts(orgId, params),
    queryFn: ({ pageParam }) =>
      listPosts(orgId as string, {
        ...params,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: orgId !== null,
  });
}

async function invalidateBoard(
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<void> {
  await queryClient.invalidateQueries({
    queryKey: [...workspaceKeys.all, "posts"],
  });
  await queryClient.invalidateQueries({
    queryKey: [...workspaceKeys.all, "comments"],
  });
}

export function useCreatePost(
  orgId: string,
): UseMutationResult<OrgPost, ApiError, CreatePostInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePostInput) => createPost(orgId, input),
    onSuccess: () => invalidateBoard(queryClient),
  });
}

export function useUpdatePost(
  orgId: string,
): UseMutationResult<OrgPost, ApiError, { postId: string; input: UpdatePostInput }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, input }) => updatePost(orgId, postId, input),
    onSuccess: () => invalidateBoard(queryClient),
  });
}

export function useDeletePost(
  orgId: string,
): UseMutationResult<void, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => deletePost(orgId, postId),
    onSuccess: () => invalidateBoard(queryClient),
  });
}

export function useSetPostPinned(
  orgId: string,
): UseMutationResult<OrgPost, ApiError, { postId: string; pinned: boolean }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, pinned }) => setPostPinned(orgId, postId, pinned),
    onSuccess: () => invalidateBoard(queryClient),
  });
}

export function useComments(
  orgId: string | null,
  postId: string,
  enabled: boolean,
): UseInfiniteQueryResult<InfiniteData<CommentPage>, ApiError> {
  return useInfiniteQuery({
    queryKey: workspaceKeys.comments(postId),
    queryFn: ({ pageParam }) =>
      listComments(orgId as string, postId, {
        limit: COMMENT_PAGE_SIZE,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: enabled && orgId !== null,
  });
}

export function useAddComment(
  orgId: string,
  postId: string,
): UseMutationResult<OrgComment, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => addComment(orgId, postId, body),
    onSuccess: () => invalidateBoard(queryClient),
  });
}

export function useDeleteComment(
  orgId: string,
  postId: string,
): UseMutationResult<void, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(orgId, postId, commentId),
    onSuccess: () => invalidateBoard(queryClient),
  });
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
