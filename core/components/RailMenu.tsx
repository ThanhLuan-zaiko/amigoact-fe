import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import type { IconType } from "react-icons";

// X-style popover rows: bold 15px text, full-row hover, inset focus ring.
export const MENU_ITEM_CLASS =
  "flex min-h-[44px] w-full items-center gap-3 px-4 py-3 text-left text-[15px] font-bold " +
  "text-zinc-900 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 " +
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand " +
  "dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus-visible:outline-brand";

export const MENU_PANEL_CLASS =
  "absolute z-50 w-72 overflow-hidden rounded-2xl border border-zinc-200 bg-white py-2 " +
  "dark:border-zinc-800 dark:bg-zinc-950";

export function MenuLink({
  to,
  Icon,
  label,
  onSelect,
}: {
  to: string;
  Icon: IconType;
  label: string;
  onSelect?: () => void;
}): ReactElement {
  return (
    <Link role="menuitem" to={to} onClick={onSelect} className={MENU_ITEM_CLASS}>
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      {label}
    </Link>
  );
}

export function MenuDivider(): ReactElement {
  return (
    <div aria-hidden="true" className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />
  );
}
