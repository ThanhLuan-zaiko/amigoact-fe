"use client";

import { type ReactNode, useActionState, useState } from "react";
import { FiAlertCircle, FiX } from "react-icons/fi";
import type { FormState } from "@/lib/account";
import { iconButton } from "../ui";

type ActionButtonProps = {
  action: () => Promise<FormState>;
  // The icon, plus text when the icon alone is not obvious.
  children: ReactNode;
  // Read by screen readers and shown as a tooltip.
  label: string;
  // When set, the first click asks for confirmation with this text.
  confirmLabel?: string;
  className?: string;
};

// One button that runs a Server Action and shows the error next to it.
export default function ActionButton({
  action,
  children,
  label,
  confirmLabel,
  className = iconButton,
}: ActionButtonProps) {
  const [state, formAction, pending] = useActionState<FormState>(action, {});
  const [confirming, setConfirming] = useState(false);
  const asksFirst = Boolean(confirmLabel) && !confirming;
  const error = state.error ?? Object.values(state.fieldErrors ?? {})[0];

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* The keys keep these as separate elements. If React reused one, the
            click that asks for confirmation would turn it into a submit button
            before the browser finishes the click, and the form would submit. */}
        {asksFirst ? (
          <button
            key="ask"
            type="button"
            aria-label={label}
            title={label}
            onClick={() => setConfirming(true)}
            className={className}
          >
            {children}
          </button>
        ) : confirmLabel ? (
          <button
            key="confirm"
            type="submit"
            disabled={pending}
            className="inline-flex h-10 shrink-0 items-center rounded-md border border-teal-700 px-3 text-sm font-semibold text-teal-700 transition-colors disabled:opacity-50 dark:border-teal-400 dark:text-teal-400"
          >
            {confirmLabel}
          </button>
        ) : (
          <button
            key="run"
            type="submit"
            disabled={pending}
            aria-label={label}
            title={label}
            className={`${className} disabled:opacity-50`}
          >
            {children}
          </button>
        )}
        {confirmLabel && confirming ? (
          <button
            type="button"
            aria-label="Hủy"
            title="Hủy"
            onClick={() => setConfirming(false)}
            className={iconButton}
          >
            <FiX aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {error ? (
        <p
          role="alert"
          className="flex items-start gap-1 text-xs font-semibold text-red-700 dark:text-red-400"
        >
          <FiAlertCircle aria-hidden="true" className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </form>
  );
}
