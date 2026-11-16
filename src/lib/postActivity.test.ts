import { describe, expect, test } from "bun:test";
import type { ActivitySummary } from "./activities";
import {
  activityOptions,
  canSignUp,
  isFull,
  linkableActivities,
  pickPostSideTab,
  postSideTabs,
  seatWidthClass,
} from "./postActivity";

function activity(fields: Partial<ActivitySummary>): ActivitySummary {
  return {
    id: "a",
    title: "Trồng cây",
    status: "published",
    start_at: null,
    end_at: null,
    registration_deadline: null,
    location: null,
    city: null,
    is_remote: false,
    hours_awarded: null,
    requires_approval: false,
    capacity: null,
    seats_taken: 0,
    organization_name: "CLB",
    organization_slug: "clb",
    ...fields,
  };
}

const NOW = new Date("2026-11-12T00:00:00Z");

describe("linkableActivities", () => {
  test("keeps published and completed activities only", () => {
    const items = [
      activity({ id: "p", status: "published" }),
      activity({ id: "c", status: "completed" }),
      activity({ id: "d", status: "draft" }),
      activity({ id: "x", status: "cancelled" }),
    ];
    expect(linkableActivities(items).map((item) => item.id)).toEqual([
      "p",
      "c",
    ]);
  });
});

describe("activityOptions", () => {
  test("labels each activity with its start time", () => {
    const options = activityOptions([
      activity({ id: "p", start_at: "2026-12-01T01:00:00Z" }),
    ]);
    expect(options[0].value).toBe("p");
    expect(options[0].label.startsWith("Trồng cây · ")).toBe(true);
  });

  test("keeps the current activity even when it is cancelled", () => {
    const current = activity({ id: "x", status: "cancelled", title: "Cũ" });
    const options = activityOptions([activity({ id: "p" })], current);
    expect(options.map((option) => option.value)).toEqual(["x", "p"]);
  });
});

describe("canSignUp", () => {
  test("is open before the deadline, or before the start without one", () => {
    expect(canSignUp(activity({ start_at: "2026-11-20T00:00:00Z" }), NOW)).toBe(
      true,
    );
    expect(
      canSignUp(
        activity({
          start_at: "2026-11-20T00:00:00Z",
          registration_deadline: "2026-11-10T00:00:00Z",
        }),
        NOW,
      ),
    ).toBe(false);
  });

  test("is closed once started, completed or cancelled", () => {
    expect(canSignUp(activity({ start_at: "2026-11-01T00:00:00Z" }), NOW)).toBe(
      false,
    );
    expect(canSignUp(activity({ status: "completed" }), NOW)).toBe(false);
    expect(canSignUp(activity({ status: "cancelled" }), NOW)).toBe(false);
  });
});

test("isFull only with a limit", () => {
  expect(isFull(activity({ capacity: 2, seats_taken: 2 }))).toBe(true);
  expect(isFull(activity({ capacity: 2, seats_taken: 1 }))).toBe(false);
  expect(isFull(activity({ capacity: null, seats_taken: 99 }))).toBe(false);
});

describe("post side tabs", () => {
  const open = activity({ start_at: "2026-12-01T00:30:00Z" });
  const closed = activity({ start_at: "2026-11-01T00:30:00Z" });

  test("an activity adds its own tab first", () => {
    expect(postSideTabs(open)).toEqual(["activity", "comments", "posts"]);
    expect(postSideTabs(null)).toEqual(["comments", "posts"]);
  });

  test("the address wins when the post has that tab", () => {
    expect(pickPostSideTab("posts", open, NOW)).toBe("posts");
    expect(pickPostSideTab("comments", open, NOW)).toBe("comments");
    expect(pickPostSideTab("activity", null, NOW)).toBe("comments");
  });

  test("an open activity leads, anything else opens the comments", () => {
    expect(pickPostSideTab(null, open, NOW)).toBe("activity");
    expect(pickPostSideTab("junk", closed, NOW)).toBe("comments");
    expect(pickPostSideTab(undefined, null, NOW)).toBe("comments");
  });
});

describe("seatWidthClass", () => {
  test("no limit draws no bar", () => {
    expect(seatWidthClass(3, null)).toBeNull();
    expect(seatWidthClass(3, 0)).toBeNull();
  });

  test("steps in tenths, keeping one seat visible and full only when full", () => {
    expect(seatWidthClass(0, 20)).toBe("w-0");
    expect(seatWidthClass(1, 100)).toBe("w-[10%]");
    expect(seatWidthClass(5, 20)).toBe("w-[30%]");
    expect(seatWidthClass(99, 100)).toBe("w-[90%]");
    expect(seatWidthClass(20, 20)).toBe("w-full");
    expect(seatWidthClass(25, 20)).toBe("w-full");
  });
});
