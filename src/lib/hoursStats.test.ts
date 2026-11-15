import { describe, expect, test } from "bun:test";
import {
  activityRows,
  dashboardHref,
  type MyHourStats,
  type OrgHourStats,
  organizationRows,
  orgStatsPath,
  percentText,
  periodLabel,
  periodTitle,
  rangeStart,
  readBucket,
  readRange,
  roundHours,
  statsPath,
} from "./hoursStats";
import { isProtected } from "./protectedPaths";

// 20:00 UTC on 31 October is already 1 November in Vietnam.
const LATE_OCTOBER = new Date("2026-10-31T20:00:00Z");

describe("filters from the address", () => {
  test("unknown values fall back to the defaults", () => {
    expect(readRange("5y")).toBe("12m");
    expect(readRange(["3m"])).toBe("12m");
    expect(readRange(undefined)).toBe("12m");
    expect(readBucket("year")).toBe("month");
  });

  test("known values are kept", () => {
    expect(readRange("3m")).toBe("3m");
    expect(readRange("all")).toBe("all");
    expect(readBucket("week")).toBe("week");
  });

  test("defaults stay out of the link", () => {
    expect(dashboardHref("12m", "month")).toBe("/hours");
    expect(dashboardHref("3m", "week")).toBe("/hours?range=3m&bucket=week");
  });
});

describe("rangeStart", () => {
  test("counts months in Vietnam time, including the current one", () => {
    expect(rangeStart("3m", LATE_OCTOBER)).toBe("2026-09-01");
    expect(rangeStart("12m", LATE_OCTOBER)).toBe("2025-12-01");
  });

  test("all time has no start", () => {
    expect(rangeStart("all", LATE_OCTOBER)).toBeNull();
    expect(statsPath("all", "week", LATE_OCTOBER)).toBe(
      "/hours/mine/stats?bucket=week",
    );
  });

  test("builds the backend path", () => {
    expect(statsPath("6m", "month", LATE_OCTOBER)).toBe(
      "/hours/mine/stats?bucket=month&from=2026-06-01",
    );
  });
});

describe("labels", () => {
  test("periods read naturally", () => {
    expect(periodLabel("2026-03-01", "month")).toBe("T3/26");
    expect(periodLabel("2026-03-09", "week")).toBe("9/3");
    expect(periodTitle("2026-03-01", "month")).toBe("Tháng 3/2026");
    expect(periodTitle("2026-03-09", "week")).toBe("Tuần từ 9/3/2026");
  });

  test("rates and hours round for display", () => {
    expect(percentText(null)).toBe("—");
    expect(percentText(0.6667)).toBe("67%");
    expect(roundHours(4.5 - 1.25)).toBe(3.25);
  });
});

describe("organizationRows", () => {
  const base: MyHourStats = {
    start: "2026-01-01",
    end: "2026-11-15",
    bucket: "month",
    totals: {
      total: 0,
      awarded: 0,
      adjusted: 0,
      activities: 0,
      organizations: 0,
    },
    series: [],
    by_organization: [
      { org_id: "a", name: "CLB A", hours: 5 },
      { org_id: null, name: null, hours: 1 },
    ],
    other_organizations: 0,
    by_term: [],
    attendance: { attended: 0, absent: 0, rate: null },
  };

  test("names a deleted organization and skips an empty rest", () => {
    expect(organizationRows(base).map((row) => row.label)).toEqual([
      "CLB A",
      "Tổ chức đã xóa",
    ]);
  });

  test("adds one row for the rest", () => {
    const rows = organizationRows({ ...base, other_organizations: 2.5 });
    expect(rows.at(-1)).toEqual({ key: "other", label: "Khác", hours: 2.5 });
  });
});

describe("organization dashboard", () => {
  test("builds the backend path with the slug", () => {
    expect(orgStatsPath("clb-xanh", "3m", "week", LATE_OCTOBER)).toBe(
      "/organizations/clb-xanh/hours/stats?bucket=week&from=2026-09-01",
    );
  });

  test("filter links stay on the organization page", () => {
    const base = "/organizations/clb-xanh/hours";
    expect(dashboardHref("12m", "month", base)).toBe(base);
    expect(dashboardHref("all", "month", base)).toBe(`${base}?range=all`);
  });

  test("activity rows name deleted activities and add the rest", () => {
    const stats = {
      by_activity: [
        { activity_id: "a", title: "Don rac", hours: 6 },
        { activity_id: null, title: null, hours: 2 },
      ],
      other_activities: 1.5,
    } as OrgHourStats;
    expect(activityRows(stats).map((row) => row.label)).toEqual([
      "Don rac",
      "Hoạt động đã xóa",
      "Khác",
    ]);
  });

  test("the organization hours page needs a login", () => {
    expect(isProtected("/org/clb-xanh/hours")).toBe(true);
    expect(isProtected("/org/clb-xanh/hours/extra")).toBe(false);
  });
});
