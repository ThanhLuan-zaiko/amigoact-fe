import Link from "next/link";
import { FiLogIn } from "react-icons/fi";
import { logout } from "@/app/_actions/account";
import { getCurrentUser } from "@/lib/auth";
import { iconButton } from "../ui";
import AccountMenu from "./AccountMenu";

// Reads the session, so AppHeader renders it behind a Suspense boundary.
export default async function HeaderAccount() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Link href="/login" aria-label="Đăng nhập" className={iconButton}>
        <FiLogIn aria-hidden="true" />
      </Link>
    );
  }
  return <AccountMenu name={user.full_name} logoutAction={logout} />;
}
