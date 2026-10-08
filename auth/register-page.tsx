import type { ReactElement } from "react";
import { AuthSidePanel } from "./components/AuthSidePanel.tsx";
import { RequireGuest } from "./components/guards.tsx";
import { RegisterCard } from "./components/RegisterCard.tsx";

export function RegisterPage(): ReactElement {
  return (
    <RequireGuest>
      <AuthSidePanel variant="register" />
      <RegisterCard />
    </RequireGuest>
  );
}
