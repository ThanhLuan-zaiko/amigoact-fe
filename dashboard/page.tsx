import type { ReactElement } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { FiInfo, FiLogIn } from "react-icons/fi";
import { BentoCard } from "../core/components/BentoCard.tsx";
import { Button } from "../core/components/Button.tsx";
import { EmptyState } from "../core/components/Feedback.tsx";
import { useRiseIn } from "../core/motion.ts";
import { useSession } from "../auth/hooks.ts";
import { DashboardSidebar } from "./components/DashboardSidebar.tsx";
import { useMyOrgs } from "./hooks.ts";
import { useMyMemberships } from "./members-hooks.ts";
import { useUnreadCount } from "../notifications/hooks.ts";

export function DashboardPage(): ReactElement {
  const session = useSession();
  const orgs = useMyOrgs(false, {}, session.data != null);
  const memberships = useMyMemberships("invited", session.data != null);
  const { pathname } = useLocation();
  const scope = useRiseIn<HTMLDivElement>([pathname]);
  const orgCount = orgs.data?.total ?? 0;
  const inviteCount = memberships.data?.total ?? 0;
  const unreadCount = useUnreadCount(session.data != null).data?.unread ?? 0;

  if (!session.isPending && !session.data) {
    return (
      <div className="col-span-1 md:col-span-6 lg:col-span-12">
        <BentoCard>
          <EmptyState
            title="Cần đăng nhập"
            message="Đăng nhập để tạo và quản lý tổ chức, câu lạc bộ hay hội nhóm của bạn."
          />
          <div className="mt-3">
            <Button
              to="/login"
              variant="primary"
              icon={<FiLogIn className="h-4 w-4" aria-hidden="true" />}
            >
              Đăng nhập
            </Button>
          </div>
        </BentoCard>
      </div>
    );
  }

  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-12">
      <h1 className="sr-only">Bảng điều khiển</h1>
      <div ref={scope} className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start">
        <DashboardSidebar
          orgCount={orgCount}
          inviteCount={inviteCount}
          unreadCount={unreadCount}
        />
        <section aria-label="Nội dung bảng điều khiển" className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:gap-6 md:grid-cols-6 lg:grid-cols-12">
          <Outlet />
          <BentoCard className="md:col-span-6 lg:col-span-12">
            <div data-rise className="flex items-center gap-2">
              <FiInfo className="h-5 w-5 text-zinc-900 dark:text-brand" aria-hidden="true" />
              <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
                Dành cho mọi loại hình
              </h3>
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Cá nhân, doanh nghiệp, câu lạc bộ hay hội nhóm đều tự tạo không gian riêng, mở sự kiện và theo dõi đóng góp.
            </p>
          </BentoCard>
        </section>
      </div>
    </div>
  );
}
