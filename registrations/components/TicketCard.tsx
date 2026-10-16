import { useState, type ReactElement } from "react";
import { FiCopy, FiCheck, FiMaximize } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { LoadingState } from "../../core/components/Feedback.tsx";
import { useTicket } from "../hooks.ts";
import { useScanCode } from "../sessions-hooks.ts";
import { toVietnameseRegistrationError } from "../messages.tsx";
import { AppealBox } from "./AppealBox.tsx";
import { StatusTimeline } from "./StatusTimeline.tsx";

interface TicketCardProps {
  activityId: string;
  registrationId: string;
}

export function TicketCard({
  activityId,
  registrationId,
}: TicketCardProps): ReactElement {
  const ticket = useTicket(activityId, registrationId);
  const scan = useScanCode();
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState("");
  const [scanMsg, setScanMsg] = useState("");

  const submit = async (): Promise<void> => {
    setScanMsg("");
    try {
      await scan.mutateAsync({ code: code.trim() });
      setScanMsg("ok");
      setCode("");
    } catch (err) {
      setScanMsg(
        err instanceof ApiError
          ? toVietnameseRegistrationError(err.code, err.message)
          : "Có lỗi xảy ra.",
      );
    }
  };

  if (ticket.isPending) {
    return <LoadingState label="Đang tải mã điểm danh…" />;
  }
  if (!ticket.data) {
    return <></>;
  }
  const token = ticket.data.checkin_token;

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-300 bg-zinc-100 p-3 dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
        Mã điểm danh của bạn
      </p>
      <p className="mt-1 font-mono text-sm break-all text-zinc-900 dark:text-zinc-100">
        {token}
      </p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Xuất trình mã này cho ban tổ chức khi đến điểm danh.
      </p>
      <button
        type="button"
        onClick={() => void copy()}
        aria-label="Sao chép mã điểm danh"
        className="mt-2 inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-zinc-300 px-3 text-sm text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-700 dark:text-zinc-200 dark:focus-visible:outline-zinc-400"
      >
        {copied ? (
          <FiCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        ) : (
          <FiCopy className="h-4 w-4" aria-hidden="true" />
        )}
        {copied ? "Đã sao chép" : "Sao chép mã"}
      </button>
      <div className="mt-3 border-t border-zinc-300 pt-3 dark:border-zinc-700">
        <label
          htmlFor={`scan-${registrationId}`}
          className="text-xs font-medium text-zinc-500 dark:text-zinc-400"
        >
          Nhập mã QR tại địa điểm để tự điểm danh
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id={`scan-${registrationId}`}
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Mã trên màn hình QR…"
            className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 font-mono text-sm text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus-visible:outline-zinc-400"
          />
          <button
            type="button"
            onClick={() => void submit()}
            disabled={scan.isPending || code.trim().length === 0}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
          >
            <FiMaximize className="h-4 w-4" aria-hidden="true" />
            {scan.isPending ? "Đang quét…" : "Điểm danh"}
          </button>
        </div>
        {scanMsg === "ok" ? (
          <p
            role="status"
            className="mt-1 text-xs text-emerald-600 dark:text-emerald-400"
          >
            Điểm danh thành công.
          </p>
        ) : scanMsg ? (
          <p
            role="alert"
            className="mt-1 text-xs text-red-600 dark:text-red-400"
          >
            {scanMsg}
          </p>
        ) : null}
      </div>
      <div className="mt-3 border-t border-zinc-300 pt-3 dark:border-zinc-700">
        <AppealBox
          activityId={activityId}
          registrationId={registrationId}
        />
      </div>
      <div className="mt-3 border-t border-zinc-300 pt-3 dark:border-zinc-700">
        <StatusTimeline
          activityId={activityId}
          registrationId={registrationId}
        />
      </div>
    </div>
  );
}
