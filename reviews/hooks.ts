import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import {
  createReview,
  listReviews,
  type ReviewItem,
  type ReviewListResponse,
} from "./api.ts";
import { reviewKeys } from "./keys.ts";

export function useReviews(
  activityId: string | undefined,
): UseQueryResult<ReviewListResponse, ApiError> {
  return useQuery({
    queryKey: reviewKeys.activity(activityId ?? ""),
    queryFn: () => listReviews(activityId ?? ""),
    enabled: Boolean(activityId),
  });
}

export function useCreateReview(
  activityId: string,
): UseMutationResult<
  ReviewItem,
  ApiError,
  { rating: number; comment?: string | null }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => createReview(activityId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: reviewKeys.activity(activityId),
      });
    },
  });
}
