import { describe, expect, test } from "bun:test";
import { checkInUrl, hoursText } from "./attendance";
import { failureState } from "./forms";
import { FIELD_MESSAGES, validateField } from "./validation";

describe("hoursText", () => {
  test("shows hours plainly", () => {
    expect(hoursText(2.5)).toBe("2.5h");
  });

  test("marks changes with a sign", () => {
    expect(hoursText(2.5, { signed: true })).toBe("+2.5h");
    expect(hoursText(-1, { signed: true })).toBe("-1h");
  });
});

describe("checkInUrl", () => {
  test("uses the request origin by default", () => {
    expect(checkInUrl(undefined, "http://localhost:3000", "abc")).toBe(
      "http://localhost:3000/checkin?token=abc",
    );
  });

  test("prefers the configured origin, without a trailing slash", () => {
    expect(checkInUrl("https://amigo.vn/", "http://localhost", "abc")).toBe(
      "https://amigo.vn/checkin?token=abc",
    );
  });

  test("an empty setting falls back to the request", () => {
    expect(checkInUrl("", "http://a.vn", "abc")).toBe(
      "http://a.vn/checkin?token=abc",
    );
  });

  test("encodes the token", () => {
    expect(checkInUrl(undefined, "http://a.vn", "a b")).toContain(
      "token=a%20b",
    );
  });
});

describe("attendance errors", () => {
  test("translates check-in codes", () => {
    expect(failureState("checkin_code_invalid").error).toContain("Mã");
    expect(failureState("not_registered_for_session").error).toContain(
      "đăng ký",
    );
    expect(failureState("attendance_pending_review").error).toContain(
      "xác nhận",
    );
  });

  test("maps a zero change to its field", () => {
    const state = failureState("validation_error", [
      { field: "delta_hours", type: "delta_zero" },
    ]);
    expect(state.fieldErrors?.delta_hours).toBeDefined();
  });

  test("uses the reason fallback for a short reason", () => {
    const state = failureState("validation_error", [
      { field: "reason", type: "string_too_short" },
    ]);
    expect(state.fieldErrors?.reason).toContain("5");
  });
});

describe("attendance field checks", () => {
  const context = { isNewPassword: false };

  test("a code has six letters or digits in any case", () => {
    expect(validateField("code", "abc234", context)).toBeNull();
    expect(validateField("code", " ABC234 ", context)).toBeNull();
    expect(validateField("code", "ABC", context)).toBe(
      FIELD_MESSAGES.checkInCode,
    );
    expect(validateField("code", "AB-234", context)).toBe(
      FIELD_MESSAGES.checkInCode,
    );
  });

  test("a change in hours can be negative but not zero", () => {
    expect(validateField("delta_hours", "-1.5", context)).toBeNull();
    expect(validateField("delta_hours", "2", context)).toBeNull();
    expect(validateField("delta_hours", "0", context)).toBe(
      FIELD_MESSAGES.deltaHours,
    );
    expect(validateField("delta_hours", "1.555", context)).toBe(
      FIELD_MESSAGES.deltaHours,
    );
  });

  test("the multiplier stays in its range", () => {
    expect(validateField("multiplier", "1.5", context)).toBeNull();
    expect(validateField("multiplier", "0.05", context)).toBe(
      FIELD_MESSAGES.multiplier,
    );
    expect(validateField("multiplier", "11", context)).toBe(
      FIELD_MESSAGES.multiplier,
    );
  });
});
