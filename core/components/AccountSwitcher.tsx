import { useRef, useState } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { FiKey, FiLogOut, FiMoreHorizontal, FiUser } from "react-icons/fi";
import { useLogout, useSession } from "../../auth/hooks.ts";
import { useDismiss } from "../dismiss.ts";
import { Avatar } from "./Avatar.tsx";
import {
  MENU_ITEM_CLASS,
  MENU_PANEL_CLASS,
  MenuDivider,
  MenuLink,
} from "./RailMenu.tsx";

// X account switcher pinned to the bottom of the rail: avatar, name and
// handle (email) with a popover for profile, password and sign-out.
export function AccountSwitcher(): ReactElement | null {
  const session = useSession();
  const logout = useLogout();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = (): void => setOpen(false);

  useDismiss(open, rootRef, close, triggerRef);

  const profile = session.data ?? null;
  if (!profile) return null;

  async function handleLogout(): Promise<void> {
    close();
    await logout.mutateAsync();
    navigate("/", { replace: true });
  }

  return (
    <div ref={rootRef} className="relative my-3 flex justify-center xl:block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Tài khoản của ${profile.full_name}`}
        className="flex items-center gap-3 rounded-full p-3 text-left transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 xl:w-full dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400"
      >
        <Avatar name={profile.full_name} src={profile.avatar_url} />
        <span className="hidden min-w-0 flex-1 xl:block">
          <span className="block truncate text-[15px] font-bold text-zinc-900 dark:text-zinc-100">
            {profile.full_name}
          </span>
          <span className="block truncate text-[15px] text-zinc-500 dark:text-zinc-400">
            {profile.email}
          </span>
        </span>
        <FiMoreHorizontal
          className="hidden h-5 w-5 shrink-0 text-zinc-900 xl:block dark:text-zinc-100"
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Menu tài khoản"
          className={`${MENU_PANEL_CLASS} bottom-full left-0 mb-2`}
        >
          <MenuLink to="/profile" Icon={FiUser} label="Hồ sơ" onSelect={close} />
          <MenuLink
            to="/change-password"
            Icon={FiKey}
            label="Đổi mật khẩu"
            onSelect={close}
          />
          <MenuDivider />
          <button
            role="menuitem"
            type="button"
            onClick={handleLogout}
            disabled={logout.isPending}
            className={MENU_ITEM_CLASS}
          >
            <FiLogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {logout.isPending
                ? "Đang đăng xuất…"
                : `Đăng xuất ${profile.full_name}`}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
