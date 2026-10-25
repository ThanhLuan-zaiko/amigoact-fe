import type { ReactElement, ReactNode } from "react";

// Red is reserved for rejection; amber for "needs attention"; emerald for
// success; zinc for neutral or closed states. Each tone carries a dark pair.
export type StateTone = "emerald" | "amber" | "red" | "zinc";

const TONES: Record<StateTone, string> = {
  emerald:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  amber:
    "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  red: "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
  zinc: "border-zinc-300 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
};

export function StateChip({
  tone,
  children,
}: {
  tone: StateTone;
  children: ReactNode;
}): ReactElement {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
