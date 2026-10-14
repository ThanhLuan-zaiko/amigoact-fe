import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import type { NavEntry } from "../nav.tsx";
import { RAIL_PILL, railLabelClass, railRowClass } from "../rail-styles.ts";

// X rail item: bold label and heavier stroke when active. Labels appear
// from xl up (icon rail below), or always inside the phone drawer.
export function RailBadge({ count }: { count: number }): ReactElement | null {
  if (count <= 0) return null;
  return (
    <span
      aria-hidden="true"
      className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-white bg-zinc-900 px-1 text-[11px] font-bold leading-none text-white dark:border-zinc-950 dark:bg-zinc-100 dark:text-zinc-950"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

interface RailNavItemProps {
  entry: NavEntry;
  active: boolean;
  count?: number;
  /** Nested workspace sections: smaller icon and text. */
  compact?: boolean;
  expanded?: boolean;
  onNavigate?: () => void;
}

export function RailNavItem({
  entry,
  active,
  count = 0,
  compact = false,
  expanded = false,
  onNavigate,
}: RailNavItemProps): ReactElement {
  const { to, label, Icon } = entry;
  const spoken = count > 0 ? `${label} (${count} mới)` : label;
  return (
    <div className={railRowClass(expanded)}>
      <Link
        to={to}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        aria-label={spoken}
        title={expanded ? undefined : label}
        className={`${RAIL_PILL} ${compact ? "gap-4 px-3 py-2" : "gap-5 p-3"} ${
          expanded ? "pr-5" : "xl:pr-5"
        }`}
      >
        <span className="relative inline-flex">
          <Icon
            aria-hidden="true"
            className={`${compact ? "h-5 w-5" : "h-[26px] w-[26px]"} ${
              active ? "stroke-[2.75]" : ""
            }`}
          />
          <RailBadge count={count} />
        </span>
        <span
          className={`${railLabelClass(expanded)} ${
            compact ? "text-[15px]" : "text-xl"
          } ${active ? "font-bold" : ""}`}
        >
          {label}
        </span>
      </Link>
    </div>
  );
}
