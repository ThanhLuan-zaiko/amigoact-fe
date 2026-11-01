// Pure helpers for account forms. Text shown to users stays in Vietnamese.
import type { FieldErrors, FormState } from "./account";
import { FIELD_MESSAGES, PASSWORD_HINT } from "./validation";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Email hoặc mật khẩu không đúng.",
  account_disabled: "Tài khoản này đã bị khóa.",
  email_taken: "Email này đã được sử dụng.",
  phone_taken: "Số điện thoại này đã được sử dụng.",
  rate_limited: "Bạn thử quá nhiều lần. Vui lòng đợi một lúc rồi thử lại.",
  invalid_current_password: "Mật khẩu hiện tại không đúng.",
  same_password: "Mật khẩu mới phải khác mật khẩu hiện tại.",
  invalid_or_expired_token: "Liên kết không hợp lệ hoặc đã hết hạn.",
  email_already_verified: "Email này đã được xác minh.",
  owns_organizations:
    "Bạn đang sở hữu tổ chức. Hãy chuyển quyền sở hữu trước khi xóa tài khoản.",
  business_fields_required:
    "Tài khoản tổ chức cần có tên đơn vị và mã số thuế.",
  session_not_found: "Không tìm thấy phiên đăng nhập này.",
  network_error: "Không kết nối được máy chủ. Vui lòng thử lại.",
  validation_error: "Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.",
  password_personal:
    "Mật khẩu không được chứa tên hoặc phần tên trong email của bạn.",
};

const PASSWORD_COMMON =
  "Mật khẩu này quá phổ biến. Hãy chọn mật khẩu khó đoán hơn.";
const PASSWORD_PERSONAL =
  "Mật khẩu không được chứa tên hoặc phần tên trong email của bạn.";

const ISSUE_MESSAGES: Record<string, string> = {
  required: FIELD_MESSAGES.required,
  phone_invalid: FIELD_MESSAGES.phone,
  tax_code_invalid: FIELD_MESSAGES.taxCode,
  legal_id_invalid: FIELD_MESSAGES.legalId,
  birth_date_invalid: FIELD_MESSAGES.birthDate,
  password_too_weak: PASSWORD_HINT,
  password_common: PASSWORD_COMMON,
  password_personal: PASSWORD_PERSONAL,
};

// Used when the issue type is generic, such as a value that is too short.
const FIELD_FALLBACKS: Record<string, string> = {
  email: FIELD_MESSAGES.email,
  new_email: FIELD_MESSAGES.email,
  password: PASSWORD_HINT,
  new_password: PASSWORD_HINT,
  full_name: "Họ và tên cần từ 1 đến 120 ký tự.",
  phone: FIELD_MESSAGES.phone,
  tax_code: FIELD_MESSAGES.taxCode,
  legal_rep_id: FIELD_MESSAGES.legalId,
  date_of_birth: FIELD_MESSAGES.birthDate,
  company_name: "Tên đơn vị cần từ 1 đến 200 ký tự.",
  legal_rep_name: "Tên người đại diện tối đa 200 ký tự.",
  legal_rep_position: "Chức vụ tối đa 200 ký tự.",
  address: "Địa chỉ tối đa 500 ký tự.",
};

// Backend errors that belong to specific inputs. A form renders only some of them.
const CODE_FIELDS: Record<string, string[]> = {
  email_taken: ["email", "new_email"],
  phone_taken: ["phone"],
  invalid_current_password: ["current_password", "password"],
  same_password: ["new_password"],
  password_personal: ["new_password", "password"],
  business_fields_required: ["company_name", "tax_code"],
};

export type ValidationIssue = {
  field: string;
  type: string;
};

function errorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? "Đã có lỗi xảy ra. Vui lòng thử lại.";
}

export function failureState(
  code: string,
  issues: ValidationIssue[] = [],
): FormState {
  const fields = CODE_FIELDS[code];
  if (fields) {
    return {
      fieldErrors: Object.fromEntries(
        fields.map((field) => [field, errorMessage(code)]),
      ),
    };
  }
  const fieldErrors: FieldErrors = {};
  for (const { field, type } of issues) {
    const message = ISSUE_MESSAGES[type] ?? FIELD_FALLBACKS[field];
    if (!message) {
      return { error: errorMessage(code) };
    }
    fieldErrors[field] = message;
  }
  return issues.length > 0 ? { fieldErrors } : { error: errorMessage(code) };
}

export function textValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

// Passwords may contain meaningful spaces, so they are not trimmed.
export function passwordValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function textOrNull(formData: FormData, name: string): string | null {
  return textValue(formData, name) || null;
}

// Only same-site paths are accepted, so a crafted link cannot redirect elsewhere after login.
export function safeNextPath(value: unknown, fallback = "/account"): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }
  return value;
}

export function describeDevice(userAgent: string | null): string {
  if (!userAgent) {
    return "Thiết bị không xác định";
  }
  const browsers: [RegExp, string][] = [
    [/Edg\//, "Edge"],
    [/OPR\//, "Opera"],
    [/Chrome\//, "Chrome"],
    [/Firefox\//, "Firefox"],
    [/Safari\//, "Safari"],
  ];
  const systems: [RegExp, string][] = [
    [/Android/, "Android"],
    [/iPhone|iPad/, "iOS"],
    [/Windows/, "Windows"],
    [/Mac OS X/, "macOS"],
    [/Linux/, "Linux"],
  ];
  const browser = browsers.find(([pattern]) => pattern.test(userAgent))?.[1];
  const system = systems.find(([pattern]) => pattern.test(userAgent))?.[1];
  return (
    [browser, system].filter(Boolean).join(" trên ") ||
    "Thiết bị không xác định"
  );
}
