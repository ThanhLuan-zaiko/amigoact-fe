import type { ReactElement } from "react";
import { FiAward } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Section } from "../../core/components/Section.tsx";
import { LoadingState } from "../../core/components/Feedback.tsx";
import { useSkillsCatalog } from "../hooks.ts";
import { LEVEL_LABELS, profileMessage } from "../messages.tsx";

const CHIP =
  "inline-flex min-h-[36px] items-center gap-1 rounded-full border px-3 " +
  "text-xs font-medium transition-colors focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-zinc-500";

// Skill picks of the volunteer form: `picks` maps skill id to self-rated
// level. Toggling a skill adds it at level 3; saving happens on the form.
export function SkillPickerCard({
  picks,
  onToggle,
  onLevel,
}: {
  picks: Record<string, number>;
  onToggle: (skillId: string) => void;
  onLevel: (skillId: string, level: number) => void;
}): ReactElement {
  const catalog = useSkillsCatalog();

  return (
    <Section>
      <div className="flex items-center gap-2">
        <FiAward className="h-5 w-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
        <h2 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Kỹ năng của bạn
        </h2>
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Chọn kỹ năng và tự đánh giá mức độ (1-5) để nhà tổ chức ghép đúng việc.
      </p>
      {catalog.isPending ? (
        <LoadingState label="Đang tải danh mục kỹ năng…" />
      ) : catalog.isError ? (
        <p role="alert" className="mt-3 text-xs text-red-600 dark:text-red-400">
          {profileMessage(
            catalog.error instanceof ApiError
              ? catalog.error.code
              : "REQUEST_FAILED",
          )}
        </p>
      ) : (
        <ul className="mt-4 grid items-start gap-2 @md:grid-cols-2">
          {(catalog.data ?? []).map((skill) => {
            const level = picks[skill.id];
            const picked = level !== undefined;
            return (
              <li
                key={skill.id}
                className="flex flex-col items-start gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <button
                  type="button"
                  aria-pressed={picked}
                  onClick={() => onToggle(skill.id)}
                  className={
                    picked
                      ? `${CHIP} border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950`
                      : `${CHIP} border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900`
                  }
                >
                  {skill.name}
                </button>
                {picked && (
                  <span className="flex flex-wrap items-center gap-1">
                    {[1, 2, 3, 4, 5].map((option) => (
                      <button
                        key={option}
                        type="button"
                        aria-label={`${skill.name} mức ${option} — ${LEVEL_LABELS[option]}`}
                        aria-pressed={level === option}
                        onClick={() => onLevel(skill.id, option)}
                        className={`h-8 w-8 rounded-full border text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 ${
                          option <= level
                            ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                            : "border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
