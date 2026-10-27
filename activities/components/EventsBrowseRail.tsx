import type { ReactElement } from "react";
import { RailCard } from "../../core/components/RailCard.tsx";
import { useMediaQuery } from "../../core/media-query.ts";
import { ActivityChatsCard } from "../../workspace/components/ActivityChatsCard.tsx";
import { useEventsBrowseState } from "../browse-state-hooks.ts";
import { CLEARED_FILTERS, hasNarrowing } from "../browse-utils.ts";
import { EventsFilterPanel } from "./EventsFilterPanel.tsx";
import { EventsFilters } from "./EventsFilters.tsx";
import { MyEventsCard } from "./MyEventsCard.tsx";
import { MyStatusFilter } from "./MyStatusFilter.tsx";

const YEAR = new Date().getFullYear();

// Right rail for /events. On desktop it holds search and every filter; the
// time tabs sit above the feed (page.tsx). On phones those controls live in
// the feed column (EventsMobileBar), so the rail keeps only the personal cards.
export function EventsBrowseRail(): ReactElement {
  const state = useEventsBrowseState();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const {
    filters,
    patch,
    signedIn,
    mineView,
    mine,
    facets,
    tagName,
    setTag,
  } = state;

  return (
    <div className="flex flex-col gap-4 pb-8 pr-3 pt-3">
      {desktop && (
        <>
          <EventsFilters
            q={filters.q}
            mode={filters.mode}
            open={filters.open}
            onPatch={patch}
          />
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
        </>
      )}
      {signedIn && <MyEventsCard />}
      {signedIn && <ActivityChatsCard />}
      <footer className="px-4 text-[13px] text-zinc-500 dark:text-zinc-400">
        <p>{`© ${YEAR} AmigoACT`}</p>
      </footer>
    </div>
  );
}
