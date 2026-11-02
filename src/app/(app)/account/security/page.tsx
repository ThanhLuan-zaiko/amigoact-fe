import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { ChangePasswordForm } from "../../../_components/account/SecurityForms";
import SessionList from "../../../_components/account/SessionList";
import { mutedText, panel, sectionTitle } from "../../../_components/ui";

export const metadata: Metadata = { title: "Bảo mật | AmigoACT" };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={`${panel} flex flex-col gap-4 p-4 sm:p-6`}>
      <h2 className={sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

async function SecurityContent() {
  await requireUser("/account/security");
  return (
    <>
      <Section title="Đổi mật khẩu">
        <ChangePasswordForm />
      </Section>
      <Section title="Thiết bị đang đăng nhập">
        <SessionList />
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
