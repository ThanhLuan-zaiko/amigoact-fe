import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import {
  getMyHours,
  listActivityHours,
  reviewHours,
  submitManualHours,
  type HourEntry,
  type MyHours,
} from "./api.ts";
import { hourKeys } from "./keys.ts";

type Mutation<TVariables> = UseMutationResult<
  unknown,
  ApiError,
  TVariables
>;

export function useMyHours(
  enabled = true,
): UseQueryResult<MyHours, ApiError> {
  return useQuery({
    queryKey: hourKeys.mine(),
    queryFn: getMyHours,
    enabled,
  });
}

export function useActivityHours(
  orgId: string | undefined,
  activityId: string | undefined,
): UseQueryResult<HourEntry[], ApiError> {
  return useQuery({
    queryKey: hourKeys.activity(activityId ?? ""),
    queryFn: () => listActivityHours(orgId ?? "", activityId ?? ""),
    enabled: Boolean(orgId && activityId),
  });
}

function useInvalidateHours() {
  const queryClient = useQueryClient();
  return {
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: hourKeys.all });
    },
  };
}

export function useSubmitManualHours(
  orgId: string,
): Mutation<{
  student_id: string;
  activity_id: string;
  hours: number;
  note?: string;
}> {
  return useMutation({
        meta: { successToast: "hours.log" },
mutationFn: (input) => submitManualHours(orgId, input),
    ...useInvalidateHours(),
  });
}

export function useReviewHours(): Mutation<{
  entryId: string;
  status: string;
  note?: string;
}> {
  return useMutation({
        meta: { successToast: "hours.approve" },
mutationFn: ({ entryId, status, note }) =>
      reviewHours(entryId, status, note),
    ...useInvalidateHours(),
  });
}
