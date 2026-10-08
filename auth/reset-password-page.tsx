import type { ReactElement } from "react";
import { RequireGuest } from "./components/guards.tsx";
import { ResetCard } from "./components/ResetCard.tsx";

export function ResetPasswordPage(): ReactElement {
  return (
    <RequireGuest>
      <ResetCard />
    </RequireGuest>
  );
}
