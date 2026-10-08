import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FiActivity,
  FiAward,
  FiCalendar,
  FiHome,
  FiKey,
  FiLogIn,
  FiLogOut,
  FiMenu,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { expandPanel } from "../motion.ts";
import { useLogout, useSession } from "../../auth/hooks.ts";
import { AccountMenu } from "./AccountMenu.tsx";
import { Button } from "./Button.tsx";
import { ThemeToggle } from "./ThemeToggle.tsx";

interface NavEntry {
  to: string;
  label: string;
  Icon: IconType;
  end?: boolean;
}

const NAV_LINKS: NavEntry[] = [
  { to: "/", label: "Trang chủ", Icon: FiHome, end: true },
  { to: "/events", label: "Sự kiện", Icon: FiCalendar },
  { to: "/orgs", label: "Tổ chức", Icon: FiUsers },
  { to: "/leaderboard", label: "Bảng xếp hạng", Icon: FiAward },
];

const LINK_BASE =
  "inline-flex min-h-[44px] items-center gap-2 text-sm font-medium transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-blue-600 dark:focus-visible:outline-blue-400";

function desktopLinkClass(state: { isActive: boolean }): string {
  const tone = state.isActive
    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 " +
      "dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100";
  return `${LINK_BASE} rounded-full px-3 ${tone}`;
}

function mobileLinkClass(state: { isActive: boolean }): string {
  const tone = state.isActive
    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900";
  return `${LINK_BASE} w-full rounded-xl px-3 ${tone}`;
}

export function Navbar(): ReactElement {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const session = useSession();
  const logout = useLogout();
  const navigate = useNavigate();
  const profile = session.data ?? null;

  // Animate the mobile panel on open; content stays visible without motion.
  useEffect(() => {
    if (open && panelRef.current) expandPanel(panelRef.current);
  }, [open]);

  useEffect(() => {
    function onKey(event: KeyboardEvent): void {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const menuLabel = open ? "Đóng menu" : "Mở menu";
  const MenuIcon = open ? FiX : FiMenu;

  async function handleMobileLogout(): Promise<void> {
    setOpen(false);
    await logout.mutateAsync();
    navigate("/", { replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <nav
        aria-label="Điều hướng chính"
        className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:px-6"
      >
        <div className="flex items-center justify-start">
          <Link
            to="/"
            aria-label="AmigoACT - Trang chủ"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-400"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400">
              <FiActivity className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              AmigoACT
            </span>
          </Link>
        </div>

        <div className="hidden items-center justify-center gap-1 md:flex">
          {NAV_LINKS.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={desktopLinkClass}>
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2">
          <ThemeToggle />
          {profile ? (
            <AccountMenu />
          ) : session.isPending ? (
            <span className="h-11 w-11" aria-hidden="true" />
          ) : (
            <Button
              to="/login"
              variant="primary"
              aria-label="Đăng nhập"
              icon={<FiLogIn className="h-4 w-4" aria-hidden="true" />}
            >
              <span className="hidden sm:inline">Đăng nhập</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="primary-navigation"
            aria-label={menuLabel}
          >
            <MenuIcon className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </nav>

      {open && (
        <div
          id="primary-navigation"
          ref={panelRef}
          className="border-t border-zinc-200 bg-white md:hidden dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            {NAV_LINKS.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={mobileLinkClass}
                onClick={() => setOpen(false)}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
            {profile && (
              <>
                <NavLink
                  to="/profile"
                  className={mobileLinkClass}
                  onClick={() => setOpen(false)}
                >
                  <FiUser className="h-5 w-5" aria-hidden="true" />
                  Hồ sơ
                </NavLink>
                <NavLink
                  to="/change-password"
                  className={mobileLinkClass}
                  onClick={() => setOpen(false)}
                >
                  <FiKey className="h-5 w-5" aria-hidden="true" />
                  Đổi mật khẩu
                </NavLink>
                <button
                  type="button"
                  onClick={handleMobileLogout}
                  disabled={logout.isPending}
                  className={`${mobileLinkClass({ isActive: false })} w-full`}
                >
                  <FiLogOut className="h-5 w-5" aria-hidden="true" />
                  {logout.isPending ? "Đang đăng xuất…" : "Đăng xuất"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
