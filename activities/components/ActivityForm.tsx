import { useState, type FormEvent, type ReactElement } from "react";
import { FiSave } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import {
  ActivityFields,
  type ActivityFieldValues,
} from "../../core/components/ActivityFields.tsx";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import type {
  ActivityDetail,
  ActivityInput,
  CategoryItem,
} from "../api.ts";
import {
  initialActivityValues,
  toActivityInput,
  toTagSuggestions,
} from "../form-values.ts";
import { toVietnameseTagMessage } from "../messages.tsx";
import { useMyTags } from "../tags-hooks.ts";

interface ActivityFormProps {
  categories: CategoryItem[];
  initial?: ActivityDetail;
  submitLabel: string;
  onSubmit: (input: ActivityInput) => Promise<unknown>;
  onDone?: () => void;
}

export function ActivityForm({
  categories,
  initial,
  submitLabel,
  onSubmit,
  onDone,
}: ActivityFormProps): ReactElement {
  const [values, setValues] = useState(() => initialActivityValues(initial));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const tags = useMyTags();

  const patch = (next: Partial<ActivityFieldValues>): void => {
    setValues((prev) => ({ ...prev, ...next }));
  };

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!values.title.trim() || !values.startAt) return;
    setBusy(true);
    setError("");
    try {
      await onSubmit(toActivityInput(values));
      onDone?.();
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.code === "TAG_DELETED"
            ? toVietnameseTagMessage(cause.code)
            : cause.message
          : "Có lỗi xảy ra. Vui lòng thử lại.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3"
      aria-busy={busy}
    >
      {error && <ErrorState title="Lỗi" message={error} />}
      <ActivityFields
        values={values}
        onChange={patch}
        categories={categories}
        tagSuggestions={toTagSuggestions(tags.data)}
        tagSuggestionsError={tags.isError}
        disabled={busy}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={busy || !values.title.trim() || !values.startAt}
          icon={<FiSave className="h-4 w-4" aria-hidden="true" />}
        >
          {busy ? "Đang lưu…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
