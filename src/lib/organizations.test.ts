import { describe, expect, test } from "bun:test";
import { failureState } from "./forms";
import { formatDate, initials, parseOffset } from "./organizations";
import {
  FIELD_MESSAGES,
  isValidOrganizationName,
  isValidWebsite,
  validateField,
} from "./validation";

describe("initials", () => {
  test("takes the first letters of the first two words", () => {
    expect(initials("Đoàn trường Bách khoa")).toBe("ĐT");
  });

  test("handles one word and extra spaces", () => {
    expect(initials("  amigo  ")).toBe("A");
  });

  test("returns an empty string for a blank name", () => {
    expect(initials("   ")).toBe("");
  });
});

describe("formatDate", () => {
  test("uses the Vietnam time zone", () => {
    expect(formatDate("2026-01-31T18:00:00Z")).toContain("1/2");
  });

  test("returns an empty string without a date", () => {
    expect(formatDate(null)).toBe("");
  });
});

describe("parseOffset", () => {
  test("accepts a positive whole number", () => {
    expect(parseOffset("20")).toBe(20);
  });

  test("falls back to the start for anything else", () => {
    for (const value of [undefined, "", "-5", "1.5", "abc", ["20"]]) {
      expect(parseOffset(value)).toBe(0);
    }
  });
});

describe("organization errors", () => {
  test("translates a membership error code", () => {
    expect(failureState("application_cooldown").error).toContain("gửi lại");
  });

  test("maps website problems to the field", () => {
    const state = failureState("validation_error", [
      { field: "website", type: "website_invalid" },
    ]);
    expect(state.fieldErrors?.website).toContain("http");
  });

  test("uses the name fallback for a generic length problem", () => {
    const state = failureState("validation_error", [
      { field: "name", type: "string_too_short" },
    ]);
    expect(state.fieldErrors?.name).toContain("2 đến 120");
  });
});

describe("organization field checks", () => {
  test.each([
    ["CLB", true],
    ["  Đoàn trường  ", true],
    ["A", false],
    ["!!!", false],
    ["x".repeat(121), false],
  ])("name %p is %p", (value, expected) => {
    expect(isValidOrganizationName(value)).toBe(expected);
  });

  test.each([
    ["https://example.org", true],
    ["http://sub.example.vn/path", true],
    ["example.org", false],
    ["javascript:alert(1)", false],
    ["ftp://example.org", false],
    ["https://localhost", false],
    ["https://user:secret@example.org", false],
  ])("website %p is %p", (value, expected) => {
    expect(isValidWebsite(value)).toBe(expected);
  });

  const context = { isNewPassword: false };

  test("a blank organization name is required", () => {
    expect(validateField("name", "   ", context)).toBe(FIELD_MESSAGES.required);
  });

  test("an empty optional website passes", () => {
    expect(validateField("website", "", context)).toBeNull();
  });

  test("a bad website gets its own message", () => {
    expect(validateField("website", "abc", context)).toBe(
      FIELD_MESSAGES.website,
    );
  });
});
