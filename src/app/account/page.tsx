import type { Metadata } from "next";
import { Suspense } from "react";
import { FiLogOut } from "react-icons/fi";
import { logout } from "@/app/_actions/account";
import { requireUser } from "@/lib/auth";
import ProfileForm from "../_components/account/ProfileForm";
import { ResendVerificationForm } from "../_components/account/SecurityForms";
import { mutedText, secondaryButton, sectionTitle } from "../_components/ui";

export const metadata: Metadata = { title: "Tài khoản | AmigoACT" };

async function ProfileContent() {
  const user = await requireUser("/account");
  return (
    <>
      {user.email_verified_at ? null : (
        <section className="flex flex-col gap-3 border border-teal-700 p-4 dark:border-teal-400">
          <h2 className={sectionTitle}>Email chưa được xác minh</h2>
          <p className={mutedText}>
            Hãy mở liên kết đã gửi tới {user.email} để xác minh email.
          </p>
          <ResendVerificationForm />
        </section>
      )}
      <ProfileForm key={user.id} user={user} />
      <form
        action={logout}
        className="border-t border-slate-200 pt-6 dark:border-slate-800"
      >
        <button type="submit" className={secondaryButton}>
          <FiLogOut aria-hidden="true" />
          Đăng xuất
        </button>
      </form>
    </>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <ProfileContent />
    </Suspense>
  );
}
