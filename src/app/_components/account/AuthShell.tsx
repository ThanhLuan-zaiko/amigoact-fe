import type { ReactNode } from "react";
import AppHeader from "../AppHeader";
import { mutedText } from "../ui";

type AuthShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function AuthShell({
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-4 sm:p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold">{title}</h1>
          {description ? <p className={mutedText}>{description}</p> : null}
        </div>
        {children}
      </main>
    </>
  );
}
