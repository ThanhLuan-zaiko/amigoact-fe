import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { NavLink } from "react-router-dom";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import type { IconType } from "react-icons";
import { Button } from "../../core/components/Button.tsx";
import { riseIn, swapGlyph } from "../../core/motion.ts";

export interface SidebarEntry {
  to: string;
  label: string;
  Icon: IconType;
  badge?: "invites" | "notifications";
}

export interface SidebarGroup {
  label: string;
  entries: SidebarEntry[];
}

const BASE =
  "inline-flex min-h-[44px] w-full items-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-brand dark:focus-visible:outline-brand";

function itemClass(isActive: boolean): string {
  if (isActive) {
    return `${BASE} bg-brand text-zinc-950 dark:bg-brand dark:text-zinc-950`;
  }
  return (
    `${BASE} text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 ` +
    "dark:hover:bg-zinc-900"
  );
}

const BADGE_CLASS =
  "ml-auto rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 " +
  "text-xs font-semibold text-amber-700 dark:border-amber-800 " +
  "dark:bg-amber-950 dark:text-amber-400";

interface SidebarGroupSectionProps {
  group: SidebarGroup;
  regionId: string;
  open: boolean;
  inviteCount: number;
  unreadCount: number;
  onToggle: (label: string) => void;
}

// One collapsible nav group. The header aligns its chevron+label to the
// same left edge as the entry icons so open and closed rows read as one
// grid; expanding staggers the entries in and cross-fades the chevron.
export function SidebarGroupSection({
  group,
  regionId,
  open,
  inviteCount,
  unreadCount,
  onToggle,
}: SidebarGroupSectionProps): ReactElement {
  const listRef = useRef<HTMLDivElement | null>(null);
  const glyphRef = useRef<HTMLSpanElement | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (glyphRef.current) swapGlyph(glyphRef.current);
    if (open && listRef.current) {
      riseIn(Array.from(listRef.current.children), {
        staggerMs: 35,
        y: 6,
        duration: 200,
      });
    }
  }, [open]);

  const badgeFor = (badge?: "invites" | "notifications") =>
    badge === "invites"
      ? inviteCount
      : badge === "notifications"
        ? unreadCount
        : 0;
  const groupBadge = group.entries.reduce(
    (sum, entry) => sum + badgeFor(entry.badge),
    0,
  );
  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        onClick={() => onToggle(group.label)}
        aria-expanded={open}
        aria-controls={regionId}
        className="w-full px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
      >
        <span className="flex w-full items-center gap-2">
          <span
            ref={glyphRef}
            className="flex h-5 w-5 shrink-0 items-center justify-center"
          >
            {open ? (
              <FiChevronDown className="h-4 w-4" aria-hidden="true" />
            ) : (
              <FiChevronRight className="h-4 w-4" aria-hidden="true" />
            )}
          </span>
          <span className="min-w-0 flex-1 truncate text-left">
            {group.label}
          </span>
          {!open && groupBadge > 0 && (
            <span
              className={BADGE_CLASS}
              aria-label={`${groupBadge} mục cần chú ý trong nhóm ${group.label}`}
            >
              {groupBadge}
            </span>
          )}
        </span>
      </Button>
      {open && (
        <div ref={listRef} id={regionId} className="mt-1 flex flex-col gap-1">
          {group.entries.map(({ to, label, Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) => itemClass(isActive)}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {label}
              {badge === "invites" && inviteCount > 0 && (
                <span
                  className={BADGE_CLASS}
                  aria-label={`${inviteCount} lời mời đang chờ`}
                >
                  {inviteCount}
                </span>
              )}
              {badge === "notifications" && unreadCount > 0 && (
                <span
                  className={BADGE_CLASS}
                  aria-label={`${unreadCount} thông báo chưa đọc`}
                >
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
