import type { ReactElement } from "react";
import { FiX } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";

// Reply/edit context strip above the composer input: left accent bar,
// label + one-line preview, close button on the right.
export function ChatContextBar({
  label,
  preview,
  onClose,
}: {
  label: string;
  preview: string;
  onClose: () => void;
}): ReactElement {
  return (
    <div className="mb-1.5 flex items-center gap-2 border-l-2 border-zinc-400 pl-2 dark:border-zinc-600">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          {label}
        </p>
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {preview || "Tệp đính kèm"}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClose}
        aria-label="Đóng"
        icon={<FiX className="h-4 w-4" aria-hidden="true" />}
      />
    </div>
  );
}
