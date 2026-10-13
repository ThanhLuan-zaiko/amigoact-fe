import type { ReactElement } from "react";
import { FiBookOpen, FiEdit3, FiTrash2 } from "react-icons/fi";
import type { ArticleShelf } from "./ArticleActions.tsx";

interface ShelfTabsProps {
  tab: ArticleShelf;
  onSelect: (shelf: ArticleShelf) => void;
}

interface ShelfTile {
  value: ArticleShelf;
  label: string;
  hint: string;
  icon: ReactElement;
}

const SHELVES: ShelfTile[] = [
  {
    value: "published",
    label: "Đã đăng",
    hint: "Bài viết đang hiển thị với thành viên.",
    icon: <FiBookOpen className="h-5 w-5" aria-hidden="true" />,
  },
  {
    value: "draft",
    label: "Nháp",
    hint: "Nháp mới, nháp chờ đăng và bài đã gỡ — chỉ bạn thấy.",
    icon: <FiEdit3 className="h-5 w-5" aria-hidden="true" />,
  },
  {
    value: "trash",
    label: "Thùng rác",
    hint: "Khôi phục hoặc xóa vĩnh viễn.",
    icon: <FiTrash2 className="h-5 w-5" aria-hidden="true" />,
  },
];

const TILE_BASE =
  "flex h-full w-full flex-col items-start gap-1 rounded-2xl border p-4 text-left " +
  "sm:p-6 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-brand dark:focus-visible:outline-brand";

const TILE_IDLE =
  "border-zinc-200 bg-white hover:bg-zinc-50 " +
  "dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900";

const TILE_ACTIVE =
  "border-brand/40 bg-brand/10 dark:border-brand/30 dark:bg-brand/10";

// Clickable shelf selector tiles standing in for a tab strip: each tile is
// one bento cell so the row reads as part of the grid instead of a toolbar.
export function ShelfTabs({ tab, onSelect }: ShelfTabsProps): ReactElement {
  return (
    <>
      {SHELVES.map((shelf) => {
        const active = tab === shelf.value;
        return (
          <button
            key={shelf.value}
            type="button"
            data-rise
            onClick={() => onSelect(shelf.value)}
            aria-pressed={active}
            className={`${TILE_BASE} md:col-span-2 lg:col-span-4 ${
              active ? TILE_ACTIVE : TILE_IDLE
            }`}
          >
            <span
              className={`flex items-center gap-2 text-base font-semibold sm:text-lg ${
                active
                  ? "text-zinc-900 dark:text-brand"
                  : "text-zinc-900 dark:text-zinc-100"
              }`}
            >
              {shelf.icon}
              {shelf.label}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {shelf.hint}
            </span>
          </button>
        );
      })}
    </>
  );
}
