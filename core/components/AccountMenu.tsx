import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";import { FiKey, FiLogOut, FiUser } from "react-icons/fi";
import { expandPanel } from "../motion.ts";
import { Button } from "./Button.tsx";
import { useLogout, useSession } from "../../auth/hooks.ts";

function initialOf(name: string): string {
  const first = name.trim().charAt(0);
  return first ? first.toUpperCase() : "?";
}

export function AccountMenu(): ReactElement | null {
  const session = useSession();
  const logout = useLogout();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const profile = session.data ?? null;

  useEffect(() => {
    if (open && panelRef.current) expandPanel(panelRef.current);
  }, [open]);

  useEffect(() => {
    function onKey(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    function onPointer(event: PointerEvent): void {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      window.addEventListener("keydown", onKey);
      window.addEventListener("pointerdown", onPointer);
      return () => {
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("pointerdown", onPointer);
      };
    }
    return undefined;
  }, [open]);

  if (session.isPending || !profile) return null;

  async function handleLogout(): Promise<void> {
    setOpen(false);
    await logout.mutateAsync();
    navigate("/", { replace: true });
  }

  const itemClass =
    "flex min-h-[44px] w-full items-center gap-2 rounded-xl px-3 text-sm font-medium " +
    "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "focus-visible:outline-blue-600 dark:focus-visible:outline-blue-400";

  return (
    <div className="relative" ref={panelRef}>
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Tài khoản của ${profile.full_name}`}
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
        >
          {initialOf(profile.full_name)}
        </span>
      </Button>
      {open && (
        <div
          role="menu"
          aria-label="Menu tài khoản"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <p className="truncate px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
            {profile.full_name}
          </p>
          <Link
            role="menuitem"
            to="/profile"
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            <FiUser className="h-4 w-4" aria-hidden="true" />
            Hồ sơ
          </Link>
          <Link
            role="menuitem"
            to="/change-password"
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            <FiKey className="h-4 w-4" aria-hidden="true" />
            Đổi mật khẩu
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={handleLogout}
            disabled={logout.isPending}
            className={itemClass}
          >
            <FiLogOut className="h-4 w-4" aria-hidden="true" />
            {logout.isPending ? "Đang đăng xuất…" : "Đăng xuất"}
          </button>
        </div>
      )}
    </div>
  );
}
