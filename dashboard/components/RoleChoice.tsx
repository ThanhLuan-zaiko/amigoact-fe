import type { ReactElement } from "react";
import { FiLock } from "react-icons/fi";
import type { RoleOption } from "../messages-roles.tsx";

interface RoleChoiceProps {
  // radio = pick one (invite), checkbox = hold several (role assignment).
  type: "radio" | "checkbox";
  name: string;
  option: RoleOption;
  checked: boolean;
  disabled?: boolean;
  // Why the row is locked; shown instead of the hint.
  lockedNote?: string;
  onChange: () => void;
}

const ROW =
  "flex items-start gap-3 rounded-xl border p-3 transition-colors " +
  "border-zinc-200 has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-50 " +
  "dark:border-zinc-800 dark:has-[:checked]:border-zinc-100 dark:has-[:checked]:bg-zinc-900 " +
  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 " +
  "has-[:focus-visible]:outline-zinc-500 dark:has-[:focus-visible]:outline-zinc-400";

// A bordered selectable row with name, hint and permission summary. It reads
// as a form field, never as an action button, so a dialog's footer buttons
// stay the only filled pills.
export function RoleChoice({
  type,
  name,
  option,
  checked,
  disabled = false,
  lockedNote,
  onChange,
}: RoleChoiceProps): ReactElement {
  const note = disabled && lockedNote ? lockedNote : option.hint;
  return (
    <label
      className={`${ROW} ${
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
      }`}
    >
      <input
        type={type}
        name={name}
        value={option.key}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 shrink-0 accent-zinc-900 dark:accent-zinc-100"
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {option.label}
          {disabled && <FiLock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
        </span>
        {note && (
          <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">{note}</span>
        )}
        {option.detail && (
          <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
            {`Quyền: ${option.detail}`}
          </span>
        )}
      </span>
    </label>
  );
}
