import type { ReactElement } from "react";
import { Link } from "react-router-dom";

export type HomeTab = "posts" | "orgs";

const TABS: readonly { key: HomeTab; label: string; to: string }[] = [
  { key: "posts", label: "Bài đăng", to: "/" },
  { key: "orgs", label: "Tổ chức", to: "/?tab=orgs" },
];

// X-style view tabs pinned under CenterHeader on the home column. Each tab
// owns a URL (?tab=) so the views stay deep-linkable; switching tabs jumps
// back to the top like switching X timelines.
export function HomeTabs({ active }: { active: HomeTab }): ReactElement {
  return (
    <nav
      aria-label="Nội dung trang chủ"
      className="sticky top-[53px] z-20 flex border-b border-zinc-200 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85"
    >
      {TABS.map(({ key, label, to }) => {
        const selected = key === active;
        return (
          <Link
            key={key}
            to={to}
            aria-current={selected ? "page" : undefined}
            onClick={() => window.scrollTo(0, 0)}
            className="flex h-[53px] flex-1 items-stretch justify-center transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-zinc-500 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400"
          >
            <span className="relative flex h-full items-center">
              <span
                className={
                  selected
                    ? "text-[15px] font-bold text-zinc-900 dark:text-zinc-100"
                    : "text-[15px] font-medium text-zinc-500 dark:text-zinc-400"
                }
              >
                {label}
              </span>
              {selected && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-1 rounded-full bg-zinc-900 dark:bg-zinc-100"
                />
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
