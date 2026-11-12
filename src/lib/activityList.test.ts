import { describe, expect, test } from "bun:test";
import {
  activityFilter,
  activityFilterHref,
  activityTagHref,
  backendStatus,
  EMPTY_MESSAGES,
  orgActivitiesPath,
} from "./activityList";
import { isProtected } from "./protectedPaths";

describe("activityFilter", () => {
  test("reads the known tabs and falls back to all", () => {
    expect(activityFilter("upcoming")).toBe("upcoming");
    expect(activityFilter("cancelled")).toBe("cancelled");
    expect(activityFilter("draft")).toBe("all");
    expect(activityFilter(undefined)).toBe("all");
    expect(activityFilter(["completed"])).toBe("all");
  });
});

test("tab links keep only the filter", () => {
  expect(orgActivitiesPath("clb xanh")).toBe("/org/clb%20xanh/activities");
  expect(activityFilterHref("clb", "all")).toBe("/org/clb/activities");
  expect(activityFilterHref("clb", "completed")).toBe(
    "/org/clb/activities?filter=completed",
  );
});

test("tab links keep a tag filter and tag chips lead to it", () => {
  expect(activityFilterHref("clb", "upcoming", "moi-truong")).toBe(
    "/org/clb/activities?filter=upcoming&tag=moi-truong",
  );
  expect(activityFilterHref("clb", "all", "moi-truong")).toBe(
    "/org/clb/activities?tag=moi-truong",
  );
  expect(activityTagHref("clb", "Môi trường")).toBe(
    "/org/clb/activities?tag=moi-truong",
  );
});

test("the backend gets a status for every tab but all", () => {
  expect(backendStatus("all")).toBeNull();
  expect(backendStatus("upcoming")).toBe("upcoming");
  expect(backendStatus("draft")).toBe("draft");
});

test("every tab has its own empty message", () => {
  expect(Object.keys(EMPTY_MESSAGES).sort()).toEqual([
    "all",
    "cancelled",
    "completed",
    "upcoming",
  ]);
});

test("drafts, trash and new activity pages need a login", () => {
  expect(isProtected("/org/clb/activities/drafts")).toBe(true);
  expect(isProtected("/org/clb/activities/trash")).toBe(true);
  expect(isProtected("/org/clb/activities/new")).toBe(true);
  expect(isProtected("/org/clb/activities")).toBe(false);
});
