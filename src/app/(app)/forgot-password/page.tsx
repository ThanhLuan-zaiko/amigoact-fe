import type { Metadata } from "next";
import AuthShell from "../../_components/account/AuthShell";
import { ForgotPasswordForm } from "../../_components/account/RecoveryForms";

export const metadata: Metadata = { title: "Quên mật khẩu | AmigoACT" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Quên mật khẩu"
      description="Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
