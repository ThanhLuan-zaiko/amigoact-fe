import { describe, expect, test } from "bun:test";
import {
  formatDateTime,
  formatDateTimeZoned,
  formatTimeRange,
  fromLocalInput,
  numberOrNull,
  seatsText,
  toLocalInput,
} from "./activities";
import { failureState } from "./forms";
import { FIELD_MESSAGES, validateField } from "./validation";

const VIETNAM = "Asia/Ho_Chi_Minh";
const NEW_YORK = "America/New_York";

describe("time inputs in the person's own zone", () => {
  test("shows a stored time on each zone's clock", () => {
    expect(toLocalInput("2026-01-31T18:30:00Z", VIETNAM)).toBe(
      "2026-02-01T01:30",
    );
    expect(toLocalInput("2026-01-31T18:30:00Z", NEW_YORK)).toBe(
      "2026-01-31T13:30",
    );
  });

  test("sends an input value with the zone's offset at that date", () => {
    expect(fromLocalInput("2026-02-01T01:30", VIETNAM)).toBe(
      "2026-02-01T01:30:00+07:00",
    );
    // New York is on standard time in February and on daylight time in June.
    expect(fromLocalInput("2026-02-01T01:30", NEW_YORK)).toBe(
      "2026-02-01T01:30:00-05:00",
    );
    expect(fromLocalInput("2026-06-15T08:00", NEW_YORK)).toBe(
      "2026-06-15T08:00:00-04:00",
    );
  });

  test("the same typed time is a different moment in each zone", () => {
    const vietnam = Date.parse(
      fromLocalInput("2026-06-15T08:00", VIETNAM) ?? "",
    );
    const newYork = Date.parse(
      fromLocalInput("2026-06-15T08:00", NEW_YORK) ?? "",
    );
    expect(newYork - vietnam).toBe(11 * 60 * 60 * 1000);
  });

  test("a value survives the round trip in both zones", () => {
    for (const zone of [VIETNAM, NEW_YORK]) {
      for (const typed of ["2026-06-15T08:00", "2026-12-31T23:45"]) {
        expect(toLocalInput(fromLocalInput(typed, zone), zone)).toBe(typed);
      }
    }
  });

  test("a time skipped by the spring clock change moves forward", () => {
    // 02:30 does not exist in New York on 8 March 2026; 03:30 EDT does.
    const sent = fromLocalInput("2026-03-08T02:30", NEW_YORK);
    expect(sent).toBe("2026-03-08T03:30:00-04:00");
  });

  test("a time repeated by the autumn clock change is the first one", () => {
    expect(fromLocalInput("2026-11-01T01:30", NEW_YORK)).toBe(
      "2026-11-01T01:30:00-04:00",
    );
  });

  test("a value that is not a real date is sent as typed", () => {
    expect(fromLocalInput("2026-02-31T10:00", VIETNAM)).toBe(
      "2026-02-31T10:00",
    );
    expect(fromLocalInput("abc", VIETNAM)).toBe("abc");
  });

  test("empty values stay empty", () => {
    expect(toLocalInput(null, VIETNAM)).toBe("");
    expect(fromLocalInput("", VIETNAM)).toBeNull();
    expect(formatDateTime(null, VIETNAM)).toBe("");
    expect(formatDateTimeZoned(null, VIETNAM)).toBe("");
    expect(formatTimeRange(null, null, VIETNAM)).toBe("");
  });
});

describe("formatting on the viewer's clock", () => {
  const moment = "2026-11-16T07:05:00Z";

  test("writes one moment in each viewer's zone", () => {
    expect(formatDateTime(moment, VIETNAM)).toBe("14:05 16/11/26");
    expect(formatDateTime(moment, NEW_YORK)).toBe("02:05 16/11/26");
  });

  test("names the zone where a time is planned around", () => {
    expect(formatDateTimeZoned(moment, VIETNAM)).toBe("14:05 16/11/26 (GMT+7)");
    expect(formatDateTimeZoned(moment, NEW_YORK)).toBe(
      "02:05 16/11/26 (GMT-5)",
    );
  });

  test("a range names its zone once", () => {
    expect(formatTimeRange(moment, "2026-11-16T10:00:00Z", VIETNAM)).toBe(
      "14:05 16/11/26 – 17:00 16/11/26 (GMT+7)",
    );
  });

  test("a range across a clock change names both offsets", () => {
    expect(
      formatTimeRange("2026-10-31T16:00:00Z", "2026-11-01T16:00:00Z", NEW_YORK),
    ).toBe("12:00 31/10/26 (GMT-4) – 11:00 1/11/26 (GMT-5)");
  });

  test("a range with one end shows that end with its zone", () => {
    expect(formatTimeRange(moment, null, NEW_YORK)).toBe(
      "02:05 16/11/26 (GMT-5)",
    );
  });
});

describe("seatsText", () => {
  test("shows the limit when there is one", () => {
    expect(seatsText(3, 10)).toBe("3/10");
    expect(seatsText(3, null)).toBe("3");
  });
});

describe("numberOrNull", () => {
  test("converts numbers and keeps bad text for the backend to reject", () => {
    expect(numberOrNull("")).toBeNull();
    expect(numberOrNull("2.5")).toBe(2.5);
    expect(numberOrNull("abc")).toBe("abc");
  });
});

describe("activity errors", () => {
  test("translates a registration error code", () => {
    expect(failureState("registration_closed").error).toContain("đóng");
  });

  test("maps a time rule to its field", () => {
    const state = failureState("validation_error", [
      { field: "end_at", type: "end_before_start" },
    ]);
    expect(state.fieldErrors?.end_at).toContain("sau");
  });

  test("uses the capacity fallback for a generic range problem", () => {
    const state = failureState("validation_error", [
      { field: "capacity", type: "greater_than_equal" },
    ]);
    expect(state.fieldErrors?.capacity).toContain("100000");
  });
});

describe("activity field checks", () => {
  const context = { isNewPassword: false };

  test("a title needs three characters with a letter or digit", () => {
    expect(validateField("title", "ab", context)).toBe(
      FIELD_MESSAGES.activityTitle,
    );
    expect(validateField("title", "...", context)).toBe(
      FIELD_MESSAGES.activityTitle,
    );
    expect(validateField("title", "Mùa hè xanh", context)).toBeNull();
    expect(validateField("title", "   ", context)).toBe(
      FIELD_MESSAGES.required,
    );
  });

  test("capacity must be a positive whole number", () => {
    for (const name of ["capacity", "max_participants"]) {
      expect(validateField(name, "0", context)).toBe(FIELD_MESSAGES.capacity);
      expect(validateField(name, "1.5", context)).toBe(FIELD_MESSAGES.capacity);
      expect(validateField(name, "100001", context)).toBe(
        FIELD_MESSAGES.capacity,
      );
      expect(validateField(name, "20", context)).toBeNull();
    }
  });

  test("hours allow two decimal places up to the limit", () => {
    expect(validateField("hours_awarded", "2.5", context)).toBeNull();
    expect(validateField("hours_awarded", "2.555", context)).toBe(
      FIELD_MESSAGES.hours,
    );
    expect(validateField("hours_awarded", "1001", context)).toBe(
      FIELD_MESSAGES.hours,
    );
    expect(validateField("hours_awarded", "", context)).toBeNull();
  });
});
