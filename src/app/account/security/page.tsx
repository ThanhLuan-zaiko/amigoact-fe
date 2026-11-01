import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import {
  ChangeEmailForm,
  ChangePasswordForm,
  DeleteAccountForm,
} from "../../_components/account/SecurityForms";
import SessionList from "../../_components/account/SessionList";
import { mutedText, sectionTitle } from "../../_components/ui";

export const metadata: Metadata = { title: "Bảo mật | AmigoACT" };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-b border-slate-200 pb-6 last:border-b-0 dark:border-slate-800">
      <h2 className={sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

async function SecurityContent() {
  const user = await requireUser("/account/security");
  return (
    <>
      <Section title="Đổi mật khẩu">
        <ChangePasswordForm />
      </Section>
      <Section title="Đổi email">
        <ChangeEmailForm email={user.email} />
      </Section>
      <Section title="Thiết bị đang đăng nhập">
        <SessionList />
      </Section>
      <Section title="Xóa tài khoản">
        <DeleteAccountForm />
      </Section>
    </>
  );
}

export default function SecurityPage() {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <SecurityContent />
    </Suspense>
  );
}
