import type { ReactElement } from "react";
import { FiLock } from "react-icons/fi";
import { PERMISSION_GROUPS } from "../permission-catalog.tsx";
import { permissionLabel } from "../messages-roles.tsx";

interface PermissionPickerProps {
  // Codes the backend lets a custom role carry.
  assignable: string[];
  selected: string[];
  // Codes the viewer may not wire (delegation subset rule).
  isLocked: (code: string) => boolean;
  onChange: (next: string[]) => void;
  // Shown on locked rows; the default fits the delegation rule.
  lockedNote?: string;
}

const ROW =
  "flex min-h-[44px] items-center gap-3 px-3 py-2 " +
  "has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 " +
  "has-[:focus-visible]:outline-zinc-500 dark:has-[:focus-visible]:outline-zinc-400";

const CHECK = "h-4 w-4 shrink-0 accent-zinc-900 dark:accent-zinc-100";

// Permission checklist grouped by area. Each group has a select-all box that
// only touches codes the viewer may grant; locked rows say why.
export function PermissionPicker({
  assignable,
  selected,
  isLocked,
  onChange,
  lockedNote = "Bạn chưa có quyền này",
}: PermissionPickerProps): ReactElement {
  const groups = PERMISSION_GROUPS.map((group) => ({
    label: group.label,
    codes: group.codes.filter((code) => assignable.includes(code)),
  })).filter((group) => group.codes.length > 0);

  function toggle(code: string): void {
    onChange(
      selected.includes(code)
        ? selected.filter((item) => item !== code)
        : [...selected, code],
    );
  }

  function toggleGroup(codes: string[], allOn: boolean): void {
    const free = codes.filter((code) => !isLocked(code));
    onChange(
      allOn
        ? selected.filter((code) => !free.includes(code))
        : Array.from(new Set([...selected, ...free])),
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => {
        const free = group.codes.filter((code) => !isLocked(code));
        const picked = free.filter((code) => selected.includes(code)).length;
        const allOn = free.length > 0 && picked === free.length;
        return (
          <div key={group.label} role="group" aria-label={group.label}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {group.label}
              </p>
              <label className="flex min-h-[32px] cursor-pointer items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <input
                  type="checkbox"
                  className={CHECK}
                  checked={allOn}
                  disabled={free.length === 0}
                  ref={(el) => {
                    if (el) el.indeterminate = picked > 0 && !allOn;
                  }}
                  onChange={() => toggleGroup(group.codes, allOn)}
                />
                Chọn cả nhóm
              </label>
            </div>
            <div className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {group.codes.map((code) => {
                const locked = isLocked(code);
                return (
                  <label
                    key={code}
                    className={`${ROW} ${locked ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}
                  >
                    <input
                      type="checkbox"
                      className={CHECK}
                      checked={selected.includes(code)}
                      disabled={locked}
                      onChange={() => toggle(code)}
                    />
                    <span className="min-w-0 flex-1 text-sm text-zinc-900 dark:text-zinc-100">
                      {permissionLabel(code)}
                    </span>
                    {locked && (
                      <span className="flex shrink-0 items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                        <FiLock className="h-3.5 w-3.5" aria-hidden="true" />
                        {lockedNote}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
