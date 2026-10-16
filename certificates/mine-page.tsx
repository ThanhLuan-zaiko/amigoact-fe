import type { ReactElement } from "react";
import { FiAward, FiDownload } from "react-icons/fi";
import { Section } from "../core/components/Section.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { pushToast } from "../core/toast.ts";
import { ApiError } from "../core/api.ts";
import { formatDateTime } from "../activities/dates.tsx";
import { useDownloadCertificate, useMyCertificates } from "./hooks.ts";
import {
  CERTIFICATE_STATUS_LABELS,
  toVietnameseCertificateError,
} from "./messages.tsx";

function saveBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function MyCertificatesPage(): ReactElement {
  const mine = useMyCertificates();
  const download = useDownloadCertificate();

  function downloadCertificate(certificateId: string, serial: string): void {
    download.mutate(certificateId, {
      onSuccess: (file) =>
        saveBlob(file.filename ?? `certificate-${serial}.pdf`, file.blob),
      onError: (error) =>
        pushToast({
          tone: "error",
          title:
            error instanceof ApiError
              ? toVietnameseCertificateError(error.code, error.message)
              : "Không tải được chứng nhận.",
        }),
    });
  }

  return (
    <Section>
      <div data-rise className="flex items-center gap-2">
        <FiAward className="h-5 w-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
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
        <ul className="mt-3 grid grid-cols-1 items-start gap-3 sm:grid-cols-2 @4xl:grid-cols-3">
          {mine.data.map((row) => (
            <li
              key={row.certificate_id}
              className="rounded-xl border border-zinc-300 bg-zinc-100 p-4 dark:border-zinc-700 dark:bg-zinc-900"
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
              {row.status === "issued" && (
                <button
                  type="button"
                  disabled={download.isPending}
                  onClick={() =>
                    downloadCertificate(row.certificate_id, row.serial_no)
                  }
                  className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                >
                  <FiDownload className="h-4 w-4" aria-hidden="true" />
                  Tải PDF
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
