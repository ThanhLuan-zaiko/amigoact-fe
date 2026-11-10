import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import type { FormState } from "@/lib/account";
import { primaryButton, sectionTitle } from "../ui";

type SubmitButtonProps = {
  icon: IconType;
  pending: boolean;
  children: ReactNode;
  className?: string;
  // Sent with the form when this button is pressed, so the action knows which one it was.
  name?: string;
  value?: string;
};

export function SubmitButton({
  icon: Icon,
  pending,
  children,
  className = primaryButton,
  name,
  value,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      className={`${className} disabled:opacity-50`}
    >
      <Icon aria-hidden="true" />
      {children}
    </button>
  );
}

// Sections are split by a divider, not by cards, so the form stays flat.
export function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-t border-slate-200 pt-6 first-of-type:border-t-0 first-of-type:pt-0 dark:border-slate-800">
      <h2 className={sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (state.error) {
    return (
      <p
        role="alert"
        className="flex items-start gap-2 rounded-md border border-red-200 p-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:text-red-400"
      >
        <FiAlertCircle aria-hidden="true" className="mt-0.5 shrink-0" />
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <output className="flex items-start gap-2 rounded-md border border-green-200 p-3 text-sm font-semibold text-green-700 dark:border-green-900 dark:text-green-400">
        <FiCheckCircle aria-hidden="true" className="mt-0.5 shrink-0" />
        {state.success}
      </output>
    );
  }
  return null;
}
