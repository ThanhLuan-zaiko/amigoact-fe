import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { ApiError } from "../core/api.ts";
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
): UseMutationResult<VolunteerProfile, ApiError, TArgs> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async (fresh) => {
      queryClient.setQueryData(profileKeys.mine, fresh);
      await queryClient.invalidateQueries({
        queryKey: profileKeys.mine,
      });
    },
  });
}

export function useUpdateProfile(): UseMutationResult<
  VolunteerProfile,
  ApiError,
  ProfilePayload
> {
  return useProfileMutation(updateMyProfile);
}

export function useSetSkills(): UseMutationResult<
  VolunteerProfile,
  ApiError,
  { skill_id: string; level: number }[]
> {
  return useProfileMutation(setMySkills);
}

export function useAddContact(): UseMutationResult<
  VolunteerProfile,
  ApiError,
  ContactPayload
> {
  return useProfileMutation(addMyContact);
}

export function useRemoveContact(): UseMutationResult<
  VolunteerProfile,
  ApiError,
  string
> {
  return useProfileMutation(removeMyContact);
}

export function useUploadAvatar(): UseMutationResult<
  { avatar_url: string },
  ApiError,
  File
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadMyAvatar,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: profileKeys.mine,
      });
    },
  });
}
