import { useEffect, useId, useRef } from "react";
import type { ReactElement, ReactNode } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { riseIn } from "../motion.ts";
import { Button } from "./Button.tsx";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Widen the panel from max-w-md to max-w-3xl for denser content. */
  wide?: boolean;
}

export function Modal({ open, title, onClose, children, wide = false }: ModalProps): ReactElement | null {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const downOnOverlay = useRef(false);

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

  // Portaled to <body>: the center column is a size container, which may
  // otherwise become the containing block of this fixed overlay.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      // Close on click, not mousedown: unmounting mid-gesture lets the release
      // hit a page element under the cursor. Both press and release must land
      // outside the panel (the backdrop covers the overlay, so comparing
      // against currentTarget never fires) - a drag out of the panel won't close.
      onMouseDown={(event) => {
        downOnOverlay.current = !panelRef.current?.contains(event.target as Node);
      }}
      onClick={(event) => {
        if (
          downOnOverlay.current &&
          !panelRef.current?.contains(event.target as Node)
        ) {
          onClose();
        }
      }}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-zinc-950/60" />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950 ${wide ? "max-w-3xl" : "max-w-md"}`}
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
            onClick={(event) => {
              event.preventDefault();
              onClose();
            }}
            aria-label="Đóng hộp thoại"
            icon={<FiX className="h-5 w-5" aria-hidden="true" />}
          />
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
