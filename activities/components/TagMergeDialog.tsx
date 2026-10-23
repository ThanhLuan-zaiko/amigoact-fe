import { useState, type ReactElement } from "react";
import { FiGitMerge, FiX } from "react-icons/fi";
import type { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { Modal } from "../../core/components/Modal.tsx";
import { SelectField } from "../../core/components/SelectField.tsx";
import { toVietnameseTagMessage } from "../messages.tsx";
import type { OrgTag } from "../tags-api.ts";
import { useMergeOrgTag } from "../tags-hooks.ts";

// Merge dialog: pick the target tag, everything tagged with the source
// moves over and the source row is deleted server-side.
export function TagMergeDialog({
  orgId,
  tag,
  others,
  onClose,
}: {
  orgId: string;
  tag: OrgTag;
  others: OrgTag[];
  onClose: () => void;
}): ReactElement {
  const [into, setInto] = useState("");
  const [error, setError] = useState("");
  const merge = useMergeOrgTag(orgId);
  return (
    <Modal open title={`Gộp thẻ #${tag.name}`} onClose={onClose}>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Mọi hoạt động và bài viết gắn #{tag.name} sẽ chuyển sang thẻ đã
        chọn, sau đó #{tag.name} bị xóa.
      </p>
      <div className="mt-3">
        <SelectField
          label="Gộp vào thẻ"
          value={into}
          onChange={setInto}
          placeholder="Chọn thẻ…"
          options={others.map((t) => ({
            value: t.slug,
            label: `#${t.name} · ${t.activity_count} hoạt động · ${t.post_count} bài viết`,
          }))}
          error={error || undefined}
        />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="ghost"
          icon={<FiX className="h-4 w-4" aria-hidden="true" />}
          onClick={onClose}
        >
          Hủy
        </Button>
        <Button
          variant="primary"
          disabled={!into || merge.isPending}
          icon={<FiGitMerge className="h-4 w-4" aria-hidden="true" />}
          onClick={() =>
            merge.mutate(
              { slug: tag.slug, into },
              {
                onSuccess: onClose,
                onError: (err: ApiError) =>
                  setError(toVietnameseTagMessage(err.code)),
              },
            )
          }
        >
          Gộp thẻ
        </Button>
      </div>
    </Modal>
  );
}
