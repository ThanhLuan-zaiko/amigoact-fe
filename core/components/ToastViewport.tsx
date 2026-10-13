import { useEffect, useRef, useSyncExternalStore } from "react";
import type { ReactElement, ReactNode } from "react";
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import { riseIn } from "../motion.ts";
import {
  dismissToast,
  getToasts,
  subscribeToasts,
  type Toast,
  type ToastTone,
} from "../toast.ts";
import { Button } from "./Button.tsx";

const TONE_ICON: Record<ToastTone, ReactNode> = {
  success: (
    <FiCheckCircle
      className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
      aria-hidden="true"
    />
  ),
  error: (
    <FiAlertCircle
      className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400"
      aria-hidden="true"
    />
  ),
  info: (
    <FiInfo
      className="h-5 w-5 shrink-0 text-zinc-900 dark:text-brand"
      aria-hidden="true"
    />
  ),
};

const TONE_BORDER: Record<ToastTone, string> = {
  success: "border-emerald-300 dark:border-emerald-800",
  error: "border-red-300 dark:border-red-800",
  info: "border-brand/40 dark:border-brand/30",
};

function ToastCard({ toast }: { toast: Toast }): ReactElement {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (node) riseIn(node, { y: 8, duration: 200 });
    const timer = setTimeout(() => dismissToast(toast.id), toast.durationMs);
    return () => clearTimeout(timer);
  }, [toast.id, toast.durationMs]);

  return (
    <div
      ref={ref}
      role={toast.tone === "error" ? "alert" : "status"}
      className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border bg-white p-3 dark:bg-zinc-950 ${TONE_BORDER[toast.tone]}`}
    >
      {TONE_ICON[toast.tone]}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {toast.title}
        </p>
        {toast.message && (
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
            {toast.message}
          </p>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => dismissToast(toast.id)}
        aria-label="Đóng thông báo"
        icon={<FiX className="h-5 w-5" aria-hidden="true" />}
      />
    </div>
  );
}

// Single bottom-center toast region for the whole app; mounted once in
// PageShell so mutation and realtime toasts surface on every page.
export function ToastViewport(): ReactElement | null {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, getToasts);
  if (toasts.length === 0) return null;
  return (
    <div
      role="region"
      aria-label="Thông báo"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
