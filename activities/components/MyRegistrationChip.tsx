import type { ReactElement } from "react";
import { MY_REGISTRATION_LABELS } from "../messages.tsx";
import { StateChip, type StateTone } from "./StateChip.tsx";

const TONE_BY_STATUS: Record<string, StateTone> = {
  pending: "amber",
  waitlisted: "amber",
  approved: "emerald",
  attended: "emerald",
  rejected: "red",
  cancelled: "zinc",
};

// The caller's own registration on this activity, shown on their rows only.
export function MyRegistrationChip({
  status,
}: {
  status: string;
}): ReactElement {
  return (
    <StateChip tone={TONE_BY_STATUS[status] ?? "zinc"}>
      {MY_REGISTRATION_LABELS[status] ?? status}
    </StateChip>
  );
}
