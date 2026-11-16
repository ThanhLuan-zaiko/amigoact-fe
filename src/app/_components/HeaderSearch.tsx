"use client";

import Form from "next/form";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { iconButton } from "./ui";

const HOME_PATH = "/";

// The home page's "Tổ chức" tab searches organizations. Every other page searches
// activities on the home page's "Hoạt động" tab. On one of those two tabs the
// header shows the words being searched.
function useSearchScope() {
  const pathname = usePathname();
  const tab = useSearchParams().get("tab");
  const onHome = pathname === HOME_PATH;
  return tab === "orgs" && onHome
    ? {
        tab: "orgs",
        label: "Tìm tổ chức",
        // Phones have no header input, so the link jumps to the one in the page.
        mobileHref: `${HOME_PATH}?tab=orgs#org-search`,
        showsQuery: true,
      }
    : {
        tab: "activities",
        label: "Tìm hoạt động, thành phố",
        mobileHref: `${HOME_PATH}?tab=activities#activity-search`,
        showsQuery: onHome && tab === "activities",
      };
}

export function HeaderSearchForm() {
  const { tab, label, showsQuery } = useSearchScope();
  const params = useSearchParams();
  // The activity tab reads an old ?city= link as its search, so the box shows it.
  const query =
    params.get("q") || (tab === "activities" ? params.get("city") : "") || "";
  const value = showsQuery ? query : "";
  return (
    <Form
      action={HOME_PATH}
      className="hidden h-10 max-w-xl flex-1 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm text-slate-500 transition-colors focus-within:border-teal-700 md:flex dark:border-slate-800 dark:focus-within:border-teal-400"
    >
      <FiSearch aria-hidden="true" className="shrink-0" />
      <input type="hidden" name="tab" value={tab} />
      <input
        key={`${tab}:${value}`}
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
