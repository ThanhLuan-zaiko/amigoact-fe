import { useState, type ReactElement } from "react";
import { FiRotateCcw, FiXOctagon } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ConfirmDialog } from "../../core/components/ConfirmDialog.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { formatDateTime } from "../dates.tsx";
import { toVietnameseTagMessage } from "../messages.tsx";
import type { OrgTag } from "../tags-api.ts";
import { useHardDeleteOrgTag, useRestoreOrgTag } from "../tags-hooks.ts";

// One trashed tag row: restore re-attaches the remembered activities;
// the hard erase is permanent and needs the danger confirm.
export function TagTrashRow({
  orgId,
  tag,
}: {
  orgId: string;
  tag: OrgTag;
}): ReactElement {
  const [eraseOpen, setEraseOpen] = useState(false);
  const [serverCode, setServerCode] = useState<string | null>(null);
  const restore = useRestoreOrgTag(orgId);
  const hardDelete = useHardDeleteOrgTag(orgId);
  const busy = restore.isPending || hardDelete.isPending;

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
    <li className="flex flex-col gap-2 px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            #{tag.name}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {tag.slug}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Đã xóa lúc {formatDateTime(tag.deleted_at)}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Sẽ gắn lại cho {tag.activity_count} hoạt động và{" "}
            {tag.post_count} bài viết khi khôi phục
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="primary"
          disabled={busy}
          onClick={() => run(restore.mutateAsync({ slug: tag.slug }))}
          icon={<FiRotateCcw className="h-4 w-4" aria-hidden="true" />}
        >
          {restore.isPending ? "Đang khôi phục…" : "Khôi phục"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => setEraseOpen(true)}
          icon={<FiXOctagon className="h-4 w-4" aria-hidden="true" />}
          className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
        >
          Xóa cứng
        </Button>
      </div>
      {serverCode && (
        <ErrorState
          title="Thao tác thất bại"
          message={toVietnameseTagMessage(serverCode)}
        />
      )}
      <ConfirmDialog
        open={eraseOpen}
        danger
        title={`Xóa vĩnh viễn thẻ #${tag.name}?`}
        message={`Thẻ sẽ bị xóa vĩnh viễn và không thể khôi phục để gắn lại cho ${tag.activity_count} hoạt động và ${tag.post_count} bài viết.`}
        confirmLabel="Xóa vĩnh viễn"
        busyLabel="Đang xóa…"
        busy={hardDelete.isPending}
        onClose={() => setEraseOpen(false)}
        onConfirm={() =>
          run(hardDelete.mutateAsync({ slug: tag.slug })).then(() => {
            if (!hardDelete.isError) setEraseOpen(false);
          })
        }
      />
    </li>
  );
}
