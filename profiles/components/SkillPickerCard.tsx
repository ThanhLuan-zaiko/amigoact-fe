import type { ReactElement } from "react";
import { useState } from "react";
import { FiAward, FiSave } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Section } from "../../core/components/Section.tsx";
import { Button } from "../../core/components/Button.tsx";
import { LoadingState } from "../../core/components/Feedback.tsx";
import { useSetSkills, useSkillsCatalog } from "../hooks.ts";
import {
  LEVEL_LABELS,
  PROFILE_TOAST,
  profileMessage,
  toastProfileError,
} from "../messages.tsx";
import type { VolunteerProfile } from "../api.ts";

interface Pick {
  level: number;
}

export function SkillPickerCard({
  profile,
}: {
  profile: VolunteerProfile;
}): ReactElement {
  const catalog = useSkillsCatalog();
  const save = useSetSkills(PROFILE_TOAST.skillsSaved);
  const [picks, setPicks] = useState<Record<string, Pick>>(() =>
    Object.fromEntries(
      profile.skills.map((edge) => [edge.id, { level: edge.level }]),
    ),
  );
  const [error, setError] = useState<string | null>(null);

  const toggle = (skillId: string): void => {
    setPicks((prev) => {
      const next = { ...prev };
      if (next[skillId]) delete next[skillId];
      else next[skillId] = { level: 3 };
      return next;
    });
  };

  const setLevel = (skillId: string, level: number): void => {
    setPicks((prev) => {
      if (!prev[skillId]) return prev;
      return { ...prev, [skillId]: { level } };
    });
  };

  const onSave = (): void => {
    setError(null);
    save.mutate(
      Object.entries(picks).map(([skill_id, pick]) => ({
        skill_id,
        level: pick.level,
      })),
      {
        onError: (err) => setError(toastProfileError(err)),
      },
    );
  };

  const CHIP =
    "inline-flex min-h-[36px] items-center gap-1 rounded-full border px-3 " +
    "text-xs font-medium transition-colors focus-visible:outline-2 " +
    "focus-visible:outline-offset-2 focus-visible:outline-zinc-500";

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
        <ul className="mt-4 grid items-start gap-2 sm:grid-cols-2">
          {(catalog.data ?? []).map((skill) => {
            const picked = picks[skill.id];
            return (
              <li
                key={skill.id}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <button
                  type="button"
                  aria-pressed={picked !== undefined}
                  onClick={() => toggle(skill.id)}
                  className={
                    picked
                      ? `${CHIP} border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950`
                      : `${CHIP} border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900`
                  }
                >
                  {skill.name}
                </button>
                {picked && (
                  <span className="ml-auto flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        aria-label={`${skill.name} mức ${level} — ${LEVEL_LABELS[level]}`}
                        aria-pressed={picked.level === level}
                        onClick={() => setLevel(skill.id, level)}
                        className={`h-8 w-8 rounded-full border text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 ${
                          level <= picked.level
                            ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                            : "border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {error && (
        <p role="alert" className="mt-3 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="mt-4">
        <Button
          variant="primary"
          disabled={save.isPending || catalog.isPending || catalog.isError}
          onClick={onSave}
          icon={<FiSave className="h-4 w-4" aria-hidden="true" />}
        >
          {save.isPending ? "Đang lưu…" : "Lưu kỹ năng"}
        </Button>
      </div>
    </Section>
  );
}
