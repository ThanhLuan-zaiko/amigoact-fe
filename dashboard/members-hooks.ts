import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { ApiError } from "../core/api.ts";
import {
  membersChannel,
  notificationsChannel,
  subscribeChannel,
} from "../core/realtime.ts";
import {
  acceptInvite,
  declineInvite,
  inviteMember,
  joinOrg,
  listMyMemberships,
  listOrgMembers,
  removeMember,
  updateMember,
  type DashboardMember,
  type MemberListPage,
  type MemberListParams,
  type MembershipPage,
  type UpdateMemberInput,
} from "./api.ts";
import { dashboardKeys } from "./keys.ts";

export function useOrgMembers(
  orgId: string | null,
  params: MemberListParams = {},
): UseQueryResult<MemberListPage, ApiError> {
  return useQuery({
    queryKey: dashboardKeys.members(orgId, params),
    queryFn: () => listOrgMembers(orgId as string, params),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    enabled: orgId !== null,
  });
}

export function useMyMemberships(
  status?: string,
  enabled = true,
): UseQueryResult<MembershipPage, ApiError> {
  return useQuery({
    queryKey: dashboardKeys.myMemberships(status),
    queryFn: () => listMyMemberships(status),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled,
  });
}

// Member mutations change both the roster and member_count on myOrgs,
// so invalidate the whole dashboard scope like other org mutations do.
async function invalidateMembers(
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
}

export function useInviteMember(
  orgId: string,
): UseMutationResult<DashboardMember, ApiError, { email: string; role?: "member" | "admin" }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, role }: { email: string; role?: "member" | "admin" }) =>
      inviteMember(orgId, email, role),
    onSuccess: () => invalidateMembers(queryClient),
  });
}

export function useUpdateMember(
  orgId: string,
): UseMutationResult<DashboardMember, ApiError, { userId: string; input: UpdateMemberInput }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: UpdateMemberInput }) =>
      updateMember(orgId, userId, input),
    onSuccess: () => invalidateMembers(queryClient),
  });
}

export function useRemoveMember(
  orgId: string,
): UseMutationResult<void, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeMember(orgId, userId),
    onSuccess: () => invalidateMembers(queryClient),
  });
}

export function useJoinOrg(): UseMutationResult<DashboardMember, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orgId: string) => joinOrg(orgId),
    onSuccess: () => invalidateMembers(queryClient),
  });
}

export function useAcceptInvite(): UseMutationResult<DashboardMember, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orgId: string) => acceptInvite(orgId),
    onSuccess: () => invalidateMembers(queryClient),
  });
}

export function useDeclineInvite(): UseMutationResult<DashboardMember, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orgId: string) => declineInvite(orgId),
    onSuccess: () => invalidateMembers(queryClient),
  });
}

// Live roster updates: any committed member change on members:{orgId}
// invalidates the whole dashboard scope (roster, counts, member_count).
export function useMemberRealtime(orgId: string | null): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (orgId === null) return undefined;
    return subscribeChannel(membersChannel(orgId), () => {
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    });
  }, [orgId, queryClient]);
}

// Live invitation inbox: membership-scoped pushes on notifications:{user}
// refresh invites, memberships and org lists across every device.
export function useMembershipRealtime(userId: string | undefined): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (userId === undefined) return undefined;
    return subscribeChannel(notificationsChannel(userId), (payload) => {
      if (payload["scope"] !== "membership") return;
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    });
  }, [userId, queryClient]);
}
