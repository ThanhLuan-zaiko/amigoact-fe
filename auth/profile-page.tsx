import type { ReactElement } from "react";
import { RequireAuth } from "./components/guards.tsx";
import { AccountSidePanel } from "./components/AccountSidePanel.tsx";
import { ProfileCard } from "./components/ProfileCard.tsx";
import { SessionsCard } from "./components/SessionsCard.tsx";

export function ProfilePage(): ReactElement {
  return (
    <RequireAuth>
      <AccountSidePanel variant="profile" />
      <ProfileCard />
      <SessionsCard />
    </RequireAuth>
  );
}
