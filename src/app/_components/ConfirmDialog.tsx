"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";
import { dangerButton, mutedText, secondaryButton, sectionTitle } from "./ui";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  confirmIcon?: ReactNode;
  pending?: boolean;
  // Lets the dialog hold the confirm button until a condition, such as a typed name, holds.
  confirmDisabled?: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
};

// A native modal dialog. The browser traps focus, closes on Escape and dims the page.
// The confirm button is red, so use it only for actions that cannot be undone.
export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  confirmIcon,
  pending = false,
  confirmDisabled = false,
  error,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-slate-200 bg-white p-0 text-slate-900 shadow-sm backdrop:bg-slate-900/50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
    >
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <h2 id={titleId} className={sectionTitle}>
          {title}
        </h2>
        <div className={`${mutedText} flex flex-col gap-2`}>{children}</div>
        {error ? (
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onClose} className={secondaryButton}>
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending || confirmDisabled}
            className={dangerButton}
          >
            {confirmIcon}
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
