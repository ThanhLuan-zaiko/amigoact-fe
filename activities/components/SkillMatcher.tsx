import { useMemo, useState, type ReactElement } from "react";
import { FiUserPlus, FiZap } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState, ErrorState } from "../../core/components/Feedback.tsx";
import { SelectField } from "../../core/components/SelectField.tsx";
import { useSkillMatches } from "../../dashboard/matching-hooks.ts";
import type { SkillEdgeDetail } from "../api.ts";

interface SkillMatcherProps {
  orgId: string;
  skills: SkillEdgeDetail[];
  staffed: Set<string>;
  onPick: (userId: string) => Promise<void>;
}

// Coordinator matching: pick one of the activity's skills and list
// org members holding it (best level first) for one-click staffing.
export function SkillMatcher({
  orgId,
  skills,
  staffed,
  onPick,
}: SkillMatcherProps): ReactElement | null {
  const [skillId, setSkillId] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const query = useSkillMatches(orgId, skillId === "" ? null : skillId);
  const options = useMemo(
    () =>
      skills.map((s) => ({
        value: s.skill_id,
        label: s.is_required ? `${s.name} (bắt buộc)` : s.name,
      })),
    [skills],
  );
  const matches = (query.data ?? []).filter(
    (m) => !staffed.has(m.user_id),
  );

  if (skills.length === 0) return null;

  const pick = async (userId: string): Promise<void> => {
    setPending(userId);
    try {
      await onPick(userId);
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <p className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
        <FiZap className="h-3.5 w-3.5" aria-hidden="true" />
        Gợi ý theo kỹ năng
      </p>
      <SelectField
        label="Kỹ năng"
        name="match_skill"
        value={skillId}
        onChange={setSkillId}
        options={[{ value: "", label: "Chọn kỹ năng…" }, ...options]}
      />
      {skillId !== "" && query.isError && (
        <ErrorState title="Lỗi" message="Không tải được gợi ý." />
      )}
      {skillId !== "" && query.data !== undefined && matches.length === 0 && (
        <EmptyState
          title="Không có gợi ý"
          message="Không thành viên nào có kỹ năng này."
        />
      )}
      {matches.length > 0 && (
        <ul className="flex flex-col gap-1">
          {matches.map((m) => (
            <li
              key={m.user_id}
              className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
            >
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {m.full_name}
                <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                  Cấp {m.level}
                </span>
              </p>
              <Button
                variant="ghost"
                disabled={pending !== null}
                onClick={() => void pick(m.user_id)}
                icon={<FiUserPlus className="h-4 w-4" aria-hidden="true" />}
              >
                Thêm
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
