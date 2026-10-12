import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";

interface StatTileProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-pressed"> {
  icon: ReactNode;
  count: ReactNode;
  label: string;
  active?: boolean;
}

const BASE =
  "flex min-h-[44px] items-center gap-3 rounded-xl border p-3 text-left transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-brand dark:focus-visible:outline-brand";

const ACTIVE = "border-brand bg-brand/10 dark:border-brand dark:bg-brand/10";

const IDLE =
  "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900";

// Pressable stat tile: a filter toggle that also shows a count, used for
// stat strips where a pill Button would hide the number.
export function StatTile({
  icon,
  count,
  label,
  active = false,
  className = "",
  type = "button",
  ...rest
}: StatTileProps): ReactElement {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={`${BASE} ${active ? ACTIVE : IDLE}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {icon}
      <span className="flex min-w-0 flex-col">
        <span className="text-lg leading-tight font-semibold text-zinc-900 dark:text-zinc-100">
          {count}
        </span>
        <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
      </span>
    </button>
  );
}
