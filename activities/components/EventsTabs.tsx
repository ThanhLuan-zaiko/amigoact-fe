import { useRef, type ReactElement } from "react";
import { Button } from "../../core/components/Button.tsx";
import type { EventsTab } from "../browse-utils.ts";
import { EVENTS_TAB_LABELS } from "../messages.tsx";

interface EventsTabsProps {
  tabs: readonly EventsTab[];
  value: EventsTab;
  onChange: (tab: EventsTab) => void;
  // wrap for the rail, scroll for the narrow phone bar.
  layout?: "wrap" | "scroll";
}

const LAYOUT = {
  wrap: "flex flex-wrap gap-2",
  scroll: "flex gap-2 overflow-x-auto px-0.5 pb-1",
} as const;

// WAI tabs pattern: one selected tab in the tab order, arrow keys move
// both selection and focus, wrapping at both ends.
export function EventsTabs({
  tabs,
  value,
  onChange,
  layout = "wrap",
}: EventsTabsProps): ReactElement {
  const listRef = useRef<HTMLDivElement>(null);
  const step = (index: number, delta: number) => {
    const next = (index + delta + tabs.length) % tabs.length;
    onChange(tabs[next]);
    // Find the tab inside this tablist, so no global id is needed.
    listRef.current
      ?.querySelectorAll<HTMLElement>('[role="tab"]')[next]
      ?.focus();
  };
  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Lọc theo thời gian"
      className={LAYOUT[layout]}
    >
      {tabs.map((tab, index) => {
        const selected = tab === value;
        return (
          <Button
            key={tab}
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
