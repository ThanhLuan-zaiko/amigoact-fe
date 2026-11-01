"use client";

import { useState } from "react";
import { FiKey, FiMail, FiSend, FiTrash2 } from "react-icons/fi";
import {
  changeEmail,
  changePassword,
  deleteAccount,
  resendVerification,
} from "@/app/_actions/account";
import { PASSWORD_HINT } from "@/lib/validation";
import { fieldLabel, secondaryButton } from "../ui";
import {
  FormMessage,
  PasswordField,
  SubmitButton,
  TextField,
} from "./FormParts";
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

export function ChangeEmailForm({ email }: { email: string }) {
  const { state, pending, formProps, passwordProps } =
    useAccountForm(changeEmail);
  return (
    <form {...formProps} className="flex flex-col gap-4">
      <p className="text-sm text-slate-700 dark:text-slate-300">
        Email hiện tại: <strong>{email}</strong>
      </p>
      <FormMessage state={state} />
      <TextField
        errors={state.fieldErrors}
        label="Email mới"
        name="new_email"
        type="email"
        autoComplete="email"
        required
      />
      <PasswordField
        label="Mật khẩu để xác nhận"
        name="password"
        {...passwordProps}
        autoComplete="current-password"
        required
      />
      <div>
        <SubmitButton pending={pending} icon={FiMail}>
          Đổi email
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

export function DeleteAccountForm() {
  const { state, pending, formProps, passwordProps } =
    useAccountForm(deleteAccount);
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className={secondaryButton}
        >
          <FiTrash2 aria-hidden="true" />
          Xóa tài khoản
        </button>
      </div>
    );
  }
  return (
    <form {...formProps} className="flex flex-col gap-4">
      <p className={fieldLabel}>
        Thao tác này không thể hoàn tác. Thông tin cá nhân của bạn sẽ bị xóa
        vĩnh viễn.
      </p>
      <FormMessage state={state} />
      <PasswordField
        label="Nhập mật khẩu để xác nhận"
        name="password"
        {...passwordProps}
        autoComplete="current-password"
        required
      />
      <div>
        <SubmitButton
          pending={pending}
          icon={FiTrash2}
          className={secondaryButton}
        >
          Xóa vĩnh viễn
        </SubmitButton>
      </div>
    </form>
  );
}
