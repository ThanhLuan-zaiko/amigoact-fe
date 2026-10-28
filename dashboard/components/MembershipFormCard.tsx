import { useState } from "react";
import type { ReactElement } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { SelectField } from "../../core/components/SelectField.tsx";
import { Section } from "../../core/components/Section.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import type { MembershipQuestion } from "../../orgs/api.ts";
import {
  useMembershipForm,
  useSaveMembershipForm,
} from "../../orgs/application-hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";

const MAX_QUESTIONS = 32;

const FIELD_OPTIONS = [
  { value: "text", label: "Trả lời ngắn" },
  { value: "textarea", label: "Đoạn văn" },
  { value: "choice", label: "Lựa chọn" },
  { value: "consent", label: "Đồng ý" },
];

// Local draft row; `key` only keys React lists and never reaches the server.
interface DraftQuestion {
  key: string;
  label: string;
  field_type: string;
  required: boolean;
}

let nextKey = 0;

function toDraft(questions: MembershipQuestion[]): DraftQuestion[] {
  return questions.map((q) => ({
    key: q.question_id,
    label: q.label,
    field_type: q.field_type,
    required: q.required,
  }));
}

// Managers edit the org's application questions; applicants answer them.
export function MembershipFormCard({ orgId }: { orgId: string }): ReactElement {
  const form = useMembershipForm(orgId);
  const save = useSaveMembershipForm(orgId);
  const [draft, setDraft] = useState<DraftQuestion[] | null>(null);
  const rows = draft ?? toDraft(form.data?.questions ?? []);
  const dirty = draft !== null;
  const valid = rows.every((row) => row.label.trim().length > 0);

  function update(key: string, patch: Partial<DraftQuestion>): void {
    setDraft(rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function add(): void {
    nextKey += 1;
    setDraft([
      ...rows,
      { key: `new-${nextKey}`, label: "", field_type: "text", required: false },
    ]);
  }

  function remove(key: string): void {
    setDraft(rows.filter((row) => row.key !== key));
  }

  async function submit(): Promise<void> {
    await save.mutateAsync(
      rows.map((row) => ({
        label: row.label.trim(),
        field_type: row.field_type,
        required: row.required,
      })),
    );
    setDraft(null);
  }

  return (
    <Section>
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Biểu mẫu hồ sơ
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Người nộp hồ sơ sẽ trả lời các câu hỏi này trước khi tổ chức duyệt.
      </p>
      {form.isPending && <LoadingState label="Đang tải biểu mẫu…" />}
      {form.isError && (
        <div className="mt-3">
          <ErrorState
            title="Không tải được biểu mẫu"
            message={toVietnameseDashboardMessage(
              form.error?.code ?? "REQUEST_FAILED",
            )}
          />
        </div>
      )}
      {form.data && (
        <div className="mt-3 flex flex-col gap-4">
          {rows.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Chưa có câu hỏi nào. Người nộp chỉ cần gửi hồ sơ.
            </p>
          )}
          {rows.map((row, index) => (
            <div
              key={row.key}
              className="flex flex-col gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800"
            >
              <TextField
                label={`Câu hỏi ${index + 1}`}
                value={row.label}
                maxLength={300}
                onChange={(event) => update(row.key, { label: event.target.value })}
              />
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[10rem] flex-1">
                  <SelectField
                    label="Kiểu trả lời"
                    value={row.field_type}
                    options={FIELD_OPTIONS}
                    onChange={(value) => update(row.key, { field_type: value })}
                  />
                </div>
                <label className="flex items-center gap-2 pb-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={row.required}
                    onChange={(event) =>
                      update(row.key, { required: event.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  Bắt buộc
                </label>
                <button
                  type="button"
                  aria-label={`Xóa câu hỏi ${index + 1}`}
                  onClick={() => remove(row.key)}
                  className="mb-1 rounded-md p-2 text-zinc-500 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-100"
                >
                  <FiTrash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={rows.length >= MAX_QUESTIONS}
              onClick={add}
              icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
            >
              Thêm câu hỏi
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={!dirty || !valid || save.isPending}
              onClick={() => void submit()}
            >
              {save.isPending ? "Đang lưu…" : "Lưu biểu mẫu"}
            </Button>
          </div>
          {!valid && dirty && (
            <p className="text-xs text-red-700 dark:text-red-300">
              Mỗi câu hỏi cần có nội dung trước khi lưu.
            </p>
          )}
          {save.isError && (
            <ErrorState
              title="Không lưu được biểu mẫu"
              message={toVietnameseDashboardMessage(
                save.error?.code ?? "REQUEST_FAILED",
              )}
            />
          )}
        </div>
      )}
    </Section>
  );
}
