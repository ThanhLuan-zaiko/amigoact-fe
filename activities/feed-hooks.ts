import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { activitiesChannel, subscribeChannel } from "../core/realtime.ts";
import { listMyActivities } from "./feed-api.ts";
import { activityKeys } from "./keys.ts";

// The socket server caps subscribes at 20 per minute, so only the first
// orgs (managers first, as the feed orders them) stay live.
const REALTIME_ORG_LIMIT = 12;

export function useMyActivities(trash = false, enabled = true) {
  return useQuery({
    queryKey: activityKeys.mine(trash),
    queryFn: () => listMyActivities(trash),
    enabled,
    staleTime: 30_000,
  });
}

// Any activity change in a watched org refetches the cross-org feed. The
// effect re-subscribes only when the watched org list actually changes.
export function useLiveMyActivities(orgIds: string[]): void {
  const queryClient = useQueryClient();
  const key = orgIds.slice(0, REALTIME_ORG_LIMIT).join(",");
  useEffect(() => {
    if (key === "") return undefined;
    const unsubscribers = key.split(",").map((orgId) =>
      subscribeChannel(activitiesChannel(orgId), () => {
        void queryClient.invalidateQueries({ queryKey: activityKeys.all });
      }),
    );
    return () => {
      for (const unsubscribe of unsubscribers) unsubscribe();
    };
  }, [key, queryClient]);
}
