import { useState, type ReactElement } from "react";
import {
  FiArrowDown,
  FiArrowUp,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState, ErrorState } from "../../core/components/Feedback.tsx";
import { SelectField } from "../../core/components/SelectField.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import type { FormQuestionInput } from "../api.ts";
import { useRegistrationForm, useSetForm } from "../hooks.ts";

const TYPE_OPTIONS = [
  { value: "text", label: "Văn bản" },
  { value: "textarea", label: "Văn bản dài" },
  { value: "choice", label: "Lựa chọn (label|opt1|opt2)" },
  { value: "consent", label: "Đồng ý (checkbox)" },
];

interface FormBuilderProps {
  orgId: string;
  activityId: string;
}

// Manager editor for the custom sign-up form of one activity.
export function FormBuilder({
  orgId,
  activityId,
}: FormBuilderProps): ReactElement {
  const form = useRegistrationForm(orgId, activityId);
  const setForm = useSetForm(orgId, activityId);
  const [rows, setRows] = useState<FormQuestionInput[] | null>(null);
  const [error, setError] = useState("");

  const questions: FormQuestionInput[] =
    rows ??
    (form.data ?? []).map((q) => ({
      label: q.label,
      field_type: q.field_type,
      required: q.required,
    }));

  const patch = (i: number, p: Partial<FormQuestionInput>): void =>
    setRows(questions.map((q, j) => (j === i ? { ...q, ...p } : q)));

  const move = (i: number, d: number): void => {
    const j = i + d;
    if (j < 0 || j >= questions.length) return;
    const next = [...questions];
    [next[i], next[j]] = [next[j] as never, next[i] as never];
    setRows(next);
  };

  const save = async (): Promise<void> => {
    setError("");
    try {
      await setForm.mutateAsync(questions);
      setRows(null);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Lỗi.");
    }
  };

  return (
    <section aria-label="Form đăng ký" className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Form đăng ký tùy biến
      </h4>
      {error && <ErrorState title="Lỗi" message={error} />}
      {questions.length === 0 && (
        <EmptyState
          title="Không có câu hỏi"
          message="Thêm câu hỏi để thu thập thông tin khi đăng ký."
        />
      )}
      {questions.map((q, i) => (
        <div
          key={i}
          className="grid grid-cols-1 gap-2 rounded-lg border border-zinc-200 p-2 sm:grid-cols-[1fr_11rem_auto] dark:border-zinc-800"
        >
          <TextField
            label={`Câu hỏi ${i + 1}`}
            value={q.label}
            onChange={(e) => patch(i, { label: e.target.value })}
            maxLength={300}
          />
          <div className="flex items-end gap-2">
            <div className="grow">
              <SelectField
                label="Kiểu"
                name={`ft${i}`}
                value={q.field_type}
                onChange={(v) => patch(i, { field_type: v })}
                options={TYPE_OPTIONS}
              />
            </div>
            <label className="flex items-center gap-1 pb-2 text-xs text-zinc-600 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={q.required}
                onChange={(e) => patch(i, { required: e.target.checked })}
                className="h-4 w-4 accent-emerald-600"
              />
              Bắt buộc
            </label>
          </div>
          <div className="flex items-end gap-1">
            <Button size="icon" variant="ghost" aria-label="Lên"
              disabled={i === 0} onClick={() => move(i, -1)}
              icon={<FiArrowUp className="h-4 w-4" aria-hidden="true" />}>
              <span className="sr-only">Lên</span>
            </Button>
            <Button size="icon" variant="ghost" aria-label="Xuống"
              disabled={i === questions.length - 1} onClick={() => move(i, 1)}
              icon={<FiArrowDown className="h-4 w-4" aria-hidden="true" />}>
              <span className="sr-only">Xuống</span>
            </Button>
            <Button size="icon" variant="ghost" aria-label="Xóa"
              onClick={() => setRows(questions.filter((_, j) => j !== i))}
              icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}>
              <span className="sr-only">Xóa</span>
            </Button>
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() =>
            setRows([
              ...questions,
              { label: "", field_type: "text", required: false },
            ])
          }
          icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
        >
          Thêm câu hỏi
        </Button>
        {rows !== null && (
          <Button disabled={setForm.isPending} onClick={() => void save()}>
            Lưu form
          </Button>
        )}
      </div>
    </section>
  );
}
