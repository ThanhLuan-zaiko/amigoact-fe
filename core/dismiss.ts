import { useEffect, type RefObject } from "react";

// Closes a popover on Escape (returning focus to its trigger) or on a
// pointer press that lands outside its root element.
export function useDismiss(
  open: boolean,
  root: RefObject<HTMLElement | null>,
  onClose: () => void,
  trigger?: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!open) return undefined;
    function onKey(event: KeyboardEvent): void {
      if (event.key !== "Escape") return;
      onClose();
      trigger?.current?.focus();
    }
    function onPointer(event: PointerEvent): void {
      if (root.current && !root.current.contains(event.target as Node)) {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open, root, onClose, trigger]);
}
