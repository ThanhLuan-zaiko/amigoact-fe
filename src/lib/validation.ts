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

export const FIELD_MESSAGES = {
  required: "Vui lòng nhập thông tin này.",
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
    return name === "full_name" ? FIELD_MESSAGES.required : null;
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
