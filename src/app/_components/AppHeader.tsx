import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { FiBell, FiPlus, FiSearch } from "react-icons/fi";
import HeaderAccount from "./account/HeaderAccount";
import ThemeToggle from "./ThemeToggle";
import { iconButton, primaryButton } from "./ui";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 md:gap-6 dark:border-slate-800 dark:bg-slate-950">
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100"
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-900 text-sm font-extrabold text-slate-900 dark:border-slate-100 dark:text-slate-100"
        >
          A
        </span>
        AmigoACT
      </Link>

      <Form
        action="/explore"
        className="hidden h-10 max-w-xl flex-1 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm text-slate-500 transition-colors focus-within:border-teal-700 md:flex dark:border-slate-800 dark:focus-within:border-teal-400"
      >
        <FiSearch aria-hidden="true" className="shrink-0" />
        <input
          type="search"
          name="q"
          maxLength={100}
          aria-label="Tìm hoạt động"
          placeholder="Tìm hoạt động"
          className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-500 dark:text-slate-100"
        />
      </Form>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Link
          href="/explore"
          aria-label="Tìm kiếm"
          title="Tìm kiếm"
          className={`${iconButton} md:hidden`}
        >
          <FiSearch aria-hidden="true" />
        </Link>
        <Link href="/compose" aria-label="Tạo bài" className={primaryButton}>
          <FiPlus aria-hidden="true" />
          <span className="hidden sm:inline">Tạo bài</span>
        </Link>
        <ThemeToggle />
        <div className="hidden sm:block">
          <button type="button" aria-label="Thông báo" className={iconButton}>
            <FiBell aria-hidden="true" />
          </button>
        </div>
        <Suspense
          fallback={
            <div className="h-10 w-10 shrink-0 rounded-md border border-slate-200 dark:border-slate-800" />
          }
        >
          <HeaderAccount />
        </Suspense>
      </div>
    </header>
  );
}
