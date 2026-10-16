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
  createSlot,
  deleteSlot,
  listSlots,
  type ActivitySlot,
  type SlotInput,
} from "./slots-api.ts";

export function useSlots(
  orgId: string,
  activityId: string,
  enabled = true,
): UseQueryResult<ActivitySlot[], ApiError> {
  return useQuery({
    queryKey: activityKeys.slots(orgId, activityId),
    queryFn: () => listSlots(orgId, activityId),
    enabled,
    staleTime: 30_000,
  });
}

function useInvalidateSlots(orgId: string, activityId: string) {
  const qc = useQueryClient();
  return () =>
    qc.invalidateQueries({
      queryKey: activityKeys.slots(orgId, activityId),
    });
}

export function useCreateSlot(
  orgId: string,
  activityId: string,
): UseMutationResult<ActivitySlot, ApiError, { scheduleId: string; input: SlotInput }> {
  const invalidate = useInvalidateSlots(orgId, activityId);
  return useMutation({
    mutationFn: ({ scheduleId, input }) =>
      createSlot(orgId, activityId, scheduleId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteSlot(
  orgId: string,
  activityId: string,
): UseMutationResult<void, ApiError, { scheduleId: string; slotId: string }> {
  const invalidate = useInvalidateSlots(orgId, activityId);
  return useMutation({
    mutationFn: ({ scheduleId, slotId }) =>
      deleteSlot(orgId, activityId, scheduleId, slotId),
    onSuccess: invalidate,
  });
}
