import type { ReactElement, ReactNode } from "react";
import type { IconType } from "react-icons";
import { Link } from "react-router-dom";

// X right-rail widget: bordered rounded-2xl box with a heavy title and
// edge-to-edge rows (rows own their padding so hover tints span the card).
export function RailCard({
  title,
  children,
  moreTo,
  Icon,
}: {
  title: string;
  children: ReactNode;
  /** Optional "show more" footer link target. */
  moreTo?: string;
  /** Small glyph beside the title. */
  Icon?: IconType;
}): ReactElement {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <h2 className="flex items-center gap-2 px-4 pt-3 pb-1 text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
        {Icon && <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />}
        {title}
      </h2>
      {children}
      {moreTo !== undefined && (
        <Link
          to={moreTo}
          className="block px-4 py-4 text-[15px] text-zinc-900 underline decoration-zinc-400 decoration-2 underline-offset-2 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-100 dark:decoration-zinc-500 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400"
        >
          Xem thêm
        </Link>
      )}
    </section>
  );
}

export const RAIL_ROW =
  "block px-4 py-3 transition-colors hover:bg-zinc-50 focus-visible:outline-2 " +
  "focus-visible:-outline-offset-2 focus-visible:outline-zinc-500 dark:hover:bg-zinc-900 " +
  "dark:focus-visible:outline-zinc-400";

// Borderless empty line for rail cards (the card already provides the frame).
export function RailEmpty({ title, message }: { title: string; message: string }): ReactElement {
  return (
    <div className="px-4 pb-4">
      <p className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100">{title}</p>
      <p className="text-[13px] text-zinc-500 dark:text-zinc-400">{message}</p>
    </div>
  );
}
