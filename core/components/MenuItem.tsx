import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";

interface MenuItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "role"> {
  icon: ReactNode;
  // danger paints the row red (armed destructive confirm step).
  tone?: "default" | "danger";
}

const BASE =
  "flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-medium " +
  "transition-colors focus-visible:outline-2 focus-visible:outline-brand " +
  "dark:focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60";

const TONES: Record<NonNullable<MenuItemProps["tone"]>, string> = {
  default:
    "text-zinc-700 hover:bg-zinc-100 focus-visible:bg-zinc-100 " +
    "dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus-visible:bg-zinc-900",
  danger:
    "text-red-600 hover:bg-red-50 focus-visible:bg-red-50 " +
    "dark:text-red-400 dark:hover:bg-red-950 dark:focus-visible:bg-red-950",
};

// Row inside a role="menu" panel. tabIndex -1: the owning menu moves
// focus with the arrow keys (roving focus), Tab leaves the menu.
export function MenuItem({
  icon,
  tone = "default",
  className = "",
  type = "button",
  children,
  ...rest
}: MenuItemProps): ReactElement {
  return (
    <button
      type={type}
      role="menuitem"
      tabIndex={-1}
      className={`${BASE} ${TONES[tone]}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
