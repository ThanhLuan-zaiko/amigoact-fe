import { useState, type ReactElement } from "react";
import { FiCheck, FiPlus, FiX } from "react-icons/fi";
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
  useActivityHours,
  useReviewHours,
  useSubmitManualHours,
} from "../hooks.ts";
import { AdjustBox } from "./AdjustBox.tsx";
import {
  HOUR_SOURCE_LABELS,
  HOUR_STATUS_LABELS,
  toVietnameseHourError,
} from "../messages.tsx";

interface HoursPanelProps {
  orgId: string;
  activityId: string;
}

export function HoursPanel({
  orgId,
  activityId,
}: HoursPanelProps): ReactElement {
  const ledger = useActivityHours(orgId, activityId);
  const review = useReviewHours();
  const submit = useSubmitManualHours(orgId);
  const [studentId, setStudentId] = useState("");
  const [hours, setHours] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const failMessage = (err: unknown): string =>
    err instanceof ApiError
      ? toVietnameseHourError(err.code, err.message)
      : "Có lỗi xảy ra.";

  const act = async (fn: () => Promise<unknown>): Promise<void> => {
    setError("");
    setNotice("");
    try {
      await fn();
    } catch (err) {
      setError(failMessage(err));
    }
  };

  const onSubmitManual = async (): Promise<void> => {
    const value = Number.parseFloat(hours);
    if (!studentId.trim() || !Number.isFinite(value) || value <= 0) {
      setError("Nhập mã sinh viên và số giờ hợp lệ.");
      return;
    }
    await act(async () => {
      await submit.mutateAsync({
        student_id: studentId.trim(),
        activity_id: activityId,
        hours: value,
      });
      setNotice("Đã ghi giờ — chờ duyệt.");
      setStudentId("");
      setHours("");
    });
  };

  return (
    <div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Sổ giờ tình nguyện
      </h3>
      {ledger.isPending && (
        <LoadingState label="Đang tải sổ giờ…" />
      )}
      {ledger.isError && (
        <ErrorState
          title="Không tải được"
          message={ledger.error.message}
        />
      )}
      {ledger.data && ledger.data.length === 0 && (
        <EmptyState
          title="Chưa có bản ghi"
          message="Giờ check-out và giờ nhập tay sẽ hiện tại đây."
        />
      )}
      {ledger.data && ledger.data.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {ledger.data.map((row) => (
            <li
              key={row.entry_id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {row.hours} giờ
                  <span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">
                    {HOUR_SOURCE_LABELS[row.source] ?? row.source}
                    {" · "}
                    {HOUR_STATUS_LABELS[row.status] ?? row.status}
                  </span>
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {row.recorded_at
                    ? formatDateTime(row.recorded_at)
                    : "—"}
                </p>
              </div>
              {row.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    disabled={review.isPending}
                    onClick={() =>
                      void act(() =>
                        review.mutateAsync({
                          entryId: row.entry_id,
                          status: "approved",
                        }),
                      )
                    }
                    icon={<FiCheck className="h-4 w-4" aria-hidden="true" />}
                  >
                    Duyệt
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={review.isPending}
                    onClick={() =>
                      void act(() =>
                        review.mutateAsync({
                          entryId: row.entry_id,
                          status: "rejected",
                        }),
                      )
                    }
                    icon={<FiX className="h-4 w-4" aria-hidden="true" />}
                  >
                    Từ chối
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Ghi giờ thủ công
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
          <TextField
            label="Mã sinh viên"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="UUID của tình nguyện viên"
            className="flex-1"
          />
          <TextField
            label="Số giờ"
            type="number"
            min={0}
            step={0.5}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="sm:w-28"
          />
          <Button
            variant="secondary"
            disabled={submit.isPending}
            onClick={() => void onSubmitManual()}
            icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
          >
            Ghi giờ
          </Button>
        </div>
      </div>
      <AdjustBox
        orgId={orgId}
        activityId={activityId}
        failMessage={failMessage}
        onError={(m) => {
          setError(m);
          setNotice("");
        }}
        onDone={(m) => {
          setNotice(m);
          setError("");
        }}
      />
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
    </div>
  );
}
