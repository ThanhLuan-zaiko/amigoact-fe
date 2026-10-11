import type { ReactElement } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiMinusCircle,
  FiShield,
} from "react-icons/fi";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import type { PublicOrgDetail } from "../api.ts";
import { TRUST_CHECK_LABELS, TRUST_CHECK_NOTES } from "../messages.tsx";
import { buildTrustChecks, trustScore, type TrustState } from "../utils.ts";

interface OrgTrustCardProps {
  org: PublicOrgDetail;
}

const STATE_ICON: Record<TrustState, ReactElement> = {
  pass: (
    <FiCheckCircle
      className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
      aria-label="Đạt"
    />
  ),
  warn: (
    <FiAlertTriangle
      className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
      aria-label="Đang chờ"
    />
  ),
  fail: (
    <FiMinusCircle
      className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600"
      aria-label="Chưa đạt"
    />
  ),
  info: (
    <FiInfo
      className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500"
      aria-label="Thông tin"
    />
  ),
};

export function OrgTrustCard({ org }: OrgTrustCardProps): ReactElement {
  const checks = buildTrustChecks(org);
  const score = trustScore(checks);
  return (
    <BentoCard className="md:col-span-6 lg:col-span-4">
      <div data-rise>
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            <FiShield
              className="h-5 w-5 text-zinc-900 dark:text-brand"
              aria-hidden="true"
            />
            Đánh giá độ tin cậy
          </h2>
          <span className="rounded-full border border-brand/40 bg-brand/10 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:border-brand/30 dark:text-brand">
            {`${score}/${checks.length}`}
          </span>
        </div>
        <ul className="mt-3 space-y-2.5">
          {checks.map((check) => (
            <li key={check.key} className="flex items-start gap-2">
              <span className="mt-0.5">{STATE_ICON[check.state]}</span>
              <div className="min-w-0">
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {TRUST_CHECK_LABELS[check.key] ?? check.key}
                </p>
                {check.noteKey && TRUST_CHECK_NOTES[check.noteKey] && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {TRUST_CHECK_NOTES[check.noteKey]}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-zinc-200 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          Đánh giá dựa trên dữ liệu công khai, không thay thế việc tự kiểm
          chứng trước khi tham gia.
        </p>
      </div>
    </BentoCard>
  );
}
