import { useRef, useState, type ReactElement } from "react";
import {
  FiEdit3,
  FiMoreHorizontal,
  FiRotateCcw,
  FiTrash2,
  FiXOctagon,
} from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ConfirmDialog } from "../../core/components/ConfirmDialog.tsx";
import { useDismiss } from "../../core/dismiss.ts";
import type { MyActivityItem } from "../feed-api.ts";
import {
  useHardDeleteActivity,
  useRestoreActivity,
  useSoftDeleteActivity,
} from "../hooks.ts";
import { toVietnameseActivityMessage } from "../messages.tsx";

// The "more" menu on a feed row. Only rendered for rows the caller can
// manage. The confirm dialog sits beside the panel, so closing the panel
// on an outside press never cancels a pending permanent delete.
export function ActivityRowMenu({
  activity,
}: {
  activity: MyActivityItem;
}): ReactElement {
  const [open, setOpen] = useState(false);
  const [eraseOpen, setEraseOpen] = useState(false);
  const [serverCode, setServerCode] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useDismiss(open, rootRef, () => setOpen(false), triggerRef);

  const softDelete = useSoftDeleteActivity(
    activity.org_id,
    "Đã chuyển vào thùng rác.",
  );
  const restore = useRestoreActivity(
    activity.org_id,
    "Đã khôi phục hoạt động.",
  );
  const hardDelete = useHardDeleteActivity(
    activity.org_id,
    "Đã xóa vĩnh viễn.",
  );
  const trashed = activity.deleted_at !== null;
  const editable =
    !trashed && (activity.status === "draft" || activity.status === "published");
  const busy =
    softDelete.isPending || restore.isPending || hardDelete.isPending;

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
    <div ref={rootRef} className="relative shrink-0">
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Thao tác với ${activity.title}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        icon={<FiMoreHorizontal className="h-5 w-5" aria-hidden="true" />}
      />
      {open && (
        <div className="absolute top-full right-0 z-20 mt-1 flex w-56 flex-col gap-1 rounded-2xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
          {editable && (
            <Button
              variant="ghost"
              to={`/manage/events/${activity.org_id}/${activity.id}?edit=1`}
              icon={<FiEdit3 className="h-4 w-4" aria-hidden="true" />}
            >
              Chỉnh sửa
            </Button>
          )}
          {trashed ? (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => void run(restore.mutateAsync(activity.id))}
              icon={<FiRotateCcw className="h-4 w-4" aria-hidden="true" />}
            >
              Khôi phục
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => void run(softDelete.mutateAsync(activity.id))}
              icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
            >
              Xóa mềm
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              setOpen(false);
              setEraseOpen(true);
            }}
            icon={<FiXOctagon className="h-4 w-4" aria-hidden="true" />}
          >
            Xóa cứng
          </Button>
          {serverCode !== null && (
            <p role="alert" className="px-2 text-xs text-red-600 dark:text-red-400">
              {toVietnameseActivityMessage(serverCode)}
            </p>
          )}
        </div>
      )}
      <ConfirmDialog
        open={eraseOpen}
        title="Xóa vĩnh viễn hoạt động?"
        danger
        confirmLabel="Xóa vĩnh viễn"
        busy={hardDelete.isPending}
        busyLabel="Đang xóa…"
        message={
          <>
            {activity.title} và toàn bộ lịch, biểu mẫu đăng ký, ảnh và dữ
            liệu liên quan sẽ bị xóa vĩnh viễn và không thể khôi phục.
          </>
        }
        onConfirm={() => {
          setEraseOpen(false);
          void run(hardDelete.mutateAsync(activity.id));
        }}
        onClose={() => setEraseOpen(false)}
      />
    </div>
  );
}
