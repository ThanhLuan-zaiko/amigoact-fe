import type { Metadata } from "next";
import { Suspense } from "react";
import { FiUsers } from "react-icons/fi";
import { getMyHourStats, getMyHours } from "@/lib/attendanceApi";
import { requireUser } from "@/lib/auth";
import { organizationRows, readBucket, readRange } from "@/lib/hoursStats";
import EmptyState from "../../_components/EmptyState";
import BreakdownSection from "../../_components/hours/BreakdownSection";
import HourEntries from "../../_components/hours/HourEntries";
import HoursSummary from "../../_components/hours/HoursSummary";
import StatsFilters from "../../_components/hours/StatsFilters";
import TrendSection from "../../_components/hours/TrendSection";
import { mutedText } from "../../_components/ui";

export const metadata: Metadata = { title: "Giờ tình nguyện | AmigoACT" };

async function HoursContent({ searchParams }: PageProps<"/hours">) {
  await requireUser("/hours");
  const query = await searchParams;
  const range = readRange(query.range);
  const bucket = readBucket(query.bucket);
  const [stats, hours] = await Promise.all([
    getMyHourStats(range, bucket),
    getMyHours(),
  ]);
  if (!stats || !hours) {
    return (
      <p className={mutedText}>Không tải được dữ liệu. Vui lòng thử lại.</p>
    );
  }
  if (hours.entries.length === 0) {
    return (
      <EmptyState
        title="Chưa có giờ nào"
        description="Giờ được ghi khi hoạt động kết thúc và bạn đã điểm danh."
      />
    );
  }
  // Phones read the summary first. From xl the charts take the wide left column and
  // the summary stays in view on the right.
  return (
    <>
      <StatsFilters range={range} bucket={bucket} base="/hours" />
      <div className="grid w-full grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="xl:col-start-2 xl:row-start-1 xl:self-stretch">
          <HoursSummary stats={stats} />
        </div>
        <div className="flex min-w-0 flex-col gap-4 xl:col-start-1 xl:row-start-1">
          <TrendSection series={stats.series} bucket={stats.bucket} />
          <BreakdownSection
            title="Theo tổ chức"
            icon={FiUsers}
            rows={organizationRows(stats)}
            description="Giờ tình nguyện theo tổ chức"
          />
          <HourEntries entries={hours.entries} />
        </div>
      </div>
    </>
  );
}

export default function HoursPage(props: PageProps<"/hours">) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <h1 className="text-2xl font-extrabold tracking-tight">
        Giờ tình nguyện
      </h1>
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <HoursContent {...props} />
      </Suspense>
    </div>
  );
}
