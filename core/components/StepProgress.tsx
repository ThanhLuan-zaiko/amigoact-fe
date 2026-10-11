import type { ReactElement } from "react";
import { FiCheck } from "react-icons/fi";

interface StepProgressProps {
  step: number;
  total: number;
  label: string;
}

export function StepProgress({ step, total, label }: StepProgressProps): ReactElement {
  return (
    <div className="flex items-center gap-3" aria-label={label}>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, index) => {
          const done = index + 1 < step;
          const active = index + 1 === step;
          return (
            <span
              key={index}
              className={
                done
                  ? "flex h-6 w-6 items-center justify-center rounded-full border border-brand bg-brand text-zinc-950 dark:border-brand dark:bg-brand dark:text-zinc-950"
                  : active
                    ? "h-6 w-6 rounded-full border-2 border-zinc-900 dark:border-brand"
                    : "h-6 w-6 rounded-full border border-zinc-300 dark:border-zinc-700"
              }
            >
              {done && <FiCheck className="h-4 w-4" aria-hidden="true" />}
            </span>
          );
        })}
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Bước {step}/{total} — {label}
      </p>
    </div>
  );
}
