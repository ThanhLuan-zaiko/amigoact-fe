import type { ReactElement } from "react";
import { ROLE_COLOR_KEYS, ROLE_DOT_CLASS, toRoleColor } from "../role-colors.ts";
import { ROLE_COLOR_LABELS } from "../messages-roles.tsx";

interface RoleColorPickerProps {
  // "" is the default colour and shows as zinc.
  value: string;
  onChange: (color: string) => void;
}

const OPTION =
  "flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border px-3 text-sm " +
  "border-zinc-300 text-zinc-900 hover:bg-zinc-50 " +
  "has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-50 " +
  "dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900 " +
  "dark:has-[:checked]:border-zinc-100 dark:has-[:checked]:bg-zinc-900 " +
  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 " +
  "has-[:focus-visible]:outline-zinc-500 dark:has-[:focus-visible]:outline-zinc-400";

// Colour swatches for a role badge; the dot previews the badge tone.
export function RoleColorPicker({ value, onChange }: RoleColorPickerProps): ReactElement {
  const current = toRoleColor(value);
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Màu huy hiệu</p>
      <div role="radiogroup" aria-label="Màu huy hiệu" className="flex flex-wrap gap-2">
        {ROLE_COLOR_KEYS.map((key) => (
          <label key={key} className={OPTION}>
            <input
              type="radio"
              name="role-color"
              className="sr-only"
              checked={current === key}
              onChange={() => onChange(key === "zinc" ? "" : key)}
            />
            <span aria-hidden="true" className={`h-3 w-3 rounded-full ${ROLE_DOT_CLASS[key]}`} />
            {ROLE_COLOR_LABELS[key]}
          </label>
        ))}
      </div>
    </div>
  );
}
