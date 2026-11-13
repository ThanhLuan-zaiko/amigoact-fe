import Link from "next/link";
import { Suspense } from "react";
import { FiGlobe, FiUsers } from "react-icons/fi";
import { getAccessToken } from "@/lib/auth";
import { getFeed, getPopularTags } from "@/lib/postApi";
import { listQuery, readTag, tagLabel } from "@/lib/tagLinks";
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
async function HomeFeed({ searchParams }: PageProps<"/">) {
  const query = await searchParams;
  const signedIn = Boolean(await getAccessToken());
  if (query.tab === "orgs") {
    const search = typeof query.q === "string" ? query.q.trim() : "";
    return (
      <>
        <FeedTabs current="orgs" tag={null} />
        <OrganizationDirectory search={search} page={query.page} />
      </>
    );
  }
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
        <FeedList posts={page.posts} filtered={tag !== null} />
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
