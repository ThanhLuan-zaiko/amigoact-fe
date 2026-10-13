import type { ReactElement } from "react";

const SIZES = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
} as const;

function initialOf(name: string): string {
  const first = name.trim().charAt(0);
  return first ? first.toUpperCase() : "?";
}

// Brand initial disc; decorative because a name label always sits beside it.
export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: keyof typeof SIZES;
}): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full border border-brand bg-brand font-semibold text-zinc-950 dark:border-brand dark:bg-brand dark:text-zinc-950 ${SIZES[size]}`}
    >
      {initialOf(name)}
    </span>
  );
}
