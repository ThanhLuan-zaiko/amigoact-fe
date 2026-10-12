import { skipToken, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { membersChannel, subscribeChannel } from "../core/realtime.ts";
import { dashboardKeys } from "./keys.ts";

// Live member presence rides the members:{org} channel alongside roster
// events: payloads carry "presence" (never "action"), so they skip the
// roster invalidation/toast path in useMemberRealtime. The server emits
// {presence:"snapshot", online:[user_id,...]} right after subscribe and
// {presence:"online"|"offline", user_id} on connection transitions.
export function useOrgPresence(orgId: string | null): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (orgId === null) return undefined;
    const key = dashboardKeys.presence(orgId);
    return subscribeChannel(membersChannel(orgId), (payload) => {
      const presence = payload["presence"];
      if (presence === "snapshot") {
        const online = payload["online"];
        if (Array.isArray(online)) {
          queryClient.setQueryData<string[]>(
            key,
            online.filter((id): id is string => typeof id === "string"),
          );
        }
        return;
      }
      if (presence !== "online" && presence !== "offline") return;
      const userId = payload["user_id"];
      if (typeof userId !== "string") return;
      queryClient.setQueryData<string[]>(key, (prev = []) =>
        presence === "online"
          ? prev.includes(userId)
            ? prev
            : [...prev, userId]
          : prev.filter((id) => id !== userId),
      );
    });
  }, [orgId, queryClient]);
}

// Reactive read side: components subscribe to the same cache key the
// subscription above maintains. skipToken: presence is push-only, so no
// refetch or invalidation can ever reset the set to an empty fetch.
export function usePresenceIds(orgId: string | null): ReadonlySet<string> {
  const { data } = useQuery<string[]>({
    queryKey: dashboardKeys.presence(orgId),
    queryFn: skipToken,
    staleTime: Number.POSITIVE_INFINITY,
  });
  return useMemo(() => new Set(data ?? []), [data]);
}
