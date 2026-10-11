import type { ReactElement } from "react";
import { ORG_KIND_LABELS } from "../messages.tsx";

interface KindPillProps {
  kind: string;
}

export function KindPill({ kind }: KindPillProps): ReactElement {
  return (
    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
      {ORG_KIND_LABELS[kind] ?? kind}
    </span>
  );
}
