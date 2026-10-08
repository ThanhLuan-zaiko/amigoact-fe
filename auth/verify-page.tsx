import type { ReactElement } from "react";
import { RequireGuest } from "./components/guards.tsx";
import { VerifyCard } from "./components/VerifyCard.tsx";

export function VerifyPage(): ReactElement {
  return (
    <RequireGuest>
      <VerifyCard />
    </RequireGuest>
  );
}
