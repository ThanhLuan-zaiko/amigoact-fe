import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { ApiError } from "../core/api.ts";
import {
  approveMember,
  getMemberApplication,
  rejectMember,
  type DashboardMember,
  type MemberApplication,
} from "./members-api.ts";
import { dashboardKeys } from "./keys.ts";

// Managers read one applicant's answers; only opened when the dialog is up.
export function useMemberApplication(
  orgId: string,
  userId: string,
  enabled: boolean,
): UseQueryResult<MemberApplication, ApiError> {
  return useQuery({
    queryKey: dashboardKeys.application(orgId, userId),
    queryFn: () => getMemberApplication(orgId, userId),
    enabled,
    retry: false,
  });
}

export function useApproveMember(
  orgId: string,
): UseMutationResult<DashboardMember, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => approveMember(orgId, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useRejectMember(
  orgId: string,
): UseMutationResult<DashboardMember, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => rejectMember(orgId, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
