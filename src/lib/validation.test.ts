import { describe, expect, test } from "bun:test";
import {
  FIELD_MESSAGES,
  isValidLegalId,
  isValidPhone,
  isValidTaxCode,
  passwordProblem,
  validateField,
} from "./validation";

describe("passwordProblem", () => {
  test.each([
    "T7#kP2vLq9",
    "Ab1!abcd",
    "Trái-Cây-7",
    "With Space 1",
  ])("accepts %p", (value) => {
    expect(passwordProblem(value)).toBeNull();
  });

  test("names only what is missing", () => {
    expect(passwordProblem("lowercase1!")).toBe("Mật khẩu cần có chữ hoa.");
    expect(passwordProblem("UPPERCASE1!")).toBe("Mật khẩu cần có chữ thường.");
    expect(passwordProblem("NoDigits!!")).toBe("Mật khẩu cần có số.");
    expect(passwordProblem("NoSpecial12")).toBe(
      "Mật khẩu cần có ký tự đặc biệt.",
    );
    expect(passwordProblem("Ab1!xyz")).toBe("Mật khẩu cần có ít nhất 8 ký tự.");
  });
});

describe("format checks match the backend", () => {
  test.each([
    "0912345678",
    "091 234 5678",
    "+84912345678",
    "84912345678",
    "(024) 3825 1234",
    "+1 415 555 2671",
  ])("accepts phone %p", (value) => {
    expect(isValidPhone(value)).toBe(true);
  });

  test.each([
    "abc",
    "12345678",
    "091234",
    "+8491234",
    "+0123456789",
  ])("rejects phone %p", (value) => {
    expect(isValidPhone(value)).toBe(false);
  });

  test("tax codes", () => {
    expect(isValidTaxCode("0101234567")).toBe(true);
    expect(isValidTaxCode("0101234567-001")).toBe(true);
    expect(isValidTaxCode("0101234567001")).toBe(true);
    expect(isValidTaxCode("123")).toBe(false);
  });

  test("legal IDs", () => {
    expect(isValidLegalId("001099012345")).toBe(true);
    expect(isValidLegalId("123456789")).toBe(true);
    expect(isValidLegalId("b1234567")).toBe(true);
    expect(isValidLegalId("1234567890")).toBe(false);
  });
});

describe("validateField", () => {
  const plain = { isNewPassword: false };

  test("an empty optional field passes", () => {
    expect(validateField("phone", "  ", plain)).toBeNull();
  });

  test("a blank full name fails", () => {
    expect(validateField("full_name", "   ", plain)).toBe(
      FIELD_MESSAGES.required,
    );
  });

  test("the password of a login form is not checked against the rules", () => {
    expect(validateField("password", "old-simple", plain)).toBeNull();
  });

  test("a new password is checked against the rules", () => {
    expect(
      validateField("password", "simple", { isNewPassword: true }),
    ).not.toBeNull();
  });

  test("the confirmation must match", () => {
    const context = { isNewPassword: true, passwordToMatch: "Ab1!abcd" };
    expect(validateField("confirm_password", "other", context)).toBe(
      FIELD_MESSAGES.mismatch,
    );
    expect(validateField("confirm_password", "Ab1!abcd", context)).toBeNull();
  });

  test("a future birth date fails", () => {
    expect(validateField("date_of_birth", "2999-01-01", plain)).toBe(
      FIELD_MESSAGES.birthDate,
    );
  });
});
