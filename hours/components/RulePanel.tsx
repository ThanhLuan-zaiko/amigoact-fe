import { useState, type ReactElement } from "react";
import { FiPlus, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { SelectField } from "../../core/components/SelectField.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useCategories } from "../../activities/hooks.ts";
import { useCreateHourRule, useHourRules, useToggleHourRule } from "../rules-hooks.ts";
import { toVietnameseHourError } from "../messages.tsx";

interface RulePanelProps {
  orgId: string;
}

export function RulePanel({ orgId }: RulePanelProps): ReactElement {
  const rules = useHourRules(orgId);
  const categories = useCategories(orgId);
  const create = useCreateHourRule(orgId);
  const toggle = useToggleHourRule(orgId);
  const [multiplier, setMultiplier] = useState("1.5");
  const [cap, setCap] = useState("");
  const [term, setTerm] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");

  const catName = (id: string | null): string =>
    categories.data?.find((c) => c.id === id)?.name ?? "Mọi danh mục";

  const submit = async (): Promise<void> => {
    setError("");
    const mult = Number.parseFloat(multiplier);
    const capValue = cap.trim() ? Number.parseFloat(cap) : null;
    if (!Number.isFinite(mult) || mult <= 0) {
      setError("Hệ số phải lớn hơn 0.");
      return;
    }
    if (capValue !== null && (!Number.isFinite(capValue) || capValue <= 0)) {
      setError("Giới hạn giờ phải lớn hơn 0.");
      return;
    }
    try {
      await create.mutateAsync({
        multiplier: mult,
        cap_hours: capValue,
        category_id: categoryId || null,
        term: term.trim() || null,
      });
      setMultiplier("1.5");
      setCap("");
      setTerm("");
      setCategoryId("");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? toVietnameseHourError(err.code, err.message)
          : "Có lỗi xảy ra.",
      );
    }
  };

  if (rules.isPending) {
    return <LoadingState label="Đang tải hệ số giờ…" />;
  }
  if (rules.isError) {
    return (
      <ErrorState
        title="Không tải được"
        message={rules.error?.message}
      />
    );
  }
  const rows = rules.data ?? [];

  return (
    <div data-rise>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Hệ số giờ theo danh mục
      </h3>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Giờ điểm danh được nhân hệ số phù hợp nhất (danh mục + kỳ).
      </p>
      {rows.length === 0 ? (
        <EmptyState
          title="Chưa có hệ số"
          message="Tạo hệ số để giờ điểm danh tự nhân theo danh mục hoặc kỳ."
        />
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {rows.map((r) => (
            <li
              key={r.rule_id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  ×{r.multiplier ?? 1}
                  {r.cap_hours != null && (
                    <span className="ml-1 text-xs font-normal text-zinc-500 dark:text-zinc-400">
                      (tối đa {r.cap_hours}h)
                    </span>
                  )}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {catName(r.category_id)}
                  {" · "}
                  {r.term ?? "Mọi kỳ"}
                </p>
              </div>
              <Button
                variant="ghost"
                disabled={toggle.isPending}
                onClick={() =>
                  void toggle.mutateAsync({
                    ruleId: r.rule_id,
                    isActive: !r.is_active,
                  })
                }
                icon={
                  r.is_active ? (
                    <FiToggleRight className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <FiToggleLeft className="h-4 w-4" aria-hidden="true" />
                  )
                }
              >
                {r.is_active ? "Đang bật" : "Đang tắt"}
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Thêm hệ số
        </p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <SelectField
            label="Danh mục"
            name="rule_category"
            value={categoryId}
            onChange={setCategoryId}
            options={[
              { value: "", label: "Mọi danh mục" },
              ...(categories.data ?? []).map((c) => ({
                value: c.id,
                label: c.name,
              })),
            ]}
          />
          <TextField
            label="Kỳ (vd 2026-H1)"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Để trống = mọi kỳ"
          />
          <TextField
            label="Hệ số"
            type="number"
            min={0}
            step={0.1}
            value={multiplier}
            onChange={(e) => setMultiplier(e.target.value)}
          />
          <TextField
            label="Giới hạn giờ"
            type="number"
            min={0}
            step={0.5}
            value={cap}
            onChange={(e) => setCap(e.target.value)}
            placeholder="Không giới hạn"
          />
        </div>
        <Button
          variant="secondary"
          className="mt-2"
          disabled={create.isPending}
          onClick={() => void submit()}
          icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
        >
          Thêm hệ số
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
