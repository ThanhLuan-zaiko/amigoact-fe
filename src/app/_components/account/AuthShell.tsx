import type { ReactNode } from "react";
import { mutedText, panel } from "../ui";

type AuthShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

// Auth content inside the shared app shell, which already provides the header and navigation.
export default function AuthShell({
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {description ? <p className={mutedText}>{description}</p> : null}
      </div>
      <div className={`${panel} p-5 sm:p-6`}>{children}</div>
    </div>
  );
}
