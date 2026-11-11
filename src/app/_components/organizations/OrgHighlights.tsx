import Link from "next/link";
import { FiBookmark, FiCalendar, FiChevronRight } from "react-icons/fi";
import { formatDateTime } from "@/lib/activities";
import { listOrganizationActivities } from "@/lib/activityApi";
import { getOrgPosts } from "@/lib/postApi";
import { postPath } from "@/lib/posts";
import IconStat from "../IconStat";
import { mutedText, panel, sectionTitle } from "../ui";

const HIGHLIGHT_COUNT = 3;

function Heading({
  icon: Icon,
  title,
  href,
  linkLabel,
}: {
  icon: typeof FiBookmark;
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className={`${sectionTitle} flex items-center gap-2`}>
        <Icon aria-hidden="true" />
        {title}
      </h2>
      <Link
        href={href}
        aria-label={linkLabel}
        title={linkLabel}
        className="text-slate-500 transition-colors hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400"
      >
        <FiChevronRight aria-hidden="true" />
      </Link>
    </div>
  );
}

// Pinned posts first. Without any, the newest posts stand in, so the panel is never empty
// when the organization has posted. Read behind a Suspense boundary.
export async function PinnedPosts({ slug }: { slug: string }) {
  const pinned = await getOrgPosts(slug, "pinned", null, HIGHLIGHT_COUNT);
  const latest =
    pinned && pinned.posts.length > 0
      ? pinned
      : await getOrgPosts(slug, "all", null, HIGHLIGHT_COUNT);
  const posts = latest?.posts ?? [];
  const title = pinned && pinned.posts.length > 0 ? "Bài ghim" : "Bài mới";

  return (
    <section className={`${panel} flex flex-col gap-3 p-4`}>
      <Heading
        icon={FiBookmark}
        title={title}
        href={postPath(slug)}
        linkLabel="Xem bảng tin"
      />
      {posts.length === 0 ? (
        <p className={mutedText}>Chưa có bài viết.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
          {posts.map((post) => (
            <li key={post.id} className="flex flex-col gap-1 py-2">
              <Link
                href={postPath(slug, post.id)}
                className="font-semibold break-words hover:text-teal-700 dark:hover:text-teal-400"
              >
                {post.title}
              </Link>
              <span className={mutedText}>{post.publishedAt}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export async function RecentActivities({ slug }: { slug: string }) {
  const page = await listOrganizationActivities(slug, 0);
  const activities = (page?.items ?? []).slice(0, HIGHLIGHT_COUNT);

  return (
    <section className={`${panel} flex flex-col gap-3 p-4`}>
      <Heading
        icon={FiCalendar}
        title="Hoạt động"
        href={`/organizations/${slug}/activities`}
        linkLabel="Xem tất cả hoạt động"
      />
      {activities.length === 0 ? (
        <p className={mutedText}>Chưa có hoạt động.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
          {activities.map((activity) => (
            <li key={activity.id} className="flex flex-col gap-1 py-2">
              <Link
                href={`/activities/${activity.id}`}
                className="font-semibold break-words hover:text-teal-700 dark:hover:text-teal-400"
              >
                {activity.title}
              </Link>
              <IconStat icon={FiCalendar} label="Thời gian">
                {formatDateTime(activity.start_at)}
              </IconStat>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
