import type { ReactElement } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { FiLogIn } from "react-icons/fi";
import { Section } from "../core/components/Section.tsx";
import { Button } from "../core/components/Button.tsx";
import { EmptyState } from "../core/components/Feedback.tsx";
import { MANAGE_ROOT } from "../core/nav.tsx";
import { useSession } from "../auth/hooks.ts";
import { ManageTabs } from "./components/ManageTabs.tsx";

export function DashboardPage(): ReactElement {
  const session = useSession();
  const { pathname } = useLocation();

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

  // /manage/chat keeps the column chrome-free: no tabs strip. The
  // Telegram panel owns the full height under CenterHeader.
  const isChat = pathname.startsWith(`${MANAGE_ROOT}/chat`);

  return (
    <>
      <h1 className="sr-only">Bảng điều khiển</h1>
      {!isChat && <ManageTabs />}
      <div className="flex min-w-0 flex-col">
        <Outlet />
      </div>
    </>
  );
}
