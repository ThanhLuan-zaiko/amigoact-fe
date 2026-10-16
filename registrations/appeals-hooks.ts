import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import {
  fileAppeal,
  getSummary,
  listAppeals,
  listMyAppeals,
  resolveAppeal,
  type AttendanceAppeal,
  type AttendanceSummary,
} from "./appeals-api.ts";
import { registrationKeys } from "./keys.ts";

export function useAppeals(
  activityId: string,
  enabled: boolean,
): UseQueryResult<AttendanceAppeal[], ApiError> {
  return useQuery({
    queryKey: registrationKeys.appeals(activityId),
    queryFn: () => listAppeals(activityId),
    enabled,
    staleTime: 15_000,
  });
}

export function useMyAppeals(
  activityId: string,
  enabled: boolean,
): UseQueryResult<AttendanceAppeal[], ApiError> {
  return useQuery({
    queryKey: registrationKeys.myAppeals(activityId),
    queryFn: () => listMyAppeals(activityId),
    enabled,
    staleTime: 15_000,
  });
}

export function useFileAppeal(
  activityId: string,
): UseMutationResult<AttendanceAppeal, ApiError, { reason: string }> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reason }) => fileAppeal(activityId, reason),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: registrationKeys.myAppeals(activityId),
      }),
  });
}

export function useResolveAppeal(
  activityId: string,
): UseMutationResult<
  AttendanceAppeal,
  ApiError,
  { studentId: string; appealId: string; status: "approved" | "rejected" }
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, appealId, status }) =>
      resolveAppeal(activityId, studentId, appealId, status),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: registrationKeys.appeals(activityId),
      });
      void qc.invalidateQueries({
        queryKey: registrationKeys.attendance(activityId),
      });
      void qc.invalidateQueries({
        queryKey: registrationKeys.roster(activityId),
      });
    },
  });
}

export function useSummary(
  activityId: string,
  registrationId: string | null,
): UseQueryResult<AttendanceSummary, ApiError> {
  return useQuery({
    queryKey: registrationKeys.summary(
      activityId,
      registrationId ?? "",
    ),
    queryFn: () => getSummary(activityId, registrationId!),
    enabled: registrationId != null,
    staleTime: 30_000,
  });
}
