import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "../auth/hooks.ts";
import { eventsFeedChannel } from "../core/channels.ts";
import { subscribeChannel } from "../core/realtime.ts";
import { ORGS_DIRECTORY_CHANNEL } from "../orgs/hooks.ts";
import {
  fetchBrowse,
  fetchBrowseMine,
  fetchMyBriefs,
  type BrowseQuery,
  type MyBrief,
} from "./browse-api.ts";
import { patchParams, readFilters } from "./browse-utils.ts";
import { activityKeys } from "./keys.ts";

// Filters and paging live in the URL. The rail and the feed both read it,
// so they stay in step without passing state between them.
export function useEventsUrl() {
  const [searchParams, setSearchParams] = useSearchParams();
  const patch = useCallback(
    (changes: Record<string, string | null>, push = false) => {
      setSearchParams((current) => patchParams(current, changes), {
        replace: !push,
      });
    },
    [setSearchParams],
  );
  return { filters: readFilters(searchParams), patch };
}

// Bursts of hints (a seat taken, a status flip) collapse into one refetch.
const REFRESH_DEBOUNCE_MS = 800;

export function useSignedIn(): boolean {
  return Boolean(useSession().data);
}

export function useBrowse(query: BrowseQuery, enabled: boolean) {
  return useQuery({
    queryKey: activityKeys.browse(query),
    queryFn: () => fetchBrowse(query),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useBrowseMine(query: BrowseQuery, enabled: boolean) {
  return useQuery({
    queryKey: activityKeys.browseMine(query),
    queryFn: () => fetchBrowseMine(query),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    enabled,
  });
}

// Activity id to the caller's best brief; empty for guests.
export function useMyBriefMap(enabled: boolean): Record<string, MyBrief> {
  const briefs = useQuery({
    queryKey: activityKeys.myBriefs(),
    queryFn: fetchMyBriefs,
    staleTime: 30_000,
    enabled,
  });
  return useMemo(
    () =>
      Object.fromEntries(
        (briefs.data ?? []).map((brief) => [brief.activity_id, brief]),
      ),
    [briefs.data],
  );
}

// Public hints only: the events feed and the org directory both refetch
// the browse family. Payloads are never trusted as data.
export function useEventsRealtime(): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      if (timer !== undefined) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = undefined;
        void queryClient.invalidateQueries({
          queryKey: activityKeys.browseAll(),
        });
      }, REFRESH_DEBOUNCE_MS);
    };
    const unsubscribers = [
      subscribeChannel(eventsFeedChannel(), refresh),
      subscribeChannel(ORGS_DIRECTORY_CHANNEL, refresh),
    ];
    return () => {
      if (timer !== undefined) clearTimeout(timer);
      for (const unsubscribe of unsubscribers) unsubscribe();
    };
  }, [queryClient]);
}
