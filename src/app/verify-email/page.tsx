import type { Metadata } from "next";
import { Suspense } from "react";
import AuthShell from "../_components/account/AuthShell";
import MissingToken from "../_components/account/MissingToken";
import { VerifyEmailForm } from "../_components/account/RecoveryForms";
import { mutedText } from "../_components/ui";

export const metadata: Metadata = {
  title: "Xác minh email | AmigoACT",
  referrer: "same-origin",
};

async function VerifyContent({
  searchParams,
}: {
  searchParams: PageProps<"/verify-email">["searchParams"];
}) {
  const { token } = await searchParams;
  return typeof token === "string" ? (
    <VerifyEmailForm token={token} />
  ) : (
    <MissingToken />
  );
}

export default function VerifyEmailPage({
  searchParams,
}: PageProps<"/verify-email">) {
  return (
    <AuthShell
      title="Xác minh email"
      description="Bấm nút bên dưới để xác nhận địa chỉ email của bạn."
    >
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <VerifyContent searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}
