import { describe, expect, test } from "bun:test";
import {
  formatDateTime,
  fromLocalInput,
  numberOrNull,
  seatsText,
  toLocalInput,
} from "./activities";
import { failureState } from "./forms";
import { FIELD_MESSAGES, validateField } from "./validation";

describe("Vietnam time inputs", () => {
  test("shows a stored time in Vietnam time", () => {
    expect(toLocalInput("2026-01-31T18:30:00Z")).toBe("2026-02-01T01:30");
  });

  test("sends an input value with the Vietnam offset", () => {
    expect(fromLocalInput("2026-02-01T01:30")).toBe(
      "2026-02-01T01:30:00+07:00",
    );
  });

  test("a value survives the round trip", () => {
    const sent = fromLocalInput("2026-06-15T08:00");
    expect(toLocalInput(sent)).toBe("2026-06-15T08:00");
  });

  test("empty values stay empty", () => {
    expect(toLocalInput(null)).toBe("");
    expect(fromLocalInput("")).toBeNull();
    expect(formatDateTime(null)).toBe("");
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
