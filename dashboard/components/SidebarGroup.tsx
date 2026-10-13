import type { ReactElement } from "react";
import { NavLink } from "react-router-dom";
import type { IconType } from "react-icons";

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
  labelId: string;
  inviteCount: number;
  unreadCount: number;
}

// Groups render fully expanded: the label is static text (not a toggle)
// and every entry stays visible so the whole surface is one scroll away.
export function SidebarGroupSection({
  group,
  labelId,
  inviteCount,
  unreadCount,
}: SidebarGroupSectionProps): ReactElement {
  return (
    <div>
      <p
        id={labelId}
        className="px-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
      >
        {group.label}
      </p>
      <ul aria-labelledby={labelId} className="mt-1 flex flex-col gap-1">
        {group.entries.map(({ to, label, Icon, badge }) => (
          <li key={to}>
            <NavLink
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
          </li>
        ))}
      </ul>
    </div>
  );
}
