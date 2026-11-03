import type { ReactNode } from "react";
import AccountNav from "../../_components/account/AccountNav";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    // On wide screens the title and the section list sit on the left, and the form on the right.
    <div className="grid w-full grid-cols-1 items-start gap-6 xl:grid-cols-[15rem_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-24">
        <h1 className="text-2xl font-extrabold tracking-tight">Tài khoản</h1>
        <AccountNav />
      </div>
      <div className="flex min-w-0 flex-col gap-6">{children}</div>
    </div>
  );
}
