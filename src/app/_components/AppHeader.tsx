import Link from "next/link";
import { Suspense } from "react";
import { FiBell, FiPlus, FiSearch } from "react-icons/fi";
import HeaderAccount from "./account/HeaderAccount";
import ThemeToggle from "./ThemeToggle";
import { iconButton, primaryButton } from "./ui";

export default function AppHeader() {
  return (
    <header className="flex h-16 items-center gap-3 border-b border-slate-200 px-4 sm:px-6 md:gap-6 dark:border-slate-800">
      <Link
        href="/"
        className="text-xl font-extrabold tracking-tight text-teal-700 dark:text-teal-400"
      >
        AmigoACT
      </Link>

      <label className="hidden h-10 max-w-xl flex-1 items-center gap-2 border border-slate-200 px-4 text-sm text-slate-500 focus-within:border-teal-700 md:flex dark:border-slate-800 dark:focus-within:border-teal-400">
        <FiSearch aria-hidden="true" className="shrink-0" />
        <input
          type="search"
          placeholder="Tìm hoạt động, tổ chức, bài viết"
          className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-500 dark:text-slate-100"
        />
      </label>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="Tìm kiếm"
          className={`${iconButton} md:hidden`}
        >
          <FiSearch aria-hidden="true" />
        </button>
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
            <div className="h-10 w-10 shrink-0 border border-slate-200 dark:border-slate-800" />
          }
        >
          <HeaderAccount />
        </Suspense>
      </div>
    </header>
  );
}
