import type { ReactElement } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface VisibilityToggleProps {
  visible: boolean;
  onToggle: () => void;
}

// One shared toggle per form: flipping it reveals every password field at
// once, so all eyes in the same form always agree with each other.
export function VisibilityToggle({
  visible,
  onToggle,
}: VisibilityToggleProps): ReactElement {
  const label = visible ? "Ẩn mật khẩu" : "Hiện mật khẩu";
  const Icon = visible ? FiEyeOff : FiEye;
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={onToggle}
      aria-label={label}
      aria-pressed={visible}
      className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-zinc-400 dark:hover:text-zinc-100 dark:focus-visible:outline-blue-400"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
