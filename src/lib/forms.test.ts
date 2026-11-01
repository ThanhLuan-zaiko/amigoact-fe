import { describe, expect, test } from "bun:test";
import {
  describeDevice,
  failureState,
  passwordValue,
  safeNextPath,
  textOrNull,
} from "./forms";

describe("safeNextPath", () => {
  test("keeps a same-site path", () => {
    expect(safeNextPath("/account/security")).toBe("/account/security");
  });

  test.each([
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "",
    null,
  ])("falls back for %p", (value) => {
    expect(safeNextPath(value)).toBe("/account");
  });
});

describe("failureState", () => {
  test("shows a general code above the form", () => {
    expect(failureState("invalid_credentials")).toEqual({
      error: "Email hoặc mật khẩu không đúng.",
    });
  });

  test("puts a field code on its input", () => {
    expect(failureState("phone_taken").fieldErrors).toEqual({
      phone: "Số điện thoại này đã được sử dụng.",
    });
  });

  test("maps validation issues to each field", () => {
    const state = failureState("validation_error", [
      { field: "phone", type: "phone_invalid" },
      { field: "email", type: "value_error" },
      { field: "password", type: "password_common" },
    ]);
    expect(state.error).toBeUndefined();
    expect(Object.keys(state.fieldErrors ?? {})).toEqual([
      "phone",
      "email",
      "password",
    ]);
    expect(state.fieldErrors?.password).toContain("quá phổ biến");
  });

  test("falls back to a form message for an unknown field", () => {
    expect(
      failureState("validation_error", [{ field: "gender", type: "literal" }])
        .error,
    ).toBe("Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.");
  });

  test("has a generic message for unknown codes", () => {
    expect(failureState("something_new").error).toBe(
      "Đã có lỗi xảy ra. Vui lòng thử lại.",
    );
  });
});

describe("form values", () => {
  test("empty optional text becomes null", () => {
    const data = new FormData();
    data.set("phone", "   ");
    expect(textOrNull(data, "phone")).toBeNull();
  });

  test("passwords keep their spaces", () => {
    const data = new FormData();
    data.set("password", " with spaces ");
    expect(passwordValue(data, "password")).toBe(" with spaces ");
  });
});

describe("describeDevice", () => {
  test("names browser and system", () => {
    const agent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36";
    expect(describeDevice(agent)).toBe("Chrome trên Windows");
  });

  test("handles a missing agent", () => {
    expect(describeDevice(null)).toBe("Thiết bị không xác định");
  });
});
