import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { getOrganization } from "@/lib/organizationApi";
import { getPostTrash } from "@/lib/postApi";
import { postPath } from "@/lib/posts";
import { hasPermission } from "@/lib/roles";
import EmptyState from "../../../../../_components/EmptyState";
import { MoreLink } from "../../../../../_components/posts/FeedFilters";
import TrashList from "../../../../../_components/posts/TrashList";
import { mutedText } from "../../../../../_components/ui";

export const metadata: Metadata = { title: "Thùng rác bài viết | AmigoACT" };

async function TrashContent({
  params,
  searchParams,
}: PageProps<"/org/[slug]/posts/trash">) {
  const { slug } = await params;
  await requireUser(`/org/${slug}/posts/trash`);
  const organization = await getOrganization(slug);
  if (!organization) {
    return null;
  }
  if (!hasPermission(organization.viewer, "posts.moderate")) {
    return (
      <p className={mutedText}>Chỉ ban quản trị mới xem được thùng rác.</p>
    );
  }
  const before = (await searchParams).before;
  const page = await getPostTrash(
    slug,
    typeof before === "string" ? before : null,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold tracking-tight">
          Thùng rác bài viết
        </h2>
        <p className={mutedText}>
          Bài đã xóa được giữ 30 ngày. Ban quản trị khôi phục được, chỉ chủ sở
          hữu xóa vĩnh viễn được.
        </p>
      </div>
      {page === null ? (
        <p className={mutedText}>Không tải được thùng rác. Vui lòng thử lại.</p>
      ) : page.items.length === 0 ? (
        <EmptyState
          title="Thùng rác trống"
          description="Bài viết bị xóa sẽ nằm ở đây trong 30 ngày."
        />
      ) : (
        <TrashList slug={slug} items={page.items} />
      )}
      <MoreLink
        href={
          page?.next_before
            ? `${postPath(slug)}/trash?before=${page.next_before}`
            : null
        }
      />
    </div>
  );
}

export default function PostTrashPage(
  props: PageProps<"/org/[slug]/posts/trash">,
) {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <TrashContent {...props} />
    </Suspense>
  );
}
