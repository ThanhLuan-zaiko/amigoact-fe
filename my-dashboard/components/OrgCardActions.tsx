import { useState } from "react";
import type { ReactElement } from "react";
import { FiEdit2, FiRotateCcw, FiTrash2, FiXOctagon } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
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
  const softDelete = useSoftDeleteOrg();
  const hardDelete = useHardDeleteOrg();
  const restore = useRestoreOrg();
  const [confirmErase, setConfirmErase] = useState(false);
  const [serverCode, setServerCode] = useState<string | null>(null);
  const busy = softDelete.isPending || hardDelete.isPending || restore.isPending;
  const trashed = org.deleted_at !== null;

  async function run(task: Promise<unknown>, erased: boolean): Promise<void> {
    setServerCode(null);
    try {
      await task;
      if (erased) setConfirmErase(false);
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
            onClick={() => run(restore.mutateAsync(org.id), false)}
            icon={<FiRotateCcw className="h-4 w-4" aria-hidden="true" />}
          >
            {restore.isPending ? "Đang khôi phục…" : "Khôi phục"}
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => run(softDelete.mutateAsync(org.id), false)}
            icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
          >
            {softDelete.isPending ? "Đang xóa…" : "Xóa mềm"}
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => {
            if (!confirmErase) {
              setConfirmErase(true);
              return;
            }
            run(hardDelete.mutateAsync(org.id), true);
          }}
          aria-pressed={confirmErase}
          icon={<FiXOctagon className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />}
          className={
            confirmErase
              ? "border-red-600 text-red-600 dark:border-red-400 dark:text-red-400"
              : undefined
          }
        >
          {hardDelete.isPending
            ? "Đang xóa…"
            : confirmErase
              ? "Bấm lại để xóa vĩnh viễn"
              : "Xóa cứng"}
        </Button>
      </div>
      {serverCode && (
        <ErrorState
          title="Thao tác thất bại"
          message={toVietnameseDashboardMessage(serverCode)}
        />
      )}
    </div>
  );
}
