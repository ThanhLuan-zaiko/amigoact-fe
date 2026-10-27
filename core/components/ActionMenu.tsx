import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import type { IconType } from "react-icons";
import { FiMoreHorizontal } from "react-icons/fi";
import { useDismiss } from "../dismiss.ts";
import { Button } from "./Button.tsx";
import { MenuItem } from "./MenuItem.tsx";

export interface MenuAction {
  key: string;
  label: string;
  Icon: IconType;
  // Destructive entries render red; pair them with a ConfirmDialog.
  danger?: boolean;
  onSelect: () => void;
}

interface ActionMenuProps {
  label: string;
  items: MenuAction[];
  open: boolean;
  busy?: boolean;
  // Last rows of a clipped list flip the panel upward.
  openUp?: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const MOVES: Record<string, (index: number, count: number) => number> = {
  ArrowDown: (index, count) => (index + 1) % count,
  ArrowUp: (index, count) => (index - 1 + count) % count,
  Home: () => 0,
  End: (_index, count) => count - 1,
};

// Overflow menu for a list row: icon trigger plus a bordered panel of menu
// items. Outside press and Escape go through useDismiss; opening focuses
// the first item, arrows/Home/End move focus, Tab dismisses, and picking an
// item returns focus to the trigger.
export function ActionMenu({
  label,
  items,
  open,
  busy = false,
  openUp = false,
  onToggle,
  onClose,
}: ActionMenuProps): ReactElement {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const returnFocus = useRef(false);
  // Latest onClose without re-running the open effect (it would steal
  // focus back to the first item on every parent render).
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useDismiss(open, rootRef, onClose, triggerRef);

  useEffect(() => {
    if (!open) {
      if (returnFocus.current) triggerRef.current?.focus();
      returnFocus.current = false;
      return undefined;
    }
    panelRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    function onKey(event: KeyboardEvent): void {
      if (event.key === "Tab") {
        closeRef.current();
        return;
      }
      const move = MOVES[event.key];
      const panel = panelRef.current;
      if (!move || !panel) return;
      const rows = Array.from(panel.querySelectorAll<HTMLElement>('[role="menuitem"]'));
      if (rows.length === 0) return;
      event.preventDefault();
      const current = rows.indexOf(document.activeElement as HTMLElement);
      rows[move(Math.max(current, 0), rows.length)]?.focus();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Hành động cho ${label}`}
        icon={<FiMoreHorizontal className="h-5 w-5" aria-hidden="true" />}
      />
      {open && (
        <div
          ref={panelRef}
          role="menu"
          aria-label={`Hành động cho ${label}`}
          className={`absolute right-0 z-20 w-56 rounded-xl border border-zinc-200 bg-white p-1.5 dark:border-zinc-800 dark:bg-zinc-950 ${
            openUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {items.map((item) => (
            <MenuItem
              key={item.key}
              disabled={busy}
              tone={item.danger ? "danger" : "default"}
              onClick={() => {
                returnFocus.current = true;
                item.onSelect();
              }}
              icon={<item.Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
            >
              {item.label}
            </MenuItem>
          ))}
        </div>
      )}
    </div>
  );
}
