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
import { pushToast, type ToastTone } from "../core/toast.ts";
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
  type OrgListPage,
  type UpdateMemberInput,
} from "./api.ts";
import { dashboardKeys } from "./keys.ts";
import { memberEventToast, membershipEventToast } from "./messages.tsx";

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

// Member events the viewer should read as losses: rendered as error toasts.
const NEGATIVE_EVENTS = new Set(["suspended", "removed"]);
const SELF_POSITIVE_EVENTS = new Set(["promoted", "reactivated"]);

function cachedMemberName(
  queryClient: ReturnType<typeof useQueryClient>,
  orgId: string,
  userId: string,
): string | null {
  const pages = queryClient.getQueriesData<MemberListPage>({
    queryKey: [...dashboardKeys.all, "members", orgId],
  });
  for (const [, data] of pages) {
    const hit = data?.items.find((item) => item.user_id === userId);
    if (hit?.full_name) return hit.full_name;
  }
  return null;
}

function cachedOrgName(
  queryClient: ReturnType<typeof useQueryClient>,
  orgId: string,
): string | null {
  const orgPages = queryClient.getQueriesData<OrgListPage>({
    queryKey: [...dashboardKeys.all, "orgs"],
  });
  for (const [, data] of orgPages) {
    const hit = data?.items.find((item) => item.id === orgId);
    if (hit) return hit.name;
  }
  const memberships = queryClient.getQueriesData<MembershipPage>({
    queryKey: [...dashboardKeys.all, "memberships"],
  });
  for (const [, data] of memberships) {
    const hit = data?.items.find((item) => item.org_id === orgId);
    if (hit) return hit.org_name;
  }
  return null;
}

// Live roster updates: any committed member change on members:{orgId}
// invalidates the whole dashboard scope (roster, counts, member_count)
// and surfaces a toast for actions made by other actors. Own actions are
// skipped (the mutation already toasted) and self-targeted changes are
// skipped too (useMembershipRealtime covers them with "you" copy).
export function useMemberRealtime(
  orgId: string | null,
  selfId?: string,
): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (orgId === null) return undefined;
    return subscribeChannel(membersChannel(orgId), (payload) => {
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      const action = payload["action"];
      const actorId = payload["actor_id"];
      const targetId = payload["user_id"];
      if (typeof action !== "string") return;
      if (actorId === selfId || targetId === selfId) return;
      const message = memberEventToast(
        action,
        typeof targetId === "string"
          ? cachedMemberName(queryClient, orgId, targetId)
          : null,
        typeof actorId === "string"
          ? cachedMemberName(queryClient, orgId, actorId)
          : null,
      );
      if (message === null) return;
      const tone: ToastTone = NEGATIVE_EVENTS.has(action) ? "error" : "info";
      pushToast({ tone, title: message });
    });
  }, [orgId, selfId, queryClient]);
}

// Live invitation inbox: membership-scoped pushes on notifications:{user}
// refresh invites, memberships and org lists across every device, and
// toast changes that target the viewer (suspended, removed, role changes).
export function useMembershipRealtime(userId: string | undefined): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (userId === undefined) return undefined;
    return subscribeChannel(notificationsChannel(userId), (payload) => {
      if (payload["scope"] !== "membership") return;
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      const action = payload["action"];
      const orgId = payload["org_id"];
      if (typeof action !== "string") return;
      const message = membershipEventToast(
        action,
        typeof orgId === "string" ? cachedOrgName(queryClient, orgId) : null,
      );
      if (message === null) return;
      const tone: ToastTone = SELF_POSITIVE_EVENTS.has(action)
        ? "success"
        : NEGATIVE_EVENTS.has(action)
          ? "error"
          : "info";
      pushToast({ tone, title: message });
    });
  }, [userId, queryClient]);
}
