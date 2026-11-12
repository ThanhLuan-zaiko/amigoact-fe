import type { Metadata } from "next";
import { Suspense } from "react";
import { getActivityTrash } from "@/lib/activityApi";
import { orgActivitiesPath } from "@/lib/activityList";
import { requireUser } from "@/lib/auth";
import { getOrganization } from "@/lib/organizationApi";
import ActivityTrashList from "../../../../../_components/activities/ActivityTrashList";
import EmptyState from "../../../../../_components/EmptyState";
import { MoreLink } from "../../../../../_components/posts/FeedFilters";
import { mutedText } from "../../../../../_components/ui";

export const metadata: Metadata = { title: "Thùng rác hoạt động | AmigoACT" };

async function TrashContent({
  params,
  searchParams,
}: PageProps<"/organizations/[slug]/activities/trash">) {
  const { slug } = await params;
  const base = orgActivitiesPath(slug);
  await requireUser(`${base}/trash`);
  const organization = await getOrganization(slug);
  if (!organization) {
    return null;
  }
  if (!organization.viewer.can_manage) {
    return (
      <p className={mutedText}>Chỉ ban quản trị mới xem được thùng rác.</p>
    );
  }
  const before = (await searchParams).before;
  const page = await getActivityTrash(
    slug,
    typeof before === "string" ? before : null,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold tracking-tight">
          Thùng rác hoạt động
        </h2>
        <p className={mutedText}>
          Hoạt động nháp đã xóa được giữ 30 ngày. Ban quản trị khôi phục được,
          chỉ chủ sở hữu xóa vĩnh viễn được.
        </p>
      </div>
      {page === null ? (
        <p className={mutedText}>Không tải được thùng rác. Vui lòng thử lại.</p>
      ) : page.items.length === 0 ? (
        <EmptyState
          title="Thùng rác trống"
          description="Hoạt động nháp bị xóa sẽ nằm ở đây trong 30 ngày."
        />
      ) : (
        <ActivityTrashList slug={slug} items={page.items} />
      )}
      <MoreLink
        href={
          page?.next_before ? `${base}/trash?before=${page.next_before}` : null
        }
      />
    </div>
  );
}

export default function ActivityTrashPage(
  props: PageProps<"/organizations/[slug]/activities/trash">,
) {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <TrashContent {...props} />
    </Suspense>
  );
}
