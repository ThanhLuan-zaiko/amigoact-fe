import { useState, type ReactElement } from "react";
import { FiSliders } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import type { EventsBrowseState } from "../browse-state-hooks.ts";
import {
  CLEARED_FILTERS,
  activeFilterCount,
  hasNarrowing,
  type EventsTab,
} from "../browse-utils.ts";
import { EventsFilterSheet } from "./EventsFilterSheet.tsx";
import { EventsFilters } from "./EventsFilters.tsx";
import { EventsTabs } from "./EventsTabs.tsx";

interface EventsMobileBarProps {
  state: EventsBrowseState;
  tabs: readonly EventsTab[];
}

// Phone controls in the feed column: search, quick toggles, the time tabs and
// a filter button that opens the full filter sheet.
export function EventsMobileBar({ state, tabs }: EventsMobileBarProps): ReactElement {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { filters, patch, mineView, facets, mine, tagName, setTag, selectTab } =
    state;
  const count = activeFilterCount(filters);
  return (
    <div className="flex flex-col gap-3">
      <EventsFilters
        q={filters.q}
        mode={filters.mode}
        open={filters.open}
        onPatch={patch}
      />
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <EventsTabs
            tabs={tabs}
            value={filters.tab}
            onChange={selectTab}
            layout="scroll"
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => setSheetOpen(true)}
          icon={<FiSliders className="h-4 w-4" aria-hidden="true" />}
        >
          {count > 0 ? `Bộ lọc (${count})` : "Bộ lọc"}
        </Button>
      </div>
      <EventsFilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        facets={facets}
        myStatuses={mine.data?.facets.my_status ?? []}
        mineView={mineView}
        tagName={tagName}
        hasNarrowing={hasNarrowing(filters)}
        onPatch={patch}
        onTag={setTag}
        onClear={() => patch(CLEARED_FILTERS)}
      />
    </div>
  );
}
