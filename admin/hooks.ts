import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import {
  getAdminStatus,
  grantAdmin,
  listAdminOrgs,
  listAdmins,
  rejectOrg,
  revokeAdmin,
  verifyOrg,
  type AdminOrgItem,
  type AdminOrgPage,
  type AdminStatus,
  type AdminUserItem,
} from "./api.ts";
import { adminKeys } from "./keys.ts";

export function useAdminStatus(
  enabled = true,
): UseQueryResult<AdminStatus, ApiError> {
  return useQuery({
    queryKey: adminKeys.status(),
    queryFn: getAdminStatus,
    staleTime: 60_000,
    retry: false,
    enabled,
  });
}

export function useAdminOrgs(
  status = "pending",
  enabled = true,
): UseQueryResult<AdminOrgPage, ApiError> {
  return useQuery({
    queryKey: adminKeys.orgs(status),
    queryFn: () => listAdminOrgs(status),
    staleTime: 15_000,
    retry: 1,
    enabled,
  });
}

export function useVerifyOrg(): UseMutationResult<
  AdminOrgItem,
  ApiError,
  string
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyOrg,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useRejectOrg(): UseMutationResult<
  AdminOrgItem,
  ApiError,
  { id: string; reason: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectOrg(id, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useAdmins(enabled = true): UseQueryResult<
  AdminUserItem[],
  ApiError
> {
  return useQuery({
    queryKey: adminKeys.admins(),
    queryFn: listAdmins,
    staleTime: 30_000,
    retry: 1,
    enabled,
  });
}

export function useGrantAdmin(): UseMutationResult<void, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: grantAdmin,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useRevokeAdmin(): UseMutationResult<void, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeAdmin,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}
