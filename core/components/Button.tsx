import { Link } from "react-router-dom";
import type { ButtonHTMLAttributes, ReactElement, ReactNode, Ref } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  to?: string;
  icon?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-blue-600 dark:focus-visible:outline-blue-400 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const SIZES: Record<ButtonSize, string> = {
  md: "min-h-[44px] rounded-lg px-4 py-2 text-sm",
  icon: "h-11 w-11 rounded-full text-sm",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 " +
    "dark:border-blue-400 dark:bg-blue-500 dark:text-zinc-950 dark:hover:bg-blue-400",
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
      <Link to={to} className={classes}>
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
