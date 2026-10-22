import { useState, type ReactElement } from "react";
import { FiEdit2, FiGitMerge, FiTrash2, FiXOctagon } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ConfirmDialog } from "../../core/components/ConfirmDialog.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { toVietnameseTagMessage } from "../messages.tsx";
import type { OrgTag } from "../tags-api.ts";
import {
  useHardDeleteOrgTag,
  useSoftDeleteOrgTag,
} from "../tags-hooks.ts";
import { TagMergeDialog } from "./TagMergeDialog.tsx";

// Labeled action bucket for a live catalog row: edit opens the inline
// rename owned by TagRow; merge needs at least one other live tag; the
// soft delete needs no confirm, the hard delete gets a danger dialog.
export function TagRowActions({
  orgId,
  tag,
  others,
  onEdit,
}: {
  orgId: string;
  tag: OrgTag;
  others: OrgTag[];
  onEdit: () => void;
}): ReactElement {
  const [mergeOpen, setMergeOpen] = useState(false);
  const [eraseOpen, setEraseOpen] = useState(false);
  const [serverCode, setServerCode] = useState<string | null>(null);
  const softDelete = useSoftDeleteOrgTag(orgId);
  const hardDelete = useHardDeleteOrgTag(orgId);
  const busy = softDelete.isPending || hardDelete.isPending;

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
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onEdit}
          icon={<FiEdit2 className="h-4 w-4" aria-hidden="true" />}
        >
          Sửa
        </Button>
        {others.length > 0 && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setMergeOpen(true)}
            icon={<FiGitMerge className="h-4 w-4" aria-hidden="true" />}
          >
            Gộp
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => run(softDelete.mutateAsync({ slug: tag.slug }))}
          icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
        >
          {softDelete.isPending ? "Đang xóa…" : "Xóa mềm"}
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
      {mergeOpen && (
        <TagMergeDialog
          orgId={orgId}
          tag={tag}
          others={others}
          onClose={() => setMergeOpen(false)}
        />
      )}
      <ConfirmDialog
        open={eraseOpen}
        danger
        title={`Xóa vĩnh viễn thẻ #${tag.name}?`}
        message={`Thẻ sẽ bị gỡ khỏi ${tag.activity_count} hoạt động và không thể khôi phục.`}
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
    </div>
  );
}
