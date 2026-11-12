import { describe, expect, test } from "bun:test";
import {
  applyNotificationFrame,
  type BellState,
  describeNotification,
  type NotificationItem,
  parseNotificationFrame,
  timeAgo,
} from "./notifications";

function item(overrides: Partial<NotificationItem> = {}): NotificationItem {
  return {
    id: "01a1d043-4ed7-7546-b020-10a94bc31245",
    type: "membership_requested",
    data: {
      organization_slug: "clb-xanh",
      organization_name: "CLB Xanh",
      applicant_name: "Lan",
      message: "Em muốn tham gia",
    },
    read: false,
    created_at: "2026-11-12T08:00:00Z",
    ...overrides,
  };
}

describe("describeNotification", () => {
  test("a membership request names the applicant, the reason and the review page", () => {
    expect(describeNotification(item())).toEqual({
      text: "Lan xin vào CLB Xanh",
      detail: "Em muốn tham gia",
      href: "/org/clb-xanh/applications",
    });
  });

  test("a request without a reason shows no detail", () => {
    const view = describeNotification(
      item({ data: { organization_slug: "a", message: null } }),
    );
    expect(view.text).toBe("Một người xin vào tổ chức");
    expect(view.detail).toBeNull();
  });

  test("hours use Vietnamese numbers and link to the hours page", () => {
    const view = describeNotification(
      item({
        type: "hours_awarded",
        data: { activity_title: "Dọn rác", hours: 4.5 },
      }),
    );
    expect(view.text).toBe('Bạn được ghi 4,5 giờ cho "Dọn rác"');
    expect(view.href).toBe("/hours");
  });

  test("an unknown code still shows a line", () => {
    expect(describeNotification(item({ type: "later_type" })).text).toBe(
      "Bạn có thông báo mới",
    );
  });
});

describe("parseNotificationFrame", () => {
  test("reads the three notification frames", () => {
    const created = parseNotificationFrame(
      JSON.stringify({ type: "notification.created", notification: item() }),
    );
    expect(created).toEqual({ kind: "created", item: item() });
    expect(
      parseNotificationFrame('{"type":"notification.read","id":"x"}'),
    ).toEqual({ kind: "read", id: "x" });
    expect(parseNotificationFrame('{"type":"notification.read_all"}')).toEqual({
      kind: "read_all",
    });
  });

  test("ignores chat frames and malformed text", () => {
    expect(parseNotificationFrame('{"op":"pong"}')).toBeNull();
    expect(parseNotificationFrame('{"type":"message.created"}')).toBeNull();
    expect(
      parseNotificationFrame(
        '{"type":"notification.created","notification":{}}',
      ),
    ).toBeNull();
    expect(parseNotificationFrame("not json")).toBeNull();
  });
});

describe("applyNotificationFrame", () => {
  const empty: BellState = { items: null, unread: 2 };

  test("a new notification raises the count before the panel was opened", () => {
    expect(
      applyNotificationFrame(empty, { kind: "created", item: item() }),
    ).toEqual({ items: null, unread: 3 });
  });

  test("a new notification goes first in an open list, once", () => {
    const older = item({ id: "older", read: true });
    const state = applyNotificationFrame(
      { items: [older], unread: 0 },
      { kind: "created", item: item() },
    );
    expect(state.items?.map((entry) => entry.id)).toEqual([item().id, "older"]);
    expect(state.unread).toBe(1);
    expect(
      applyNotificationFrame(state, { kind: "created", item: item() }),
    ).toBe(state);
  });

  test("reading lowers the count once and never below zero", () => {
    const state = { items: [item()], unread: 1 };
    const read = applyNotificationFrame(state, { kind: "read", id: item().id });
    expect(read).toEqual({ items: [item({ read: true })], unread: 0 });
    expect(applyNotificationFrame(read, { kind: "read", id: item().id })).toBe(
      read,
    );
    expect(
      applyNotificationFrame(
        { items: null, unread: 0 },
        { kind: "read", id: "x" },
      ).unread,
    ).toBe(0);
  });

  test("read all clears the count and every item", () => {
    expect(
      applyNotificationFrame(
        { items: [item()], unread: 5 },
        { kind: "read_all" },
      ),
    ).toEqual({ items: [item({ read: true })], unread: 0 });
  });
});

describe("timeAgo", () => {
  const now = Date.parse("2026-11-12T10:00:00Z");

  test("counts minutes, hours and days, then shows the date", () => {
    expect(timeAgo("2026-11-12T09:59:30Z", now)).toBe("Vừa xong");
    expect(timeAgo("2026-11-12T09:55:00Z", now)).toBe("5 phút trước");
    expect(timeAgo("2026-11-12T07:00:00Z", now)).toBe("3 giờ trước");
    expect(timeAgo("2026-11-10T10:00:00Z", now)).toBe("2 ngày trước");
    expect(timeAgo("2026-10-01T10:00:00Z", now)).toBe("01/10/2026");
    expect(timeAgo("bad", now)).toBe("");
  });
});

describe("withdrawn requests", () => {
  test("a deleted unread request leaves the list and lowers the count", () => {
    const state = applyNotificationFrame(
      { items: [item()], unread: 1 },
      { kind: "deleted", item: item() },
    );
    expect(state).toEqual({ items: [], unread: 0 });
  });

  test("a deleted request the panel never loaded uses the backend read flag", () => {
    expect(
      applyNotificationFrame(
        { items: null, unread: 3 },
        { kind: "deleted", item: item() },
      ),
    ).toEqual({ items: null, unread: 2 });
    expect(
      applyNotificationFrame(
        { items: null, unread: 3 },
        { kind: "deleted", item: item({ read: true }) },
      ).unread,
    ).toBe(3);
  });

  test("a deleted read item keeps the count", () => {
    const read = item({ read: true });
    expect(
      applyNotificationFrame(
        { items: [read], unread: 4 },
        { kind: "deleted", item: item() },
      ),
    ).toEqual({ items: [], unread: 4 });
  });

  test("parses the deleted frame", () => {
    expect(
      parseNotificationFrame(
        JSON.stringify({ type: "notification.deleted", notification: item() }),
      ),
    ).toEqual({ kind: "deleted", item: item() });
  });
});

describe("members leaving", () => {
  test("managers read who left and open the member list", () => {
    const view = describeNotification(
      item({
        type: "member_left",
        data: {
          organization_slug: "clb-xanh",
          organization_name: "CLB Xanh",
          member_name: "Minh",
        },
      }),
    );
    expect(view).toEqual({
      text: "Minh đã rời CLB Xanh",
      detail: null,
      href: "/org/clb-xanh/members",
    });
  });

  test("a removed member reads where they were removed from", () => {
    const view = describeNotification(
      item({
        type: "membership_removed",
        data: { organization_slug: "clb-xanh", organization_name: "CLB Xanh" },
      }),
    );
    expect(view.text).toBe("Bạn đã bị xóa khỏi CLB Xanh");
    expect(view.href).toBe("/org/clb-xanh");
  });
});
