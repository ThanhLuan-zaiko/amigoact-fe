import type { ReactElement } from "react";
import { FiCamera, FiDownload, FiFileText } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState } from "../../core/components/Feedback.tsx";
import { Section } from "../../core/components/Section.tsx";
import { formatDateTime } from "../../activities/dates.tsx";
import { useMyOrgs } from "../../dashboard/hooks.ts";
import { pushToast } from "../../core/toast.ts";
import {
  useCreateSnapshot,
  useDownloadExport,
  useExportJobs,
  useRequestExport,
  useSnapshots,
} from "../hooks.ts";

function saveCsv(filename: string, text: string): void {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ReportsCard(): ReactElement | null {
  const orgs = useMyOrgs(false, { limit: 1 });
  const orgId = orgs.data?.items[0]?.id;
  const snapshots = useSnapshots(orgId);
  const jobs = useExportJobs(Boolean(orgId));
  const createSnapshot = useCreateSnapshot(orgId);
  const requestExport = useRequestExport(orgId);
  const download = useDownloadExport();
  if (!orgId) return null;

  function exportStats(): void {
    requestExport.mutate(
      { job_type: "stats_csv" },
      {
        onSuccess: (job) => {
          if (job.file_url) {
            download.mutate(job.file_url, {
              onSuccess: (text) =>
                saveCsv(`stats-${job.job_id}.csv`, text),
            });
          }
        },
      },
    );
  }

  function takeSnapshot(): void {
    createSnapshot.mutate({ report_type: "participation" });
  }

  const rows = snapshots.data ?? [];
  return (
    <Section>
      <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
        <FiFileText className="h-5 w-5" aria-hidden /> Báo cáo &amp; Xuất dữ liệu
      </h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Lưu snapshot thống kê hoặc xuất CSV phục vụ báo cáo.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={createSnapshot.isPending}
          onClick={takeSnapshot}
          icon={<FiCamera className="h-4 w-4" aria-hidden />}
        >
          Chụp snapshot
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={requestExport.isPending}
          onClick={exportStats}
          icon={<FiDownload className="h-4 w-4" aria-hidden />}
        >
          Xuất thống kê CSV
        </Button>
      </div>
      {rows.length === 0 ? (
        <div className="mt-3">
          <EmptyState
            title="Chưa có snapshot"
            message="Snapshot đầu tiên sẽ xuất hiện ở đây."
          />
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
          {rows.slice(0, 5).map((snap) => (
            <li
              key={snap.snapshot_id}
              className="flex items-center justify-between gap-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {snap.report_type}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {formatDateTime(snap.created_at)} ·{" "}
                  {snap.payload.months.length} tháng dữ liệu
                </p>
              </div>
              <button
                type="button"
                className="rounded-full px-3 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-300 dark:hover:bg-zinc-800"
                onClick={() =>
                  pushToast({
                    title: `Snapshot ${snap.report_type} gồm ${snap.payload.months.length} tháng.`,
                  })
                }
              >
                Xem
              </button>
            </li>
          ))}
        </ul>
      )}
      {(jobs.data ?? []).length > 0 ? (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {jobs.data!.length} lượt xuất gần đây
        </p>
      ) : null}
    </Section>
  );
}
