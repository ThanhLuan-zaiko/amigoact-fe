import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import { activityKeys } from "./keys.ts";
import {
  deleteActivityMedia,
  listActivityMedia,
  updateActivityMedia,
  uploadActivityMedia,
  type ActivityMediaItem,
  type ActivityMediaPatch,
} from "./media-api.ts";

type Mutation<TVariables> = UseMutationResult<
  unknown,
  ApiError,
  TVariables,
  unknown
>;

/** Ordered gallery for one activity; public read on the detail page. */
export function useActivityMedia(
  activityId: string | undefined,
): UseQueryResult<ActivityMediaItem[], ApiError> {
  return useQuery({
    queryKey: activityKeys.media(activityId ?? ""),
    queryFn: () => listActivityMedia(activityId ?? ""),
    enabled: activityId !== undefined && activityId !== "",
    staleTime: 15_000,
  });
}

function useInvalidateMedia(activityId: string) {
  const queryClient = useQueryClient();
  return {
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: activityKeys.media(activityId),
      });
    },
  };
}

export function useUploadActivityMedia(
  activityId: string,
): Mutation<{ file: File; caption?: string; role?: string }> {
  return useMutation({
    meta: { successToast: "media.upload" },
    mutationFn: ({ file, caption, role }) =>
      uploadActivityMedia(activityId, file, caption, role),
    ...useInvalidateMedia(activityId),
  });
}

export function useUpdateActivityMedia(
  activityId: string,
): Mutation<{ assetId: string; patch: ActivityMediaPatch }> {
  return useMutation({
    mutationFn: ({ assetId, patch }) =>
      updateActivityMedia(activityId, assetId, patch),
    ...useInvalidateMedia(activityId),
  });
}

export function useDeleteActivityMedia(
  activityId: string,
): Mutation<{ assetId: string }> {
  return useMutation({
    meta: { successToast: "media.delete" },
    mutationFn: ({ assetId }) => deleteActivityMedia(activityId, assetId),
    ...useInvalidateMedia(activityId),
  });
}
