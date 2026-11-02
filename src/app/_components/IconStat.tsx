import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { mutedText } from "./ui";

type IconStatProps = {
  icon: IconType;
  // Read by screen readers and shown as a tooltip, since the icon replaces the word.
  label: string;
  children: ReactNode;
};

export default function IconStat({
  icon: Icon,
  label,
  children,
}: IconStatProps) {
  return (
    <span
      title={label}
      className={`${mutedText} inline-flex min-w-0 items-center gap-1.5`}
    >
      <Icon aria-hidden="true" className="shrink-0" />
      <span className="sr-only">{label}: </span>
      <span className="min-w-0 break-words">{children}</span>
    </span>
  );
}
