"use client";

import Form from "next/form";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { iconButton } from "./ui";

const ORGANIZATIONS_PATH = "/organizations";

// The organizations page searches organizations. Every other page searches activities.
function useSearchScope() {
  const isOrganizations = usePathname() === ORGANIZATIONS_PATH;
  return isOrganizations
    ? {
        action: ORGANIZATIONS_PATH,
        label: "Tìm tổ chức",
        // Phones have no header input, so the link jumps to the one in the page.
        mobileHref: `${ORGANIZATIONS_PATH}#org-search`,
        isOrganizations,
      }
    : {
        action: "/explore",
        label: "Tìm hoạt động",
        mobileHref: "/explore",
        isOrganizations,
      };
}

export function HeaderSearchForm() {
  const { action, label, isOrganizations } = useSearchScope();
  const query = useSearchParams().get("q") ?? "";
  const value = isOrganizations ? query : "";
  return (
    <Form
      action={action}
      className="hidden h-10 max-w-xl flex-1 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm text-slate-500 transition-colors focus-within:border-teal-700 md:flex dark:border-slate-800 dark:focus-within:border-teal-400"
    >
      <FiSearch aria-hidden="true" className="shrink-0" />
      <input
        key={`${action}:${value}`}
        type="search"
        name="q"
        defaultValue={value}
        maxLength={100}
        aria-label={label}
        placeholder={label}
        className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-500 dark:text-slate-100"
      />
    </Form>
  );
}

export function HeaderSearchLink() {
  const { label, mobileHref } = useSearchScope();
  return (
    <Link
      href={mobileHref}
      aria-label={label}
      title={label}
      className={`${iconButton} md:hidden`}
    >
      <FiSearch aria-hidden="true" />
    </Link>
  );
}
