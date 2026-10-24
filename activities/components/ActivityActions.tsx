import { useState } from "react";
import type { ReactElement } from "react";
import { FiRotateCcw, FiTrash2, FiXOctagon } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ConfirmDialog } from "../../core/components/ConfirmDialog.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import {
  useHardDeleteActivity,
  useRestoreActivity,
  useSoftDeleteActivity,
} from "../hooks.ts";
import { toVietnameseActivityMessage } from "../messages.tsx";
import type { ActivitySummary } from "../api.ts";

interface ActivityActionsProps {
  orgId: string;
  activity: ActivitySummary;
  /** Runs after a permanent delete succeeds (the detail page leaves). */
  onErased?: () => void;
}

export function ActivityActions({
  orgId,
  activity,
  onErased,
}: ActivityActionsProps): ReactElement {
  const softDelete = useSoftDeleteActivity(
    orgId,
    "Đã chuyển vào thùng rác.",
  );
  const hardDelete = useHardDeleteActivity(orgId, "Đã xóa vĩnh viễn.");
  const restore = useRestoreActivity(orgId, "Đã khôi phục hoạt động.");
  const [eraseOpen, setEraseOpen] = useState(false);
  const [serverCode, setServerCode] = useState<string | null>(null);
  const busy =
    softDelete.isPending || hardDelete.isPending || restore.isPending;
  const trashed = activity.deleted_at !== null;

  async function run(task: Promise<unknown>): Promise<void> {
    setServerCode(null);
    try {
      await task;
    } catch (error) {
      setServerCode(
        error instanceof ApiError ? error.code : "REQUEST_FAILED",
      );
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {trashed ? (
          <Button
            type="button"
            variant="primary"
            disabled={busy}
            onClick={() => run(restore.mutateAsync(activity.id))}
            icon={<FiRotateCcw className="h-4 w-4" aria-hidden="true" />}
          >
            {restore.isPending ? "Đang khôi phục…" : "Khôi phục"}
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => run(softDelete.mutateAsync(activity.id))}
            icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
          >
            {softDelete.isPending ? "Đang xóa…" : "Xóa mềm"}
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => setEraseOpen(true)}
          icon={<FiXOctagon className="h-4 w-4" aria-hidden="true" />}
          className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
        >
          {hardDelete.isPending ? "Đang xóa…" : "Xóa cứng"}
        </Button>
      </div>
      <ConfirmDialog
        open={eraseOpen}
        title="Xóa vĩnh viễn hoạt động?"
        danger
        confirmLabel="Xóa vĩnh viễn"
        message={
          <>
            {activity.title} và toàn bộ lịch, biểu mẫu đăng ký, ảnh và dữ
            liệu liên quan sẽ bị xóa vĩnh viễn và không thể khôi phục.
          </>
        }
        onConfirm={() => {
          setEraseOpen(false);
          void run(
            hardDelete.mutateAsync(activity.id).then(() => onErased?.()),
          );
        }}
        onClose={() => setEraseOpen(false)}
      />
      {serverCode && (
        <ErrorState
          title="Thao tác thất bại"
          message={toVietnameseActivityMessage(serverCode)}
        />
      )}
    </div>
  );
}
