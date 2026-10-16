import type { ReactElement } from "react";
import { SelectField } from "../../core/components/SelectField.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import type { FormQuestion } from "../../activities/api.ts";
import { parseQuestion } from "../form-utils.ts";

interface FormFieldsProps {
  questions: FormQuestion[];
  answers: Record<string, string>;
  onChange: (questionId: string, value: string) => void;
}

// Renders one custom sign-up form; answers keyed by question_id.
export function FormFields({
  questions,
  answers,
  onChange,
}: FormFieldsProps): ReactElement {
  return (
    <>
      {questions.map((q) => {
        const { label, options } = parseQuestion(q);
        const value = answers[q.question_id] ?? "";
        const suffix = q.required ? " *" : "";
        if (q.field_type === "consent") {
          return (
            <label
              key={q.question_id}
              className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
            >
              <input
                type="checkbox"
                checked={value === "yes"}
                onChange={(e) =>
                  onChange(q.question_id, e.target.checked ? "yes" : "")
                }
                className="h-4 w-4 accent-emerald-600"
              />
              {label}
              {suffix}
            </label>
          );
        }
        if (q.field_type === "choice" && options.length > 0) {
          return (
            <SelectField
              key={q.question_id}
              label={`${label}${suffix}`}
              name={q.question_id}
              value={value}
              onChange={(v) => onChange(q.question_id, v)}
              options={[
                { value: "", label: "Chọn…" },
                ...options.map((o) => ({ value: o, label: o })),
              ]}
            />
          );
        }
        return (
          <TextField
            key={q.question_id}
            label={`${label}${suffix}`}
            value={value}
            onChange={(e) => onChange(q.question_id, e.target.value)}
            maxLength={q.field_type === "textarea" ? 2000 : 300}
          />
        );
      })}
    </>
  );
}
