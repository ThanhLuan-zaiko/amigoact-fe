import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { ApiError } from "../core/api.ts";
import { activityKeys } from "./keys.ts";
import {
  createOrgTag,
  hardDeleteOrgTag,
  listOrgTags,
  mergeOrgTag,
  renameOrgTag,
  restoreOrgTag,
  searchPublicTags,
  softDeleteOrgTag,
  type OrgTag,
  type OrgTagPage,
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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: activityKeys.all }),
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

export function useRestoreOrgTag(
  orgId: string | null,
): UseMutationResult<OrgTag | void, ApiError, { slug: string }> {
  return useOrgTagMutation(
    (id, input) => restoreOrgTag(id, input.slug),
    orgId,
    "tag.restore",
  );
}
