import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import type { AttendanceRecord } from "./api.ts";
import { registrationKeys } from "./keys.ts";
import {
  createSession,
  listScans,
  listSessions,
  scanCode,
  transitionSession,
  type AttendanceSession,
  type ScanLogItem,
  type SessionInput,
} from "./sessions-api.ts";

export function useSessions(
  activityId: string,
): UseQueryResult<AttendanceSession[], ApiError> {
  return useQuery({
    queryKey: registrationKeys.sessions(activityId),
    queryFn: () => listSessions(activityId),
    staleTime: 15_000,
  });
}

export function useCreateSession(
  activityId: string,
): UseMutationResult<
  AttendanceSession,
  ApiError,
  { scheduleId: string; input: SessionInput }
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ scheduleId, input }) =>
      createSession(activityId, scheduleId, input),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: registrationKeys.sessions(activityId),
      }),
  });
}

export function useTransitionSession(
  activityId: string,
): UseMutationResult<
  AttendanceSession,
  ApiError,
  { scheduleId: string; sessionId: string; action: "open" | "closed" }
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ scheduleId, sessionId, action }) =>
      transitionSession(activityId, scheduleId, sessionId, action),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: registrationKeys.sessions(activityId),
      }),
  });
}

export function useScans(
  activityId: string,
  sessionId: string | null,
): UseQueryResult<ScanLogItem[], ApiError> {
  return useQuery({
    queryKey: registrationKeys.scans(sessionId ?? ""),
    queryFn: () => listScans(activityId, sessionId!),
    enabled: sessionId != null,
  });
}

export function useScanCode(): UseMutationResult<
  AttendanceRecord,
  ApiError,
  { code: string; deviceInfo?: string }
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, deviceInfo }) => scanCode(code, deviceInfo),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: registrationKeys.all }),
  });
}
