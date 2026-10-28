import { useEffect, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { FiCircle, FiCopy, FiFileText, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { Modal } from "../../core/components/Modal.tsx";
import { RAIL_ROW, RailCard } from "../../core/components/RailCard.tsx";
import { SelectField } from "../../core/components/SelectField.tsx";
import {
  UnsavedChangesDialog,
  UnsavedGuard,
} from "../../core/components/UnsavedGuard.tsx";
import type { MembershipForm, MembershipFormInput } from "../../orgs/api.ts";
import {
  useMembershipForm,
  useSaveMembershipForm,
} from "../../orgs/application-hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";

const MAX_QUESTIONS = 32;
const MAX_OPTIONS = 20;
const DEFAULT_TITLE = "Hồ sơ tình nguyện";

const FIELD_OPTIONS = [
  { value: "text", label: "Trả lời ngắn" },
  { value: "textarea", label: "Đoạn văn" },
  { value: "choice", label: "Lựa chọn" },
  { value: "consent", label: "Đồng ý" },
  { value: "file", label: "Tải file minh chứng" },
];

// Grey stand-in for how each non-choice answer type looks to the applicant.
const PREVIEW: Record<string, string> = {
  text: "Văn bản trả lời ngắn",
  textarea: "Văn bản nhiều dòng",
  consent: "Tôi đồng ý",
  file: "Người nộp tải lên file PDF hoặc ảnh, tối đa 10 MB",
};

// Shared frame for every block in the editor: the right-rail card look.
// No overflow-hidden here: the kind dropdown opens below its card and would be clipped.
const FRAME = "rounded-2xl border border-zinc-200 dark:border-zinc-800";

// Filled input, the same tone as the rail search pill.
const FILLED_INPUT =
  "w-full rounded-lg bg-zinc-100 px-3 py-2 text-[15px] text-zinc-900 placeholder:text-zinc-500 focus:outline-2 focus:outline-zinc-500 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:outline-zinc-400";

// Round icon button in the footer of a question card.
const ICON_BUTTON =
  "rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400";

// Local draft row; `key` only keys React lists and never reaches the server.
interface DraftQuestion {
  key: string;
  label: string;
  field_type: string;
  required: boolean;
  options: string[];
  // Choice only: adds a "Khác" option that lets the applicant type their own answer.
  allow_other: boolean;
}

interface Draft {
  title: string;
  description: string;
  questions: DraftQuestion[];
}

let nextKey = 0;

function newKey(): string {
  nextKey += 1;
  return `new-${nextKey}`;
}

function toDraft(form: MembershipForm | undefined): Draft {
  return {
    title: form?.title ?? "",
    description: form?.description ?? "",
    questions: (form?.questions ?? []).map((q) => ({
      key: q.question_id,
      label: q.label,
      field_type: q.field_type,
      required: q.required,
      options: q.options,
      allow_other: q.allow_other,
    })),
  };
}

// A label or option containing "|" breaks the applicant's shared field renderer.
function isClean(text: string): boolean {
  return !text.includes("|");
}

function questionValid(row: DraftQuestion): boolean {
  if (row.label.trim().length === 0 || !isClean(row.label)) return false;
  if (row.field_type !== "choice") return true;
  const options = row.options.map((o) => o.trim()).filter(Boolean);
  // "Khác" counts as one choice.
  const choices = options.length + (row.allow_other ? 1 : 0);
  return choices >= 2 && options.every(isClean);
}

// Rail summary of the org's application questions; editing opens a modal.
export function MembershipFormCard({ orgId }: { orgId: string }): ReactElement {
  const form = useMembershipForm(orgId);
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // X, overlay and Esc ask before discarding an unsaved draft.
  function requestClose(): void {
    if (dirty) setConfirming(true);
    else close();
  }

  function close(): void {
    setConfirming(false);
    setDirty(false);
    setOpen(false);
  }

  const count = form.data?.questions.length ?? 0;
  const summary =
    form.data === undefined
      ? "Câu hỏi người nộp hồ sơ trả lời."
      : count === 0
        ? "Chưa có câu hỏi. Người nộp chỉ gửi hồ sơ tình nguyện."
        : `${count} câu hỏi cho người nộp hồ sơ.`;
  return (
    <RailCard title="Biểu mẫu hồ sơ" Icon={FiFileText}>
      <p className="px-4 pb-2 text-[13px] text-zinc-500 dark:text-zinc-400">{summary}</p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${RAIL_ROW} w-full text-left text-[15px] font-bold text-zinc-900 dark:text-zinc-100`}
      >
        Chỉnh sửa biểu mẫu
      </button>
      <Modal open={open} wide title="Biểu mẫu hồ sơ" onClose={requestClose}>
        <MembershipFormEditor orgId={orgId} onDirtyChange={setDirty} />
        {confirming && (
          <UnsavedChangesDialog onStay={() => setConfirming(false)} onLeave={close} />
        )}
      </Modal>
    </RailCard>
  );
}

// One rounded rail-card block; each editor section is one of these.
function Block({ children, className = "" }: { children: ReactNode; className?: string }): ReactElement {
  return <div className={`${FRAME} ${className}`}>{children}</div>;
}

// Managers edit the heading and application questions; applicants answer them.
function MembershipFormEditor({
  orgId,
  onDirtyChange,
}: {
  orgId: string;
  onDirtyChange: (dirty: boolean) => void;
}): ReactElement {
  const form = useMembershipForm(orgId);
  const save = useSaveMembershipForm(orgId);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const current = draft ?? toDraft(form.data);
  const rows = current.questions;
  const dirty = draft !== null;
  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);
  const valid =
    rows.every(questionValid) &&
    isClean(current.title) &&
    isClean(current.description);

  function patchDraft(patch: Partial<Draft>): void {
    setDraft({ ...current, ...patch });
  }

  function updateQuestion(key: string, patch: Partial<DraftQuestion>): void {
    patchDraft({
      questions: rows.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    });
  }

  function add(): void {
    const row: DraftQuestion = {
      key: newKey(),
      label: "",
      field_type: "text",
      required: false,
      options: [],
      allow_other: false,
    };
    patchDraft({ questions: [...rows, row] });
    setFocused(row.key);
  }

  function duplicate(index: number): void {
    const copy = { ...rows[index], key: newKey(), options: [...rows[index].options] };
    patchDraft({ questions: [...rows.slice(0, index + 1), copy, ...rows.slice(index + 1)] });
    setFocused(copy.key);
  }

  function remove(key: string): void {
    patchDraft({ questions: rows.filter((row) => row.key !== key) });
  }

  function setOption(key: string, index: number, text: string): void {
    const row = rows.find((r) => r.key === key);
    if (!row) return;
    updateQuestion(key, { options: row.options.map((o, i) => (i === index ? text : o)) });
  }

  function addOption(key: string): void {
    const row = rows.find((r) => r.key === key);
    if (!row) return;
    updateQuestion(key, { options: [...row.options, ""] });
  }

  function removeOption(key: string, index: number): void {
    const row = rows.find((r) => r.key === key);
    if (!row) return;
    updateQuestion(key, { options: row.options.filter((_, i) => i !== index) });
  }

  async function submit(): Promise<void> {
    const payload: MembershipFormInput = {
      title: current.title.trim(),
      description: current.description.trim(),
      questions: rows.map((row) => {
        const isChoice = row.field_type === "choice";
        return {
          label: row.label.trim(),
          field_type: row.field_type,
          required: row.required,
          options: isChoice ? row.options.map((o) => o.trim()).filter(Boolean) : [],
          allow_other: isChoice && row.allow_other,
        };
      }),
    };
    await save.mutateAsync(payload);
    setDraft(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <UnsavedGuard active={dirty} />
      {form.isPending && <LoadingState label="Đang tải biểu mẫu…" />}
      {form.isError && (
        <ErrorState
          title="Không tải được biểu mẫu"
          message={toVietnameseDashboardMessage(form.error?.code ?? "REQUEST_FAILED")}
        />
      )}
      {form.data && (
        <>
          <Block>
            <div className="px-4 pt-3 pb-1">
              <input
                type="text"
                aria-label="Tiêu đề biểu mẫu"
                value={current.title}
                maxLength={120}
                placeholder={DEFAULT_TITLE}
                onChange={(event) => patchDraft({ title: event.target.value })}
                className="w-full bg-transparent text-lg font-extrabold tracking-tight text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
              />
            </div>
            <div className="px-4 pb-3">
              <textarea
                aria-label="Mô tả biểu mẫu"
                value={current.description}
                maxLength={1000}
                rows={2}
                placeholder="Mô tả ngắn để người nộp biết cần chuẩn bị gì (không bắt buộc)"
                onChange={(event) => patchDraft({ description: event.target.value })}
                className="w-full resize-none bg-transparent text-[15px] text-zinc-600 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-400"
              />
            </div>
          </Block>

          {rows.length === 0 && (
            <p className="px-1 text-[13px] text-zinc-500 dark:text-zinc-400">
              Chưa có câu hỏi nào. Người nộp chỉ cần gửi hồ sơ.
            </p>
          )}

          {rows.map((row, index) => {
            const isFocused = focused === row.key;
            const isChoice = row.field_type === "choice";
            return (
              <Block
                key={row.key}
                className={isFocused ? "border-zinc-400 dark:border-zinc-600" : ""}
              >
                <div
                  onFocus={() => setFocused(row.key)}
                  className="flex flex-col gap-3 px-4 pt-3 pb-3"
                >
                  <label
                    htmlFor={`question-${row.key}`}
                    className="text-[13px] text-zinc-500 dark:text-zinc-400"
                  >
                    {`Câu hỏi ${index + 1}`}
                    {row.required && <span className="text-red-600 dark:text-red-400"> *</span>}
                  </label>
                  <input
                    id={`question-${row.key}`}
                    type="text"
                    value={row.label}
                    maxLength={300}
                    placeholder="Nhập câu hỏi"
                    onChange={(event) => updateQuestion(row.key, { label: event.target.value })}
                    className={FILLED_INPUT}
                  />
                  <SelectField
                    label="Kiểu trả lời"
                    value={row.field_type}
                    options={FIELD_OPTIONS}
                    onChange={(value) => updateQuestion(row.key, { field_type: value })}
                  />

                  {isChoice ? (
                    <ul className="flex flex-col gap-2">
                      {row.options.map((option, optionIndex) => (
                        <li key={optionIndex} className="flex items-center gap-2">
                          <FiCircle className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
                          <input
                            type="text"
                            aria-label={`Phương án ${optionIndex + 1} của câu hỏi ${index + 1}`}
                            value={option}
                            maxLength={100}
                            placeholder={`Phương án ${optionIndex + 1}`}
                            onChange={(event) => setOption(row.key, optionIndex, event.target.value)}
                            className={`${FILLED_INPUT} py-1.5`}
                          />
                          <button
                            type="button"
                            aria-label={`Xóa phương án ${optionIndex + 1} của câu hỏi ${index + 1}`}
                            onClick={() => removeOption(row.key, optionIndex)}
                            className={ICON_BUTTON}
                          >
                            <FiX className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                      <li>
                        <button
                          type="button"
                          disabled={row.options.length >= MAX_OPTIONS}
                          onClick={() => addOption(row.key)}
                          className="inline-flex items-center gap-2 py-1 pl-6 text-[15px] font-bold text-zinc-900 hover:underline disabled:opacity-40 dark:text-zinc-100"
                        >
                          <FiPlus className="h-4 w-4" aria-hidden="true" />
                          Thêm phương án
                        </button>
                      </li>
                      {row.allow_other ? (
                        <li className="flex items-center gap-2">
                          <FiCircle className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
                          <span className="min-w-0 flex-1 py-1.5 text-[15px] text-zinc-500 dark:text-zinc-400">
                            Khác: người nộp tự nhập
                          </span>
                          <button
                            type="button"
                            aria-label={`Bỏ lựa chọn Khác của câu hỏi ${index + 1}`}
                            onClick={() => updateQuestion(row.key, { allow_other: false })}
                            className={ICON_BUTTON}
                          >
                            <FiX className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </li>
                      ) : (
                        <li>
                          <button
                            type="button"
                            onClick={() => updateQuestion(row.key, { allow_other: true })}
                            className="inline-flex items-center gap-2 py-1 pl-6 text-[15px] font-bold text-zinc-900 hover:underline dark:text-zinc-100"
                          >
                            <FiPlus className="h-4 w-4" aria-hidden="true" />
                            Thêm lựa chọn "Khác"
                          </button>
                        </li>
                      )}
                      {row.options.length + (row.allow_other ? 1 : 0) < 2 && (
                        <li className="pl-6 text-[13px] text-zinc-500 dark:text-zinc-400">
                          Cần ít nhất hai lựa chọn.
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
                      {PREVIEW[row.field_type] ?? PREVIEW.text}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-1 border-t border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  <button
                    type="button"
                    aria-label={`Nhân bản câu hỏi ${index + 1}`}
                    disabled={rows.length >= MAX_QUESTIONS}
                    onClick={() => duplicate(index)}
                    className={ICON_BUTTON}
                  >
                    <FiCopy className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Xóa câu hỏi ${index + 1}`}
                    onClick={() => remove(row.key)}
                    className={ICON_BUTTON}
                  >
                    <FiTrash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="mx-2 h-6 w-px bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />
                  <button
                    type="button"
                    role="switch"
                    aria-checked={row.required}
                    aria-label={`Bắt buộc câu hỏi ${index + 1}`}
                    onClick={() => updateQuestion(row.key, { required: !row.required })}
                    className="flex cursor-pointer items-center gap-2 rounded-full px-1 py-0.5 text-[13px] text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-300"
                  >
                    <span>Bắt buộc</span>
                    <span
                      aria-hidden="true"
                      className={`inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                        row.required
                          ? "justify-end bg-zinc-900 dark:bg-zinc-500"
                          : "justify-start bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
                    </span>
                  </button>
                </div>
              </Block>
            );
          })}

          <Block className="overflow-hidden">
            <button
              type="button"
              disabled={rows.length >= MAX_QUESTIONS}
              onClick={add}
              className={`${RAIL_ROW} flex w-full items-center gap-2 text-left text-[15px] font-bold text-zinc-900 disabled:opacity-40 dark:text-zinc-100`}
            >
              <FiPlus className="h-4 w-4" aria-hidden="true" />
              Thêm câu hỏi
            </button>
          </Block>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
            {!valid && dirty && (
              <p className="mr-auto text-[13px] text-red-700 dark:text-red-300">
                Mỗi câu hỏi cần tiêu đề; lựa chọn cần ít nhất hai phương án; không dùng dấu "|".
              </p>
            )}
            <Button
              type="button"
              variant="primary"
              disabled={!dirty || !valid || save.isPending}
              onClick={() => void submit()}
            >
              {save.isPending ? "Đang lưu…" : "Lưu biểu mẫu"}
            </Button>
          </div>
          {save.isError && (
            <ErrorState
              title="Không lưu được biểu mẫu"
              message={toVietnameseDashboardMessage(save.error?.code ?? "REQUEST_FAILED")}
            />
          )}
        </>
      )}
    </div>
  );
}
