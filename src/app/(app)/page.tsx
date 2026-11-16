import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { FiGlobe, FiUsers } from "react-icons/fi";
import { getAccessToken } from "@/lib/auth";
import { getFeed, getPopularTags } from "@/lib/postApi";
import { listQuery, readTag, tagLabel } from "@/lib/tagLinks";
import { viewerTimeZone } from "@/lib/viewerTimeZone";
import ActivityDirectory from "../_components/activities/ActivityDirectory";
import Composer from "../_components/Composer";
import FeedList from "../_components/FeedList";
import OrganizationDirectory from "../_components/organizations/OrganizationDirectory";
import { MoreLink } from "../_components/posts/FeedFilters";
import ScopeToggle from "../_components/posts/ScopeToggle";
import TagFilterBar from "../_components/posts/TagFilterBar";
import RightRail from "../_components/RightRail";
import {
  mutedText,
  segmentActive,
  segmentIdle,
  segmentItem,
  segmentList,
} from "../_components/ui";

type Tab = "all" | "orgs";

function text(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

// Switching tabs keeps the tag filter. The organization directory has no tags.
function FeedTabs({ current, tag }: { current: Tab; tag: string | null }) {
  const tabs = [
    {
      value: "all" as const,
      label: "Tất cả",
      icon: FiGlobe,
      href: `/${listQuery({ tag })}`,
    },
    {
      value: "orgs" as const,
      label: "Tổ chức",
      icon: FiUsers,
      href: `/${listQuery({ tab: "orgs" })}`,
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

// The home feed shows public posts of every organization, plus member posts of the
// organizations the viewer belongs to. "Tổ chức của tôi" narrows it to those organizations.
// The "Tất cả" tab shows posts only; an activity appears inside the post that is
// about it (PostActivityRow). ?tab=activities (the header search, old /explore
// links) lists activities instead of the posts, still under "Tất cả". The
// "Tổ chức" tab is the directory.
async function HomeFeed({ searchParams }: PageProps<"/">) {
  const query = await searchParams;
  if (query.tab === "activities") {
    // Old /explore links may carry ?city= alone. The one search box matches the
    // city too, so that value becomes the search.
    return (
      <>
        <FeedTabs current="all" tag={null} />
        <ActivityDirectory
          search={text(query.q) || text(query.city)}
          page={query.page}
        />
      </>
    );
  }
  if (query.tab === "orgs") {
    return (
      <>
        <Composer />
        <FeedTabs current="orgs" tag={null} />
        <OrganizationDirectory search={text(query.q)} page={query.page} />
      </>
    );
  }
  // Posts show whether their activity still takes sign-ups, which depends on
  // the current time, so this list renders per request (see canSignUp).
  await connection();
  const signedIn = Boolean(await getAccessToken());
  // "tab=mine" is the address of the former tab, so old links keep working.
  const mine = signedIn && (query.scope === "mine" || query.tab === "mine");
  const before = typeof query.before === "string" ? query.before : null;
  const tag = readTag(query.tag);
  const page = await getFeed(mine ? "mine" : "all", before, tag);
  const more = page?.nextBefore
    ? `/${listQuery({ scope: mine ? "mine" : null, tag, before: page.nextBefore })}`
    : null;

  return (
    <>
      <Composer />
      <FeedTabs current="all" tag={tag} />
      {signedIn ? <ScopeToggle mine={mine} tag={tag} /> : null}
      {tag ? (
        <TagFilterBar
          label={tagLabel(tag, page?.posts ?? [])}
          clearHref={`/${listQuery({ scope: mine ? "mine" : null })}`}
        />
      ) : null}
      {page === null ? (
        <p className={mutedText}>Không tải được bảng tin. Vui lòng thử lại.</p>
      ) : (
        <FeedList
          posts={page.posts}
          filtered={tag !== null}
          timeZone={await viewerTimeZone()}
        />
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
        <Suspense fallback={<p className={mutedText}>Đang tải bảng tin…</p>}>
          <HomeFeed {...props} />
        </Suspense>
      </div>

      <aside className="sticky top-20 hidden max-h-[calc(100dvh-6rem)] w-[300px] shrink-0 self-start overflow-y-auto lg:block">
        <Suspense fallback={<RightRail popularTags={[]} />}>
          <HomeRail />
        </Suspense>
      </aside>
    </div>
  );
}
