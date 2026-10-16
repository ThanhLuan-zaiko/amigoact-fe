import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { ApiError, type BlobResult } from "../core/api.ts";
import {
  createTemplate,
  downloadCertificateFile,
  issueCertificate,
  listActivityCertificates,
  listMyCertificates,
  listTemplates,
  revokeCertificate,
  updateTemplate,
  type Certificate,
  type CertificateTemplate,
  type MyCertificate,
  type TemplateInput,
  type TemplatePatch,
} from "./api.ts";
import { certificateKeys } from "./keys.ts";

type Mutation<TVariables> = UseMutationResult<
  unknown,
  ApiError,
  TVariables
>;

export function useMyCertificates(
  enabled = true,
): UseQueryResult<MyCertificate[], ApiError> {
  return useQuery({
    queryKey: certificateKeys.mine(),
    queryFn: listMyCertificates,
    enabled,
  });
}

/** Manager feed: every certificate of one activity (issue/revoke UI). */
export function useActivityCertificates(
  activityId: string,
): UseQueryResult<Certificate[], ApiError> {
  return useQuery({
    queryKey: certificateKeys.activity(activityId),
    queryFn: () => listActivityCertificates(activityId),
  });
}

function useInvalidateCertificates() {
  const queryClient = useQueryClient();
  return {
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: certificateKeys.all,
      });
    },
  };
}

export function useIssueCertificate(
  activityId: string,
): Mutation<{ studentId: string; templateId?: string }> {
  return useMutation({
    meta: { successToast: "certificate.issue" },
    mutationFn: ({ studentId, templateId }) =>
      issueCertificate(activityId, studentId, templateId),
    ...useInvalidateCertificates(),
  });
}

export function useRevokeCertificate(
  activityId: string,
): Mutation<{ studentId: string; reason?: string }> {
  return useMutation({
    meta: { successToast: "certificate.revoke" },
    mutationFn: ({ studentId, reason }) =>
      revokeCertificate(activityId, studentId, reason),
    ...useInvalidateCertificates(),
  });
}

/** Silent on success: the browser download is its own confirmation. */
export function useDownloadCertificate(): UseMutationResult<
  BlobResult,
  ApiError,
  string
> {
  return useMutation({
    mutationFn: (certificateId) => downloadCertificateFile(certificateId),
  });
}

/** Org template library shown when issuing and managing layouts. */
export function useTemplates(
  orgId: string,
  enabled = true,
): UseQueryResult<CertificateTemplate[], ApiError> {
  return useQuery({
    queryKey: certificateKeys.templates(orgId),
    queryFn: () => listTemplates(orgId),
    enabled,
    staleTime: 30_000,
  });
}

export function useCreateTemplate(
  orgId: string,
): Mutation<TemplateInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => createTemplate(orgId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: certificateKeys.templates(orgId),
      });
    },
  });
}

export function useUpdateTemplate(
  orgId: string,
): Mutation<{ templateId: string; patch: TemplatePatch }> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, patch }) =>
      updateTemplate(orgId, templateId, patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: certificateKeys.templates(orgId),
      });
    },
  });
}
