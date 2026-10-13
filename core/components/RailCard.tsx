import type { ReactElement, ReactNode } from "react";
import { Link } from "react-router-dom";

// X right-rail widget: bordered rounded-2xl box with a heavy title and
// edge-to-edge rows (rows own their padding so hover tints span the card).
export function RailCard({
  title,
  children,
  moreTo,
}: {
  title: string;
  children: ReactNode;
  /** Optional "show more" footer link target. */
  moreTo?: string;
}): ReactElement {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <h2 className="px-4 pb-1 pt-3 text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
      {children}
      {moreTo !== undefined && (
        <Link
          to={moreTo}
          className="block px-4 py-4 text-[15px] text-zinc-900 underline decoration-brand decoration-2 underline-offset-2 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand dark:text-brand dark:hover:bg-zinc-900 dark:focus-visible:outline-brand"
        >
          Xem thêm
        </Link>
      )}
    </section>
  );
}

export const RAIL_ROW =
  "block px-4 py-3 transition-colors hover:bg-zinc-50 focus-visible:outline-2 " +
  "focus-visible:-outline-offset-2 focus-visible:outline-brand dark:hover:bg-zinc-900 " +
  "dark:focus-visible:outline-brand";
