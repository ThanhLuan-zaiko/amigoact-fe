"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiLogOut, FiUser } from "react-icons/fi";

type AccountMenuProps = {
  name: string;
  logoutAction: () => Promise<void>;
};

const menuItem =
  "flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-teal-700 dark:text-slate-300 dark:hover:text-teal-400 dark:focus-visible:outline-teal-400";

export default function AccountMenu({ name, logoutAction }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close the menu on a click outside it or on Escape.
  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Tài khoản của ${name}`}
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors hover:border-teal-700 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:text-teal-400 dark:focus-visible:outline-teal-400"
      >
        <FiUser aria-hidden="true" />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-20 mt-2 flex w-56 flex-col overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <p className="truncate border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-slate-100">
            {name}
          </p>
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className={`${menuItem} border-b border-slate-200 dark:border-slate-800`}
          >
            <FiUser aria-hidden="true" />
            Tài khoản
          </Link>
          <form action={logoutAction}>
            <button type="submit" className={menuItem}>
              <FiLogOut aria-hidden="true" />
              Đăng xuất
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
