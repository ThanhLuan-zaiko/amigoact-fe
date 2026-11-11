"use client";

import { type ReactNode, useId, useState, useTransition } from "react";
import type { FormState } from "@/lib/account";
import { purgeConfirmed } from "@/lib/posts";
import ConfirmDialog from "../ConfirmDialog";
import { iconButton, inputField } from "../ui";

type ConfirmActionProps = {
  action: () => Promise<FormState>;
  // The icon-only trigger button, named for screen readers and tooltips.
  label: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  // When set, the user must type this text again before the button unlocks.
  typeToConfirm?: string;
  className?: string;
};

// An icon button that asks first in a dialog, then runs a Server Action.
// Errors stay in the dialog. A successful action usually redirects or refreshes.
export default function ConfirmAction({
  action,
  label,
  icon,
  title,
  children,
  confirmLabel,
  typeToConfirm,
  className = iconButton,
}: ConfirmActionProps) {
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const locked =
    typeToConfirm !== undefined && !purgeConfirmed(typeToConfirm, typed);

  function close() {
    setOpen(false);
    setTyped("");
    setError(undefined);
  }

  function confirm() {
    startTransition(async () => {
      const state = await action();
      const failure = state.error ?? Object.values(state.fieldErrors ?? {})[0];
      if (failure) {
        setError(failure);
        return;
      }
      close();
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={() => setOpen(true)}
        className={className}
      >
        {icon}
      </button>
      <ConfirmDialog
        open={open}
        title={title}
        confirmLabel={pending ? "Đang xử lý…" : confirmLabel}
        confirmIcon={icon}
        pending={pending}
        confirmDisabled={locked}
        error={error}
        onConfirm={confirm}
        onClose={close}
      >
        {children}
        {typeToConfirm !== undefined ? (
          <label htmlFor={inputId} className="flex flex-col gap-1">
            <span>
              Gõ lại chính xác{" "}
              <strong className="break-words text-slate-900 dark:text-slate-100">
                {typeToConfirm}
              </strong>{" "}
              để xác nhận.
            </span>
            <input
              id={inputId}
              value={typed}
              onChange={(event) => setTyped(event.currentTarget.value)}
              autoComplete="off"
              className={inputField}
            />
          </label>
        ) : null}
      </ConfirmDialog>
    </>
  );
}
