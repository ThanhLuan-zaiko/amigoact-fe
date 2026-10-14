import { useState, type ReactElement } from "react";
import { FiActivity } from "react-icons/fi";
import { Section } from "../core/components/Section.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { ApiError } from "../core/api.ts";
import { useMyOrgs } from "../dashboard/hooks.ts";
import { useOrgAudit } from "./hooks.ts";

const RESULT_LABELS: Record<string, string> = {
  allowed: "Cho phép",
  denied: "Từ chối",
};

export function AuditPage(): ReactElement {
  const orgs = useMyOrgs(false, { limit: 100 });
  const items = orgs.data?.items ?? [];
  const [selected, setSelected] = useState("");
  const orgId = selected || items[0]?.id || "";
  const feed = useOrgAudit(orgId || undefined);

  return (
    <Section>
      <div data-rise className="flex items-center gap-2">
        <FiActivity
          className="h-5 w-5 text-zinc-900 dark:text-zinc-100"
          aria-hidden="true"
        />
        <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Nhật ký hoạt động
        </h3>
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Ai đã làm gì trong tổ chức — phân quyền, thành viên, hoạt động.
      </p>
      {items.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((org) => (
            <button
              key={org.id}
              type="button"
              onClick={() => setSelected(org.id)}
              className={`min-h-[44px] rounded-xl border px-3 text-sm font-medium transition-colors ${
                org.id === orgId
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                  : "border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
              }`}
            >
              {org.name}
            </button>
          ))}
        </div>
      )}
      <div className="mt-4">
        {feed.isPending ? (
          <LoadingState label="Đang tải nhật ký…" />
        ) : feed.isError ? (
          <ErrorState
            title="Không tải được nhật ký"
            message={
              feed.error instanceof ApiError
                ? feed.error.message
                : "Có lỗi xảy ra."
            }
          />
        ) : !feed.data || feed.data.length === 0 ? (
          <EmptyState
            title="Chưa có hoạt động nào"
            message="Các hành động quản trị sẽ xuất hiện tại đây."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {feed.data.map((entry) => (
              <li
                key={entry.log_id}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800"
              >
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(entry.occurred_at).toLocaleString("vi-VN")}
                </span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {entry.actor_name}
                </span>
                <span className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                  {entry.action}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {entry.resource_type}
                  {entry.resource_id
                    ? ` · ${entry.resource_id.slice(0, 8)}`
                    : ""}
                </span>
                <span
                  className={`ml-auto rounded-full border px-2 py-0.5 text-xs font-semibold ${
                    entry.result === "denied"
                      ? "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
                      : "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                  }`}
                >
                  {RESULT_LABELS[entry.result] ?? entry.result}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}
