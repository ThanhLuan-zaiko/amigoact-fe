import type { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
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
import { OrgsPage } from "./orgs/page.tsx";

export default function App(): ReactElement {
  return (
    <Routes>
      <Route element={<PageShell />}>
        <Route index element={<HomePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="orgs" element={<OrgsPage />} />
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
