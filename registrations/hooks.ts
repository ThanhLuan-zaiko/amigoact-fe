import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { ApiError } from "../core/api.ts";
import { attendanceChannel, subscribeChannel } from "../core/realtime.ts";
import { hourKeys } from "../hours/keys.ts";
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
  listRegistrationHistory,
  reviewRegistration,
  type AttendanceRecord,
  type HistoryEntry,
  type Registration,
  type RosterItem,
  type Ticket,
} from "./api.ts";
import { registrationKeys } from "./keys.ts";

type Mutation<TVariables, TData = unknown> = UseMutationResult<
  TData,
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

export function useRegistrationHistory(
  activityId: string | undefined,
  registrationId: string | undefined,
): UseQueryResult<HistoryEntry[], ApiError> {
  return useQuery({
    queryKey: registrationKeys.history(
      activityId ?? "",
      registrationId ?? "",
    ),
    queryFn: () =>
      listRegistrationHistory(activityId ?? "", registrationId ?? ""),
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
): Mutation<{ note?: string }, Registration> {
  return useMutation({
        meta: { successToast: "registration.apply" },
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
        meta: { successToast: "registration.save" },
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
        meta: { successToast: "registration.cancel" },
mutationFn: ({ activityId, registrationId }) =>
      cancelRegistration(activityId, registrationId),
    ...useInvalidateRegistrations(),
  });
}

export function useCheckIn(
  activityId: string,
): Mutation<{ checkinToken: string }> {
  return useMutation({
        meta: { successToast: "registration.checkin" },
mutationFn: ({ checkinToken }) =>
      checkInByToken(activityId, checkinToken),
    ...useInvalidateRegistrations(),
  });
}

export function useManualCheckIn(
  activityId: string,
): Mutation<{ registrationId: string }> {
  return useMutation({
        meta: { successToast: "registration.checkin" },
mutationFn: ({ registrationId }) =>
      checkInManual(activityId, registrationId),
    ...useInvalidateRegistrations(),
  });
}

export function useCheckOut(
  activityId: string,
): Mutation<{ recordId: string; actualHours?: number }> {
  return useMutation({
        meta: { successToast: "registration.checkout" },
mutationFn: ({ recordId, actualHours }) =>
      checkOut(activityId, recordId, actualHours),
    ...useInvalidateRegistrations(),
  });
}

// Live check-in feed (AGENTS.md 12.1): committed check-in/out events on
// attendance:{activityId} refresh the roster, the attendance list, and
// the hours tiles (check-out can credit pending hours). The payload is
// never trusted as truth; queries are invalidated and refetched.
export function useLiveAttendance(activityId: string | undefined): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (activityId === undefined) return undefined;
    return subscribeChannel(attendanceChannel(activityId), () => {
      void queryClient.invalidateQueries({
        queryKey: registrationKeys.all,
      });
      void queryClient.invalidateQueries({ queryKey: hourKeys.all });
    });
  }, [activityId, queryClient]);
}
