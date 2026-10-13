import type { ReactElement } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { FiInfo, FiLogIn } from "react-icons/fi";
import { Section } from "../core/components/Section.tsx";
import { Button } from "../core/components/Button.tsx";
import { EmptyState } from "../core/components/Feedback.tsx";
import { useRiseIn } from "../core/motion.ts";
import { useSession } from "../auth/hooks.ts";

export function DashboardPage(): ReactElement {
  const session = useSession();
  const { pathname } = useLocation();
  const scope = useRiseIn<HTMLDivElement>([pathname]);

  if (!session.isPending && !session.data) {
    return (
      <Section>
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
      </Section>
    );
  }

  return (
    <>
      <h1 className="sr-only">Bảng điều khiển</h1>
      <div ref={scope} className="flex min-w-0 flex-col">
        <Outlet />
        <Section>
          <div data-rise className="flex items-center gap-2">
            <FiInfo className="h-5 w-5 text-zinc-900 dark:text-brand" aria-hidden="true" />
            <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
              Dành cho mọi loại hình
            </h3>
          </div>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Cá nhân, doanh nghiệp, câu lạc bộ hay hội nhóm đều tự tạo không gian riêng, mở sự kiện và theo dõi đóng góp.
          </p>
        </Section>
      </div>
    </>
  );
}
