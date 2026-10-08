export type FieldErrors = Partial<Record<string, string>>;

const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_PATTERN = /^0(?:3|5|7|8|9)\d{8}$/;
const CODE_PATTERN = /^\d{6}$/;

function isFakePhone(digits: string): boolean {
  if (new Set(digits).size === 1) return true;
  let ascending = true;
  let descending = true;
  for (let i = 0; i < 9; i += 1) {
    const diff = Number(digits[i + 1]) - Number(digits[i]);
    if (diff !== 1) ascending = false;
    if (diff !== -1) descending = false;
  }
  return ascending || descending;
}

export function validateEmailValue(value: string): string | null {
  const address = value.trim().toLowerCase();
  if (address.length === 0) return "REQUIRED";
  if (address.length > 254 || !EMAIL_PATTERN.test(address)) return "INVALID_EMAIL";
  return null;
}

export function validatePhoneValue(value: string): string | null {
  const digits = value.replace(/[\s.]/g, "");
  if (digits.length === 0) return "REQUIRED";
  if (!PHONE_PATTERN.test(digits) || isFakePhone(digits)) return "INVALID_PHONE";
  return null;
}

export function validatePasswordValue(value: string): string | null {
  if (value.length === 0) return "REQUIRED";
  const strong =
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[^A-Za-z0-9]/.test(value);
  return strong ? null : "WEAK_PASSWORD";
}

export function validateNameValue(value: string): string | null {
  const name = value.trim();
  if (name.length === 0) return "REQUIRED";
  if (name.length < 2 || name.length > 100) return "INVALID_NAME";
  return null;
}

export function validateCodeValue(value: string): string | null {
  if (value.trim().length === 0) return "REQUIRED";
  return CODE_PATTERN.test(value.trim()) ? null : "INVALID_CODE";
}

export interface RegisterForm {
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

export function validateRegisterForm(form: RegisterForm): FieldErrors {
  const errors: FieldErrors = {};
  const email = validateEmailValue(form.email);
  if (email) errors.email = email;
  const phone = validatePhoneValue(form.phone);
  if (phone) errors.phone = phone;
  const password = validatePasswordValue(form.password);
  if (password) errors.password = password;
  if (form.confirmPassword !== form.password)
    errors.confirmPassword = "PASSWORD_MISMATCH";
  const name = validateNameValue(form.fullName);
  if (name) errors.fullName = name;
  return errors;
}

export interface LoginForm {
  email: string;
  password: string;
}

export function validateLoginForm(form: LoginForm): FieldErrors {
  const errors: FieldErrors = {};
  const email = validateEmailValue(form.email);
  if (email) errors.email = email;
  if (form.password.length === 0) errors.password = "REQUIRED";
  return errors;
}

export function validateLoginField(
  form: LoginForm,
  key: "email" | "password",
): string | null {
  if (key === "email") return validateEmailValue(form.email);
  return form.password.length === 0 ? "REQUIRED" : null;
}

export function validateRegisterField(
  form: RegisterForm,
  key: "email" | "phone" | "password" | "confirmPassword" | "fullName",
): string | null {
  if (key === "email") return validateEmailValue(form.email);
  if (key === "phone") return validatePhoneValue(form.phone);
  if (key === "password") return validatePasswordValue(form.password);
  if (key === "confirmPassword") {
    return form.confirmPassword !== form.password ? "PASSWORD_MISMATCH" : null;
  }
  return validateNameValue(form.fullName);
}

export interface VerifyForm {
  email: string;
  code: string;
}

export function validateVerifyField(
  form: VerifyForm,
  key: "email" | "code",
): string | null {
  if (key === "email") return validateEmailValue(form.email);
  return validateCodeValue(form.code);
}

export interface ResetForm {
  email: string;
  code: string;
  password: string;
  confirm: string;
}

export function validateResetField(
  form: ResetForm,
  key: "email" | "code" | "password" | "confirm",
): string | null {
  if (key === "email") return validateEmailValue(form.email);
  if (key === "code") return validateCodeValue(form.code);
  if (key === "password") return validatePasswordValue(form.password);
  return form.confirm !== form.password ? "PASSWORD_MISMATCH" : null;
}

export interface ChangeForm {
  current: string;
  next: string;
  confirm: string;
}

export function validateChangeField(
  form: ChangeForm,
  key: "current" | "next" | "confirm",
): string | null {
  if (key === "current") return form.current.length === 0 ? "REQUIRED" : null;
  if (key === "next") return validatePasswordValue(form.next);
  return form.confirm !== form.next ? "PASSWORD_MISMATCH" : null;
}
