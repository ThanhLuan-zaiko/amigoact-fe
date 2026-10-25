import type { ReactElement } from "react";
import { FiSave } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";

// The one save of the volunteer form. Sticky at the foot of the column and
// lifted above the phone tab bar (h-14) on small screens.
export function VolunteerSaveBar({
  dirty,
  saving,
  error,
}: {
  dirty: boolean;
  saving: boolean;
  error: string | null;
}): ReactElement {
  const status = error ?? (dirty ? "Có thay đổi chưa lưu." : "Đã lưu mọi thay đổi.");
  const tone = error
    ? "text-red-600 dark:text-red-400"
    : dirty
      ? "text-amber-700 dark:text-amber-400"
      : "text-emerald-700 dark:text-emerald-400";

  return (
    <div className="sticky bottom-14 z-30 flex flex-wrap items-center gap-3 border-t border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur sm:bottom-0 dark:border-zinc-800 dark:bg-zinc-950/90">
      <p
        role={error ? "alert" : "status"}
        className={`min-w-0 flex-1 text-sm font-medium ${tone}`}
      >
        {status}
      </p>
      <Button
        type="submit"
        variant="primary"
        disabled={saving || !dirty}
        icon={<FiSave className="h-4 w-4" aria-hidden="true" />}
      >
        {saving ? "Đang lưu…" : "Lưu hồ sơ"}
      </Button>
    </div>
  );
}
