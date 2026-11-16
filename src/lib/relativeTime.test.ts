import { describe, expect, test } from "bun:test";
import { absoluteTime, compactCount, relativeTime } from "./relativeTime";

const NOW = new Date("2026-11-16T07:00:00Z");

describe("relativeTime", () => {
  test("counts minutes, hours and days from UTC instants", () => {
    expect(relativeTime("2026-11-16T06:59:30Z", NOW)).toBe("Vừa xong");
    expect(relativeTime("2026-11-16T06:55:00Z", NOW)).toBe("5 phút");
    expect(relativeTime("2026-11-16T05:00:00Z", NOW)).toBe("2 giờ");
    expect(relativeTime("2026-11-13T07:00:00Z", NOW)).toBe("3 ngày");
  });

  test("the age does not depend on the zone an offset is written in", () => {
    // 13:55 in Vietnam is 06:55 UTC, five minutes before NOW.
    expect(relativeTime("2026-11-16T13:55:00+07:00", NOW)).toBe("5 phút");
    expect(relativeTime("2026-11-15T22:55:00-08:00", NOW)).toBe("5 phút");
  });

  test("a clock running a little behind still reads as just now", () => {
    expect(relativeTime("2026-11-16T07:00:20Z", NOW)).toBe("Vừa xong");
  });

  test("older dates are written in the viewer's zone", () => {
    // 20:30 UTC on 1 Nov is already 2 Nov in Vietnam, still 1 Nov in New York.
    const iso = "2026-11-01T20:30:00Z";
    expect(relativeTime(iso, NOW, "Asia/Ho_Chi_Minh")).toBe("2/11");
    expect(relativeTime(iso, NOW, "America/New_York")).toBe("1/11");
  });

  test("another year shows the year", () => {
    expect(relativeTime("2025-03-04T05:00:00Z", NOW, "UTC")).toBe("4/3/2025");
  });

  test("text that is not a date gives nothing", () => {
    expect(relativeTime("hôm qua", NOW)).toBe("");
    expect(absoluteTime("hôm qua")).toBe("");
  });
});

describe("absoluteTime", () => {
  test("names the zone of the clock it uses", () => {
    const iso = "2026-11-16T07:05:00Z";
    expect(absoluteTime(iso, "Asia/Ho_Chi_Minh")).toContain("14:05");
    expect(absoluteTime(iso, "Asia/Ho_Chi_Minh")).toContain("GMT+7");
    expect(absoluteTime(iso, "Europe/London")).toContain("07:05");
  });
});

describe("compactCount", () => {
  test("prints counts the way social apps do", () => {
    expect(compactCount(0)).toBe("0");
    expect(compactCount(999)).toBe("999");
    expect(compactCount(1000)).toBe("1K");
    expect(compactCount(1250)).toBe("1,2K");
    expect(compactCount(12_900)).toBe("12K");
    expect(compactCount(1_560_000)).toBe("1,5Tr");
    expect(compactCount(-3)).toBe("0");
  });
});
