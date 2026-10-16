import type { ReactElement } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { formatDateTime } from "../../activities/dates.tsx";
import { useAppeals, useResolveAppeal } from "../appeals-hooks.ts";

const APPEAL_LABELS: Record<string, string> = {
  pending: "Đang chờ",
  approved: "Đã chấp nhận",
  rejected: "Đã từ chối",
};

interface AppealPanelProps {
  activityId: string;
}

export function AppealPanel({ activityId }: AppealPanelProps): ReactElement {
  const appeals = useAppeals(activityId, true);
  const resolve = useResolveAppeal(activityId);

  if (appeals.isPending) {
    return <LoadingState label="Đang tải khiếu nại…" />;
  }
  if (appeals.isError) {
    return (
      <ErrorState
        title="Không tải được khiếu nại"
        message={appeals.error?.message}
      />
    );
  }
  const rows = appeals.data ?? [];

  return (
    <div>
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Khiếu nại điểm danh
      </h2>
      {rows.length === 0 ? (
        <EmptyState
          title="Chưa có khiếu nại"
          message="Sinh viên chưa gửi khiếu nại điểm danh nào."
        />
      ) : (
        <ul className="mt-3 space-y-3">
          {rows.map((a) => (
            <li
              key={a.appeal_id}
              className="rounded-xl border border-zinc-300 p-3 dark:border-zinc-700"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {APPEAL_LABELS[a.status] ?? a.status}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {a.created_at ? formatDateTime(a.created_at) : ""}
                </p>
              </div>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                {a.reason}
              </p>
              {a.status === "pending" ? (
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="primary"
                    disabled={resolve.isPending}
                    onClick={() =>
                      void resolve.mutateAsync({
                        studentId: a.student_id,
                        appealId: a.appeal_id,
                        status: "approved",
                      })
                    }
                    icon={<FiCheck className="h-4 w-4" aria-hidden="true" />}
                  >
                    Chấp nhận
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={resolve.isPending}
                    onClick={() =>
                      void resolve.mutateAsync({
                        studentId: a.student_id,
                        appealId: a.appeal_id,
                        status: "rejected",
                      })
                    }
                    icon={<FiX className="h-4 w-4" aria-hidden="true" />}
                  >
                    Từ chối
                  </Button>
                </div>
              ) : a.resolved_at ? (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Xử lý lúc {formatDateTime(a.resolved_at)}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
