import type { ReactElement } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { PageShell } from "./core/components/PageShell.tsx";
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
  return <Navigate to={`/manage/${splat}`} replace />;
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
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Route>
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="verify" element={<VerifyPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
