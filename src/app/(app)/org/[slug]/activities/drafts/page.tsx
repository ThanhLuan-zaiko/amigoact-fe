import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FiPlus } from "react-icons/fi";
import { listOrganizationActivities } from "@/lib/activityApi";
import { orgActivitiesPath } from "@/lib/activityList";
import { requireUser } from "@/lib/auth";
import { getOrganization } from "@/lib/organizationApi";
import { pageOffset } from "@/lib/organizations";
import { hasModule } from "@/lib/roles";
import ActivityCard from "../../../../../_components/activities/ActivityCard";
import EmptyState from "../../../../../_components/EmptyState";
import PageLinks from "../../../../../_components/organizations/PageLinks";
import { mutedText, primaryButton } from "../../../../../_components/ui";

export const metadata: Metadata = { title: "Hoạt động nháp | AmigoACT" };

async function DraftsContent({
  params,
  searchParams,
}: PageProps<"/org/[slug]/activities/drafts">) {
  const { slug } = await params;
  const base = orgActivitiesPath(slug);
  await requireUser(`${base}/drafts`);
  const organization = await getOrganization(slug);
  if (!organization) {
    return null;
  }
  if (!hasModule(organization.viewer, "activities")) {
    return (
      <p className={mutedText}>Chỉ ban quản trị mới xem được hoạt động nháp.</p>
    );
  }
  const offset = pageOffset((await searchParams).page);
  const page = await listOrganizationActivities(slug, offset, "draft");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <h2 className="text-xl font-extrabold tracking-tight">
            Hoạt động nháp
          </h2>
          <p className={mutedText}>
            Chỉ ban quản trị nhìn thấy. Đăng hoạt động để mọi người đăng ký.
          </p>
        </div>
        <Link href={`${base}/new`} className={primaryButton}>
          <FiPlus aria-hidden="true" />
          Tạo hoạt động
        </Link>
      </div>
      {page === null ? (
        <p className={mutedText}>Không tải được bản nháp. Vui lòng thử lại.</p>
      ) : page.items.length === 0 ? (
        <EmptyState
          title="Chưa có hoạt động nháp"
          description="Hoạt động mới tạo nằm ở đây cho tới khi được đăng."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {page.items.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
      <PageLinks
        path={`${base}/drafts`}
        offset={offset}
        total={page?.total ?? 0}
      />
    </div>
  );
}

export default function ActivityDraftsPage(
  props: PageProps<"/org/[slug]/activities/drafts">,
) {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <DraftsContent {...props} />
    </Suspense>
  );
}
