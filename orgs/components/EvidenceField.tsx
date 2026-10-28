import { useId } from "react";
import type { ChangeEvent, ReactElement } from "react";
import { FiPaperclip, FiX } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { useUploadMembershipFile } from "../application-hooks.ts";
import type { MembershipQuestion } from "../api.ts";
import { toVietnameseOrgsMessage } from "../messages.tsx";

interface EvidenceFieldProps {
  orgId: string;
  question: MembershipQuestion;
  // The staged media_id, or "" while nothing is attached.
  value: string;
  // File name shown for the staged file; null when nothing is attached.
  name: string | null;
  onChange: (value: string, name: string | null) => void;
}

// One evidence upload question: the file is staged as soon as it is picked,
// and its media_id becomes the answer.
export function EvidenceField({
  orgId,
  question,
  value,
  name,
  onChange,
}: EvidenceFieldProps): ReactElement {
  const inputId = useId();
  const upload = useUploadMembershipFile(orgId);
  const suffix = question.required ? " *" : "";

  function onPick(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    upload.mutate(file, {
      onSuccess: (staged) => onChange(staged.media_id, staged.name),
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {`${question.label}${suffix}`}
      </label>
      {value && name ? (
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800">
          <FiPaperclip className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate text-sm text-zinc-800 dark:text-zinc-200">
            {name}
          </span>
          <button
            type="button"
            aria-label={`Gỡ file ${name}`}
            onClick={() => onChange("", null)}
            className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <FiX className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <input
          id={inputId}
          type="file"
          accept="application/pdf,image/*"
          disabled={upload.isPending}
          onChange={onPick}
          className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-full file:border file:border-zinc-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:text-zinc-900 hover:file:bg-zinc-50 disabled:opacity-60 dark:text-zinc-400 dark:file:border-zinc-700 dark:file:bg-zinc-950 dark:file:text-zinc-100"
        />
      )}
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {upload.isPending ? "Đang tải file lên…" : "PDF hoặc ảnh, tối đa 10 MB."}
      </p>
      {upload.isError && (
        <ErrorState
          title="Chưa tải được file"
          message={toVietnameseOrgsMessage(
            upload.error instanceof ApiError ? upload.error.code : "REQUEST_FAILED",
          )}
        />
      )}
    </div>
  );
}
