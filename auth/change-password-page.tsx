import type { ReactElement } from "react";
import { RequireAuth } from "./components/guards.tsx";
import { AccountSidePanel } from "./components/AccountSidePanel.tsx";
import { ChangePasswordCard } from "./components/ChangePasswordCard.tsx";

export function ChangePasswordPage(): ReactElement {
  return (
    <RequireAuth>
      <AccountSidePanel variant="password" />
      <ChangePasswordCard />
    </RequireAuth>
  );
}
