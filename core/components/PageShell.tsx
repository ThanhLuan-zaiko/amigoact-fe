import { useState } from "react";
import type { ReactElement } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSession } from "../../auth/hooks.ts";
import { useNotificationsRealtime } from "../../notifications/hooks.ts";
import { CenterHeader } from "./CenterHeader.tsx";
import { LeftRail } from "./LeftRail.tsx";
import { MobileTabBar } from "./MobileTabBar.tsx";
import { NavDrawer } from "./NavDrawer.tsx";
import { RightRail } from "./RightRail.tsx";
import { ToastViewport } from "./ToastViewport.tsx";

// X-style three-column shell, centered as one group:
// left rail (icons sm-xl, labels xl+) | 600px bordered column | right rail
// (lg+). Phones get a sticky header, a drawer and a bottom tab bar. The
// column is a size container: page layouts respond to its width (@2xl/@4xl),
// not the viewport. Workspace surfaces (/manage, /admin) drop the right
// rail and widen the column to 920px, like X Messages.
export function PageShell(): ReactElement {
  const { pathname } = useLocation();
  const session = useSession();
  const wide = pathname.startsWith("/manage") || pathname.startsWith("/admin");
  // Live badge: notification pings invalidate the unread count everywhere.
  useNotificationsRealtime(session.data?.id);
  // The drawer toggle only holds while the route it was opened on stays
  // current; navigating closes it.
  const [drawer, setDrawer] = useState<{ path: string; open: boolean } | null>(
    null,
  );
  const drawerOpen = drawer !== null && drawer.path === pathname && drawer.open;
  const closeDrawer = (): void => setDrawer({ path: pathname, open: false });

  return (
    <div className="min-h-dvh bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="flex justify-center">
        <header className="sticky top-0 z-40 hidden h-dvh w-[88px] shrink-0 sm:flex xl:w-[275px]">
          <LeftRail />
        </header>
        <main
          className={`@container min-h-dvh w-full min-w-0 border-zinc-200 pb-20 sm:border-x sm:pb-0 dark:border-zinc-800 ${
            wide ? "max-w-[920px]" : "max-w-[600px]"
          }`}
        >
          <CenterHeader
            drawerOpen={drawerOpen}
            onOpenDrawer={() => setDrawer({ path: pathname, open: true })}
          />
          <div className="flex flex-col">
            <Outlet />
          </div>
        </main>
        {!wide && (
          <aside
            aria-label="Thông tin cá nhân"
            className="sticky top-0 ml-6 hidden h-dvh w-[290px] shrink-0 overflow-y-auto lg:block xl:w-[350px]"
          >
            <RightRail />
          </aside>
        )}
      </div>
      <MobileTabBar />
      <NavDrawer open={drawerOpen} onClose={closeDrawer} />
      <ToastViewport />
    </div>
  );
}
