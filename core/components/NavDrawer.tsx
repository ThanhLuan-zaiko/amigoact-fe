import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiLogIn, FiLogOut, FiUserPlus } from "react-icons/fi";
import { useAdminStatus } from "../../admin/hooks.ts";
import { useLogout, useSession } from "../../auth/hooks.ts";
import { useUnreadCount } from "../../notifications/hooks.ts";
import { useChatUnreadTotal } from "../../workspace/hooks.ts";
import { expandPanel } from "../motion.ts";
import { activeEntry } from "../nav-meta.ts";
import {
  ADMIN_LINK,
  MORE_LINKS,
  PASSWORD_LINK,
  PRIMARY_LINKS,
} from "../nav.tsx";
import { RAIL_PILL } from "../rail-styles.ts";
import { Avatar } from "./Avatar.tsx";
import { Button } from "./Button.tsx";
import { RailNavItem } from "./RailNavItem.tsx";
import { ThemeToggle } from "./ThemeToggle.tsx";

// Phone navigation drawer (X slides it in from the avatar): identity,
// every destination with labels, secondary links and the theme switch.
export function NavDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}): ReactElement | null {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const session = useSession();
  const logout = useLogout();
  const profile = session.data ?? null;
  const signedIn = profile !== null;
  const admin = useAdminStatus(signedIn);
  const active = activeEntry(pathname, PRIMARY_LINKS);
  const unread = useUnreadCount(signedIn).data?.unread ?? 0;
  const chatUnread = useChatUnreadTotal(signedIn);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (panelRef.current) {
      expandPanel(panelRef.current);
      panelRef.current.focus({ preventScroll: true });
    }
    function onKey(event: KeyboardEvent): void {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previous?.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open) return null;

  const links = PRIMARY_LINKS.filter((entry) => signedIn || !entry.auth);
  const extras = [
    ...MORE_LINKS.filter((entry) => signedIn || !entry.auth),
    ...(admin.data?.is_admin ? [ADMIN_LINK] : []),
    ...(signedIn ? [PASSWORD_LINK] : []),
  ];

  async function handleLogout(): Promise<void> {
    onClose();
    await logout.mutateAsync();
    navigate("/", { replace: true });
  }

  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      <button
        type="button"
        aria-label="Đóng menu"
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/40 dark:bg-zinc-950/70"
      />
      <div
        ref={panelRef}
        id="app-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu điều hướng"
        tabIndex={-1}
        className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col overflow-y-auto border-r border-zinc-200 bg-white py-3 dark:border-zinc-800 dark:bg-zinc-950"
      >
        {profile ? (
          <div className="px-4 pb-3">
            <Avatar name={profile.full_name} src={profile.avatar_url} />
            <p className="mt-2 truncate text-[17px] font-bold text-zinc-900 dark:text-zinc-100">
              {profile.full_name}
            </p>
            <p className="truncate text-[15px] text-zinc-500 dark:text-zinc-400">
              {profile.email}
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            <Button
              to="/login"
              icon={<FiLogIn className="h-4 w-4" aria-hidden="true" />}
            >
              Đăng nhập
            </Button>
            <Button
              to="/register"
              variant="secondary"
              icon={<FiUserPlus className="h-4 w-4" aria-hidden="true" />}
            >
              Tạo tài khoản
            </Button>
          </div>
        )}
        <nav aria-label="Điều hướng chính" className="px-2">
          <ul className="flex flex-col gap-0.5">
            {links.map((entry) => (
              <li key={entry.to}>
                <RailNavItem
                  entry={entry}
                  expanded
                  active={entry === active}
                  count={
                    entry.badge === "notifications"
                      ? unread
                      : entry.badge === "chat"
                        ? chatUnread
                        : 0
                  }
                  onNavigate={onClose}
                />
              </li>
            ))}
          </ul>
        </nav>
        <div aria-hidden="true" className="mx-4 my-2 h-px bg-zinc-200 dark:bg-zinc-800" />
        <ul className="flex flex-col gap-0.5 px-2">
          {extras.map((entry) => (
            <li key={entry.to}>
              <RailNavItem
                entry={entry}
                compact
                expanded
                active={activeEntry(pathname, [entry]) !== null}
                onNavigate={onClose}
              />
            </li>
          ))}
          {signedIn && (
            <li>
              <button
                type="button"
                onClick={handleLogout}
                disabled={logout.isPending}
                className={`${RAIL_PILL} gap-4 px-3 py-2 pr-5 disabled:opacity-60`}
              >
                <FiLogOut className="h-5 w-5" aria-hidden="true" />
                <span className="text-[15px]">
                  {logout.isPending ? "Đang đăng xuất…" : "Đăng xuất"}
                </span>
              </button>
            </li>
          )}
        </ul>
        <div className="mt-auto px-2 pt-3">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
