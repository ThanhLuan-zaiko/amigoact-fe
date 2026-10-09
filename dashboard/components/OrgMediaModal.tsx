import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { FiX } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import type { DashboardOrg } from "../api.ts";
import { MediaDropzone } from "./MediaDropzone.tsx";

interface OrgMediaModalProps {
  org: DashboardOrg;
  canManage: boolean;
  onClose: () => void;
}

export function OrgMediaModal({ org, canManage, onClose }: OrgMediaModalProps): ReactElement {
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    restoreRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    // Lock background scroll while the dialog is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent): void {
      if (event.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      restoreRef.current?.focus();
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Tệp của ${org.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 sm:p-6"
      onClick={() => onCloseRef.current()}
    >
      {/* Capped dialog stays put; only the library pane below scrolls. */}
      <div
        className="flex max-h-[calc(100dvh-2rem)] w-full min-w-0 max-w-3xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 sm:max-h-[calc(100dvh-3rem)] sm:p-6 dark:border-zinc-800 dark:bg-zinc-950"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
              {`Tệp của ${org.name}`}
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">@{org.slug}</p>
          </div>
          <Button
            ref={closeRef}
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => onCloseRef.current()}
            aria-label="Đóng"
            className="shrink-0"
            icon={<FiX className="h-4 w-4" aria-hidden="true" />}
          />
        </div>
        <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
          <MediaDropzone orgId={org.id} canManage={canManage} />
        </div>
      </div>
    </div>
  );
}
