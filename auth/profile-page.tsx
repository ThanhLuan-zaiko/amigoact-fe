import type { ReactElement } from "react";
import { RequireAuth } from "./components/guards.tsx";
import { ProfileCard } from "./components/ProfileCard.tsx";

export function ProfilePage(): ReactElement {
  return (
    <RequireAuth>
      <ProfileCard />
    </RequireAuth>
  );
}
