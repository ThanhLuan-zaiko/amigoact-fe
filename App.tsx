import type { ReactElement } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { FiHome } from "react-icons/fi";
import { PageShell } from "./core/components/PageShell.tsx";
import { BentoCard } from "./core/components/BentoCard.tsx";
import { Button } from "./core/components/Button.tsx";
import { EmptyState } from "./core/components/Feedback.tsx";
import { ChangePasswordPage } from "./auth/change-password-page.tsx";
import { ForgotPasswordPage } from "./auth/forgot-password-page.tsx";
import { LoginPage } from "./auth/page.tsx";
import { ProfilePage } from "./auth/profile-page.tsx";
import { RegisterPage } from "./auth/register-page.tsx";
import { ResetPasswordPage } from "./auth/reset-password-page.tsx";
import { VerifyPage } from "./auth/verify-page.tsx";
import { EventsPage } from "./events/page.tsx";
import { HomePage } from "./home/page.tsx";
import { LeaderboardPage } from "./leaderboard/page.tsx";
import { DashboardCreatePage } from "./dashboard/create-page.tsx";
import { DashboardEventsPage } from "./dashboard/events-page.tsx";
import { DashboardMembersPage } from "./dashboard/members-page.tsx";
import { DashboardOrgsPage } from "./dashboard/orgs-page.tsx";
import { DashboardOverviewPage } from "./dashboard/overview-page.tsx";
import { DashboardSettingsPage } from "./dashboard/settings-page.tsx";
import { DashboardPage } from "./dashboard/page.tsx";
import { OrgsPage } from "./orgs/page.tsx";

function LegacyDashboardRedirect(): ReactElement {
  const { "*": splat = "" } = useParams();
  const { search, hash } = useLocation();
  return <Navigate to={`/manage/${splat}${search}${hash}`} replace />;
}

function NotFoundPage(): ReactElement {
  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-12">
      <BentoCard>
        <EmptyState
          title="Không tìm thấy trang"
          message="Trang bạn tìm không tồn tại hoặc đã được di chuyển."
        />
        <div className="mt-3">
          <Button
            to="/"
            variant="primary"
            icon={<FiHome className="h-4 w-4" aria-hidden="true" />}
          >
            Về trang chủ
          </Button>
        </div>
      </BentoCard>
    </div>
  );
}

export default function App(): ReactElement {
  return (
    <Routes>
      <Route element={<PageShell />}>
        <Route index element={<HomePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="orgs" element={<OrgsPage />} />
        <Route path="my-dashboard/*" element={<LegacyDashboardRedirect />} />
        <Route path="manage" element={<DashboardPage />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<DashboardOverviewPage />} />
          <Route path="orgs" element={<DashboardOrgsPage />} />
          <Route path="orgs/create" element={<DashboardCreatePage />} />
          <Route path="create" element={<Navigate to="orgs/create" replace />} />
          <Route path="events" element={<DashboardEventsPage />} />
          <Route path="members" element={<DashboardMembersPage />} />
          <Route path="settings" element={<DashboardSettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="verify" element={<VerifyPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
