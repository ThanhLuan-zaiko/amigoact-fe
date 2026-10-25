import type { ReactElement } from "react";
import { FiUsers } from "react-icons/fi";

interface SeatsMeterProps {
  max: number | null;
  seatsLeft: number | null;
}

// Seat text only. Colour follows how full the activity is; red is never
// used because a full activity still accepts applications (waitlist).
export function SeatsMeter({
  max,
  seatsLeft,
}: SeatsMeterProps): ReactElement | null {
  if (max === null || seatsLeft === null) return null;
  const tone =
    seatsLeft === 0
      ? "text-zinc-600 dark:text-zinc-400"
      : seatsLeft * 5 <= max
        ? "text-amber-700 dark:text-amber-400"
        : "text-emerald-700 dark:text-emerald-400";
  const label =
    seatsLeft === 0
      ? "Hết chỗ, vào danh sách chờ"
      : `Còn ${seatsLeft}/${max} chỗ`;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${tone}`}>
      <FiUsers className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
