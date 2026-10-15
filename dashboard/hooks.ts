import {
  keepPreviousData,
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
  replaceOrgMediaFile,
  restoreOrg,
  setOrgMediaRole,
  softDeleteOrg,
  updateOrg,
  uploadOrgMedia,
  type CreateOrgInput,
  type DashboardOrg,
  type MediaRole,
  type OrgListPage,
  type OrgListParams,
  type OrgMedia,
  type UpdateOrgInput,
} from "./api.ts";
import { dashboardKeys } from "./keys.ts";

export function useMyOrgs(
  includeDeleted = false,
  params: OrgListParams = {},
  enabled = true,
): UseQueryResult<OrgListPage, ApiError> {
  return useQuery({
    queryKey: dashboardKeys.myOrgs(includeDeleted, params),
    queryFn: () => listMyOrgs(includeDeleted, params),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useCreateOrg(
  successTitle: string,
): UseMutationResult<DashboardOrg, ApiError, CreateOrgInput> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successToast: successTitle },
    mutationFn: createOrg,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.myOrgs() });
    },
  });
}

export function useUpdateOrg(
  successTitle: string,
): UseMutationResult<
  DashboardOrg,
  ApiError,
  { id: string; input: UpdateOrgInput }
> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successToast: successTitle },
    mutationFn: ({ id, input }: { id: string; input: UpdateOrgInput }) =>
      updateOrg(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useSoftDeleteOrg(
  successTitle: string,
): UseMutationResult<DashboardOrg, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successToast: successTitle },
    mutationFn: softDeleteOrg,
    onSuccess: async (_org, orgId) => {
      queryClient.removeQueries({ queryKey: dashboardKeys.orgMedia(orgId) });
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useHardDeleteOrg(
  successTitle: string,
): UseMutationResult<void, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successToast: successTitle },
    mutationFn: hardDeleteOrg,
    onSuccess: async (_data, orgId) => {
      queryClient.removeQueries({ queryKey: dashboardKeys.orgMedia(orgId) });
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useRestoreOrg(
  successTitle: string,
): UseMutationResult<DashboardOrg, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successToast: successTitle },
    mutationFn: restoreOrg,
    onSuccess: async (_org, orgId) => {
      queryClient.removeQueries({ queryKey: dashboardKeys.orgMedia(orgId) });
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useOrgMedia(
  orgId: string,
  enabled = true,
): UseQueryResult<OrgMedia[], ApiError> {
  return useQuery({
    queryKey: dashboardKeys.orgMedia(orgId),
    queryFn: () => listOrgMedia(orgId),
    staleTime: 30_000,
    // 4xx answers (410 ORG_DELETED, 403) are terminal; retrying just spams.
    retry: (failureCount, error) =>
      failureCount === 0 &&
      !(error instanceof ApiError && error.status >= 400 && error.status < 500),
    refetchOnWindowFocus: false,
    enabled,
  });
}

// successTitle optional: the post editor has its own per-block upload
// progress UI, so it passes nothing and stays silent.
export function useUploadOrgMedia(
  orgId: string,
  successTitle?: string,
): UseMutationResult<OrgMedia, ApiError, { file: File; role: MediaRole }> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successToast: successTitle },
    mutationFn: ({ file, role }: { file: File; role: MediaRole }) =>
      uploadOrgMedia(orgId, file, role),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: dashboardKeys.orgMedia(orgId),
      });
    },
  });
}

// Org-agnostic upload for flows where the target org only exists after
// a preceding mutation (e.g. create-then-upload in OrgCreateCard).
export function useUploadOrgMediaFile(successTitle?: string): UseMutationResult<
  OrgMedia,
  ApiError,
  { orgId: string; file: File; role: MediaRole }
> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successToast: successTitle },
    mutationFn: ({ orgId, file, role }: { orgId: string; file: File; role: MediaRole }) =>
      uploadOrgMedia(orgId, file, role),
    onSuccess: async (media) => {
      await queryClient.invalidateQueries({
        queryKey: dashboardKeys.orgMedia(media.org_id),
      });
    },
  });
}

export function useSetOrgMediaRole(
  orgId: string,
  successTitle: string,
): UseMutationResult<OrgMedia, ApiError, { mediaId: string; role: MediaRole }> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successToast: successTitle },
    mutationFn: ({ mediaId, role }: { mediaId: string; role: MediaRole }) =>
      setOrgMediaRole(orgId, mediaId, role),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: dashboardKeys.orgMedia(orgId),
      });
    },
  });
}

export function useReplaceOrgMediaFile(
  orgId: string,
  successTitle: string,
): UseMutationResult<OrgMedia, ApiError, { mediaId: string; file: File }> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successToast: successTitle },
    mutationFn: ({ mediaId, file }: { mediaId: string; file: File }) =>
      replaceOrgMediaFile(orgId, mediaId, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: dashboardKeys.orgMedia(orgId),
      });
    },
  });
}

export function useDeleteOrgMedia(
  orgId: string,
  successTitle: string,
): UseMutationResult<void, ApiError, string> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successToast: successTitle },
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
  successTitle: string,
): UseMutationResult<void, ApiError, void> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successToast: successTitle },
    mutationFn: () => deleteAllOrgMedia(orgId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: dashboardKeys.orgMedia(orgId),
      });
    },
  });
}
