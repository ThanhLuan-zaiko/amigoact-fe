import type { ReactElement } from "react";
import { RequireGuest } from "./components/guards.tsx";
import { ForgotCard } from "./components/ForgotCard.tsx";

export function ForgotPasswordPage(): ReactElement {
  return (
    <RequireGuest>
      <ForgotCard />
    </RequireGuest>
  );
}
