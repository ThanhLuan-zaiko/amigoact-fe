import type { ReactElement, ReactNode } from "react";
import { FiAlertTriangle, FiCheck, FiX } from "react-icons/fi";
import { Button } from "./Button.tsx";
import { Modal } from "./Modal.tsx";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  /** Shown on the confirm button while `busy`. */
  busyLabel?: string;
  cancelLabel?: string;
  /** Destructive confirm: warning icon + red-filled confirm button (see AGENTS.md, Design). */
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

// Shared confirm dialog for irreversible or risky actions. Built on Modal so
// portal/Esc/outside-press/focus-restore behave identically everywhere; the
// danger tone exists because Button has no red variant by design.
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  busyLabel,
  cancelLabel = "Hủy",
  danger = false,
  busy = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps): ReactElement {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="flex items-start gap-3">
        {danger && (
          <FiAlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400"
            aria-hidden="true"
          />
        )}
        <div className="text-sm text-zinc-600 dark:text-zinc-400">{message}</div>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={onClose}
          icon={<FiX className="h-4 w-4" aria-hidden="true" />}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={busy}
          onClick={onConfirm}
          className={
            danger
              ? "border-red-600 bg-red-600 text-white hover:bg-red-700 dark:border-red-400 dark:bg-red-400 dark:text-red-950 dark:hover:bg-red-300"
              : undefined
          }
          icon={
            danger ? (
              <FiAlertTriangle className="h-4 w-4" aria-hidden="true" />
            ) : (
              <FiCheck className="h-4 w-4" aria-hidden="true" />
            )
          }
        >
          {busy && busyLabel ? busyLabel : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
