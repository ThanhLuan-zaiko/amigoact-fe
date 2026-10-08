import type { ReactElement } from "react";
import { RequireAuth } from "./components/guards.tsx";
import { ChangePasswordCard } from "./components/ChangePasswordCard.tsx";

export function ChangePasswordPage(): ReactElement {
  return (
    <RequireAuth>
      <ChangePasswordCard />
    </RequireAuth>
  );
}
