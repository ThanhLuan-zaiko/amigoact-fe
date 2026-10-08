import type { ReactElement, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { LoadingState } from "../../core/components/Feedback.tsx";
import { useSession } from "../hooks.ts";

export function RequireAuth({ children }: { children: ReactNode }): ReactElement {
  const session = useSession();
  if (session.isPending) return <LoadingState label="Đang tải phiên đăng nhập…" />;
  if (!session.data) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RequireGuest({ children }: { children: ReactNode }): ReactElement {
  const session = useSession();
  if (session.isPending) return <LoadingState label="Đang tải phiên đăng nhập…" />;
  if (session.data) return <Navigate to="/" replace />;
  return <>{children}</>;
}
