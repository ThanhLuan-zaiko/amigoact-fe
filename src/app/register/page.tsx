import type { Metadata } from "next";
import AuthShell from "../_components/account/AuthShell";
import RegisterForm from "../_components/account/RegisterForm";

export const metadata: Metadata = { title: "Đăng ký | AmigoACT" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Tạo tài khoản"
      description="Tham gia cùng các tổ chức và tình nguyện viên trên AmigoACT."
    >
      <RegisterForm />
    </AuthShell>
  );
}
