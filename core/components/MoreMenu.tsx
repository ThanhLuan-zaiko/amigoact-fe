import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { useAdminStatus } from "../../admin/hooks.ts";
import { useSession } from "../../auth/hooks.ts";
import { useDismiss } from "../dismiss.ts";
import { expandPanel } from "../motion.ts";
import { ADMIN_LINK, MORE_LINKS } from "../nav.tsx";
import { RAIL_PILL, railLabelClass, railRowClass } from "../rail-styles.ts";
import { MENU_PANEL_CLASS, MenuDivider, MenuLink } from "./RailMenu.tsx";
import { ThemeToggle } from "./ThemeToggle.tsx";

// X "More": secondary destinations plus display settings in a popover
// that opens upward over the rail.
export function MoreMenu(): ReactElement {
  const session = useSession();
  const admin = useAdminStatus(session.data != null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = (): void => setOpen(false);

  useDismiss(open, rootRef, close, triggerRef);
  useEffect(() => {
    if (open && panelRef.current) expandPanel(panelRef.current);
  }, [open]);

  const links = MORE_LINKS.filter((entry) => session.data != null || !entry.auth);

  return (
    <div ref={rootRef} className={`relative ${railRowClass(false)}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Thêm"
        title="Thêm"
        className={`${RAIL_PILL} gap-5 p-3 xl:pr-5`}
      >
        <FiMoreHorizontal className="h-[26px] w-[26px]" aria-hidden="true" />
        <span className={`${railLabelClass(false)} text-xl`}>Thêm</span>
      </button>
      {open && (
        <div
          ref={panelRef}
          role="menu"
          aria-label="Thêm"
          className={`${MENU_PANEL_CLASS} bottom-full left-0 mb-2`}
        >
          {links.map(({ to, label, Icon }) => (
            <MenuLink key={to} to={to} Icon={Icon} label={label} onSelect={close} />
          ))}
          {admin.data?.is_admin && (
            <MenuLink
              to={ADMIN_LINK.to}
              Icon={ADMIN_LINK.Icon}
              label={ADMIN_LINK.label}
              onSelect={close}
            />
          )}
          <MenuDivider />
          <ThemeToggle labeled />
        </div>
      )}
    </div>
  );
}
