import { useState, type ReactElement } from "react";
import { FiPlus, FiTrash2, FiZap } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState, ErrorState } from "../../core/components/Feedback.tsx";
import { SelectField } from "../../core/components/SelectField.tsx";
import { useSkillsCatalog } from "../../profiles/hooks.ts";
import type { ActivityDetailView } from "../api.ts";

interface SkillsPanelProps {
  skills: ActivityDetailView["skills"];
  canManage: boolean;
  onSave: (
    skills: { skill_id: string; is_required: boolean }[],
  ) => Promise<unknown>;
}

// Skill requirements of the activity: the picker reads the shared skills
// catalog and toggles each edge's required flag; saves replace the list.
export function SkillsPanel({
  skills,
  canManage,
  onSave,
}: SkillsPanelProps): ReactElement {
  const catalog = useSkillsCatalog();
  const [skillId, setSkillId] = useState("");
  const [required, setRequired] = useState(true);
  const [error, setError] = useState("");

  const save = async (
    next: { skill_id: string; is_required: boolean }[],
  ): Promise<void> => {
    setError("");
    try {
      await onSave(next);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Lỗi.");
    }
  };

  const taken = new Set(skills.map((s) => s.skill_id));
  const options = (catalog.data ?? [])
    .filter((s) => !taken.has(s.id))
    .map((s) => ({ value: s.id, label: s.name }));

  return (
    <section aria-label="Kỹ năng" className="flex flex-col gap-3">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <FiZap className="h-4 w-4" aria-hidden="true" /> Kỹ năng yêu cầu
      </h4>
      {error && <ErrorState title="Lỗi" message={error} />}
      {skills.length === 0 ? (
        <EmptyState
          title="Chưa yêu cầu kỹ năng"
          message="Gắn kỹ năng để tình nguyện viên biết cần chuẩn bị gì."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {skills.map((s) => (
            <li
              key={s.skill_id}
              className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
            >
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {s.name}
                {s.is_required && (
                  <span className="ml-2 text-xs text-zinc-500">Bắt buộc</span>
                )}
              </p>
              {canManage && (
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Gỡ kỹ năng"
                  onClick={() =>
                    void save(
                      skills
                        .filter((x) => x.skill_id !== s.skill_id)
                        .map((x) => ({
                          skill_id: x.skill_id,
                          is_required: x.is_required,
                        })),
                    )
                  }
                  icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
                >
                  <span className="sr-only">Gỡ</span>
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {canManage && options.length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <SelectField
            label="Kỹ năng"
            name="skill_id"
            value={skillId}
            onChange={setSkillId}
            options={[{ value: "", label: "Chọn…" }, ...options]}
          />
          <label className="flex min-h-[44px] items-center gap-2 self-end text-sm text-zinc-900 dark:text-zinc-100">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="h-4 w-4 accent-zinc-900 dark:accent-zinc-100"
            />
            Bắt buộc
          </label>
          <div className="self-end">
            <Button
              variant="secondary"
              disabled={!skillId}
              onClick={() =>
                void save([
                  ...skills.map((x) => ({
                    skill_id: x.skill_id,
                    is_required: x.is_required,
                  })),
                  { skill_id: skillId, is_required: required },
                ]).then(() => setSkillId(""))
              }
              icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
            >
              Thêm
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
