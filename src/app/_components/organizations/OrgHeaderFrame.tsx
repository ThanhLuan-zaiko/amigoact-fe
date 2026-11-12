"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { initials } from "@/lib/organizations";
import { feedBackHref } from "@/lib/orgBack";
import { iconButton, panel } from "../ui";

type OrgHeaderFrameProps = {
  slug: string;
  name: string;
  logoUrl: string | null;
  // The full header with cover, stats, and navigation.
  children: ReactNode;
};

// Reading or writing a post needs the space more than the organization banner,
// so feed sub pages get one short row: back, logo, name.
export default function OrgHeaderFrame({
  slug,
  name,
  logoUrl,
  children,
}: OrgHeaderFrameProps) {
  const back = feedBackHref(usePathname(), slug);
  if (back === null) {
    return children;
  }
  return (
    <section className={`${panel} flex items-center gap-3 p-2 sm:p-3`}>
      <Link
        href={back}
        aria-label="Quay lại"
        title="Quay lại"
        className={iconButton}
      >
        <FiArrowLeft aria-hidden="true" />
      </Link>
      <Link
        href={`/organizations/${slug}`}
        className="flex min-w-0 items-center gap-3 hover:text-teal-700 dark:hover:text-teal-400"
      >
        {logoUrl ? (
          // biome-ignore lint/performance/noImgElement: the picture is a same-origin proxy path.
          <img
            src={logoUrl}
            alt=""
            className="h-9 w-9 shrink-0 rounded-md border border-slate-300 object-cover dark:border-slate-700"
          />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-300 text-sm font-extrabold dark:border-slate-700">
            {initials(name)}
          </span>
        )}
        <span className="truncate font-bold">{name}</span>
      </Link>
    </section>
  );
}
