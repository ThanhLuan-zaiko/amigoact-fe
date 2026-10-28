import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { ApiError } from "../core/api.ts";
import { dashboardKeys } from "../dashboard/keys.ts";
import {
  applyToOrg,
  getMembershipForm,
  saveMembershipForm,
  uploadMembershipFile,
  type MembershipForm,
  type MembershipFormInput,
  type OrgMembership,
  type StagedEvidence,
} from "./api.ts";
import { orgKeys } from "./keys.ts";

// Stages one evidence file; the returned media_id goes into the answer.
export function useUploadMembershipFile(
  orgId: string,
): UseMutationResult<StagedEvidence, ApiError, File> {
  return useMutation({
    mutationFn: (file: File) => uploadMembershipFile(orgId, file),
  });
}

// Applicant and manager share the org's form: GET is open to signed-in viewers.
export function useMembershipForm(
  orgId: string,
  enabled = true,
): UseQueryResult<MembershipForm, ApiError> {
  return useQuery({
    queryKey: orgKeys.membershipForm(orgId),
    queryFn: () => getMembershipForm(orgId),
    enabled,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useSaveMembershipForm(
  orgId: string,
): UseMutationResult<MembershipForm, ApiError, MembershipFormInput> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successToast: "member.form" },
    mutationFn: (form: MembershipFormInput) => saveMembershipForm(orgId, form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: orgKeys.membershipForm(orgId),
      });
    },
  });
}

export function useApplyToOrg(
  slug: string,
): UseMutationResult<
  OrgMembership,
  ApiError,
  { orgId: string; answers: Record<string, string> }
> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successToast: "org.apply" },
    mutationFn: ({ orgId, answers }) => applyToOrg(orgId, answers),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: orgKeys.detail(slug) });
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
