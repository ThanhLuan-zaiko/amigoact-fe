import type { ReactElement, ReactNode } from "react";

interface SectionProps {
  className?: string;
  children: ReactNode;
}

// Feed section: the only page-level surface. Sections stack edge to edge in
// the center column, separated by a bottom hairline (X timeline style) -
// no floating cards, no grid placement classes.
export function Section({ className = "", children }: SectionProps): ReactElement {
  return (
    <section
      className={
        "border-b border-zinc-200 px-4 py-4 dark:border-zinc-800" +
        `${className ? ` ${className}` : ""}`
      }
    >
      {children}
    </section>
  );
}
