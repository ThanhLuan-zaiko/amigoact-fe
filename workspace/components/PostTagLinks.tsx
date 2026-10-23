import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { FiHash } from "react-icons/fi";
import type { PostTag } from "../board-api.ts";

const CHIP =
  "inline-flex min-h-[28px] items-center gap-1 rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400";

// Tag chips. With an org id they open the board filtered by that slug.
export function PostTagLinks({
  tags,
  orgId,
}: {
  tags: PostTag[] | undefined;
  orgId?: string;
}): ReactElement | null {
  const items = tags ?? [];
  if (items.length === 0) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5">
      {items.map((tag) => (
        <li key={tag.slug}>
          {orgId ? (
            <Link
              to={`/manage/board?org=${orgId}&tag=${tag.slug}`}
              className={CHIP}
            >
              <FiHash className="h-3 w-3" aria-hidden="true" />
              {tag.name}
            </Link>
          ) : (
            <span className={CHIP}>
              <FiHash className="h-3 w-3" aria-hidden="true" />
              {tag.name}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
