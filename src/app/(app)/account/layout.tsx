import type { ReactNode } from "react";
import AccountNav from "../../_components/account/AccountNav";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Tài khoản</h1>
      <AccountNav />
      {children}
    </div>
  );
}
