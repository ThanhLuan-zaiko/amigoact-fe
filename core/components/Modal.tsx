import { useEffect, useId, useRef } from "react";
import type { ReactElement, ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { riseIn } from "../motion.ts";
import { Button } from "./Button.tsx";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps): ReactElement | null {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    if (panel) {
      riseIn(panel, { y: 12, duration: 220 });
      panel.focus({ preventScroll: true });
    }
    function onKey(event: KeyboardEvent): void {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prev?.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-zinc-950/60" />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex items-center justify-between gap-2">
          <h3
            id={titleId}
            className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100"
          >
            {title}
          </h3>
          <Button
            ref={closeRef}
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            icon={<FiX className="h-5 w-5" aria-hidden="true" />}
          />
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
