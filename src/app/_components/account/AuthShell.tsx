import Link from "next/link";
import type { ReactNode } from "react";
import { FiArrowLeft } from "react-icons/fi";
import ThemeToggle from "../ThemeToggle";
import { mutedText, secondaryButton } from "../ui";

type AuthShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function AuthShell({
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <>
      <header className="flex h-16 items-center gap-3 border-b border-slate-200 px-4 sm:px-6 dark:border-slate-800">
        <Link href="/" className={secondaryButton}>
          <FiArrowLeft aria-hidden="true" />
          Quay lại
        </Link>
        <Link
          href="/"
          className="mx-auto text-xl font-extrabold tracking-tight text-teal-700 dark:text-teal-400"
        >
          AmigoACT
        </Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-4 sm:p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold">{title}</h1>
          {description ? <p className={mutedText}>{description}</p> : null}
        </div>
        {children}
      </main>
    </>
  );
}
