import {
  skipToken,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { membersChannel, subscribeChannel } from "../core/realtime.ts";
import { dashboardKeys } from "./keys.ts";

// Live member presence rides the members:{org} channel alongside roster
// events: payloads carry "presence" (never "action"), so they skip the
// roster invalidation/toast path in useMemberRealtime. The server emits
// {presence:"snapshot", online:[user_id,...]} right after the FIRST
// subscribe to a channel and {presence:"online"|"offline", user_id} on
// connection transitions. Extra handlers on an already-joined channel get
// no snapshot, so every handler on this channel must feed this function:
// whichever one subscribed first would otherwise swallow the snapshot.
export function applyPresencePayload(
  queryClient: QueryClient,
  orgId: string,
  payload: Record<string, unknown>,
): void {
  const presence = payload["presence"];
  if (presence !== "snapshot" && presence !== "online" && presence !== "offline") {
    return;
  }
  const key = dashboardKeys.presence(orgId);
  // Push-only data must outlive its observers: no query can refetch it.
  queryClient.setQueryDefaults(key, {
    gcTime: Number.POSITIVE_INFINITY,
    staleTime: Number.POSITIVE_INFINITY,
  });
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
  const userId = payload["user_id"];
  if (typeof userId !== "string") return;
  queryClient.setQueryData<string[]>(key, (prev = []) =>
    presence === "online"
      ? prev.includes(userId)
        ? prev
        : [...prev, userId]
      : prev.filter((id) => id !== userId),
  );
}

export function useOrgPresence(orgId: string | null): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (orgId === null) return undefined;
    return subscribeChannel(membersChannel(orgId), (payload) =>
      applyPresencePayload(queryClient, orgId, payload),
    );
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
