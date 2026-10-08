import type { ReactElement, ReactNode } from "react";

interface BentoCardProps {
  className?: string;
  children: ReactNode;
}

export function BentoCard({ className = "", children }: BentoCardProps): ReactElement {
  return (
    <section
      className={
        "rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 " +
        `dark:border-zinc-800 dark:bg-zinc-950${className ? ` ${className}` : ""}`
      }
    >
      {children}
    </section>
  );
}
