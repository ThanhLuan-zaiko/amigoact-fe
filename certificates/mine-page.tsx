import type { ReactElement } from "react";
import { FiAward } from "react-icons/fi";
import { BentoCard } from "../core/components/BentoCard.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { formatDateTime } from "../activities/dates.tsx";
import { useMyCertificates } from "./hooks.ts";
import { CERTIFICATE_STATUS_LABELS } from "./messages.tsx";

export function MyCertificatesPage(): ReactElement {
  const mine = useMyCertificates();

  return (
    <BentoCard className="md:col-span-6 lg:col-span-12">
      <div data-rise className="flex items-center gap-2">
        <FiAward className="h-5 w-5 text-zinc-900 dark:text-brand" aria-hidden="true" />
        <h1 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Chứng nhận của tôi
        </h1>
      </div>
      {mine.isPending && <LoadingState label="Đang tải chứng nhận…" />}
      {mine.isError && (
        <ErrorState
          title="Không tải được"
          message={mine.error.message}
        />
      )}
      {mine.data && mine.data.length === 0 && (
        <EmptyState
          title="Chưa có chứng nhận"
          message="Hoàn thành hoạt động và được ban tổ chức cấp chứng nhận."
        />
      )}
      {mine.data && mine.data.length > 0 && (
        <ul className="mt-3 grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mine.data.map((row) => (
            <li
              key={row.certificate_id}
              className="rounded-xl border border-brand/40 bg-brand/10 p-4 dark:border-brand/30"
            >
              <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                {CERTIFICATE_STATUS_LABELS[row.status] ?? row.status}
              </p>
              <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">
                {row.activity_title || "Hoạt động"}
              </p>
              <p className="mt-1 font-mono text-sm text-zinc-700 dark:text-zinc-300">
                {row.serial_no}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {row.issued_at
                  ? `Cấp ngày ${formatDateTime(row.issued_at)}`
                  : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </BentoCard>
  );
}
