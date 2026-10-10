import { useState, type ReactElement } from "react";
import {
  FiAward,
  FiCheck,
  FiClock,
  FiUserCheck,
  FiX,
} from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { formatDateTime } from "../../activities/dates.ts";
import { useIssueCertificate } from "../../certificates/hooks.ts";
import { toVietnameseCertificateError } from "../../certificates/messages.tsx";
import { useManualCheckIn, useReview, useRoster } from "../hooks.ts";
import {
  REGISTRATION_STATUS_LABELS,
  toVietnameseRegistrationError,
} from "../messages.tsx";

interface RosterPanelProps {
  activityId: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending:
    "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
  approved:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
  attended:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
  rejected:
    "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400",
  waitlisted:
    "border-zinc-300 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
  cancelled:
    "border-zinc-300 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400",
};

export function RosterPanel({
  activityId,
}: RosterPanelProps): ReactElement {
  const roster = useRoster(activityId);
  const review = useReview(activityId);
  const checkIn = useManualCheckIn(activityId);
  const issueCert = useIssueCertificate(activityId);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  if (roster.isPending) {
    return <LoadingState label="Đang tải danh sách đăng ký…" />;
  }
  if (roster.isError) {
    return (
      <ErrorState
        title="Không tải được danh sách"
        message={roster.error.message}
      />
    );
  }
  const rows = roster.data ?? [];

  const act = async (
    fn: () => Promise<unknown>,
    success?: string,
  ): Promise<void> => {
    setError("");
    setNotice("");
    try {
      await fn();
      if (success) setNotice(success);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? toVietnameseRegistrationError(
              err.code,
              toVietnameseCertificateError(err.code, err.message),
            )
          : "Có lỗi xảy ra.",
      );
    }
  };

  return (
    <div data-rise>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Đơn đăng ký ({rows.length})
      </h3>
      {rows.length === 0 ? (
        <EmptyState
          title="Chưa có đăng ký"
          message="Đơn đăng ký sẽ hiện tại đây khi tình nguyện viên tham gia."
        />
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {rows.map((row) => (
            <li
              key={row.registration_id}
              className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                  {row.student_name}
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {row.student_email ?? ""}
                  {row.registered_at
                    ? ` · ${formatDateTime(row.registered_at)}`
                    : ""}
                </p>
                {row.note && (
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    “{row.note}”
                  </p>
                )}
                <span
                  className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[row.status] ?? STATUS_STYLES.waitlisted}`}
                >
                  {REGISTRATION_STATUS_LABELS[row.status] ?? row.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(row.status === "pending" ||
                  row.status === "waitlisted") && (
                  <Button
                    disabled={review.isPending}
                    onClick={() =>
                      void act(() =>
                        review.mutateAsync({
                          registrationId: row.registration_id,
                          status: "approved",
                        }),
                      )
                    }
                    icon={<FiCheck className="h-4 w-4" aria-hidden="true" />}
                  >
                    Duyệt
                  </Button>
                )}
                {row.status === "pending" && (
                  <Button
                    variant="secondary"
                    disabled={review.isPending}
                    onClick={() =>
                      void act(() =>
                        review.mutateAsync({
                          registrationId: row.registration_id,
                          status: "waitlisted",
                        }),
                      )
                    }
                    icon={<FiClock className="h-4 w-4" aria-hidden="true" />}
                  >
                    Chờ
                  </Button>
                )}
                {row.status === "approved" && (
                  <Button
                    variant="secondary"
                    disabled={checkIn.isPending}
                    onClick={() =>
                      void act(() =>
                        checkIn.mutateAsync({
                          registrationId: row.registration_id,
                        }),
                      )
                    }
                    icon={
                      <FiUserCheck className="h-4 w-4" aria-hidden="true" />
                    }
                  >
                    Điểm danh
                  </Button>
                )}
                {row.status === "attended" && (
                  <Button
                    variant="secondary"
                    disabled={issueCert.isPending}
                    onClick={() =>
                      void act(
                        () =>
                          issueCert.mutateAsync({
                            studentId: row.student_id,
                          }),
                        "Đã cấp chứng nhận.",
                      )
                    }
                    icon={<FiAward className="h-4 w-4" aria-hidden="true" />}
                  >
                    Cấp chứng nhận
                  </Button>
                )}
                {(row.status === "pending" ||
                  row.status === "waitlisted") && (
                  <Button
                    variant="ghost"
                    disabled={review.isPending}
                    onClick={() =>
                      void act(() =>
                        review.mutateAsync({
                          registrationId: row.registration_id,
                          status: "rejected",
                        }),
                      )
                    }
                    icon={<FiX className="h-4 w-4" aria-hidden="true" />}
                  >
                    Từ chối
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
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
