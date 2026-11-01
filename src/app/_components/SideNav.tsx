import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FiCalendar,
  FiCompass,
  FiHome,
  FiMessageSquare,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import type { Organization } from "./types";

type NavItem = {
  label: string;
  href: string;
  icon: IconType;
};

const navItems: NavItem[] = [
  { label: "Trang chủ", href: "/", icon: FiHome },
  { label: "Khám phá", href: "/explore", icon: FiCompass },
  { label: "Hoạt động", href: "/activities", icon: FiCalendar },
  { label: "Tổ chức của tôi", href: "/organizations", icon: FiUsers },
  { label: "Tin nhắn", href: "/messages", icon: FiMessageSquare },
  { label: "Hồ sơ", href: "/profile", icon: FiUser },
];

type SideNavProps = {
  activeHref: string;
  joinedOrganizations: Pick<Organization, "id" | "name">[];
};

export default function SideNav({
  activeHref,
  joinedOrganizations,
}: SideNavProps) {
  return (
    <nav aria-label="Điều hướng chính" className="flex flex-col text-[15px]">
      {navItems.map(({ label, href, icon: Icon }) => {
        const active = href === activeHref;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 border-l-[3px] px-3 py-2.5 ${
              active
                ? "border-teal-700 font-bold text-teal-700 dark:border-teal-400 dark:text-teal-400"
                : "border-transparent text-slate-700 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-400"
            }`}
          >
            <Icon aria-hidden="true" className="shrink-0" />
            {label}
          </Link>
        );
      })}

      <h2 className="mt-6 border-b border-slate-200 px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Tổ chức đã tham gia
      </h2>
      {joinedOrganizations.length === 0 ? (
        <p className="px-3 pt-2 text-sm text-slate-500 dark:text-slate-400">
          Chưa tham gia tổ chức nào.
        </p>
      ) : (
        <ul className="flex flex-col">
          {joinedOrganizations.map((organization) => (
            <li key={organization.id}>
              <Link
                href={`/organizations/${organization.id}`}
                className="block px-3 py-2 text-sm text-slate-700 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-400"
              >
                {organization.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
