import { useState, type ReactElement } from "react";
import { FiCheck, FiEdit3, FiHash, FiTrash2, FiX } from "react-icons/fi";
import type { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { toVietnameseTagMessage } from "../messages.tsx";
import type { MyTag } from "../tags-api.ts";
import { useDeleteMyTag, useRenameMyTag } from "../tags-hooks.ts";

function tagError(code: string): string {
  if (code === "TAG_EXISTS") return "Bạn đã có thẻ này.";
  return toVietnameseTagMessage(code);
}

// One personal tag. The name selects it for the right-rail post list.
export function UserTagRow({
  tag,
  selected,
  onSelect,
}: {
  tag: MyTag;
  selected: boolean;
  onSelect: (slug: string) => void;
}): ReactElement {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tag.name);
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState("");
  const rename = useRenameMyTag();
  const remove = useDeleteMyTag();

  function save(): void {
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
        onError: (err: ApiError) => setError(tagError(err.code)),
      },
    );
  }

  return (
    <li
      className={`flex flex-col gap-2 px-4 py-3${selected ? " bg-zinc-100 dark:bg-zinc-900" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {editing ? (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <div className="min-w-[10rem] flex-1">
              <TextField
                label="Tên thẻ"
                hideLabel
                maxLength={40}
                value={draft}
                autoFocus
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") save();
                  if (event.key === "Escape") setEditing(false);
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
          <button
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(tag.slug)}
            className="inline-flex min-h-[44px] min-w-0 flex-1 items-center gap-2 rounded-full px-1 text-left text-sm font-semibold text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-100 dark:focus-visible:outline-zinc-400"
          >
            <FiHash className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className={`truncate${selected ? " font-bold" : ""}`}>
              {tag.name}
            </span>
            <span className="shrink-0 text-xs font-normal text-zinc-500 dark:text-zinc-400">
              {`${tag.post_count} bài`}
            </span>
          </button>
        )}
      </div>
      {!editing && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            icon={<FiEdit3 className="h-4 w-4" aria-hidden="true" />}
            onClick={() => setEditing(true)}
          >
            Đổi tên
          </Button>
          <Button
            type="button"
            variant={armed ? "primary" : "secondary"}
            aria-pressed={armed}
            disabled={remove.isPending}
            icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
            onClick={() => {
              if (!armed) {
                setArmed(true);
                return;
              }
              remove.mutate(
                { slug: tag.slug },
                { onError: (err: ApiError) => setError(tagError(err.code)) },
              );
            }}
          >
            {armed ? "Xóa hẳn" : "Xóa"}
          </Button>
        </div>
      )}
      {error && !editing && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </li>
  );
}
