"use client";

import Link from "next/link";
import { FiCheck, FiKey, FiMail } from "react-icons/fi";
import {
  forgotPassword,
  resetPassword,
  verifyEmail,
} from "@/app/_actions/auth";
import { PASSWORD_HINT } from "@/lib/validation";
import { secondaryButton } from "../ui";
import {
  FormMessage,
  PasswordField,
  SubmitButton,
  TextField,
} from "./FormParts";
import { useAccountForm } from "./useAccountForm";

const linkClass =
  "text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400";

export function ForgotPasswordForm() {
  const { state, pending, formProps } = useAccountForm(forgotPassword);
  return (
    <form {...formProps} className="flex flex-col gap-4">
      <FormMessage state={state} />
      <TextField
        errors={state.fieldErrors}
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <SubmitButton pending={pending} icon={FiMail}>
        Gửi liên kết
      </SubmitButton>
      <Link href="/login" className={linkClass}>
        Quay lại đăng nhập
      </Link>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const { state, pending, formProps, passwordProps } =
    useAccountForm(resetPassword);
  if (state.success) {
    return (
      <div className="flex flex-col gap-4">
        <FormMessage state={state} />
        <Link href="/login" className={secondaryButton}>
          <FiKey aria-hidden="true" />
          Đăng nhập
        </Link>
      </div>
    );
  }
  return (
    <form {...formProps} className="flex flex-col gap-4">
      <FormMessage state={state} />
      <input type="hidden" name="token" value={token} />
      <PasswordField
        label="Mật khẩu mới"
        name="new_password"
        {...passwordProps}
        autoComplete="new-password"
        minLength={8}
        maxLength={128}
        hint={PASSWORD_HINT}
        required
      />
      <PasswordField
        label="Nhập lại mật khẩu mới"
        name="confirm_password"
        {...passwordProps}
        autoComplete="new-password"
        required
      />
      <SubmitButton pending={pending} icon={FiKey}>
        Đặt lại mật khẩu
      </SubmitButton>
    </form>
  );
}

// Confirming takes a click, so mail scanners that open the link do not use up the token.
export function VerifyEmailForm({ token }: { token: string }) {
  const { state, pending, formProps } = useAccountForm(verifyEmail);
  if (state.success) {
    return (
      <div className="flex flex-col gap-4">
        <FormMessage state={state} />
        <Link href="/account" className={secondaryButton}>
          <FiCheck aria-hidden="true" />
          Tới tài khoản
        </Link>
      </div>
    );
  }
  return (
    <form {...formProps} className="flex flex-col gap-4">
      <FormMessage state={state} />
      <input type="hidden" name="token" value={token} />
      <SubmitButton pending={pending} icon={FiCheck}>
        Xác minh email
      </SubmitButton>
    </form>
  );
}
