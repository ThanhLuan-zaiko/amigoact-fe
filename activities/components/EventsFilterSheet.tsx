import type { ReactElement } from "react";
import { Modal } from "../../core/components/Modal.tsx";
import type { BrowseFacets, StatusFacet } from "../browse-api.ts";
import type { EventsFilters } from "../browse-utils.ts";
import { EventsFilterPanel } from "./EventsFilterPanel.tsx";
import { MyStatusFilter } from "./MyStatusFilter.tsx";

interface EventsFilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: EventsFilters;
  facets: BrowseFacets | undefined;
  myStatuses: StatusFacet[];
  mineView: boolean;
  tagName: string | undefined;
  hasNarrowing: boolean;
  onPatch: (patch: Record<string, string | null>) => void;
  onTag: (slug: string | undefined, name?: string) => void;
  onClear: () => void;
}

// Phone filters: the same controls as the desktop rail, in a side sheet.
export function EventsFilterSheet({
  open,
  onClose,
  filters,
  facets,
  myStatuses,
  mineView,
  tagName,
  hasNarrowing,
  onPatch,
  onTag,
  onClear,
}: EventsFilterSheetProps): ReactElement {
  return (
    <Modal side open={open} title="Bộ lọc" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <EventsFilterPanel
          filters={filters}
          categories={facets?.categories ?? []}
          cities={facets?.cities ?? []}
          tags={facets?.tags ?? []}
          tagName={tagName}
          showSort={!mineView}
          hasNarrowing={hasNarrowing}
          onPatch={onPatch}
          onTag={onTag}
          onClear={onClear}
        />
        {mineView && (
          <MyStatusFilter
            statuses={myStatuses}
            value={filters.reg}
            onChange={(status) => onPatch({ reg: status, page: null })}
          />
        )}
      </div>
    </Modal>
  );
}
