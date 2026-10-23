import { useState, type ReactElement } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiCheck, FiFileText, FiX } from "react-icons/fi";
import type { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { toVietnameseTagMessage } from "../messages.tsx";
import type { OrgTag } from "../tags-api.ts";
import { useRenameOrgTag } from "../tags-hooks.ts";
import { TagRowActions } from "./TagRowActions.tsx";

// One live catalog row: name + slug + usage link on the first line,
// labeled curation buttons wrapped below (they stack cleanly at 360px).
export function TagRow({
  orgId,
  tag,
  others,
  canManage,
}: {
  orgId: string;
  tag: OrgTag;
  others: OrgTag[];
  canManage: boolean;
}): ReactElement {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tag.name);
  const [error, setError] = useState("");
  const rename = useRenameOrgTag(orgId);

  function save(): void {
    // Same spelling after trim: close silently, no API call, no toast.
    if (draft.trim() === tag.name) {
      setEditing(false);
      setError("");
      return;
    }
    setError("");
    rename.mutate(
      { slug: tag.slug, name: draft },
      {
        onSuccess: () => setEditing(false),
        onError: (err: ApiError) =>
          setError(toVietnameseTagMessage(err.code)),
      },
    );
  }

  return (
    <li className="flex flex-col gap-2 px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="min-w-[10rem] flex-1">
                <TextField
                  label="Tên thẻ"
                  hideLabel
                  maxLength={40}
                  value={draft}
                  autoFocus
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") save();
                    if (e.key === "Escape") setEditing(false);
                  }}
                  error={error || undefined}
                />
              </div>
              <Button
                size="icon"
                aria-label="Lưu"
                disabled={rename.isPending}
                icon={<FiCheck className="h-4 w-4" aria-hidden="true" />}
                onClick={save}
              />
              <Button
                size="icon"
                variant="ghost"
                aria-label="Hủy"
                icon={<FiX className="h-4 w-4" aria-hidden="true" />}
                onClick={() => setEditing(false)}
              />
            </div>
          ) : (
            <>
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                #{tag.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {tag.slug}
              </p>
            </>
          )}
        </div>
        <Link
          to={`/manage/events?org=${orgId}&tag=${tag.slug}`}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-2 text-sm text-zinc-600 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400"
        >
          <FiCalendar className="h-4 w-4" aria-hidden="true" />
          {tag.activity_count} hoạt động
        </Link>
        <Link
          to={`/manage/board?org=${orgId}&tag=${tag.slug}`}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-2 text-sm text-zinc-600 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400"
        >
          <FiFileText className="h-4 w-4" aria-hidden="true" />
          {tag.post_count} bài viết
        </Link>
      </div>
      {canManage && !editing && (
        <TagRowActions
          orgId={orgId}
          tag={tag}
          others={others}
          onEdit={() => {
            setDraft(tag.name);
            setEditing(true);
          }}
        />
      )}
    </li>
  );
}
