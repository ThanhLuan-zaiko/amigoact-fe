import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import { hourKeys } from "./keys.ts";
import {
  adjustHours,
  createHourRule,
  listHourRules,
  toggleHourRule,
  type HourAdjustment,
  type HourRule,
  type HourRuleInput,
} from "./rules-api.ts";

export function useHourRules(
  orgId: string,
  enabled = true,
): UseQueryResult<HourRule[], ApiError> {
  return useQuery({
    queryKey: hourKeys.rules(orgId),
    queryFn: () => listHourRules(orgId),
    enabled,
    staleTime: 30_000,
  });
}

function useInvalidateRules(orgId: string) {
  const queryClient = useQueryClient();
  return {
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: hourKeys.rules(orgId),
      });
      await queryClient.invalidateQueries({ queryKey: hourKeys.all });
    },
  };
}

export function useCreateHourRule(
  orgId: string,
): UseMutationResult<HourRule, ApiError, HourRuleInput> {
  return useMutation({
    mutationFn: (input) => createHourRule(orgId, input),
    ...useInvalidateRules(orgId),
  });
}

export function useToggleHourRule(
  orgId: string,
): UseMutationResult<
  HourRule,
  ApiError,
  { ruleId: string; isActive: boolean }
> {
  return useMutation({
    mutationFn: ({ ruleId, isActive }) =>
      toggleHourRule(orgId, ruleId, isActive),
    ...useInvalidateRules(orgId),
  });
}

export function useAdjustHours(
  orgId: string,
): UseMutationResult<
  HourAdjustment,
  ApiError,
  {
    student_id: string;
    activity_id: string;
    delta_hours: number;
    reason: string;
  }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => adjustHours(orgId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: hourKeys.all });
    },
  });
}
