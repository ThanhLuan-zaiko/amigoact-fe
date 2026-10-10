import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import {
  applyToActivity,
  cancelRegistration,
  checkInByToken,
  checkInManual,
  checkOut,
  getTicket,
  listActivityAttendance,
  listActivityRoster,
  listMyAttendance,
  listMyRegistrations,
  reviewRegistration,
  type AttendanceRecord,
  type Registration,
  type RosterItem,
  type Ticket,
} from "./api.ts";
import { registrationKeys } from "./keys.ts";

type Mutation<TVariables> = UseMutationResult<
  unknown,
  ApiError,
  TVariables
>;

export function useMyRegistrations(
  enabled = true,
): UseQueryResult<Registration[], ApiError> {
  return useQuery({
    queryKey: registrationKeys.mine(),
    queryFn: listMyRegistrations,
    enabled,
  });
}

export function useMyAttendance(
  enabled = true,
): UseQueryResult<AttendanceRecord[], ApiError> {
  return useQuery({
    queryKey: registrationKeys.myAttendance(),
    queryFn: listMyAttendance,
    enabled,
  });
}

export function useRoster(
  activityId: string | undefined,
): UseQueryResult<RosterItem[], ApiError> {
  return useQuery({
    queryKey: registrationKeys.roster(activityId ?? ""),
    queryFn: () => listActivityRoster(activityId ?? ""),
    enabled: Boolean(activityId),
  });
}

export function useTicket(
  activityId: string | undefined,
  registrationId: string | undefined,
): UseQueryResult<Ticket, ApiError> {
  return useQuery({
    queryKey: registrationKeys.ticket(
      activityId ?? "",
      registrationId ?? "",
    ),
    queryFn: () => getTicket(activityId ?? "", registrationId ?? ""),
    enabled: Boolean(activityId && registrationId),
  });
}

export function useActivityAttendance(
  activityId: string | undefined,
): UseQueryResult<AttendanceRecord[], ApiError> {
  return useQuery({
    queryKey: registrationKeys.attendance(activityId ?? ""),
    queryFn: () => listActivityAttendance(activityId ?? ""),
    enabled: Boolean(activityId),
  });
}

function useInvalidateRegistrations() {
  const queryClient = useQueryClient();
  return {
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: registrationKeys.all,
      });
    },
  };
}

export function useApply(
  activityId: string,
): Mutation<{ note?: string }> {
  return useMutation({
    mutationFn: ({ note }) => applyToActivity(activityId, note),
    ...useInvalidateRegistrations(),
  });
}

export function useReview(
  activityId: string,
): Mutation<{
  registrationId: string;
  status: string;
  reviewNote?: string;
}> {
  return useMutation({
    mutationFn: ({ registrationId, status, reviewNote }) =>
      reviewRegistration(activityId, registrationId, status, reviewNote),
    ...useInvalidateRegistrations(),
  });
}

export function useCancelRegistration(): Mutation<{
  activityId: string;
  registrationId: string;
}> {
  return useMutation({
    mutationFn: ({ activityId, registrationId }) =>
      cancelRegistration(activityId, registrationId),
    ...useInvalidateRegistrations(),
  });
}

export function useCheckIn(
  activityId: string,
): Mutation<{ checkinToken: string }> {
  return useMutation({
    mutationFn: ({ checkinToken }) =>
      checkInByToken(activityId, checkinToken),
    ...useInvalidateRegistrations(),
  });
}

export function useManualCheckIn(
  activityId: string,
): Mutation<{ registrationId: string }> {
  return useMutation({
    mutationFn: ({ registrationId }) =>
      checkInManual(activityId, registrationId),
    ...useInvalidateRegistrations(),
  });
}

export function useCheckOut(
  activityId: string,
): Mutation<{ recordId: string; actualHours?: number }> {
  return useMutation({
    mutationFn: ({ recordId, actualHours }) =>
      checkOut(activityId, recordId, actualHours),
    ...useInvalidateRegistrations(),
  });
}
