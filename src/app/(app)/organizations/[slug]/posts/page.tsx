import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FiEdit3, FiFileText, FiTrash2 } from "react-icons/fi";
import { getOrganization } from "@/lib/organizationApi";
import { getOrgPosts } from "@/lib/postApi";
import { feedFilter, postPath } from "@/lib/posts";
import EmptyState from "../../../../_components/EmptyState";
import PostCard from "../../../../_components/PostCard";
import FeedFilters, {
  MoreLink,
} from "../../../../_components/posts/FeedFilters";
import {
  iconButton,
  mutedText,
  primaryButton,
} from "../../../../_components/ui";

export const metadata: Metadata = { title: "Bảng tin tổ chức | AmigoACT" };

function firstValue(value: string | string[] | undefined): string | null {
  return typeof value === "string" && value ? value : null;
}

async function OrganizationFeed({
  params,
  searchParams,
}: PageProps<"/organizations/[slug]/posts">) {
  const { slug } = await params;
  const query = await searchParams;
  const filter = feedFilter(query.filter);
  const before = firstValue(query.before);
  const [organization, page] = await Promise.all([
    getOrganization(slug),
    getOrgPosts(slug, filter, before),
  ]);
  if (!organization) {
    return null;
  }
  const base = postPath(slug);
  const isMember = organization.viewer.status === "active";
  const more = page?.nextBefore
    ? `${base}?${new URLSearchParams({
        ...(filter === "all" ? {} : { filter }),
        before: page.nextBefore,
      })}`
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1">
          <FeedFilters path={base} current={filter} />
        </div>
        {isMember ? (
          <Link
            href={`${base}/drafts`}
            aria-label="Bản nháp của tôi"
            title="Bản nháp của tôi"
            className={iconButton}
          >
            <FiFileText aria-hidden="true" />
          </Link>
        ) : null}
        {organization.viewer.can_manage ? (
          <Link
            href={`${base}/trash`}
            aria-label="Thùng rác bài viết"
            title="Thùng rác bài viết"
            className={iconButton}
          >
            <FiTrash2 aria-hidden="true" />
          </Link>
        ) : null}
        {isMember ? (
          <Link href={`${base}/new`} className={primaryButton}>
            <FiEdit3 aria-hidden="true" />
            Viết bài
          </Link>
        ) : null}
      </div>
      {page === null ? (
        <p className={mutedText}>Không tải được bài viết. Vui lòng thử lại.</p>
      ) : page.posts.length === 0 ? (
        <EmptyState
          title="Chưa có bài viết"
          description={
            isMember
              ? "Hãy viết bài đầu tiên cho tổ chức."
              : "Bài viết công khai của tổ chức sẽ hiện ở đây."
          }
        />
      ) : (
        <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-2">
          {page.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      <MoreLink href={more} />
    </div>
  );
}

export default function OrganizationPostsPage(
  props: PageProps<"/organizations/[slug]/posts">,
) {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <OrganizationFeed {...props} />
    </Suspense>
  );
}
