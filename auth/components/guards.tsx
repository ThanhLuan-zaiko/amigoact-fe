import type { ReactElement, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingState } from "../../core/components/Feedback.tsx";
import { Section } from "../../core/components/Section.tsx";
import { loginPath, safeNextPath } from "../next-path.ts";
import { useSession } from "../hooks.ts";

export function RequireAuth({ children }: { children: ReactNode }): ReactElement {
  const session = useSession();
  const location = useLocation();
  if (session.isPending) {
    return (
      <Section>
        <LoadingState label="Đang tải phiên đăng nhập…" />
      </Section>
    );
  }
  if (!session.data) {
    return (
      <Navigate
        to={loginPath(`${location.pathname}${location.search}`)}
        replace
      />
    );
  }
  return <>{children}</>;
}

// Login and register pages send a signed-in visitor on to the ?next= path, if
// it is a safe in-app path; otherwise to the home page.
export function RequireGuest({ children }: { children: ReactNode }): ReactElement {
  const session = useSession();
  const location = useLocation();
  if (session.isPending) {
    return (
      <Section>
        <LoadingState label="Đang tải phiên đăng nhập…" />
      </Section>
    );
  }
  if (session.data) {
    const next = safeNextPath(new URLSearchParams(location.search).get("next"));
    return <Navigate to={next ?? "/"} replace />;
  }
  return <>{children}</>;
}
