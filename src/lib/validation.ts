// Checks that give instant feedback in the browser. The backend stays the
// authority: it repeats them and also rejects common and personal passwords.

export const PASSWORD_HINT =
  "Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.";

const PASSWORD_RULES: [RegExp, string][] = [
  [/^[\s\S]{8,}$/u, "ít nhất 8 ký tự"],
  [/\p{Lu}/u, "chữ hoa"],
  [/\p{Ll}/u, "chữ thường"],
  [/\p{Nd}/u, "số"],
  [/[^\p{L}\p{N}]/u, "ký tự đặc biệt"],
];

export function passwordProblem(value: string): string | null {
  const missing = PASSWORD_RULES.flatMap(([pattern, label]) =>
    pattern.test(value) ? [] : [label],
  );
  return missing.length > 0 ? `Mật khẩu cần có ${missing.join(", ")}.` : null;
}

export function isValidPhone(value: string): boolean {
  const compact = value.replace(/[\s.()-]/g, "");
  return (
    /^0\d{9,10}$/.test(compact) ||
    /^\+?84\d{9,10}$/.test(compact) ||
    /^\+(?!84)[1-9]\d{6,13}$/.test(compact)
  );
}

export function isValidTaxCode(value: string): boolean {
  return /^\d{10}(-?\d{3})?$/.test(value.trim());
}

export function isValidLegalId(value: string): boolean {
  const compact = value.trim().toUpperCase();
  return (
    /^(\d{9}|\d{12})$/.test(compact) ||
    /^(?=.*[A-Z])[A-Z0-9]{6,20}$/.test(compact)
  );
}

// The backend repeats this and also rejects credentials inside the URL.
export function isValidWebsite(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname.includes(".") &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

// Two to 120 characters with at least one letter or digit, so "!!!" is not a name.
export function isValidOrganizationName(value: string): boolean {
  const name = value.trim();
  return name.length >= 2 && name.length <= 120 && /[\p{L}\p{N}]/u.test(name);
}

// Digits only: no sign, no dot, no exponent, no spaces. "1e3" and " 5" are refused.
export function isPlainInteger(value: string): boolean {
  return /^[0-9]+$/.test(value);
}

// A plain decimal such as 2 or 2.5. The backend refuses "1e3", "NaN" and ".5" too.
export function isPlainDecimal(value: string): boolean {
  return /^-?[0-9]+(\.[0-9]+)?$/.test(value);
}

// Titles need a real letter, so "2024" or "!!!" is not a title. Same rule as the backend.
export function hasLetter(value: string): boolean {
  return /\p{L}/u.test(value);
}

function isValidActivityTitle(value: string): boolean {
  const title = value.trim();
  return title.length >= 3 && title.length <= 200 && hasLetter(title);
}

function isValidCapacity(value: string): boolean {
  const text = value.trim();
  const capacity = Number(text);
  return isPlainInteger(text) && capacity >= 1 && capacity <= 100000;
}

function isValidHours(value: string): boolean {
  const hours = Number(value);
  return /^\d+(\.\d{1,2})?$/.test(value.trim()) && hours <= 1000;
}

function isValidDelta(value: string): boolean {
  const delta = Number(value);
  return (
    /^-?\d+(\.\d{1,2})?$/.test(value.trim()) &&
    delta !== 0 &&
    Math.abs(delta) <= 1000
  );
}

function isValidMultiplier(value: string): boolean {
  const multiplier = Number(value);
  return (
    /^\d+(\.\d{1,3})?$/.test(value.trim()) &&
    multiplier >= 0.1 &&
    multiplier <= 10
  );
}

function isValidCapHours(value: string): boolean {
  const cap = Number(value);
  return /^\d+(\.\d{1,2})?$/.test(value.trim()) && cap > 0 && cap <= 9999;
}

export const FIELD_MESSAGES = {
  checkInCode: "Mã điểm danh gồm 6 chữ hoặc số.",
  deltaHours: "Số giờ thay đổi khác 0, từ -1000 đến 1000, tối đa 2 số lẻ.",
  multiplier: "Hệ số từ 0.1 đến 10, tối đa 3 số lẻ.",
  capHours: "Giới hạn giờ lớn hơn 0 và tối đa 9999.",
  activityTitle:
    "Tên hoạt động cần từ 3 đến 200 ký tự, có ít nhất một chữ cái.",
  capacity: "Số chỗ chỉ gồm chữ số, từ 1 đến 100000.",
  hours: "Số giờ từ 0 đến 1000, tối đa 2 chữ số thập phân.",
  organizationName: "Tên tổ chức cần từ 2 đến 120 ký tự, có chữ hoặc số.",
  website: "Website cần có dạng https://ten-mien.vn.",
  required: "Vui lòng nhập thông tin này.",
  number:
    "Chỉ nhập số, ví dụ 12 hoặc 2.5. Không có chữ, dấu cách hay ký hiệu khác.",
  needsLetter: "Cần có ít nhất một chữ cái, không chỉ gồm số hay ký hiệu.",
  email: "Email không đúng định dạng.",
  phone: "Số điện thoại không hợp lệ. Ví dụ: 0912345678 hoặc +84912345678.",
  taxCode: "Mã số thuế gồm 10 chữ số, hoặc 13 chữ số với chi nhánh.",
  legalId: "Nhập CCCD 12 số, CMND 9 số hoặc số hộ chiếu.",
  birthDate: "Ngày sinh phải là một ngày trong quá khứ.",
  mismatch: "Mật khẩu nhập lại không khớp.",
};

type FieldContext = {
  isNewPassword: boolean;
  passwordToMatch?: string;
};

// Optional fields that are empty pass here. Required ones are checked separately.
export function validateField(
  name: string,
  value: string,
  { isNewPassword, passwordToMatch }: FieldContext,
): string | null {
  if (isNewPassword && name !== "confirm_password") {
    return passwordProblem(value);
  }
  if (name === "confirm_password") {
    return value === passwordToMatch ? null : FIELD_MESSAGES.mismatch;
  }
  if (!value.trim()) {
    return name === "full_name" || name === "name" || name === "title"
      ? FIELD_MESSAGES.required
      : null;
  }
  if (name === "title") {
    return isValidActivityTitle(value) ? null : FIELD_MESSAGES.activityTitle;
  }
  if (name === "capacity" || name === "max_participants") {
    return isValidCapacity(value) ? null : FIELD_MESSAGES.capacity;
  }
  if (name === "hours_awarded") {
    return isValidHours(value) ? null : FIELD_MESSAGES.hours;
  }
  if (name === "code") {
    return /^[0-9A-Za-z]{6}$/.test(value.trim())
      ? null
      : FIELD_MESSAGES.checkInCode;
  }
  if (name === "delta_hours") {
    return isValidDelta(value) ? null : FIELD_MESSAGES.deltaHours;
  }
  if (name === "multiplier") {
    return isValidMultiplier(value) ? null : FIELD_MESSAGES.multiplier;
  }
  if (name === "cap_hours") {
    return isValidCapHours(value) ? null : FIELD_MESSAGES.capHours;
  }
  if (name === "name") {
    return isValidOrganizationName(value)
      ? null
      : FIELD_MESSAGES.organizationName;
  }
  if (name === "website") {
    return isValidWebsite(value) ? null : FIELD_MESSAGES.website;
  }
  if (name === "phone") {
    return isValidPhone(value) ? null : FIELD_MESSAGES.phone;
  }
  if (name === "tax_code") {
    return isValidTaxCode(value) ? null : FIELD_MESSAGES.taxCode;
  }
  if (name === "legal_rep_id") {
    return isValidLegalId(value) ? null : FIELD_MESSAGES.legalId;
  }
  if (name === "date_of_birth") {
    const today = new Date().toISOString().slice(0, 10);
    return value < today ? null : FIELD_MESSAGES.birthDate;
  }
  return null;
}
