import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FiPlus } from "react-icons/fi";
import { listOrganizationActivities } from "@/lib/activityApi";
import { getOrganization } from "@/lib/organizationApi";
import { pageOffset } from "@/lib/organizations";
import ActivityCard from "../../../../_components/activities/ActivityCard";
import EmptyState from "../../../../_components/EmptyState";
import PageLinks from "../../../../_components/organizations/PageLinks";
import { mutedText, primaryButton } from "../../../../_components/ui";

export const metadata: Metadata = { title: "Hoạt động của tổ chức | AmigoACT" };

async function OrganizationActivities({
  params,
  searchParams,
}: PageProps<"/organizations/[slug]/activities">) {
  const { slug } = await params;
  const offset = pageOffset((await searchParams).page);
  const [organization, page] = await Promise.all([
    getOrganization(slug),
    listOrganizationActivities(slug, offset),
  ]);
  if (!organization) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {organization.viewer.can_manage ? (
        <div>
          <Link
            href={`/organizations/${slug}/activities/new`}
            className={primaryButton}
          >
            <FiPlus aria-hidden="true" />
            Tạo hoạt động
          </Link>
        </div>
      ) : null}
      {page === null ? (
        <p className={mutedText}>Không tải được danh sách. Vui lòng thử lại.</p>
      ) : page.items.length === 0 ? (
        <EmptyState
          title="Chưa có hoạt động"
          description="Hoạt động của tổ chức sẽ hiện ở đây."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {page.items.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
      <PageLinks
        path={`/organizations/${slug}/activities`}
        offset={offset}
        total={page?.total ?? 0}
      />
    </div>
  );
}

export default function OrganizationActivitiesPage(
  props: PageProps<"/organizations/[slug]/activities">,
) {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <OrganizationActivities {...props} />
    </Suspense>
  );
}
