import type { ReactElement } from "react";
import { ACTIVITY_STATUS_LABELS } from "../messages.tsx";

// Lifecycle chip for manage and detail screens. Tones stay inside the
// AGENTS.md palette: zinc chrome, amber for live, emerald for public.
const STATUS_TONE: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  published:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  ongoing: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  completed: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function StatusChip({ status }: { status: string }): ReactElement {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[status] ?? STATUS_TONE.draft}`}
    >
      {ACTIVITY_STATUS_LABELS[status] ?? status}
    </span>
  );
}
