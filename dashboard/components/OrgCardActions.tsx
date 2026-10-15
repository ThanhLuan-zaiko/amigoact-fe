import { useState } from "react";
import type { ReactElement } from "react";
import { FiEdit2, FiRotateCcw, FiTrash2, FiXOctagon } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ConfirmDialog } from "../../core/components/ConfirmDialog.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { useHardDeleteOrg, useRestoreOrg, useSoftDeleteOrg } from "../hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import type { DashboardOrg } from "../api.ts";

interface OrgCardActionsProps {
  org: DashboardOrg;
  isEditing: boolean;
  onEdit: () => void;
}

export function OrgCardActions({ org, isEditing, onEdit }: OrgCardActionsProps): ReactElement {
  const softDelete = useSoftDeleteOrg("Đã chuyển vào thùng rác.");
  const hardDelete = useHardDeleteOrg("Đã xóa vĩnh viễn.");
  const restore = useRestoreOrg("Đã khôi phục tổ chức.");
  const [eraseOpen, setEraseOpen] = useState(false);
  const [serverCode, setServerCode] = useState<string | null>(null);
  const busy = softDelete.isPending || hardDelete.isPending || restore.isPending;
  const trashed = org.deleted_at !== null;

  async function run(task: Promise<unknown>): Promise<void> {
    setServerCode(null);
    try {
      await task;
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {!trashed && (
          <Button
            type="button"
            variant="secondary"
            onClick={onEdit}
            aria-pressed={isEditing}
            icon={<FiEdit2 className="h-4 w-4" aria-hidden="true" />}
          >
            Sửa
          </Button>
        )}
        {trashed ? (
          <Button
            type="button"
            variant="primary"
            disabled={busy}
            onClick={() => run(restore.mutateAsync(org.id))}
            icon={<FiRotateCcw className="h-4 w-4" aria-hidden="true" />}
          >
            {restore.isPending ? "Đang khôi phục…" : "Khôi phục"}
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => run(softDelete.mutateAsync(org.id))}
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
        title="Xóa vĩnh viễn tổ chức?"
        danger
        confirmLabel="Xóa vĩnh viễn"
        message={
          <>
            {org.name} và toàn bộ dữ liệu liên quan sẽ bị xóa vĩnh viễn và không
            thể khôi phục.
          </>
        }
        onConfirm={() => {
          setEraseOpen(false);
          void run(hardDelete.mutateAsync(org.id));
        }}
        onClose={() => setEraseOpen(false)}
      />
      {serverCode && (
        <ErrorState
          title="Thao tác thất bại"
          message={toVietnameseDashboardMessage(serverCode)}
        />
      )}
    </div>
  );
}
