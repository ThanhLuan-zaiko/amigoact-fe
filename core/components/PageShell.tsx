import { useState } from "react";
import type { ReactElement } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSession } from "../../auth/hooks.ts";
import { useNotificationsRealtime } from "../../notifications/hooks.ts";
import { CenterHeader } from "./CenterHeader.tsx";
import { LeftRail } from "./LeftRail.tsx";
import { MobileTabBar } from "./MobileTabBar.tsx";
import { Modal } from "./Modal.tsx";
import { NavDrawer } from "./NavDrawer.tsx";
import { RealtimeBanner } from "./RealtimeBanner.tsx";
import { RightRail } from "./RightRail.tsx";
import { ToastViewport } from "./ToastViewport.tsx";
import { RAIL_SCROLL } from "../rail-styles.ts";

// X-style three-column shell, centered as one group:
// left rail (icons sm-xl, labels xl+) | 600px bordered column | right rail
// (lg+, every route). Phones get a sticky header, a drawer and a bottom tab
// bar. The frame is identical on every route: the column width never changes,
// so the rails never shift while navigating. The column is a size container:
// page layouts respond to its width (@2xl/@4xl), not the viewport.
export function PageShell(): ReactElement {
  const { pathname } = useLocation();
  const session = useSession();
  // Live badge: notification pings invalidate the unread count everywhere.
  useNotificationsRealtime(session.data?.id);
  // The drawer toggle only holds while the route it was opened on stays
  // current; navigating closes it.
  const [drawer, setDrawer] = useState<{ path: string; open: boolean } | null>(
    null,
  );
  const drawerOpen = drawer !== null && drawer.path === pathname && drawer.open;
  const closeDrawer = (): void => setDrawer({ path: pathname, open: false });
  // Same path tie as the nav drawer: changing route closes the rail sheet.
  const [rail, setRail] = useState<{ path: string; open: boolean } | null>(
    null,
  );
  const railOpen = rail !== null && rail.path === pathname && rail.open;

  return (
    <div className="min-h-dvh bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="flex justify-center">
        <header className="sticky top-0 z-40 hidden h-dvh w-[88px] shrink-0 sm:flex xl:w-[275px]">
          <LeftRail />
        </header>
        <main
          className="@container min-h-dvh w-full min-w-0 max-w-[600px] border-zinc-200 pb-20 sm:border-x sm:pb-0 dark:border-zinc-800"
        >
          <CenterHeader
            drawerOpen={drawerOpen}
            onOpenDrawer={() => setDrawer({ path: pathname, open: true })}
            railOpen={railOpen}
            onOpenRail={() => setRail({ path: pathname, open: true })}
          />
          <RealtimeBanner />
          <div className="flex flex-col">
            <Outlet />
          </div>
        </main>
        <aside
          aria-label="Thông tin cá nhân"
          className={`sticky top-0 ml-6 hidden h-dvh w-[290px] shrink-0 lg:block xl:w-[350px] ${RAIL_SCROLL}`}
        >
          <RightRail />
        </aside>
      </div>
      <MobileTabBar />
      <NavDrawer open={drawerOpen} onClose={closeDrawer} />
      <Modal
        side
        open={railOpen}
        title="Thông tin"
        onClose={() => setRail({ path: pathname, open: false })}
      >
        <RightRail />
      </Modal>
      <ToastViewport />
    </div>
  );
}
