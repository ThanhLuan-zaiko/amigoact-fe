import Link from "next/link";
import { FiLogIn, FiUser } from "react-icons/fi";
import { getCurrentUser } from "@/lib/auth";
import { iconButton } from "../ui";

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
  return (
    <Link
      href="/account"
      aria-label={`Tài khoản của ${user.full_name}`}
      title={user.full_name}
      className="flex h-10 w-10 shrink-0 items-center justify-center border border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400"
    >
      <FiUser aria-hidden="true" />
    </Link>
  );
}
