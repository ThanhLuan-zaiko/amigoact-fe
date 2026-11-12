import { describe, expect, test } from "bun:test";
import { numberOrNull } from "./activities";
import { failureState } from "./forms";
import { isProtected } from "./protectedPaths";
import {
  FIELD_MESSAGES,
  hasLetter,
  isPlainDecimal,
  isPlainInteger,
  validateField,
} from "./validation";

const noPassword = { isNewPassword: false };

describe("isPlainInteger", () => {
  test("accepts digits only", () => {
    expect(isPlainInteger("0")).toBe(true);
    expect(isPlainInteger("120")).toBe(true);
  });

  test.each([
    "",
    "1e3",
    " 5",
    "5 ",
    "-1",
    "1.0",
    "+3",
    "5 chỗ",
    "0x10",
    "١٢",
  ])("refuses %p", (value) => {
    expect(isPlainInteger(value)).toBe(false);
  });
});

describe("isPlainDecimal", () => {
  test.each(["2", "2.5", "-1", "0.25", "1000"])("accepts %p", (value) => {
    expect(isPlainDecimal(value)).toBe(true);
  });

  test.each([
    "",
    ".5",
    "1.",
    "1e3",
    "NaN",
    "Infinity",
    "1,5",
    " 2",
    "2h",
  ])("refuses %p", (value) => {
    expect(isPlainDecimal(value)).toBe(false);
  });
});

describe("hasLetter", () => {
  test("needs a real letter, digits and marks are not enough", () => {
    expect(hasLetter("Ngày hội 2024")).toBe(true);
    expect(hasLetter("đi")).toBe(true);
    expect(hasLetter("2024")).toBe(false);
    expect(hasLetter("!!! ---")).toBe(false);
  });
});

describe("validateField numbers", () => {
  test("capacity refuses an exponent and spaces inside", () => {
    expect(validateField("max_participants", "1e3", noPassword)).toBe(
      FIELD_MESSAGES.capacity,
    );
    expect(validateField("capacity", "1 0", noPassword)).toBe(
      FIELD_MESSAGES.capacity,
    );
    expect(validateField("capacity", "10", noPassword)).toBeNull();
  });

  test("an activity title needs a letter", () => {
    expect(validateField("title", "12345", noPassword)).toBe(
      FIELD_MESSAGES.activityTitle,
    );
    expect(validateField("title", "Mùa hè xanh", noPassword)).toBeNull();
  });
});

describe("numberOrNull", () => {
  test("only plain numbers become numbers", () => {
    expect(numberOrNull("12")).toBe(12);
    expect(numberOrNull("-2.5")).toBe(-2.5);
  });

  test("other text goes to the backend as typed, so it is refused clearly", () => {
    expect(numberOrNull("1e3")).toBe("1e3");
    expect(numberOrNull("0x10")).toBe("0x10");
    expect(numberOrNull("Infinity")).toBe("Infinity");
  });
});

describe("failureState for type errors", () => {
  test("a number of the wrong shape shows the field range when known", () => {
    const state = failureState("validation_error", [
      { field: "max_participants", type: "int_type" },
    ]);
    expect(state.fieldErrors?.max_participants).toBe(FIELD_MESSAGES.capacity);
  });

  test("an unknown number field gets the generic number message", () => {
    const state = failureState("validation_error", [
      { field: "size", type: "number_invalid" },
    ]);
    expect(state.fieldErrors?.size).toBe(FIELD_MESSAGES.number);
  });

  test("text without a letter has its own message", () => {
    const state = failureState("validation_error", [
      { field: "post_title", type: "text_needs_letter" },
    ]);
    expect(state.fieldErrors?.post_title).toBe(FIELD_MESSAGES.needsLetter);
  });
});

describe("isProtected", () => {
  test.each([
    "/org/clb-a/posts/new",
    "/org/clb-a/posts/drafts",
    "/org/clb-a/posts/trash",
    "/org/clb-a/posts/0190a1b2-0000-7000-8000-000000000000/edit",
    "/compose",
  ])("sends %p to the login page", (path) => {
    expect(isProtected(path)).toBe(true);
  });

  test.each([
    "/org/clb-a/posts",
    "/org/clb-a/posts/0190a1b2-0000-7000-8000-000000000000",
    "/org/clb-a",
    "/org/clb-a/posts/new/extra",
  ])("leaves %p open to visitors", (path) => {
    expect(isProtected(path)).toBe(false);
  });
});
