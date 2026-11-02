"use client";

import { FiKey, FiSend } from "react-icons/fi";
import { changePassword, resendVerification } from "@/app/_actions/account";
import { PASSWORD_HINT } from "@/lib/validation";
import { secondaryButton } from "../ui";
import { FormMessage, PasswordField, SubmitButton } from "./FormParts";
import { useAccountForm } from "./useAccountForm";

export function ChangePasswordForm() {
  const { state, pending, formProps, passwordProps } =
    useAccountForm(changePassword);
  return (
    <form {...formProps} className="flex flex-col gap-4">
      <FormMessage state={state} />
      <PasswordField
        label="Mật khẩu hiện tại"
        name="current_password"
        {...passwordProps}
        autoComplete="current-password"
        required
      />
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
      <div>
        <SubmitButton pending={pending} icon={FiKey}>
          Đổi mật khẩu
        </SubmitButton>
      </div>
    </form>
  );
}

export function ResendVerificationForm() {
  const { state, pending, formProps } = useAccountForm(resendVerification);
  return (
    <form {...formProps} className="flex flex-col items-start gap-3">
      <FormMessage state={state} />
      <SubmitButton pending={pending} icon={FiSend} className={secondaryButton}>
        Gửi lại liên kết
      </SubmitButton>
    </form>
  );
}
