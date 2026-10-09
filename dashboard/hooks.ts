import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import {
  createOrg,
  deleteAllOrgMedia,
  deleteOrgMedia,
  hardDeleteOrg,
  listMyOrgs,
  listOrgMedia,
  restoreOrg,
  setOrgMediaRole,
  softDeleteOrg,
  updateOrg,
  uploadOrgMedia,
  type CreateOrgInput,
  type DashboardOrg,
  type MediaRole,
  type OrgMedia,
  type UpdateOrgInput,
} from "./api.ts";
import { dashboardKeys } from "./keys.ts";

export function useMyOrgs(
  includeDeleted = false,
  enabled = true,
): UseQueryResult<DashboardOrg[], ApiError> {
  return useQuery({
    queryKey: dashboardKeys.myOrgs(includeDeleted),
    queryFn: () => listMyOrgs(includeDeleted),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled,
  });
}

function useInvalidateOrgs(): {
  onSuccess: () => Promise<void>;
} {
  const queryClient = useQueryClient();
  return {
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  };
}

export function useCreateOrg(): UseMutationResult<DashboardOrg, ApiError, CreateOrgInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrg,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.myOrgs() });
    },
  });
}

export function useUpdateOrg(): UseMutationResult<
  DashboardOrg,
  ApiError,
  { id: string; input: UpdateOrgInput }
> {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOrgInput }) =>
      updateOrg(id, input),
    ...useInvalidateOrgs(),
  });
}

export function useSoftDeleteOrg(): UseMutationResult<DashboardOrg, ApiError, string> {
  return useMutation({
    mutationFn: softDeleteOrg,
    ...useInvalidateOrgs(),
  });
}

export function useHardDeleteOrg(): UseMutationResult<void, ApiError, string> {
  return useMutation({
    mutationFn: hardDeleteOrg,
    ...useInvalidateOrgs(),
  });
}

export function useRestoreOrg(): UseMutationResult<DashboardOrg, ApiError, string> {
  return useMutation({
    mutationFn: restoreOrg,
    ...useInvalidateOrgs(),
  });
}

export function useOrgMedia(orgId: string): UseQueryResult<OrgMedia[], ApiError> {
  return useQuery({
    queryKey: dashboardKeys.orgMedia(orgId),
    queryFn: () => listOrgMedia(orgId),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useUploadOrgMedia(
  orgId: string,
): UseMutationResult<OrgMedia, ApiError, { file: File; role: MediaRole }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, role }: { file: File; role: MediaRole }) =>
      uploadOrgMedia(orgId, file, role),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: dashboardKeys.orgMedia(orgId),
      });
    },
  });
}

export function useSetOrgMediaRole(
  orgId: string,
): UseMutationResult<OrgMedia, ApiError, { mediaId: string; role: MediaRole }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mediaId, role }: { mediaId: string; role: MediaRole }) =>
      setOrgMediaRole(orgId, mediaId, role),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: dashboardKeys.orgMedia(orgId),
      });
    },
  });
}

export function useDeleteOrgMedia(
  orgId: string,
): UseMutationResult<void, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mediaId: string) => deleteOrgMedia(orgId, mediaId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: dashboardKeys.orgMedia(orgId),
      });
    },
  });
}

export function useDeleteAllOrgMedia(
  orgId: string,
): UseMutationResult<void, ApiError, void> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteAllOrgMedia(orgId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: dashboardKeys.orgMedia(orgId),
      });
    },
  });
}
