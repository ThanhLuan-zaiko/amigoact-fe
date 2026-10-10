import { useState, type ReactElement } from "react";
import { FiCalendar, FiClipboard, FiXCircle } from "react-icons/fi";
import { ApiError } from "../core/api.ts";
import { BentoCard } from "../core/components/BentoCard.tsx";
import { Button } from "../core/components/Button.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { formatDateTime } from "../activities/dates.tsx";
import {
  useCancelRegistration,
  useMyAttendance,
  useMyRegistrations,
} from "./hooks.ts";
import { TicketCard } from "./components/TicketCard.tsx";
import {
  CHECKIN_METHOD_LABELS,
  REGISTRATION_STATUS_LABELS,
  toVietnameseRegistrationError,
} from "./messages.tsx";

const CANCELLABLE = new Set(["pending", "approved", "waitlisted"]);

export function MyRegistrationsPage(): ReactElement {
  const mine = useMyRegistrations();
  const attendance = useMyAttendance();
  const cancel = useCancelRegistration();
  const [error, setError] = useState("");
  const [openTicket, setOpenTicket] = useState<string | null>(null);

  const onCancel = async (
    activityId: string,
    registrationId: string,
  ): Promise<void> => {
    setError("");
    try {
      await cancel.mutateAsync({ activityId, registrationId });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? toVietnameseRegistrationError(err.code, err.message)
          : "Có lỗi xảy ra.",
      );
    }
  };

  return (
    <>
      <BentoCard className="md:col-span-6 lg:col-span-12">
        <div data-rise className="flex items-center gap-2">
          <FiClipboard className="h-5 w-5 text-zinc-900 dark:text-brand" aria-hidden="true" />
          <h1 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            Đăng ký của tôi
          </h1>
        </div>
        {mine.isPending && (
          <LoadingState label="Đang tải đăng ký…" />
        )}
        {mine.isError && (
          <ErrorState
            title="Không tải được"
            message={mine.error.message}
          />
        )}
        {mine.data && mine.data.length === 0 && (
          <EmptyState
            title="Chưa đăng ký hoạt động nào"
            message="Khám phá các hoạt động đang mở và gửi đăng ký đầu tiên."
          />
        )}
        {mine.data && mine.data.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {mine.data.map((row) => (
              <li
                key={row.registration_id}
                className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {REGISTRATION_STATUS_LABELS[row.status] ?? row.status}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {row.registered_at
                        ? `Đăng ký ${formatDateTime(row.registered_at)}`
                        : ""}
                      {row.review_note ? ` · ${row.review_note}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      to={`/events`}
                      icon={
                        <FiCalendar className="h-4 w-4" aria-hidden="true" />
                      }
                    >
                      Xem sự kiện
                    </Button>
                    {(row.status === "approved" ||
                      row.status === "attended") && (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          setOpenTicket(
                            openTicket === row.registration_id
                              ? null
                              : row.registration_id,
                          )
                        }
                      >
                        {openTicket === row.registration_id
                          ? "Ẩn mã"
                          : "Mã điểm danh"}
                      </Button>
                    )}
                    {CANCELLABLE.has(row.status) && (
                      <Button
                        variant="ghost"
                        disabled={cancel.isPending}
                        onClick={() =>
                          void onCancel(
                            row.activity_id,
                            row.registration_id,
                          )
                        }
                        icon={
                          <FiXCircle className="h-4 w-4" aria-hidden="true" />
                        }
                      >
                        Hủy
                      </Button>
                    )}
                  </div>
                </div>
                {openTicket === row.registration_id && (
                  <TicketCard
                    activityId={row.activity_id}
                    registrationId={row.registration_id}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </BentoCard>
      <BentoCard className="md:col-span-6 lg:col-span-12">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Lịch sử điểm danh
        </h2>
        {attendance.isPending && (
          <LoadingState label="Đang tải điểm danh…" />
        )}
        {attendance.data && attendance.data.length === 0 && (
          <EmptyState
            title="Chưa có lượt điểm danh"
            message="Khi bạn check-in tại sự kiện, bản ghi sẽ hiện tại đây."
          />
        )}
        {attendance.data && attendance.data.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {attendance.data.map((row) => (
              <li
                key={row.record_id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <p className="text-sm text-zinc-900 dark:text-zinc-100">
                  {row.scanned_at ? formatDateTime(row.scanned_at) : "—"}
                  <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {CHECKIN_METHOD_LABELS[row.method ?? ""] ?? row.method}
                  </span>
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {row.actual_hours != null
                    ? `${row.actual_hours} giờ`
                    : "Chưa chốt giờ"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </BentoCard>
    </>
  );
}
