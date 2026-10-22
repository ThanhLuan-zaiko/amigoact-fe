import type { ReactElement, ReactNode } from "react";
import { Link } from "react-router-dom";

interface OrgFeedRowProps {
  /** Leading circular identity image (author avatar or org logo). */
  avatar: ReactNode;
  /** Bold header name matching the avatar's owner. */
  title: ReactNode;
  /** Inline mark right after the title (e.g. the verified check). */
  badge?: ReactNode;
  /** Muted header tail after the title ("@slug", "dang trong ..."). */
  meta?: ReactNode;
  href: string;
  /** Bottom meta/action row (icons, counts, pills). */
  footer?: ReactNode;
  /** Body content under the header line (title, excerpt, media). */
  children?: ReactNode;
}

// One X-style row shape shared by the "Bai dang" and "To chuc" tabs so both
// read as the same timeline: round avatar, "Name + meta" header, free-form
// body, muted meta footer, edge-to-edge divided rows.
export function OrgFeedRow({
  avatar,
  title,
  badge,
  meta,
  href,
  footer,
  children,
}: OrgFeedRowProps): ReactElement {
  return (
    <li>
      <Link
        to={href}
        className="group flex gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-zinc-500 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400"
      >
        {avatar}
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-1 text-[15px] leading-6">
            <span className="truncate font-bold text-zinc-900 group-hover:underline dark:text-zinc-100">
              {title}
            </span>
            {badge}
            {meta !== undefined && (
              <span className="truncate text-zinc-500 dark:text-zinc-400">
                {meta}
              </span>
            )}
          </p>
          {children}
          {footer !== undefined && (
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
              {footer}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}
