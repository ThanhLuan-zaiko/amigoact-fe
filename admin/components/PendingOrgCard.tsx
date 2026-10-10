import { useState } from "react";
import type { ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import { FiCheck, FiCheckSquare, FiX } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { useAdminOrgs, useVerifyOrg } from "../hooks.ts";
import { adminMessage, legalStatusLabel, orgKindLabel } from "../messages.tsx";
import type { AdminOrgItem } from "../api.ts";
import { RejectModal } from "./RejectModal.tsx";

const STATUS_TABS = ["pending", "verified", "rejected"] as const;
const TAB_LABELS: Record<string, string> = {
  pending: "Chờ xác minh",
  verified: "Đã xác minh",
  rejected: "Bị từ chối",
};

function OrgRow({
  item,
  isPendingTab,
  onReject,
}: {
  item: AdminOrgItem;
  isPendingTab: boolean;
  onReject: (org: AdminOrgItem) => void;
}): ReactElement {
  const verify = useVerifyOrg();
  const [error, setError] = useState("");

  async function approve(): Promise<void> {
    setError("");
    try {
      await verify.mutateAsync(item.id);
    } catch (err) {
      setError(
        adminMessage(err instanceof ApiError ? err.code : "REQUEST_FAILED"),
      );
    }
  }

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-3 sm:p-4 dark:border-zinc-800">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {item.name}
        </p>
        <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          {orgKindLabel(item.kind)}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            item.legal_status === "verified"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
              : item.legal_status === "rejected"
                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
          }`}
        >
          {legalStatusLabel(item.legal_status)}
        </span>
      </div>
      <dl className="grid grid-cols-1 gap-1 text-sm text-zinc-600 sm:grid-cols-2 dark:text-zinc-400">
        <div>
          <dt className="inline font-medium text-zinc-900 dark:text-zinc-200">
            Chủ sở hữu:{" "}
          </dt>
          <dd className="inline">
            {item.owner_name} ({item.owner_email})
          </dd>
        </div>
        <div>
          <dt className="inline font-medium text-zinc-900 dark:text-zinc-200">
            Mã số thuế:{" "}
          </dt>
          <dd className="inline">{item.tax_code ?? "—"}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-zinc-900 dark:text-zinc-200">
            Người đại diện:{" "}
          </dt>
          <dd className="inline">{item.legal_rep_name ?? "—"}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-zinc-900 dark:text-zinc-200">
            Nộp hồ sơ:{" "}
          </dt>
          <dd className="inline">
            {new Date(item.created_at).toLocaleDateString("vi-VN")}
          </dd>
        </div>
      </dl>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {isPendingTab && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            disabled={verify.isPending}
            onClick={() => void approve()}
            icon={<FiCheck className="h-4 w-4" aria-hidden="true" />}
          >
            {verify.isPending ? "Đang duyệt…" : "Phê duyệt"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => onReject(item)}
            icon={<FiX className="h-4 w-4" aria-hidden="true" />}
          >
            Từ chối
          </Button>
        </div>
      )}
    </li>
  );
}

export function PendingOrgCard(): ReactElement {
  const [params, setParams] = useSearchParams();
  const tab = params.get("status") ?? "pending";
  const status = STATUS_TABS.includes(tab as (typeof STATUS_TABS)[number])
    ? tab
    : "pending";
  const queue = useAdminOrgs(status);
  const [rejecting, setRejecting] = useState<AdminOrgItem | null>(null);

  return (
    <BentoCard className="md:col-span-6 lg:col-span-12">
      <div className="flex items-center gap-2">
        <FiCheckSquare
          className="h-5 w-5 text-zinc-900 dark:text-brand"
          aria-hidden="true"
        />
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Xác minh tổ chức
        </h1>
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Hồ sơ pháp lý của các doanh nghiệp đăng ký chờ ban quản trị duyệt.
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Trạng thái">
        {STATUS_TABS.map((value) => (
          <Button
            key={value}
            variant={status === value ? "primary" : "secondary"}
            onClick={() => setParams({ status: value })}
          >
            {TAB_LABELS[value]}
          </Button>
        ))}
      </div>

      <div className="mt-4">
        {queue.isPending && <LoadingState label="Đang tải hàng chờ…" />}
        {queue.isError && (
          <ErrorState
            title="Không tải được hàng chờ"
            message={adminMessage(
              queue.error instanceof ApiError
                ? queue.error.code
                : "REQUEST_FAILED",
            )}
          />
        )}
        {queue.data && queue.data.items.length === 0 && (
          <EmptyState
            title="Không có hồ sơ"
            message={`Không có tổ chức nào ở trạng thái "${TAB_LABELS[status]}".`}
          />
        )}
        {queue.data && queue.data.items.length > 0 && (
          <ul className="flex flex-col gap-3">
            {queue.data.items.map((item) => (
              <OrgRow
                key={item.id}
                item={item}
                isPendingTab={status === "pending"}
                onReject={setRejecting}
              />
            ))}
          </ul>
        )}
      </div>
      <RejectModal org={rejecting} onClose={() => setRejecting(null)} />
    </BentoCard>
  );
}
