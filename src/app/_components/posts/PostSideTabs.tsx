import Link from "next/link";
import type { IconType } from "react-icons";
import { FiCalendar, FiFileText, FiMessageCircle } from "react-icons/fi";
import type { PostSideTab } from "@/lib/postActivity";

const LABELS: Record<PostSideTab, { label: string; icon: IconType }> = {
  activity: { label: "Hoạt động", icon: FiCalendar },
  comments: { label: "Bình luận", icon: FiMessageCircle },
  posts: { label: "Bài viết khác", icon: FiFileText },
};

// The tab row of the panel beside a post. Each tab is an address (?tab=), so a
// shared link opens the same tab and the page needs no client code.
export default function PostSideTabs({
  tabs,
  current,
  commentCount,
}: {
  tabs: PostSideTab[];
  current: PostSideTab;
  commentCount: number;
}) {
  return (
    <nav
      aria-label="Nội dung bên cạnh bài viết"
      className="flex border-b border-slate-200 dark:border-slate-800"
    >
      {tabs.map((tab) => {
        const { label, icon: Icon } = LABELS[tab];
        const active = tab === current;
        return (
          <Link
            key={tab}
            href={`?tab=${tab}`}
            scroll={false}
            replace
            aria-current={active ? "page" : undefined}
            className={`-mb-px flex min-w-0 flex-1 items-center justify-center gap-2 border-b-2 px-2 py-3 text-sm font-semibold transition-colors ${
              active
                ? "border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            <Icon aria-hidden="true" className="shrink-0" />
            <span className="truncate">
              {tab === "comments" ? `${label} (${commentCount})` : label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
