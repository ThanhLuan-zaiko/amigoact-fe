import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type UseInfiniteQueryResult,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import {
  addComment,
  createPost,
  createRevision,
  deleteComment,
  deletePost,
  getPost,
  getPublicOrgPost,
  listComments,
  listDraftPosts,
  listPosts,
  listTrashPosts,
  publishPost,
  restorePost,
  setPostPinned,
  unpublishPost,
  updatePost,
  type CommentPage,
  type CreatePostInput,
  type OrgComment,
  type OrgPost,
  type PostKind,
  type PostListParams,
  type PostPage,
  type UpdatePostInput,
} from "./board-api.ts";
import { workspaceKeys } from "./keys.ts";

export const POST_PAGE_SIZE = 15;
export const SHELF_PAGE_SIZE = 20;
const COMMENT_PAGE_SIZE = 20;

const QUERY_DEFAULTS = {
  staleTime: 30_000,
  retry: 1,
  refetchOnWindowFocus: false,
} as const;

// Numbered feed pages; keepPreviousData keeps the last page rendered while
// the next one loads so page switches do not flash a loading state.
export function useOrgPosts(
  orgId: string | null,
  kind?: PostKind,
  page = 1,
): UseQueryResult<PostPage, ApiError> {
  const params: PostListParams = { limit: POST_PAGE_SIZE, kind, page };
  return useQuery({
    queryKey: workspaceKeys.posts(orgId, params),
    queryFn: () => listPosts(orgId as string, params),
    placeholderData: keepPreviousData,
    ...QUERY_DEFAULTS,
    enabled: orgId !== null,
  });
}

// Drafts (own) and trash (own, or whole org for managers) shelves.
export function usePostShelf(
  orgId: string | null,
  shelf: "drafts" | "trash",
  page = 1,
  enabled = true,
): UseQueryResult<PostPage, ApiError> {
  const fetchPage = shelf === "drafts" ? listDraftPosts : listTrashPosts;
  return useQuery({
    queryKey:
      shelf === "drafts"
        ? workspaceKeys.drafts(orgId, page)
        : workspaceKeys.trash(orgId, page),
    queryFn: () =>
      fetchPage(orgId as string, { limit: SHELF_PAGE_SIZE, page }),
    placeholderData: keepPreviousData,
    ...QUERY_DEFAULTS,
    enabled: enabled && orgId !== null,
  });
}

export function useOrgPost(
  orgId: string | null,
  postId: string | null,
): UseQueryResult<OrgPost, ApiError> {
  return useQuery({
    queryKey: workspaceKeys.post(orgId, postId),
    queryFn: () => getPost(orgId as string, postId as string),
    ...QUERY_DEFAULTS,
    retry: (count, error) => error.status !== 404 && count < 1,
    enabled: orgId !== null && postId !== null,
  });
}

// Guest read of a published announcement on /orgs/:slug/posts/:postId.
export function usePublicOrgPost(
  slug: string | undefined,
  postId: string | undefined,
): UseQueryResult<OrgPost, ApiError> {
  return useQuery({
    queryKey: workspaceKeys.publicPost(slug ?? null, postId ?? null),
    queryFn: () => getPublicOrgPost(slug as string, postId as string),
    ...QUERY_DEFAULTS,
    retry: (count, error) => error.status !== 404 && count < 1,
    enabled: slug !== undefined && slug !== "" && postId != null,
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

function useBoardMutation<TVars, TResult>(
  mutationFn: (vars: TVars) => Promise<TResult>,
  toastKey?: string,
): UseMutationResult<TResult, ApiError, TVars> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successToast: toastKey },
    mutationFn,
    onSuccess: () => invalidateBoard(queryClient),
  });
}

export function useCreatePost(
  orgId: string,
): UseMutationResult<OrgPost, ApiError, CreatePostInput> {
  return useBoardMutation((input: CreatePostInput) => createPost(orgId, input), "post.save");
}

export function useUpdatePost(
  orgId: string,
): UseMutationResult<OrgPost, ApiError, { postId: string; input: UpdatePostInput }> {
  return useBoardMutation(
    ({ postId, input }: { postId: string; input: UpdatePostInput }) =>
      updatePost(orgId, postId, input),
    "post.save",
  );
}

export function usePublishPost(
  orgId: string,
): UseMutationResult<OrgPost, ApiError, string> {
  return useBoardMutation((postId: string) => publishPost(orgId, postId), "post.publish");
}

export function useCreateRevision(
  orgId: string,
): UseMutationResult<OrgPost, ApiError, string> {
  return useBoardMutation((postId: string) => createRevision(orgId, postId));
}

export function useUnpublishPost(
  orgId: string,
): UseMutationResult<OrgPost, ApiError, string> {
  return useBoardMutation((postId: string) => unpublishPost(orgId, postId), "post.unpublish");
}

export function useSoftDeletePost(
  orgId: string,
): UseMutationResult<void, ApiError, string> {
  return useBoardMutation((postId: string) => deletePost(orgId, postId), "post.delete");
}

export function useHardDeletePost(
  orgId: string,
): UseMutationResult<void, ApiError, string> {
  return useBoardMutation((postId: string) => deletePost(orgId, postId, true), "post.delete");
}

export function useRestorePost(
  orgId: string,
): UseMutationResult<OrgPost, ApiError, string> {
  return useBoardMutation((postId: string) => restorePost(orgId, postId), "post.restore");
}

export function useSetPostPinned(
  orgId: string,
): UseMutationResult<OrgPost, ApiError, { postId: string; pinned: boolean }> {
  return useBoardMutation(
    ({ postId, pinned }: { postId: string; pinned: boolean }) =>
      setPostPinned(orgId, postId, pinned),
    "post.pin",
  );
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
    ...QUERY_DEFAULTS,
    enabled: enabled && orgId !== null,
  });
}

export function useAddComment(
  orgId: string,
  postId: string,
): UseMutationResult<OrgComment, ApiError, string> {
  return useBoardMutation((body: string) => addComment(orgId, postId, body));
}

export function useDeleteComment(
  orgId: string,
  postId: string,
): UseMutationResult<void, ApiError, string> {
  return useBoardMutation((commentId: string) =>
    deleteComment(orgId, postId, commentId),
  );
}
