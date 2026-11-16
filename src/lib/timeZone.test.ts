import { describe, expect, test } from "bun:test";
import {
  DEFAULT_TIME_ZONE,
  describeZone,
  deviceTimeZone,
  isoOffset,
  isTimeZone,
  safeTimeZone,
  wallClock,
  zonedInstant,
  zoneLabel,
  zoneOffsetMinutes,
} from "./timeZone";

const VIETNAM = "Asia/Ho_Chi_Minh";
const NEW_YORK = "America/New_York";
const WINTER = new Date("2026-01-15T12:00:00Z");
const SUMMER = new Date("2026-07-15T12:00:00Z");

describe("isTimeZone and safeTimeZone", () => {
  test("accepts real IANA zones and their aliases", () => {
    for (const zone of [VIETNAM, NEW_YORK, "Asia/Kolkata", "UTC"]) {
      expect(isTimeZone(zone)).toBe(true);
    }
  });

  test("refuses anything that is not a zone", () => {
    for (const value of [
      "",
      "Mars/Olympus",
      "Asia/Ho_Chi_Minh; path=/",
      "../etc",
      "a".repeat(80),
      42,
      null,
      undefined,
    ]) {
      expect(isTimeZone(value)).toBe(false);
    }
  });

  test("falls back to Vietnam for a missing or bad zone", () => {
    expect(safeTimeZone(undefined)).toBe(DEFAULT_TIME_ZONE);
    expect(safeTimeZone("Mars/Olympus")).toBe(DEFAULT_TIME_ZONE);
    expect(safeTimeZone(NEW_YORK)).toBe(NEW_YORK);
  });

  test("the device zone is always a real zone", () => {
    expect(isTimeZone(deviceTimeZone())).toBe(true);
  });
});

describe("offsets", () => {
  test("Vietnam keeps +7 all year; New York changes with daylight time", () => {
    expect(zoneOffsetMinutes(WINTER, VIETNAM)).toBe(420);
    expect(zoneOffsetMinutes(SUMMER, VIETNAM)).toBe(420);
    expect(zoneOffsetMinutes(WINTER, NEW_YORK)).toBe(-300);
    expect(zoneOffsetMinutes(SUMMER, NEW_YORK)).toBe(-240);
    expect(zoneOffsetMinutes(WINTER, "Asia/Kolkata")).toBe(330);
  });

  test("ISO offsets and zone labels", () => {
    expect(isoOffset(420)).toBe("+07:00");
    expect(isoOffset(-300)).toBe("-05:00");
    expect(isoOffset(330)).toBe("+05:30");
    expect(isoOffset(0)).toBe("+00:00");
    expect(zoneLabel(WINTER, VIETNAM)).toBe("GMT+7");
    expect(zoneLabel(WINTER, NEW_YORK)).toBe("GMT-5");
    expect(zoneLabel(SUMMER, NEW_YORK)).toBe("GMT-4");
    expect(zoneLabel(WINTER, "Asia/Kolkata")).toBe("GMT+5:30");
    expect(zoneLabel("not a date", VIETNAM)).toBe("");
  });

  test("describeZone names the zone and its offset now", () => {
    expect(describeZone(VIETNAM, WINTER)).toBe("Asia/Ho_Chi_Minh (GMT+7)");
    expect(describeZone(NEW_YORK, SUMMER)).toBe("America/New_York (GMT-4)");
  });
});

describe("wall clocks", () => {
  test("one moment shows a different wall clock in each zone", () => {
    const moment = new Date("2026-01-31T18:30:00Z");
    expect(wallClock(moment, VIETNAM)).toEqual({
      year: 2026,
      month: 2,
      day: 1,
      hour: 1,
      minute: 30,
      second: 0,
    });
    expect(wallClock(moment, NEW_YORK).hour).toBe(13);
    expect(wallClock(new Date("2026-01-31T17:00:00Z"), VIETNAM).hour).toBe(0);
  });

  test("a wall clock maps back to its moment in both zones", () => {
    const wall = {
      year: 2026,
      month: 6,
      day: 15,
      hour: 8,
      minute: 0,
      second: 0,
    };
    expect(zonedInstant(wall, VIETNAM).toISOString()).toBe(
      "2026-06-15T01:00:00.000Z",
    );
    expect(zonedInstant(wall, NEW_YORK).toISOString()).toBe(
      "2026-06-15T12:00:00.000Z",
    );
  });

  test("the hour after the autumn change is read on standard time", () => {
    const wall = {
      year: 2026,
      month: 11,
      day: 1,
      hour: 3,
      minute: 0,
      second: 0,
    };
    expect(zonedInstant(wall, NEW_YORK).toISOString()).toBe(
      "2026-11-01T08:00:00.000Z",
    );
  });
});
