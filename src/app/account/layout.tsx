import AppHeader from "../_components/AppHeader";
import AccountNav from "../_components/account/AccountNav";
import MobileNav from "../_components/MobileNav";

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 pb-24 sm:p-6 md:pb-6">
        <h1 className="text-2xl font-extrabold">Tài khoản</h1>
        <AccountNav />
        {children}
      </main>
      <MobileNav activeHref="/account" />
    </>
  );
}
