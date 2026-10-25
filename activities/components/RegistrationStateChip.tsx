import { useState, type ReactElement } from "react";
import { formatDateTime } from "../dates.tsx";
import { StateChip } from "./StateChip.tsx";

const CLOSING_WINDOW_MS = 48 * 60 * 60 * 1000;

interface RegistrationStateChipProps {
  open: boolean;
  deadline: string | null;
}

// Whether sign-ups are open right now, and whether the deadline is close.
export function RegistrationStateChip({
  open,
  deadline,
}: RegistrationStateChipProps): ReactElement {
  // Read the clock once per mount so render stays pure.
  const [clock] = useState(() => Date.now());
  if (!open) return <StateChip tone="zinc">Đã đóng đăng ký</StateChip>;
  const closing =
    deadline !== null &&
    new Date(deadline).getTime() - clock <= CLOSING_WINDOW_MS;
  if (closing) {
    return (
      <StateChip tone="amber">Hạn đăng ký {formatDateTime(deadline)}</StateChip>
    );
  }
  return <StateChip tone="emerald">Đang mở đăng ký</StateChip>;
}
