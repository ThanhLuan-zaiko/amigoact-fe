import { useState } from "react";
import {
  useBrowse,
  useBrowseMine,
  useEventsUrl,
  useSignedIn,
} from "./browse-hooks.ts";
import {
  toMineQuery,
  toPublicQuery,
  type EventsTab,
} from "./browse-utils.ts";

export const GUEST_TABS: readonly EventsTab[] = ["upcoming", "live", "past"];
export const SIGNED_IN_TABS: readonly EventsTab[] = [
  "upcoming",
  "live",
  "past",
  "mine",
];

// Filters, feed queries and rail actions for the /events controls. The desktop
// rail and the phone bar both read it, so neither repeats the glue.
export function useEventsBrowseState() {
  const { filters, patch } = useEventsUrl();
  const signedIn = useSignedIn();
  const mineView = signedIn && filters.tab === "mine";
  // Same query keys as the feed, so react-query shares the results.
  const browse = useBrowse(toPublicQuery(filters), filters.tab !== "mine");
  const mine = useBrowseMine(toMineQuery(filters), mineView);
  const [tagName, setTagName] = useState<string>();
  // Facets come from whichever view is on screen; the filter fields only
  // list values that have results under the other filters.
  const facets = mineView ? mine.data?.facets : browse.data?.facets;

  const selectTab = (tab: EventsTab) =>
    patch(
      { tab: tab === "upcoming" ? null : tab, page: null, reg: null },
      true,
    );

  const setTag = (slug: string | undefined, name?: string) => {
    setTagName(name);
    patch({ tag: slug ?? null, page: null });
  };

  return {
    filters,
    patch,
    signedIn,
    mineView,
    browse,
    mine,
    facets,
    tagName,
    selectTab,
    setTag,
  };
}

export type EventsBrowseState = ReturnType<typeof useEventsBrowseState>;
