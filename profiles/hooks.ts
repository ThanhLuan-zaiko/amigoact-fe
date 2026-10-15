import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { ApiError } from "../core/api.ts";
import { authKeys } from "../auth/keys.ts";
import {
  addMyContact,
  getMyProfile,
  getPublicProfile,
  listSkills,
  removeMyContact,
  setMySkills,
  updateMyProfile,
  uploadMyAvatar,
  type ContactPayload,
  type ProfilePayload,
  type PublicVolunteer,
  type SkillItem,
  type VolunteerProfile,
} from "./api.ts";
import { profileKeys } from "./keys.ts";

export function useMyProfile(
  enabled = true,
): UseQueryResult<VolunteerProfile, ApiError> {
  return useQuery({
    queryKey: profileKeys.mine,
    queryFn: getMyProfile,
    staleTime: 30_000,
    retry: 1,
    enabled,
  });
}

export function useSkillsCatalog(
  enabled = true,
): UseQueryResult<SkillItem[], ApiError> {
  return useQuery({
    queryKey: profileKeys.skills,
    queryFn: listSkills,
    staleTime: 5 * 60_000,
    retry: 1,
    enabled,
  });
}

export function usePublicProfile(
  userId: string | undefined,
): UseQueryResult<PublicVolunteer, ApiError> {
  return useQuery({
    queryKey: profileKeys.public(userId ?? ""),
    queryFn: () => getPublicProfile(userId ?? ""),
    staleTime: 60_000,
    retry: 1,
    enabled: userId !== undefined,
  });
}

function useProfileMutation<TArgs>(
  mutationFn: (args: TArgs) => Promise<VolunteerProfile>,
  successTitle: string,
): UseMutationResult<VolunteerProfile, ApiError, TArgs> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successToast: successTitle },
    mutationFn,
    onSuccess: async (fresh) => {
      queryClient.setQueryData(profileKeys.mine, fresh);
      await queryClient.invalidateQueries({
        queryKey: profileKeys.mine,
      });
    },
  });
}

export function useUpdateProfile(
  successTitle: string,
): UseMutationResult<VolunteerProfile, ApiError, ProfilePayload> {
  return useProfileMutation(updateMyProfile, successTitle);
}

export function useSetSkills(
  successTitle: string,
): UseMutationResult<
  VolunteerProfile,
  ApiError,
  { skill_id: string; level: number }[]
> {
  return useProfileMutation(setMySkills, successTitle);
}

export function useAddContact(
  successTitle: string,
): UseMutationResult<VolunteerProfile, ApiError, ContactPayload> {
  return useProfileMutation(addMyContact, successTitle);
}

export function useRemoveContact(
  successTitle: string,
): UseMutationResult<VolunteerProfile, ApiError, string> {
  return useProfileMutation(removeMyContact, successTitle);
}

export function useUploadAvatar(
  successTitle: string,
): UseMutationResult<{ avatar_url: string }, ApiError, File> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successToast: successTitle },
    mutationFn: uploadMyAvatar,
    onSuccess: async () => {
      // avatar_url also rides on the session payload, so shell chrome
      // (AccountSwitcher, header, drawer) refreshes with the profile card.
      await queryClient.invalidateQueries({
        queryKey: profileKeys.mine,
      });
      await queryClient.invalidateQueries({
        queryKey: authKeys.session(),
      });
    },
  });
}
