import Link from "next/link";
import { Suspense } from "react";
import { FiGlobe, FiStar } from "react-icons/fi";
import { getAccessToken } from "@/lib/auth";
import { getFeed, getPopularTags } from "@/lib/postApi";
import Composer from "../_components/Composer";
import FeedList from "../_components/FeedList";
import { MoreLink } from "../_components/posts/FeedFilters";
import RightRail from "../_components/RightRail";
import {
  mutedText,
  segmentActive,
  segmentIdle,
  segmentItem,
  segmentList,
} from "../_components/ui";

type Tab = "mine" | "public";

function FeedTabs({ current }: { current: Tab }) {
  const tabs = [
    {
      value: "mine" as const,
      label: "Dành cho bạn",
      icon: FiStar,
      href: "/?tab=mine",
    },
    {
      value: "public" as const,
      label: "Công khai",
      icon: FiGlobe,
      href: "/?tab=public",
    },
  ];
  return (
    <nav aria-label="Bảng tin" className={segmentList}>
      {tabs.map(({ value, label, icon: Icon, href }) => {
        const active = value === current;
        return (
          <Link
            key={value}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`${segmentItem} flex-1 justify-center whitespace-nowrap ${active ? segmentActive : segmentIdle}`}
          >
            <Icon aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

// Members start on their organizations. Visitors, and members who pick it, see
// every organization's public posts.
async function HomeFeed({ searchParams }: PageProps<"/">) {
  const query = await searchParams;
  const signedIn = Boolean(await getAccessToken());
  const tab: Tab = query.tab === "public" || !signedIn ? "public" : "mine";
  const before = typeof query.before === "string" ? query.before : null;
  const page = await getFeed(tab, before);
  const more = page?.nextBefore
    ? `/?tab=${tab}&before=${page.nextBefore}`
    : null;

  return (
    <>
      {signedIn ? <FeedTabs current={tab} /> : null}
      {page === null ? (
        <p className={mutedText}>Không tải được bảng tin. Vui lòng thử lại.</p>
      ) : (
        <FeedList posts={page.posts} />
      )}
      <MoreLink href={more} />
    </>
  );
}

async function HomeRail() {
  return <RightRail popularTags={await getPopularTags()} />;
}

// The feed is the only page that shows the right rail.
export default function HomePage(props: PageProps<"/">) {
  return (
    <div className="flex min-w-0 flex-1 gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <Composer />
        <Suspense fallback={<p className={mutedText}>Đang tải bảng tin…</p>}>
          <HomeFeed {...props} />
        </Suspense>
      </div>

      <aside className="hidden w-[300px] shrink-0 lg:block">
        <Suspense fallback={<RightRail popularTags={[]} />}>
          <HomeRail />
        </Suspense>
      </aside>
    </div>
  );
}
