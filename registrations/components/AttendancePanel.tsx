import { useState, type ReactElement } from "react";
import { FiLogOut, FiUserCheck } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { formatDateTime } from "../../activities/dates.tsx";
import {
  useActivityAttendance,
  useCheckIn,
  useCheckOut,
} from "../hooks.ts";
import {
  CHECKIN_METHOD_LABELS,
  toVietnameseRegistrationError,
} from "../messages.tsx";

interface AttendancePanelProps {
  activityId: string;
}

export function AttendancePanel({
  activityId,
}: AttendancePanelProps): ReactElement {
  const attendance = useActivityAttendance(activityId);
  const checkIn = useCheckIn(activityId);
  const checkOut = useCheckOut(activityId);
  const [token, setToken] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const failMessage = (err: unknown): string =>
    err instanceof ApiError
      ? toVietnameseRegistrationError(err.code, err.message)
      : "Có lỗi xảy ra.";

  const scan = async (): Promise<void> => {
    setError("");
    setNotice("");
    try {
      await checkIn.mutateAsync({ checkinToken: token.trim() });
      setNotice("Điểm danh thành công.");
      setToken("");
    } catch (err) {
      setError(failMessage(err));
    }
  };

  const out = async (recordId: string): Promise<void> => {
    setError("");
    try {
      await checkOut.mutateAsync({ recordId });
    } catch (err) {
      setError(failMessage(err));
    }
  };

  return (
    <div data-rise>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Điểm danh
      </h3>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <TextField
          label="Mã điểm danh của tình nguyện viên"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Dán mã từ vé của tình nguyện viên…"
          className="flex-1"
        />
        <Button
          disabled={checkIn.isPending || token.trim().length === 0}
          onClick={() => void scan()}
          icon={<FiUserCheck className="h-4 w-4" aria-hidden="true" />}
        >
          Điểm danh
        </Button>
      </div>
      {notice && (
        <p
          role="status"
          className="mt-2 text-sm text-emerald-600 dark:text-emerald-400"
        >
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {attendance.isPending && (
        <LoadingState label="Đang tải danh sách điểm danh…" />
      )}
      {attendance.isError && (
        <ErrorState
          title="Không tải được"
          message={attendance.error.message}
        />
      )}
      {attendance.data && attendance.data.length === 0 && (
        <EmptyState
          title="Chưa ai điểm danh"
          message="Bản ghi điểm danh sẽ hiện khi tình nguyện viên check-in."
        />
      )}
      {attendance.data && attendance.data.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {attendance.data.map((row) => (
            <li
              key={row.record_id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {row.scanned_at
                    ? formatDateTime(row.scanned_at)
                    : "—"}
                  <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {CHECKIN_METHOD_LABELS[row.method ?? ""] ??
                      row.method}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {row.checked_out_at
                    ? `Ra về ${formatDateTime(row.checked_out_at)}`
                    : "Chưa check-out"}
                  {row.actual_hours != null
                    ? ` · ${row.actual_hours} giờ`
                    : ""}
                </p>
              </div>
              {!row.checked_out_at && (
                <Button
                  variant="secondary"
                  disabled={checkOut.isPending}
                  onClick={() => void out(row.record_id)}
                  icon={<FiLogOut className="h-4 w-4" aria-hidden="true" />}
                >
                  Check-out
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
