import { describe, expect, test } from "bun:test";
import { describeNotification, type NotificationItem } from "./notifications";
import {
  isNotificationType,
  mutedTypesFrom,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPES,
} from "./notificationTypes";

// The codes in amigoact-be/src/notifications/events.py. Locks the list the form shows.
const BACKEND_TYPES = [
  "registration_approved",
  "registration_rejected",
  "registration_promoted",
  "activity_cancelled",
  "membership_requested",
  "membership_approved",
  "membership_rejected",
  "member_left",
  "membership_removed",
  "hours_awarded",
  "appeal_approved",
  "appeal_rejected",
  "certificate_issued",
  "certificate_revoked",
];

const DEFAULT_TEXT = "Bạn có thông báo mới";

function item(type: string): NotificationItem {
  return {
    id: "1",
    type,
    data: {},
    read: false,
    created_at: "2026-11-13T00:00:00Z",
  };
}

describe("notification types", () => {
  test("the form lists exactly the codes the backend sends", () => {
    expect<string[]>([...NOTIFICATION_TYPES].sort()).toEqual(
      [...BACKEND_TYPES].sort(),
    );
  });

  test("every code has its own text in the bell and the list", () => {
    for (const type of BACKEND_TYPES) {
      expect(describeNotification(item(type)).text).not.toBe(DEFAULT_TEXT);
    }
  });

  test("every code has a Vietnamese label", () => {
    for (const type of BACKEND_TYPES) {
      expect(
        NOTIFICATION_TYPE_LABELS[type as keyof typeof NOTIFICATION_TYPE_LABELS],
      ).toBeTruthy();
    }
  });

  test("a type not received is muted, and the rest are kept", () => {
    expect(mutedTypesFrom(BACKEND_TYPES)).toEqual([]);
    expect(mutedTypesFrom([])).toEqual(NOTIFICATION_TYPES);
    expect(mutedTypesFrom(["hours_awarded"])).not.toContain("hours_awarded");
    expect(mutedTypesFrom(["hours_awarded"]).length).toBe(
      NOTIFICATION_TYPES.length - 1,
    );
  });

  test("only known codes pass the type check", () => {
    expect(isNotificationType("hours_awarded")).toBe(true);
    expect(isNotificationType("unknown_code")).toBe(false);
    expect(isNotificationType("constructor")).toBe(false);
  });
});
