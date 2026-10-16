import { useState, type ReactElement } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import { LoadingState } from "../../core/components/Feedback.tsx";
import { useTicket } from "../hooks.ts";
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
  const [copied, setCopied] = useState(false);

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
        <StatusTimeline
          activityId={activityId}
          registrationId={registrationId}
        />
      </div>
    </div>
  );
}
