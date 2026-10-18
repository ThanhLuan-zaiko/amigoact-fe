import type { ReactElement } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { FiHome } from "react-icons/fi";
import { PageShell } from "./core/components/PageShell.tsx";
import { Section } from "./core/components/Section.tsx";
import { Button } from "./core/components/Button.tsx";
import { EmptyState } from "./core/components/Feedback.tsx";
import { AdminAdminsPage } from "./admin/admins-page.tsx";
import { AuditPage } from "./audit/page.tsx";
import { AdminModerationPage } from "./admin/moderation-page.tsx";
import { AdminOrgsPage } from "./admin/orgs-page.tsx";
import { AdminPage } from "./admin/page.tsx";
import { ChangePasswordPage } from "./auth/change-password-page.tsx";
import { MyCertificatesPage } from "./certificates/mine-page.tsx";
import { VerifyCertificatePage } from "./certificates/verify-page.tsx";
import { ForgotPasswordPage } from "./auth/forgot-password-page.tsx";
import { LoginPage } from "./auth/page.tsx";
import { ProfilePage } from "./auth/profile-page.tsx";
import { RegisterPage } from "./auth/register-page.tsx";
import { ResetPasswordPage } from "./auth/reset-password-page.tsx";
import { VerifyPage } from "./auth/verify-page.tsx";
import { EventDetailPage } from "./activities/detail-page.tsx";
import { EventsPage } from "./activities/page.tsx";
import { ManageEventDetailPage } from "./activities/manage-detail-page.tsx";
import { ManageEventsPage } from "./activities/manage-page.tsx";
import { HomePage } from "./home/page.tsx";
import { MyHoursPage } from "./hours/mine-page.tsx";
import { LeaderboardPage } from "./leaderboard/page.tsx";
import { DashboardCreatePage } from "./dashboard/create-page.tsx";
import { DashboardMembersPage } from "./dashboard/members-page.tsx";
import { DashboardOrgsPage } from "./dashboard/orgs-page.tsx";
import { DashboardOverviewPage } from "./dashboard/overview-page.tsx";
import { DashboardSettingsPage } from "./dashboard/settings-page.tsx";
import { DashboardPage } from "./dashboard/page.tsx";
import { MembershipRealtime } from "./dashboard/components/MembershipRealtime.tsx";
import { ChatInboxRealtime } from "./workspace/components/ChatInboxRealtime.tsx";
import { NotificationsPage } from "./notifications/page.tsx";
import { OrgDetailPage } from "./orgs/detail-page.tsx";
import { PublicVolunteerPage } from "./profiles/public-page.tsx";
import { MyRegistrationsPage } from "./registrations/mine-page.tsx";
import { VolunteerProfilePage } from "./profiles/volunteer-page.tsx";
import { OrgNewsPage } from "./orgs/news-page.tsx";
import { OrgPostPage } from "./workspace/org-post-page.tsx";
import { WorkspaceBoardPage } from "./workspace/board-page.tsx";
import { WorkspaceChatPage } from "./workspace/chat-page.tsx";
import { WorkspaceReadPage } from "./workspace/read-page.tsx";
import { WorkspaceWritePage } from "./workspace/write-page.tsx";

function LegacyDashboardRedirect(): ReactElement {
  const { "*": splat = "" } = useParams();
  const { search, hash } = useLocation();
  return <Navigate to={`/manage/${splat}${search}${hash}`} replace />;
}

// The org directory is the "To chuc" tab of the home column; keep legacy
// /orgs?q&kind&sort&page deep links working by forwarding the query string.
function OrgsDirectoryRedirect(): ReactElement {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  params.set("tab", "orgs");
  return <Navigate to={`/?${params.toString()}`} replace />;
}

function NotFoundPage(): ReactElement {
  return (
    <div>
      <Section>
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
      </Section>
    </div>
  );
}

export default function App(): ReactElement {
  return (
    <>
      <MembershipRealtime />
      <ChatInboxRealtime />
      <Routes>
      <Route element={<PageShell />}>
        <Route index element={<HomePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:orgId/:slug" element={<EventDetailPage />} />
        <Route path="orgs" element={<OrgsDirectoryRedirect />} />
        <Route path="orgs/:slug" element={<OrgDetailPage />} />
        <Route path="orgs/:slug/posts" element={<OrgNewsPage />} />
        <Route
          path="orgs/:slug/posts/:postId"
          element={<OrgPostPage />}
        />
        <Route path="my-dashboard/*" element={<LegacyDashboardRedirect />} />
        <Route path="manage" element={<DashboardPage />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<DashboardOverviewPage />} />
          <Route path="orgs" element={<DashboardOrgsPage />} />
          <Route path="orgs/create" element={<DashboardCreatePage />} />
          <Route path="create" element={<Navigate to="orgs/create" replace />} />
          <Route path="events" element={<ManageEventsPage />} />
          <Route
            path="events/:orgId/:activityId"
            element={<ManageEventDetailPage />}
          />
          <Route path="volunteer" element={<VolunteerProfilePage />} />
          <Route
            path="registrations"
            element={<MyRegistrationsPage />}
          />
          <Route path="hours" element={<MyHoursPage />} />
          <Route
            path="certificates"
            element={<MyCertificatesPage />}
          />
          <Route path="members" element={<DashboardMembersPage />} />
          <Route path="board" element={<WorkspaceBoardPage />} />
          <Route path="board/write" element={<WorkspaceWritePage />} />
          <Route path="board/post" element={<WorkspaceReadPage />} />
          <Route path="chat" element={<WorkspaceChatPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="settings" element={<DashboardSettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="admin" element={<AdminPage />}>
          <Route index element={<Navigate to="orgs" replace />} />
          <Route path="orgs" element={<AdminOrgsPage />} />
          <Route path="moderation" element={<AdminModerationPage />} />
          <Route path="admins" element={<AdminAdminsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route
          path="certificates/verify"
          element={<VerifyCertificatePage />}
        />
        <Route path="volunteers/:userId" element={<PublicVolunteerPage />} />
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
    </>
  );
}
