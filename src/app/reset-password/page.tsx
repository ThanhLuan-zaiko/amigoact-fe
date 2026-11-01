import type { Metadata } from "next";
import { Suspense } from "react";
import AuthShell from "../_components/account/AuthShell";
import MissingToken from "../_components/account/MissingToken";
import { ResetPasswordForm } from "../_components/account/RecoveryForms";
import { mutedText } from "../_components/ui";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu | AmigoACT",
  referrer: "same-origin",
};

async function ResetContent({
  searchParams,
}: {
  searchParams: PageProps<"/reset-password">["searchParams"];
}) {
  const { token } = await searchParams;
  return typeof token === "string" ? (
    <ResetPasswordForm token={token} />
  ) : (
    <MissingToken />
  );
}

export default function ResetPasswordPage({
  searchParams,
}: PageProps<"/reset-password">) {
  return (
    <AuthShell
      title="Đặt lại mật khẩu"
      description="Sau khi đặt lại, mọi thiết bị đang đăng nhập sẽ bị đăng xuất."
    >
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <ResetContent searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}
