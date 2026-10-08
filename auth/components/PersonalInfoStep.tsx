import type { ReactElement } from "react";
import { FiLock, FiMail, FiPhone, FiUser } from "react-icons/fi";
import { TextField } from "../../core/components/TextField.tsx";
import { toVietnameseMessage } from "../messages.tsx";
import type { FieldErrors, RegisterForm } from "../schemas.ts";
import { VisibilityToggle } from "./VisibilityToggle.tsx";

interface PersonalInfoStepProps {
  form: RegisterForm;
  errors: FieldErrors;
  touched: Record<string, boolean>;
  showPasswords: boolean;
  onUpdate: (
    key: "fullName" | "email" | "phone" | "password" | "confirmPassword",
    value: string,
  ) => void;
  onBlurField: (key: string) => void;
  onTogglePasswords: () => void;
}

function showError(touched: Record<string, boolean>, code: string | undefined, key: string): string | undefined {
  return touched[key] && code ? toVietnameseMessage(code) : undefined;
}

export function PersonalInfoStep({
  form,
  errors,
  touched,
  showPasswords,
  onUpdate,
  onBlurField,
  onTogglePasswords,
}: PersonalInfoStepProps): ReactElement {
  return (
    <div className="flex flex-col gap-3">
      <TextField
        label="Họ và tên"
        name="fullName"
        autoComplete="name"
        placeholder="Nguyễn Văn A"
        value={form.fullName}
        onChange={(event) => onUpdate("fullName", event.target.value)}
        onBlur={() => onBlurField("fullName")}
        error={showError(touched, errors.fullName, "fullName")}
        icon={<FiUser className="h-4 w-4" aria-hidden="true" />}
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="vidu@email.com"
        value={form.email}
        onChange={(event) => onUpdate("email", event.target.value)}
        onBlur={() => onBlurField("email")}
        error={showError(touched, errors.email, "email")}
        icon={<FiMail className="h-4 w-4" aria-hidden="true" />}
      />
      <TextField
        label="Số điện thoại"
        name="phone"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        placeholder="0912345678"
        value={form.phone}
        onChange={(event) => onUpdate("phone", event.target.value)}
        onBlur={() => onBlurField("phone")}
        error={showError(touched, errors.phone, "phone")}
        icon={<FiPhone className="h-4 w-4" aria-hidden="true" />}
      />
      <TextField
        label="Mật khẩu"
        name="password"
        type={showPasswords ? "text" : "password"}
        autoComplete="new-password"
        placeholder="Tối thiểu 8 ký tự"
        hint="Gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
        value={form.password}
        onChange={(event) => onUpdate("password", event.target.value)}
        onBlur={() => onBlurField("password")}
        error={showError(touched, errors.password, "password")}
        icon={<FiLock className="h-4 w-4" aria-hidden="true" />}
        trailing={<VisibilityToggle visible={showPasswords} onToggle={onTogglePasswords} />}
      />
      <TextField
        label="Nhập lại mật khẩu"
        name="confirmPassword"
        type={showPasswords ? "text" : "password"}
        autoComplete="new-password"
        placeholder="Nhập lại mật khẩu"
        value={form.confirmPassword}
        onChange={(event) => onUpdate("confirmPassword", event.target.value)}
        onBlur={() => onBlurField("confirmPassword")}
        error={showError(touched, errors.confirmPassword, "confirmPassword")}
        icon={<FiLock className="h-4 w-4" aria-hidden="true" />}
        trailing={<VisibilityToggle visible={showPasswords} onToggle={onTogglePasswords} />}
      />
    </div>
  );
}
