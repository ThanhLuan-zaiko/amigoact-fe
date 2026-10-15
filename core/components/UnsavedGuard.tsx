import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { FiAlertTriangle, FiLogOut, FiX } from "react-icons/fi";
import { Button } from "./Button.tsx";

type PendingLeave = { kind: "link"; href: string } | { kind: "back" };

// Unsaved-changes guard for long forms. The browser's own beforeunload
// dialog covers reload/tab-close and same-tab external navigation; in-app
// navigation is intercepted here because the app uses <BrowserRouter>
// (useBlocker needs a data router). Internal <a> clicks are cancelled in
// the capture phase before React Router's handler runs, and history Back
// is absorbed by a same-URL sentinel entry pushed while the guard is on.
// Both paths ask through the dialog below before leaving.
export function UnsavedGuard({
  active,
}: {
  active: boolean;
}): ReactElement | null {
  const navigate = useNavigate();
  const [pending, setPending] = useState<PendingLeave | null>(null);
  const leavingRef = useRef(false);
  const mountedRef = useRef(true);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Reload, tab/browser close, and same-tab external navigation.
  useEffect(() => {
    if (!active) return undefined;
    function onBeforeUnload(event: BeforeUnloadEvent): void {
      event.preventDefault();
      // Legacy Chrome only fires the prompt when returnValue is set.
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [active]);

  // Internal link clicks: cancelled before React Router's own handler.
  useEffect(() => {
    if (!active) return undefined;
    function onClick(event: MouseEvent): void {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const anchor = (event.target as HTMLElement | null)?.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href.startsWith("/") && !href.startsWith("?")) return;
      event.preventDefault();
      event.stopPropagation();
      setPending({ kind: "link", href });
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [active]);

  // Back/Forward: a same-URL sentinel absorbs the pop so the real entry is
  // never left silently; choosing "stay" pushes a fresh sentinel.
  useEffect(() => {
    if (!active) return undefined;
    window.history.pushState(null, "", window.location.href);
    function onPop(): void {
      if (!leavingRef.current) setPending({ kind: "back" });
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [active]);

  // Dialog chrome: Esc dismisses (stays), focus moves into the panel and
  // back to the trigger on close - same contract as the drawer/popovers.
  useEffect(() => {
    if (pending === null) return undefined;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus({ preventScroll: true });
    function onKey(event: KeyboardEvent): void {
      if (event.key === "Escape") stay();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending !== null]);

  function stay(): void {
    if (pending?.kind === "back") {
      window.history.pushState(null, "", window.location.href);
    }
    setPending(null);
  }

  function leave(): void {
    const target = pending;
    setPending(null);
    if (target?.kind === "back") {
      // Swallow our own popstate; if no real entry exists to go back to,
      // re-arm the sentinel so the guard keeps working on this page.
      leavingRef.current = true;
      window.history.back();
      window.setTimeout(() => {
        if (!mountedRef.current) return;
        leavingRef.current = false;
        window.history.pushState(null, "", window.location.href);
      }, 400);
    } else if (target) {
      navigate(target.href);
    }
  }

  if (pending === null) return null;

  // Portaled to <body> per AGENTS.md section 5.6: the center column is a size container.
  return createPortal(
    <div
      role="presentation"
      onClick={stay}
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 dark:bg-zinc-950/70"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Chưa lưu thay đổi"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-4 focus-visible:outline-none dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex items-center gap-2">
          <FiAlertTriangle
            className="h-5 w-5 text-zinc-900 dark:text-zinc-100"
            aria-hidden="true"
          />
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Chưa lưu thay đổi
          </h2>
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Dữ liệu bạn đang nhập sẽ mất nếu rời trang này. Bạn có chắc muốn rời
          đi không?
        </p>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={stay}
            icon={<FiX className="h-4 w-4" aria-hidden="true" />}
          >
            Ở lại
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={leave}
            icon={<FiLogOut className="h-4 w-4" aria-hidden="true" />}
          >
            Rời trang
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
