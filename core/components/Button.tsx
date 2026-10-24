import { Link } from "react-router-dom";
import type { ButtonHTMLAttributes, ReactElement, ReactNode, Ref } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "icon" | "cell";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  to?: string;
  icon?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const SIZES: Record<ButtonSize, string> = {
  md: "min-h-[44px] rounded-full px-4 py-2 text-sm",
  icon: "h-11 w-11 rounded-full text-sm",
  // Dense day cells in the rail calendar; the drawer keeps 44px targets.
  cell: "h-9 w-9 rounded-full text-xs",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 " +
    "dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200",
  secondary:
    "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 " +
    "dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900",
  ghost:
    "border border-transparent text-zinc-700 hover:bg-zinc-100 " +
    "dark:text-zinc-200 dark:hover:bg-zinc-900",
};

export function Button({
  variant = "primary",
  size = "md",
  to,
  icon,
  className = "",
  children,
  type = "button",
  ref,
  ...rest
}: ButtonProps): ReactElement {
  const classes = `${BASE} ${SIZES[size]} ${VARIANTS[variant]}${className ? ` ${className}` : ""}`;
  const content = (
    <>
      {icon}
      {children}
    </>
  );
  if (to !== undefined) {
    return (
      <Link
        to={to}
        className={classes}
        aria-label={rest["aria-label"]}
        title={rest.title}
      >
        {content}
      </Link>
    );
  }
  return (
    <button type={type} ref={ref} className={classes} {...rest}>
      {content}
    </button>
  );
}
