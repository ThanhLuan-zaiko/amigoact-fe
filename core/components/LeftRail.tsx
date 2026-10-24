import type { ReactElement } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiActivity, FiLogIn, FiPlus } from "react-icons/fi";
import { useSession } from "../../auth/hooks.ts";
import { useUnreadCount } from "../../notifications/hooks.ts";
import { useChatUnreadTotal } from "../../workspace/hooks.ts";
import { activeEntry } from "../nav-meta.ts";
import { PRIMARY_LINKS } from "../nav.tsx";
import { RAIL_SCROLL } from "../rail-styles.ts";
import { AccountSwitcher } from "./AccountSwitcher.tsx";
import { MoreMenu } from "./MoreMenu.tsx";
import { RailNavItem } from "./RailNavItem.tsx";

// The rail's single full-width pill, X "Post" equivalent.
const CTA_CLASS =
  "flex h-[52px] items-center justify-center gap-2 rounded-full border border-zinc-900 bg-zinc-900 " +
  "text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-100 " +
  "dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:outline-zinc-400";

// Shared left rail for every page: logo, primary destinations, More, the
// primary action and the account switcher pinned to the bottom. Workspace
// sections live in the ManageTabs strip on /manage pages, not in the rail.
export function LeftRail(): ReactElement {
  const { pathname } = useLocation();
  const session = useSession();
  const signedIn = session.data != null;
  const active = activeEntry(pathname, PRIMARY_LINKS);
  const unread = useUnreadCount(signedIn).data?.unread ?? 0;
  const chatUnread = useChatUnreadTotal(signedIn);
  const links = PRIMARY_LINKS.filter((entry) => signedIn || !entry.auth);

  return (
    <div className="flex h-full w-full flex-col px-2 xl:px-3">
      <div className="flex justify-center py-1 xl:justify-start">
        <Link
          to="/"
          aria-label="AmigoACT - Trang chủ"
          className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-full transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950">
            <FiActivity className="h-5 w-5" aria-hidden="true" />
          </span>
        </Link>
      </div>
      <nav aria-label="Điều hướng chính" className={`min-h-0 ${RAIL_SCROLL}`}>
        <ul className="flex flex-col gap-0.5">
          {links.map((entry) => (
            <li key={entry.to}>
              <RailNavItem
                entry={entry}
                active={entry === active}
                count={
                  entry.badge === "notifications"
                    ? unread
                    : entry.badge === "chat"
                      ? chatUnread
                      : 0
                }
              />
            </li>
          ))}
        </ul>
      </nav>
      <MoreMenu />
      <div className="mt-3 flex justify-center xl:block xl:pr-4">
        {signedIn ? (
          <Link
            to="/manage/events?create=1"
            aria-label="Tạo hoạt động"
            className={`${CTA_CLASS} w-[52px] xl:w-full`}
          >
            <FiPlus className="h-6 w-6 xl:hidden" aria-hidden="true" />
            <span className="hidden text-[17px] font-bold xl:inline">
              Tạo hoạt động
            </span>
          </Link>
        ) : (
          !session.isPending && (
            <Link
              to="/login"
              aria-label="Đăng nhập"
              className={`${CTA_CLASS} w-[52px] xl:w-full`}
            >
              <FiLogIn className="h-6 w-6 xl:hidden" aria-hidden="true" />
              <span className="hidden text-[17px] font-bold xl:inline">
                Đăng nhập
              </span>
            </Link>
          )
        )}
      </div>
      <div className="flex-1" />
      <AccountSwitcher />
    </div>
  );
}
