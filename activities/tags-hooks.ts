import { useSyncExternalStore } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { ApiError } from "../core/api.ts";
import { workspaceKeys } from "../workspace/keys.ts";
import { activityKeys } from "./keys.ts";
import {
  createOrgTag,
  hardDeleteOrgTag,
  createMyTag,
  deleteMyTag,
  listMyTagPosts,
  listMyTags,
  listOrgTags,
  listOwnedTags,
  mergeOrgTag,
  renameMyTag,
  renameOrgTag,
  restoreOrgTag,
  searchPublicTags,
  softDeleteOrgTag,
  type MyTag,
  type MyTagPost,
  type OrgTag,
  type OrgTagPage,
  type OwnedTag,
  type PublicTag,
} from "./tags-api.ts";

export function usePublicTagSearch(
  query: string,
): UseQueryResult<PublicTag[], ApiError> {
  return useQuery({
    queryKey: activityKeys.tags(query.trim()),
    queryFn: () => searchPublicTags(query),
    enabled: query.trim().length > 0,
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  });
}

export function useOwnedTags(
  orgId: string | null,
): UseQueryResult<OwnedTag[], ApiError> {
  return useQuery({
    queryKey: activityKeys.ownedTags(orgId ?? ""),
    queryFn: () => listOwnedTags(orgId ?? ""),
    enabled: orgId !== null && orgId !== "",
    staleTime: 30_000,
  });
}

export function useOrgTags(
  orgId: string | null,
  trash = false,
  enabled = true,
): UseQueryResult<OrgTagPage, ApiError> {
  return useQuery({
    queryKey: activityKeys.orgTags(orgId ?? "", trash),
    queryFn: () => listOrgTags(orgId ?? "", trash),
    enabled: orgId !== null && enabled,
    staleTime: 30_000,
  });
}

function useOrgTagMutation<TInput>(
  fn: (orgId: string, input: TInput) => Promise<OrgTag | void>,
  orgId: string | null,
  successToast: string,
): UseMutationResult<OrgTag | void, ApiError, TInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TInput) => fn(orgId ?? "", input),
    meta: { successToast },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
      // Rename, merge, trash, and restore rewrite post chips too.
      queryClient.invalidateQueries({
        queryKey: [...workspaceKeys.all, "posts"],
      });
    },
  });
}

export function useCreateOrgTag(
  orgId: string | null,
): UseMutationResult<OrgTag | void, ApiError, { name: string }> {
  return useOrgTagMutation(
    (id, input) => createOrgTag(id, input.name),
    orgId,
    "tag.create",
  );
}

export function useRenameOrgTag(
  orgId: string | null,
): UseMutationResult<
  OrgTag | void,
  ApiError,
  { slug: string; name: string }
> {
  return useOrgTagMutation(
    (id, input) => renameOrgTag(id, input.slug, input.name),
    orgId,
    "tag.rename",
  );
}

export function useMergeOrgTag(
  orgId: string | null,
): UseMutationResult<
  OrgTag | void,
  ApiError,
  { slug: string; into: string }
> {
  return useOrgTagMutation(
    (id, input) => mergeOrgTag(id, input.slug, input.into),
    orgId,
    "tag.merge",
  );
}

export function useSoftDeleteOrgTag(
  orgId: string | null,
): UseMutationResult<OrgTag | void, ApiError, { slug: string }> {
  return useOrgTagMutation(
    (id, input) => softDeleteOrgTag(id, input.slug),
    orgId,
    "tag.trash",
  );
}

export function useHardDeleteOrgTag(
  orgId: string | null,
): UseMutationResult<OrgTag | void, ApiError, { slug: string }> {
  return useOrgTagMutation(
    (id, input) => hardDeleteOrgTag(id, input.slug),
    orgId,
    "tag.erase",
  );
}

function useMyTagMutation<TInput>(
  fn: (input: TInput) => Promise<MyTag | void>,
  successToast: string,
): UseMutationResult<MyTag | void, ApiError, TInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    meta: { successToast },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
      queryClient.invalidateQueries({
        queryKey: [...workspaceKeys.all, "posts"],
      });
    },
  });
}

// The URL update is a navigation. A click writes here first so the row
// and the rail paint before that navigation commits.
let pickedSlug = "";
let pickAhead = false;
const pickListeners = new Set<() => void>();

function emitPick(): void {
  for (const listener of pickListeners) listener();
}

function subscribePick(listener: () => void): () => void {
  pickListeners.add(listener);
  return () => pickListeners.delete(listener);
}

function pickSnapshot(): string {
  return pickedSlug;
}

export function selectMyTag(slug: string): void {
  pickAhead = true;
  if (pickedSlug === slug) return;
  pickedSlug = slug;
  emitPick();
}

export function followTagParam(param: string): void {
  if (pickAhead) {
    if (param === pickedSlug) pickAhead = false;
    return;
  }
  if (pickedSlug === param) return;
  pickedSlug = param;
  emitPick();
}

export function useShownTag(param: string): string {
  const picked = useSyncExternalStore(subscribePick, pickSnapshot, pickSnapshot);
  return pickAhead || picked !== "" ? picked : param;
}

export function useMyTags(): UseQueryResult<MyTag[], ApiError> {
  return useQuery({
    queryKey: activityKeys.myTags(),
    queryFn: listMyTags,
    staleTime: 30_000,
  });
}

export function useMyTagPosts(
  slug: string | null,
): UseQueryResult<MyTagPost[], ApiError> {
  return useQuery({
    queryKey: activityKeys.myTagPosts(slug ?? ""),
    queryFn: () => listMyTagPosts(slug ?? ""),
    enabled: slug !== null && slug !== "",
    staleTime: 30_000,
  });
}

export function useCreateMyTag(): UseMutationResult<
  MyTag | void,
  ApiError,
  { name: string }
> {
  return useMyTagMutation((input) => createMyTag(input.name), "tag.create");
}

export function useRenameMyTag(): UseMutationResult<
  MyTag | void,
  ApiError,
  { slug: string; name: string }
> {
  return useMyTagMutation(
    (input) => renameMyTag(input.slug, input.name),
    "tag.rename",
  );
}

export function useDeleteMyTag(): UseMutationResult<
  MyTag | void,
  ApiError,
  { slug: string }
> {
  return useMyTagMutation((input) => deleteMyTag(input.slug), "tag.erase");
}

export function useRestoreOrgTag(
  orgId: string | null,
): UseMutationResult<OrgTag | void, ApiError, { slug: string }> {
  return useOrgTagMutation(
    (id, input) => restoreOrgTag(id, input.slug),
    orgId,
    "tag.restore",
  );
}
