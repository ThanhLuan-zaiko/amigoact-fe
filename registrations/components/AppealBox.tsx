import { useState, type ReactElement } from "react";
import { FiAlertCircle, FiSend } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { TextArea } from "../../core/components/TextArea.tsx";
import { useFileAppeal, useMyAppeals, useSummary } from "../appeals-hooks.ts";
import { toVietnameseRegistrationError } from "../messages.tsx";

const APPEAL_LABELS: Record<string, string> = {
  pending: "Đang chờ",
  approved: "Đã chấp nhận",
  rejected: "Đã từ chối",
};

interface AppealBoxProps {
  activityId: string;
  registrationId: string;
}

export function AppealBox({
  activityId,
  registrationId,
}: AppealBoxProps): ReactElement {
  const summary = useSummary(activityId, registrationId);
  const appeals = useMyAppeals(activityId, true);
  const file = useFileAppeal(activityId);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (): Promise<void> => {
    setMsg("");
    try {
      await file.mutateAsync({ reason: reason.trim() });
      setMsg("ok");
      setReason("");
      setOpen(false);
    } catch (err) {
      setMsg(
        err instanceof ApiError
          ? toVietnameseRegistrationError(err.code, err.message)
          : "Có lỗi xảy ra.",
      );
    }
  };

  const s = summary.data;
  return (
    <div>
      {s && (
        <dl className="grid grid-cols-3 gap-2 text-center">
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">Phiên</dt>
            <dd className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {s.sessions_attended}/{s.sessions_total}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">Phút</dt>
            <dd className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {s.minutes_attended}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">
              Trạng thái
            </dt>
            <dd
              className={`text-sm font-semibold ${
                s.status === "complete"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-900 dark:text-zinc-100"
              }`}
            >
              {s.status === "complete" ? "Hoàn thành" : "Chưa đủ"}
            </dd>
          </div>
        </dl>
      )}
      {(appeals.data?.length ?? 0) > 0 && (
        <ul className="mt-3 space-y-1">
          {appeals.data!.map((a) => (
            <li
              key={a.appeal_id}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <span className="min-w-0 truncate text-zinc-600 dark:text-zinc-300">
                {a.reason}
              </span>
              <span className="shrink-0 font-medium text-zinc-500 dark:text-zinc-400">
                {APPEAL_LABELS[a.status] ?? a.status}
              </span>
            </li>
          ))}
        </ul>
      )}
      {open ? (
        <div className="mt-3">
          <TextArea
            label="Lý do khiếu nại"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={2000}
            rows={2}
          />
          <div className="mt-2 flex gap-2">
            <Button
              variant="primary"
              disabled={file.isPending || reason.trim().length < 3}
              onClick={() => void submit()}
              icon={<FiSend className="h-4 w-4" aria-hidden="true" />}
            >
              {file.isPending ? "Đang gửi…" : "Gửi khiếu nại"}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Đóng
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-zinc-300 px-3 text-sm text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-700 dark:text-zinc-200 dark:focus-visible:outline-zinc-400"
        >
          <FiAlertCircle className="h-4 w-4" aria-hidden="true" />
          Khiếu nại điểm danh
        </button>
      )}
      {msg === "ok" ? (
        <p
          role="status"
          className="mt-1 text-xs text-emerald-600 dark:text-emerald-400"
        >
          Đã gửi khiếu nại.
        </p>
      ) : msg ? (
        <p
          role="alert"
          className="mt-1 text-xs text-red-600 dark:text-red-400"
        >
          {msg}
        </p>
      ) : null}
    </div>
  );
}
