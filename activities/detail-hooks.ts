import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import { eventsFeedChannel } from "../core/channels.ts";
import { subscribeChannel } from "../core/realtime.ts";
import { fetchEventCard, type BrowseItem } from "./browse-api.ts";
import { activityKeys } from "./keys.ts";

// Same debounce as the feed: a burst of hints becomes one refetch.
const REFRESH_DEBOUNCE_MS = 800;

// The card holds what the detail endpoints lack: organization, cover, seats
// and whether registration is open. A 404 only means the feed does not serve
// this activity, so the page works without it.
export function useEventCard(activityId: string | undefined) {
  return useQuery<BrowseItem, ApiError>({
    queryKey: activityKeys.card(activityId ?? ""),
    queryFn: () => fetchEventCard(activityId ?? ""),
    enabled: Boolean(activityId),
    retry: (count, error) =>
      !(error instanceof ApiError && error.status === 404) && count < 1,
    staleTime: 30_000,
  });
}

// Public hints for one activity. The payload only names the activity that
// changed; the card and the detail are refetched, never read from the hint.
export function useEventDetailRealtime(
  orgId: string | undefined,
  activityId: string | undefined,
  slug: string | undefined,
): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!activityId) return undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      if (timer !== undefined) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = undefined;
        void queryClient.invalidateQueries({
          queryKey: activityKeys.card(activityId),
        });
        if (orgId) {
          void queryClient.invalidateQueries({
            queryKey: activityKeys.view(orgId, activityId),
          });
        }
        if (orgId && slug) {
          void queryClient.invalidateQueries({
            queryKey: activityKeys.bySlug(orgId, slug),
          });
        }
      }, REFRESH_DEBOUNCE_MS);
    };
    const unsubscribe = subscribeChannel(eventsFeedChannel(), (payload) => {
      if (payload["activity_id"] === activityId) refresh();
    });
    return () => {
      if (timer !== undefined) clearTimeout(timer);
      unsubscribe();
    };
  }, [queryClient, orgId, activityId, slug]);
}
