import type { ReactElement } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSession } from "../../auth/hooks.ts";
import { useUnreadCount } from "../../notifications/hooks.ts";
import { activeEntry } from "../nav-meta.ts";
import { PRIMARY_LINKS, TAB_PATHS_GUEST, TAB_PATHS_MEMBER } from "../nav.tsx";
import { RailBadge } from "./RailNavItem.tsx";

// Phone-only bottom tab bar (X keeps its main destinations as icons here).
export function MobileTabBar(): ReactElement {
  const { pathname } = useLocation();
  const session = useSession();
  const signedIn = session.data != null;
  const unread = useUnreadCount(signedIn).data?.unread ?? 0;
  const paths = signedIn ? TAB_PATHS_MEMBER : TAB_PATHS_GUEST;
  const tabs = PRIMARY_LINKS.filter((entry) => paths.includes(entry.to));
  const active = activeEntry(pathname, tabs);

  return (
    <nav
      aria-label="Điều hướng nhanh"
      className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-zinc-200 bg-white/90 backdrop-blur sm:hidden dark:border-zinc-800 dark:bg-zinc-950/90"
    >
      {tabs.map((entry) => {
        const { to, label, Icon } = entry;
        const isActive = entry === active;
        const count = entry.badge === "notifications" ? unread : 0;
        return (
          <Link
            key={to}
            to={to}
            aria-label={count > 0 ? `${label} (${count} mới)` : label}
            aria-current={isActive ? "page" : undefined}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus-visible:outline-brand"
          >
            <span className="relative inline-flex">
              <Icon
                aria-hidden="true"
                className={`h-[26px] w-[26px] ${isActive ? "stroke-[2.75]" : ""}`}
              />
              <RailBadge count={count} />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
