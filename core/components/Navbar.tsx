import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FiActivity,
  FiAward,
  FiCalendar,
  FiGrid,
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
import { NotificationBell } from "./NotificationBell.tsx";
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
  { to: "/manage", label: "Bảng điều khiển", Icon: FiGrid },
];

const LINK_BASE =
  "inline-flex min-h-[44px] items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-brand dark:focus-visible:outline-brand";

function desktopLinkClass(state: { isActive: boolean }): string {
  const tone = state.isActive
    ? "bg-brand text-zinc-950 dark:bg-brand dark:text-zinc-950"
    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 " +
      "dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100";
  return `${LINK_BASE} rounded-full px-3 ${tone}`;
}

function mobileLinkClass(state: { isActive: boolean }): string {
  const tone = state.isActive
    ? "bg-brand text-zinc-950 dark:bg-brand dark:text-zinc-950"
    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900";
  return `${LINK_BASE} w-full rounded-xl px-3 ${tone}`;
}

export function Navbar(): ReactElement {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
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
      if (event.key === "Escape" && open) {
        setOpen(false);
        menuTriggerRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-4 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr]"
      >
        <div className="flex min-w-0 items-center justify-start">
          <Link
            to="/"
            aria-label="AmigoACT - Trang chủ"
            className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:focus-visible:outline-brand"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand bg-brand text-zinc-950 dark:border-brand dark:bg-brand dark:text-zinc-950">
              <FiActivity className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="truncate text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
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
          {!profile && !session.isPending && (
            <Button
              to="/login"
              variant="primary"
              aria-label="Đăng nhập"
              icon={<FiLogIn className="h-4 w-4" aria-hidden="true" />}
            >
              <span className="hidden sm:inline">Đăng nhập</span>
            </Button>
          )}
          <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white p-1 md:contents dark:border-zinc-800 dark:bg-zinc-950">
            {profile && <NotificationBell userId={profile.id} />}
            <ThemeToggle />
            {profile ? (
              <AccountMenu />
            ) : (
              session.isPending && (
                <span className="h-11 w-11 rounded-full" aria-hidden="true" />
              )
            )}
            <span
              aria-hidden="true"
              className="h-6 w-px bg-zinc-200 md:hidden dark:bg-zinc-800"
            />
            <Button
              ref={menuTriggerRef}
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
        </div>
      </nav>

      {open && (
        <div
          id="primary-navigation"
          ref={panelRef}
          className="border-t border-zinc-200 bg-white md:hidden dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            <p className="px-3 pb-1 text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
              Điều hướng
            </p>
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
                <div
                  aria-hidden="true"
                  className="my-1 h-px bg-zinc-200 dark:bg-zinc-800"
                />
                <p className="px-3 pb-1 text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                  Tài khoản
                </p>
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
