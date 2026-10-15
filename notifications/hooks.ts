import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { ApiError } from "../core/api.ts";
import {
  notificationsChannel,
  subscribeChannel,
} from "../core/realtime.ts";
import {
  getPreferences,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updatePreferences,
  type MarkAllResult,
  type NotificationItem,
  type NotificationPage,
  type NotificationPreferences,
} from "./api.ts";
import { notificationKeys } from "./keys.ts";

export function useNotifications(
  limit = 30,
  offset = 0,
  enabled = true,
): UseQueryResult<NotificationPage, ApiError> {
  return useQuery({
    queryKey: notificationKeys.list(limit, offset),
    queryFn: () => listNotifications(limit, offset),
    staleTime: 15_000,
    retry: 1,
    refetchOnWindowFocus: true,
    enabled,
  });
}

export function useUnreadCount(
  enabled = true,
): UseQueryResult<NotificationPage, ApiError> {
  return useQuery({
    queryKey: notificationKeys.list(1, 0),
    queryFn: () => listNotifications(1, 0),
    staleTime: 30_000,
    retry: 1,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    enabled,
  });
}

export function useMarkNotificationRead(): UseMutationResult<
  NotificationItem,
  ApiError,
  string
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
  });
}

export function useMarkAllNotificationsRead(): UseMutationResult<
  MarkAllResult,
  ApiError
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
  });
}

export function useNotificationPreferences(
  enabled = true,
): UseQueryResult<NotificationPreferences, ApiError> {
  return useQuery({
    queryKey: notificationKeys.prefs(),
    queryFn: getPreferences,
    enabled,
  });
}

export function useUpdateNotificationPreferences(): UseMutationResult<
  NotificationPreferences,
  ApiError,
  Partial<NotificationPreferences>
> {
  const queryClient = useQueryClient();
  return useMutation({
        meta: { successToast: "notification.prefs" },
mutationFn: updatePreferences,
    onSuccess: (data) => {
      queryClient.setQueryData(notificationKeys.prefs(), data);
    },
  });
}

// Live inbox: in-app notification pings on notifications:{user} refresh
// the badge and the inbox list the moment they are persisted.
export function useNotificationsRealtime(userId: string | undefined): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (userId === undefined) return undefined;
    return subscribeChannel(notificationsChannel(userId), (payload) => {
      if (payload["scope"] !== "inapp") return;
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    });
  }, [userId, queryClient]);
}
