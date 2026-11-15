import type { Metadata } from "next";
import { Suspense } from "react";
import { FiFlag } from "react-icons/fi";
import { getOrgHourStats } from "@/lib/attendanceApi";
import { requireUser } from "@/lib/auth";
import { activityRows, readBucket, readRange } from "@/lib/hoursStats";
import { getOrganization } from "@/lib/organizationApi";
import { orgBase } from "@/lib/orgRoutes";
import { hasPermission } from "@/lib/roles";
import BreakdownSection from "../../../../_components/hours/BreakdownSection";
import OrgHoursSummary from "../../../../_components/hours/OrgHoursSummary";
import StatsFilters from "../../../../_components/hours/StatsFilters";
import TrendSection from "../../../../_components/hours/TrendSection";
import { mutedText } from "../../../../_components/ui";

export const metadata: Metadata = { title: "Giờ tình nguyện | AmigoACT" };

type Props = PageProps<"/org/[slug]/hours">;

// The organization's hours for people with attendance.hours. Phones read the
// summary first; from xl the charts take the wide column and the summary stays in view.
async function OrgHoursContent({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  await requireUser(`/org/${slug}/hours`);
  const organization = await getOrganization(slug);
  if (!organization) {
    return null;
  }
  const { viewer } = organization;
  if (!hasPermission(viewer, "attendance.hours")) {
    return (
      <p className={mutedText}>Bạn không có quyền xem giờ của tổ chức này.</p>
    );
  }
  const range = readRange(query.range);
  const bucket = readBucket(query.bucket);
  const stats = await getOrgHourStats(slug, range, bucket);
  if (!stats) {
    return (
      <p className={mutedText}>Không tải được dữ liệu. Vui lòng thử lại.</p>
    );
  }
  const base = `${orgBase(organization.slug, viewer.role === "owner")}/hours`;
  return (
    <>
      <StatsFilters range={range} bucket={bucket} base={base} />
      <div className="grid w-full grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="xl:col-start-2 xl:row-start-1 xl:self-stretch">
          <OrgHoursSummary stats={stats} />
        </div>
        <div className="flex min-w-0 flex-col gap-4 xl:col-start-1 xl:row-start-1">
          <TrendSection series={stats.series} bucket={stats.bucket} />
          <BreakdownSection
            title="Theo hoạt động"
            icon={FiFlag}
            rows={activityRows(stats)}
            description="Giờ tình nguyện theo hoạt động"
          />
        </div>
      </div>
    </>
  );
}

export default function OrgHoursPage(props: Props) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <OrgHoursContent {...props} />
      </Suspense>
    </div>
  );
}
