// The hour statistics behind the /hours dashboard. Backend: GET /hours/mine/stats.

export type Bucket = "week" | "month";

export type PeriodHours = { period: string; awarded: number; adjusted: number };

export type MyHourStats = {
  start: string;
  end: string;
  bucket: Bucket;
  totals: {
    total: number;
    awarded: number;
    adjusted: number;
    activities: number;
    organizations: number;
  };
  series: PeriodHours[];
  by_organization: {
    org_id: string | null;
    name: string | null;
    hours: number;
  }[];
  other_organizations: number;
  by_term: { term: string; hours: number }[];
  attendance: { attended: number; absent: number; rate: number | null };
};

export type OrgHourStats = Omit<
  MyHourStats,
  "totals" | "by_organization" | "other_organizations"
> & {
  totals: {
    total: number;
    awarded: number;
    adjusted: number;
    adjustments: number;
    activities: number;
    volunteers: number;
  };
  by_activity: {
    activity_id: string | null;
    title: string | null;
    hours: number;
  }[];
  other_activities: number;
  top_volunteers: { user_id: string; full_name: string; hours: number }[];
};

export type RangeKey = "3m" | "6m" | "12m" | "all";

export const RANGES: { key: RangeKey; label: string; months: number | null }[] =
  [
    { key: "3m", label: "3 tháng", months: 3 },
    { key: "6m", label: "6 tháng", months: 6 },
    { key: "12m", label: "12 tháng", months: 12 },
    { key: "all", label: "Tất cả", months: null },
  ];

export const BUCKETS: { key: Bucket; label: string }[] = [
  { key: "month", label: "Theo tháng" },
  { key: "week", label: "Theo tuần" },
];

export const DEFAULT_RANGE: RangeKey = "12m";
export const DEFAULT_BUCKET: Bucket = "month";

const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;

type Param = string | string[] | undefined;

// Values come from the address, so anything unknown falls back to the default.
export function readRange(value: Param): RangeKey {
  return RANGES.find((range) => range.key === value)?.key ?? DEFAULT_RANGE;
}

export function readBucket(value: Param): Bucket {
  return BUCKETS.find((bucket) => bucket.key === value)?.key ?? DEFAULT_BUCKET;
}

function isoDate(year: number, monthIndex: number, day: number): string {
  return new Date(Date.UTC(year, monthIndex, day)).toISOString().slice(0, 10);
}

// The first day of the oldest month in the range, in Vietnam time. Null means all time.
export function rangeStart(range: RangeKey, now: Date): string | null {
  const months = RANGES.find((item) => item.key === range)?.months ?? null;
  if (months === null) return null;
  const local = new Date(now.getTime() + VIETNAM_OFFSET_MS);
  return isoDate(local.getUTCFullYear(), local.getUTCMonth() - (months - 1), 1);
}

function statsQuery(range: RangeKey, bucket: Bucket, now: Date): string {
  const query = new URLSearchParams({ bucket });
  const start = rangeStart(range, now);
  if (start) query.set("from", start);
  return query.toString();
}

export function statsPath(range: RangeKey, bucket: Bucket, now: Date): string {
  return `/hours/mine/stats?${statsQuery(range, bucket, now)}`;
}

export function orgStatsPath(
  slug: string,
  range: RangeKey,
  bucket: Bucket,
  now: Date,
): string {
  const path = `/organizations/${encodeURIComponent(slug)}/hours/stats`;
  return `${path}?${statsQuery(range, bucket, now)}`;
}

// The address of the dashboard with one filter changed. Defaults stay out of the URL.
export function dashboardHref(
  range: RangeKey,
  bucket: Bucket,
  base = "/hours",
): string {
  const query = new URLSearchParams();
  if (range !== DEFAULT_RANGE) query.set("range", range);
  if (bucket !== DEFAULT_BUCKET) query.set("bucket", bucket);
  const text = query.toString();
  return text ? `${base}?${text}` : base;
}

function dateParts(period: string): [number, number, number] {
  const [year, month, day] = period.split("-").map(Number);
  return [year, month, day];
}

// Short labels for the axis: "T3/26" for a month, "9/3" for the Monday of a week.
export function periodLabel(period: string, bucket: Bucket): string {
  const [year, month, day] = dateParts(period);
  return bucket === "month"
    ? `T${month}/${String(year).slice(2)}`
    : `${day}/${month}`;
}

// Longer labels for the caption and the table.
export function periodTitle(period: string, bucket: Bucket): string {
  const [year, month, day] = dateParts(period);
  return bucket === "month"
    ? `Tháng ${month}/${year}`
    : `Tuần từ ${day}/${month}/${year}`;
}

export function percentText(rate: number | null): string {
  return rate === null ? "—" : `${Math.round(rate * 100)}%`;
}

// Two decimals at most, without trailing zeros: 2.5, not 2.50.
export function roundHours(hours: number): number {
  return Math.round(hours * 100) / 100;
}

export type BreakdownRow = { key: string; label: string; hours: number };

// The organizations, plus one "Other" row for the rest the backend summed up.
export function organizationRows(stats: MyHourStats): BreakdownRow[] {
  const rows = stats.by_organization.map((item, index) => ({
    key: item.org_id ?? `none-${index}`,
    label: item.name ?? "Tổ chức đã xóa",
    hours: item.hours,
  }));
  if (stats.other_organizations > 0) {
    rows.push({
      key: "other",
      label: "Khác",
      hours: stats.other_organizations,
    });
  }
  return rows;
}

// The activities, plus one "Other" row for the rest the backend summed up.
export function activityRows(stats: OrgHourStats): BreakdownRow[] {
  const rows = stats.by_activity.map((item, index) => ({
    key: item.activity_id ?? `none-${index}`,
    label: item.title ?? "Hoạt động đã xóa",
    hours: item.hours,
  }));
  if (stats.other_activities > 0) {
    rows.push({ key: "other", label: "Khác", hours: stats.other_activities });
  }
  return rows;
}
