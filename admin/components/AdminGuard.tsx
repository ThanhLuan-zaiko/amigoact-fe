import type { ReactElement, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import {
  EmptyState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { Button } from "../../core/components/Button.tsx";
import { FiLogIn } from "react-icons/fi";
import { useSession } from "../../auth/hooks.ts";
import { useAdminStatus } from "../hooks.ts";

export function AdminGuard({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const session = useSession();
  const status = useAdminStatus(session.data != null);

  if (session.isPending || status.isPending) {
    return <LoadingState label="Đang kiểm tra quyền quản trị…" />;
  }
  if (!session.data) {
    return <Navigate to="/login" replace />;
  }
  if (!status.data?.is_admin) {
    return (
      <div className="col-span-1 md:col-span-6 lg:col-span-12">
        <EmptyState
          title="Khu vực quản trị"
          message="Trang này chỉ dành cho quản trị viên nền tảng."
        />
        <div className="mt-3">
          <Button
            to="/"
            variant="secondary"
            icon={<FiLogIn className="h-4 w-4" aria-hidden="true" />}
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
