import type { ReactElement } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiActivity, FiLogIn, FiPlus } from "react-icons/fi";
import { useSession } from "../../auth/hooks.ts";
import { useMyMemberships } from "../../dashboard/members-hooks.ts";
import { useUnreadCount } from "../../notifications/hooks.ts";
import { activeEntry } from "../nav-meta.ts";
import { MANAGE_LINKS, MANAGE_ROOT, PRIMARY_LINKS } from "../nav.tsx";
import { AccountSwitcher } from "./AccountSwitcher.tsx";
import { MoreMenu } from "./MoreMenu.tsx";
import { RailNavItem } from "./RailNavItem.tsx";

// The rail's single full-width pill, X "Post" equivalent (see AGENTS 7.8).
const CTA_CLASS =
  "flex h-[52px] items-center justify-center gap-2 rounded-full border border-brand bg-brand " +
  "text-zinc-950 transition-colors hover:bg-brand/85 focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-brand dark:border-brand " +
  "dark:bg-brand dark:text-zinc-950 dark:hover:bg-brand/85 dark:focus-visible:outline-brand";

// Shared left rail for every page: logo, primary destinations (the
// dashboard expands into its workspace sections in place), More, the
// primary action and the account switcher pinned to the bottom.
export function LeftRail(): ReactElement {
  const { pathname } = useLocation();
  const session = useSession();
  const signedIn = session.data != null;
  const active = activeEntry(pathname, PRIMARY_LINKS);
  const inManage = signedIn && active?.to === MANAGE_ROOT;
  const unread = useUnreadCount(signedIn).data?.unread ?? 0;
  const invites = useMyMemberships("invited", inManage).data?.total ?? 0;
  const manageActive = inManage ? activeEntry(pathname, MANAGE_LINKS) : null;
  const links = PRIMARY_LINKS.filter((entry) => signedIn || !entry.auth);

  return (
    <div className="flex h-full w-full flex-col px-2 xl:px-3">
      <div className="flex justify-center py-1 xl:justify-start">
        <Link
          to="/"
          aria-label="AmigoACT - Trang chủ"
          className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-full transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:hover:bg-zinc-900 dark:focus-visible:outline-brand"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand bg-brand text-zinc-950 dark:border-brand dark:bg-brand dark:text-zinc-950">
            <FiActivity className="h-5 w-5" aria-hidden="true" />
          </span>
        </Link>
      </div>
      <nav aria-label="Điều hướng chính" className="min-h-0 overflow-y-auto">
        <ul className="flex flex-col gap-0.5">
          {links.map((entry) => (
            <li key={entry.to}>
              <RailNavItem
                entry={entry}
                active={entry === active}
                count={entry.badge === "notifications" ? unread : 0}
              />
              {entry.to === MANAGE_ROOT && inManage && (
                <ul
                  aria-label="Không gian quản lý"
                  className="my-1 flex flex-col gap-0.5 border-y border-zinc-200 py-1 xl:ml-[25px] xl:border-y-0 xl:border-l xl:py-0 xl:pl-3 dark:border-zinc-800"
                >
                  {MANAGE_LINKS.map((sub) => (
                    <li key={sub.to}>
                      <RailNavItem
                        entry={sub}
                        compact
                        active={sub === manageActive}
                        count={sub.badge === "invites" ? invites : 0}
                      />
                    </li>
                  ))}
                </ul>
              )}
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
