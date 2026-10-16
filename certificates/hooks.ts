import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import {
  issueCertificate,
  listActivityCertificates,
  listMyCertificates,
  revokeCertificate,
  type Certificate,
  type MyCertificate,
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
): Mutation<{ studentId: string }> {
  return useMutation({
    meta: { successToast: "certificate.issue" },
    mutationFn: ({ studentId }) =>
      issueCertificate(activityId, studentId),
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
