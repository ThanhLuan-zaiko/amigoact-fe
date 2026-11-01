import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FiCompass,
  FiHome,
  FiMessageSquare,
  FiPlus,
  FiUser,
} from "react-icons/fi";

type MobileItem = {
  label: string;
  href: string;
  icon: IconType;
};

const mobileItems: MobileItem[] = [
  { label: "Trang chủ", href: "/", icon: FiHome },
  { label: "Khám phá", href: "/explore", icon: FiCompass },
  { label: "Tạo bài", href: "/compose", icon: FiPlus },
  { label: "Tin nhắn", href: "/messages", icon: FiMessageSquare },
  { label: "Hồ sơ", href: "/account", icon: FiUser },
];

type MobileNavProps = {
  activeHref: string;
};

export default function MobileNav({ activeHref }: MobileNavProps) {
  return (
    <nav
      aria-label="Điều hướng nhanh"
      className="fixed inset-x-0 bottom-0 z-10 flex h-16 items-center justify-around border-t border-slate-200 bg-white md:hidden dark:border-slate-800 dark:bg-slate-950"
    >
      {mobileItems.map(({ label, href, icon: Icon }) => {
        const active = href === activeHref;
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 px-3 text-xs font-semibold ${
              active
                ? "text-teal-700 dark:text-teal-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <Icon aria-hidden="true" className="text-lg" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
