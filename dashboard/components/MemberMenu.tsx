import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import type { IconType } from "react-icons";
import { FiMoreHorizontal } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { MenuItem } from "../../core/components/MenuItem.tsx";

export interface MenuAction {
  key: string;
  label: string;
  Icon: IconType;
  danger?: boolean;
  // Armed entries show the second-press confirm state (destructive flow).
  armed?: boolean;
  onSelect: () => void;
}

interface MemberMenuProps {
  label: string;
  items: MenuAction[];
  open: boolean;
  busy?: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const MOVES: Record<string, (index: number, count: number) => number> = {
  ArrowDown: (index, count) => (index + 1) % count,
  ArrowUp: (index, count) => (index - 1 + count) % count,
  Home: () => 0,
  End: (_index, count) => count - 1,
};

// Overflow menu for a member row: icon trigger plus a bordered panel of
// menu items. Opening focuses the first item; arrows/Home/End move focus,
// Escape or picking an item returns focus to the trigger, an outside
// press or Tab simply dismisses it.
export function MemberMenu({
  label,
  items,
  open,
  busy = false,
  onToggle,
  onClose,
}: MemberMenuProps): ReactElement {
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

  useEffect(() => {
    if (!open) {
      if (returnFocus.current) triggerRef.current?.focus();
      returnFocus.current = false;
      return undefined;
    }
    panelRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    function onPointerDown(event: MouseEvent): void {
      if (rootRef.current?.contains(event.target as Node)) return;
      returnFocus.current = false;
      closeRef.current();
    }
    function onKey(event: KeyboardEvent): void {
      if (event.key === "Escape" || event.key === "Tab") {
        returnFocus.current = event.key === "Escape";
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
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
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
          className="absolute top-full right-0 z-20 mt-1 w-56 rounded-xl border border-zinc-200 bg-white p-1.5 dark:border-zinc-800 dark:bg-zinc-950"
        >
          {items.map((item) => (
            <MenuItem
              key={item.key}
              disabled={busy}
              tone={item.armed ? "danger" : "default"}
              onClick={() => {
                returnFocus.current = true;
                item.onSelect();
              }}
              icon={
                <item.Icon
                  className={
                    item.danger
                      ? "h-4 w-4 shrink-0 text-red-600 dark:text-red-400"
                      : "h-4 w-4 shrink-0"
                  }
                  aria-hidden="true"
                />
              }
            >
              {item.label}
            </MenuItem>
          ))}
        </div>
      )}
    </div>
  );
}
