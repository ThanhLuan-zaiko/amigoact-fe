import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FiFileText, FiPlus, FiTrash2 } from "react-icons/fi";
import { listOrganizationActivities } from "@/lib/activityApi";
import {
  activityFilter,
  activityFilterHref,
  EMPTY_MESSAGES,
  orgActivitiesPath,
} from "@/lib/activityList";
import { getOrganization } from "@/lib/organizationApi";
import { pageOffset } from "@/lib/organizations";
import { hasModule, hasPermission } from "@/lib/roles";
import { readTag, tagLabel } from "@/lib/tagLinks";
import ActivityCard from "../../../../_components/activities/ActivityCard";
import ActivityFilters from "../../../../_components/activities/ActivityFilters";
import EmptyState from "../../../../_components/EmptyState";
import PageLinks from "../../../../_components/organizations/PageLinks";
import TagFilterBar from "../../../../_components/posts/TagFilterBar";
import {
  iconButton,
  mutedText,
  primaryButton,
} from "../../../../_components/ui";

export const metadata: Metadata = { title: "Hoạt động của tổ chức | AmigoACT" };

async function OrganizationActivities({
  params,
  searchParams,
}: PageProps<"/org/[slug]/activities">) {
  const { slug } = await params;
  const query = await searchParams;
  const filter = activityFilter(query.filter);
  const offset = pageOffset(query.page);
  const tag = readTag(query.tag);
  const [organization, page] = await Promise.all([
    getOrganization(slug),
    listOrganizationActivities(slug, offset, filter, tag),
  ]);
  if (!organization) {
    return null;
  }
  const base = orgActivitiesPath(slug);
  const { viewer } = organization;
  const canManage = hasModule(viewer, "activities");
  const empty = tag
    ? {
        title: "Chưa có hoạt động với thẻ này",
        description: "Bỏ lọc thẻ để xem mọi hoạt động của tổ chức.",
      }
    : EMPTY_MESSAGES[filter];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1">
          <ActivityFilters slug={slug} current={filter} tag={tag} />
        </div>
        {canManage ? (
          <>
            <Link
              href={`${base}/drafts`}
              aria-label="Hoạt động nháp"
              title="Hoạt động nháp"
              className={iconButton}
            >
              <FiFileText aria-hidden="true" />
            </Link>
            {hasPermission(viewer, "activities.delete") ? (
              <Link
                href={`${base}/trash`}
                aria-label="Thùng rác hoạt động"
                title="Thùng rác hoạt động"
                className={iconButton}
              >
                <FiTrash2 aria-hidden="true" />
              </Link>
            ) : null}
            {hasPermission(viewer, "activities.create") ? (
              <Link href={`${base}/new`} className={primaryButton}>
                <FiPlus aria-hidden="true" />
                Tạo hoạt động
              </Link>
            ) : null}
          </>
        ) : null}
      </div>
      {tag ? (
        <TagFilterBar
          label={tagLabel(
            tag,
            page?.items.map((item) => ({ tags: item.tags ?? [] })) ?? [],
          )}
          clearHref={activityFilterHref(slug, filter)}
        />
      ) : null}
      {page === null ? (
        <p className={mutedText}>Không tải được danh sách. Vui lòng thử lại.</p>
      ) : page.items.length === 0 ? (
        <EmptyState title={empty.title} description={empty.description} />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {page.items.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
      <PageLinks
        path={activityFilterHref(slug, filter, tag)}
        offset={offset}
        total={page?.total ?? 0}
      />
    </div>
  );
}

export default function OrganizationActivitiesPage(
  props: PageProps<"/org/[slug]/activities">,
) {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <OrganizationActivities {...props} />
    </Suspense>
  );
}
