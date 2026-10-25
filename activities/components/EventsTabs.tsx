import type { ReactElement } from "react";
import { Button } from "../../core/components/Button.tsx";
import type { EventsTab } from "../browse-utils.ts";
import { EVENTS_TAB_LABELS } from "../messages.tsx";

interface EventsTabsProps {
  tabs: readonly EventsTab[];
  value: EventsTab;
  onChange: (tab: EventsTab) => void;
}

// WAI tabs pattern: one selected tab in the tab order, arrow keys move
// both selection and focus, wrapping at both ends.
export function EventsTabs({
  tabs,
  value,
  onChange,
}: EventsTabsProps): ReactElement {
  const step = (index: number, delta: number) => {
    const next = tabs[(index + delta + tabs.length) % tabs.length];
    onChange(next);
    document.getElementById(`events-tab-${next}`)?.focus();
  };
  return (
    <div
      role="tablist"
      aria-label="Lọc theo thời gian"
      className="flex flex-wrap gap-2"
    >
      {tabs.map((tab, index) => {
        const selected = tab === value;
        return (
          <Button
            key={tab}
            id={`events-tab-${tab}`}
            role="tab"
            aria-selected={selected}
            aria-controls="events-feed"
            tabIndex={selected ? 0 : -1}
            variant={selected ? "primary" : "secondary"}
            className="shrink-0"
            onClick={() => onChange(tab)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") step(index, 1);
              if (event.key === "ArrowLeft") step(index, -1);
            }}
          >
            {EVENTS_TAB_LABELS[tab]}
          </Button>
        );
      })}
    </div>
  );
}
