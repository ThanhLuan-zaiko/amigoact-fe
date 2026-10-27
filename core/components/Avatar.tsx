import type { ReactElement } from "react";
import { apiBaseUrl } from "../api.ts";

const SIZES = {
  xs: "h-5 w-5 text-[10px]",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
  xl: "h-24 w-24 text-4xl border-4",
} as const;

function initialOf(name: string): string {
  const first = name.trim().charAt(0);
  return first ? first.toUpperCase() : "?";
}

// Round identity disc: the uploaded avatar image when the account has one,
// otherwise the neutral initial fallback. Decorative because a name label
// always sits beside it.
export function Avatar({
  name,
  src = null,
  size = "md",
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZES;
}): ReactElement {
  if (src) {
    return (
      <img
        src={`${apiBaseUrl()}${src}`}
        alt=""
        aria-hidden="true"
        className={`shrink-0 rounded-full border border-zinc-200 object-cover dark:border-zinc-700 ${SIZES[size]}`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full border border-zinc-900 bg-zinc-900 font-semibold text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 ${SIZES[size]}`}
    >
      {initialOf(name)}
    </span>
  );
}
