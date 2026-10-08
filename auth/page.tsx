import type { ReactElement } from "react";
import { AuthSidePanel } from "./components/AuthSidePanel.tsx";
import { RequireGuest } from "./components/guards.tsx";
import { LoginCard } from "./components/LoginCard.tsx";

export function LoginPage(): ReactElement {
  return (
    <RequireGuest>
      <AuthSidePanel variant="login" />
      <LoginCard />
    </RequireGuest>
  );
}
