import { useState, type ReactElement } from "react";
import { RailCard } from "../../core/components/RailCard.tsx";
import {
  useBrowse,
  useBrowseMine,
  useEventsUrl,
  useSignedIn,
} from "../browse-hooks.ts";
import {
  CLEARED_FILTERS,
  hasNarrowing,
  toMineQuery,
  toPublicQuery,
  type EventsTab,
} from "../browse-utils.ts";
import { ActivityChatsCard } from "../../workspace/components/ActivityChatsCard.tsx";
import { EventsFilterPanel } from "./EventsFilterPanel.tsx";
import { EventsFilters } from "./EventsFilters.tsx";
import { EventsTabs } from "./EventsTabs.tsx";
import { MyEventsCard } from "./MyEventsCard.tsx";
import { MyStatusFilter } from "./MyStatusFilter.tsx";

const GUEST_TABS: readonly EventsTab[] = ["upcoming", "live", "past"];
const SIGNED_IN_TABS: readonly EventsTab[] = [
  "upcoming",
  "live",
  "past",
  "mine",
];
const YEAR = new Date().getFullYear();

// Right rail for /events: the time tabs, search and every filter. The page
// column keeps only the feed. Same shape as EventsRail on /manage/events.
export function EventsBrowseRail(): ReactElement {
  const { filters, patch } = useEventsUrl();
  const signedIn = useSignedIn();
  const mineView = signedIn && filters.tab === "mine";
  // Same query keys as the feed, so react-query shares the results.
  const browse = useBrowse(toPublicQuery(filters), filters.tab !== "mine");
  const mine = useBrowseMine(toMineQuery(filters), mineView);
  const [tagName, setTagName] = useState<string>();

  const selectTab = (tab: EventsTab) =>
    patch(
      { tab: tab === "upcoming" ? null : tab, page: null, reg: null },
      true,
    );

  const setTag = (slug: string | undefined, name?: string) => {
    setTagName(name);
    patch({ tag: slug ?? null, page: null });
  };

  // Facets come from whichever view is on screen; the filter fields only
  // list values that have results under the other filters.
  const facets = mineView ? mine.data?.facets : browse.data?.facets;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <EventsFilters
        q={filters.q}
        mode={filters.mode}
        open={filters.open}
        onPatch={patch}
      />
      <RailCard title="Thời gian">
        <div className="px-4 pb-4">
          <EventsTabs
            tabs={signedIn ? SIGNED_IN_TABS : GUEST_TABS}
            value={filters.tab}
            onChange={selectTab}
          />
        </div>
      </RailCard>
      <RailCard title="Bộ lọc">
        <div className="px-4 pb-4">
          <EventsFilterPanel
            filters={filters}
            categories={facets?.categories ?? []}
            cities={facets?.cities ?? []}
            tags={facets?.tags ?? []}
            tagName={tagName}
            showSort={!mineView}
            hasNarrowing={hasNarrowing(filters)}
            onPatch={patch}
            onTag={setTag}
            onClear={() => patch(CLEARED_FILTERS)}
          />
        </div>
      </RailCard>
      {mineView && (
        <RailCard title="Trạng thái">
          <div className="px-4 pb-4">
            <MyStatusFilter
              statuses={mine.data?.facets.my_status ?? []}
              value={filters.reg}
              onChange={(status) => patch({ reg: status, page: null })}
            />
          </div>
        </RailCard>
      )}
      {signedIn && <MyEventsCard />}
      {signedIn && <ActivityChatsCard />}
      <footer className="px-4 text-[13px] text-zinc-500 dark:text-zinc-400">
        <p>{`© ${YEAR} AmigoACT`}</p>
      </footer>
    </div>
  );
}
