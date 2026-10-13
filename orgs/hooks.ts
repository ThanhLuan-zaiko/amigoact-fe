import { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { ApiError } from "../core/api.ts";
import { subscribeChannel } from "../core/realtime.ts";
import {
  fetchPublicOrg,
  joinOrg,
  listPublicOrgPosts,
  listPublicOrgs,
  type OrgMembership,
  type PublicOrgDetail,
  type PublicOrgPage,
  type PublicOrgParams,
  type PublicPostPage,
} from "./api.ts";
import { orgKeys } from "./keys.ts";

export function usePublicOrgs(
  params: PublicOrgParams,
): UseQueryResult<PublicOrgPage, ApiError> {
  return useQuery({
    queryKey: orgKeys.directory(params),
    queryFn: () => listPublicOrgs(params),
    staleTime: 60_000,
  });
}

export function usePublicOrg(
  slug: string | undefined,
): UseQueryResult<PublicOrgDetail, ApiError> {
  return useQuery({
    queryKey: orgKeys.detail(slug ?? ""),
    queryFn: () => fetchPublicOrg(slug ?? ""),
    enabled: slug !== undefined && slug !== "",
    retry: false,
    staleTime: 60_000,
  });
}

export const ORG_NEWS_PAGE_SIZE = 9;

export function usePublicOrgPosts(
  slug: string | undefined,
  page = 1,
): UseQueryResult<PublicPostPage, ApiError> {
  return useQuery({
    queryKey: orgKeys.posts(slug ?? "", page),
    queryFn: () =>
      listPublicOrgPosts(slug ?? "", {
        limit: ORG_NEWS_PAGE_SIZE,
        page,
      }),
    enabled: slug !== undefined && slug !== "",
    retry: false,
    staleTime: 60_000,
  });
}

export const ORGS_DIRECTORY_CHANNEL = "orgs:directory";

/**
 * Live public directory: any visibility event (created/updated/
 * restored/removed) revalidates every org query so hidden or deleted
 * orgs disappear immediately. Payload is only a refetch hint - REST
 * stays the fact source, so forged or stale events cannot resurrect
 * a hidden org.
 */
export function useOrgsRealtime(): void {
  const queryClient = useQueryClient();
  useEffect(
    () =>
      subscribeChannel(ORGS_DIRECTORY_CHANNEL, () => {
        void queryClient.invalidateQueries({ queryKey: orgKeys.all });
      }),
    [queryClient],
  );
}

export function useJoinOrg(
  slug: string,
): UseMutationResult<OrgMembership, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orgId: string) => joinOrg(orgId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: orgKeys.all });
      await queryClient.invalidateQueries({ queryKey: orgKeys.detail(slug) });
    },
  });
}
