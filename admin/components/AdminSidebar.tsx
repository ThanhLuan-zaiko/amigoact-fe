import type { ReactElement } from "react";
import { NavLink } from "react-router-dom";
import type { IconType } from "react-icons";
import { FiCheckSquare, FiShield, FiUsers } from "react-icons/fi";
import { Section } from "../../core/components/Section.tsx";

interface AdminEntry {
  to: string;
  label: string;
  Icon: IconType;
}

const ENTRIES: AdminEntry[] = [
  { to: "/admin/orgs", label: "Xác minh tổ chức", Icon: FiCheckSquare },
  { to: "/admin/admins", label: "Quản trị viên", Icon: FiUsers },
];

const BASE =
  "inline-flex min-h-[44px] w-full items-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400";

function itemClass(isActive: boolean): string {
  if (isActive) {
    return `${BASE} bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950`;
  }
  return (
    `${BASE} text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 ` +
    "dark:hover:bg-zinc-900"
  );
}

export function AdminSidebar(): ReactElement {
  return (
    <Section className="w-full shrink-0 @4xl:sticky @4xl:top-20 @4xl:w-64">
      <div className="flex items-center gap-2">
        <FiShield
          className="h-5 w-5 text-zinc-900 dark:text-zinc-100"
          aria-hidden="true"
        />
        <div>
          <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
            Quản trị nền tảng
          </p>
          <h2 className="mt-1 text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            Ban quản trị
          </h2>
        </div>
      </div>
      <nav aria-label="Điều hướng quản trị" className="mt-4 flex flex-col gap-1">
        {ENTRIES.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} end className={({ isActive }) => itemClass(isActive)}>
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </Section>
  );
}
