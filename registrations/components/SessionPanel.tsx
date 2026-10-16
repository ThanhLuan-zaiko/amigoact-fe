import { useState, type ReactElement } from "react";
import {
  FiCopy,
  FiPlay,
  FiPlus,
  FiStopCircle,
} from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import {
  EmptyState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { SelectField } from "../../core/components/SelectField.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { formatDateTime } from "../../activities/dates.tsx";
import type { ScheduleItem } from "../../activities/api.ts";
import {
  useCreateSession,
  useScans,
  useSessions,
  useTransitionSession,
} from "../sessions-hooks.ts";

const SESSION_LABELS: Record<string, string> = {
  scheduled: "Đã lên lịch", open: "Đang mở", closed: "Đã đóng",
};

const SCAN_LABELS: Record<string, string> = {
  accepted: "Hợp lệ", duplicate: "Trùng",
  expired: "Hết hạn", invalid: "Không hợp lệ",
};

interface SessionPanelProps {
  activityId: string;
  schedules: ScheduleItem[];
}

export function SessionPanel({
  activityId,
  schedules,
}: SessionPanelProps): ReactElement {
  const sessions = useSessions(activityId);
  const create = useCreateSession(activityId);
  const transition = useTransitionSession(activityId);
  const [scheduleId, setScheduleId] = useState("");
  const [title, setTitle] = useState("");
  const [viewScans, setViewScans] = useState<string | null>(null);
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const scans = useScans(activityId, viewScans);

  const failMessage = (err: unknown): string =>
    err instanceof ApiError ? err.message : "Có lỗi xảy ra.";

  const add = async (): Promise<void> => {
    setError("");
    try {
      await create.mutateAsync({
        scheduleId,
        input: { title: title.trim() },
      });
      setTitle("");
    } catch (err) {
      setError(failMessage(err));
    }
  };

  const act = async (
    schedule: string,
    sessionId: string,
    action: "open" | "closed",
  ): Promise<void> => {
    setError("");
    try {
      await transition.mutateAsync({ scheduleId: schedule, sessionId, action });
    } catch (err) {
      setError(failMessage(err));
    }
  };

  const copy = async (code: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <section aria-label="Phiên điểm danh QR" className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Phiên điểm danh QR
      </h4>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {sessions.isPending && (
        <LoadingState label="Đang tải phiên điểm danh…" />
      )}
      {sessions.data && sessions.data.length === 0 && (
        <EmptyState
          title="Chưa có phiên"
          message="Tạo phiên điểm danh để phát mã QR cho tình nguyện viên."
        />
      )}
      {(sessions.data?.length ?? 0) > 0 && (
        <ul className="flex flex-col gap-2">
          {sessions.data!.map((s) => (
            <li
              key={s.session_id}
              className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {s.title}
                    <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                      {SESSION_LABELS[s.status] ?? s.status}
                    </span>
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {s.closes_at
                      ? `Đóng ${formatDateTime(s.closes_at)}`
                      : "Không giới hạn"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {s.status === "scheduled" && (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        void act(s.schedule_id, s.session_id, "open")
                      }
                      icon={<FiPlay className="h-4 w-4" aria-hidden="true" />}
                    >
                      Mở
                    </Button>
                  )}
                  {s.status === "open" && (
                    <Button
                      variant="ghost"
                      onClick={() =>
                        void act(s.schedule_id, s.session_id, "closed")
                      }
                      icon={
                        <FiStopCircle className="h-4 w-4" aria-hidden="true" />
                      }
                    >
                      Đóng
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setViewScans(
                        viewScans === s.session_id ? null : s.session_id,
                      )
                    }
                  >
                    {viewScans === s.session_id ? "Ẩn log" : "Log quét"}
                  </Button>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-zinc-50 px-2 py-1.5 dark:bg-zinc-900">
                <code className="flex-1 truncate text-xs text-zinc-700 dark:text-zinc-300">
                  {s.qr_code}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Sao chép mã QR"
                  onClick={() => void copy(s.qr_code)}
                  icon={
                    <FiCopy className="h-3.5 w-3.5" aria-hidden="true" />
                  }
                >
                  <span className="sr-only">
                    {copied === s.qr_code ? "Đã chép" : "Sao chép"}
                  </span>
                </Button>
                {copied === s.qr_code && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">
                    Đã chép
                  </span>
                )}
              </div>
              {viewScans === s.session_id && (
                <ul className="mt-2 flex flex-col gap-1 border-t border-zinc-100 pt-2 dark:border-zinc-800/60">
                  {scans.data?.length === 0 && (
                    <li className="text-xs text-zinc-500 dark:text-zinc-400">
                      Chưa có lượt quét nào.
                    </li>
                  )}
                  {scans.data?.map((l, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400"
                    >
                      <span>
                        {l.student_id.slice(0, 8)}…
                        {l.device_info ? ` · ${l.device_info}` : ""}
                      </span>
                      <span>
                        {SCAN_LABELS[l.result] ?? l.result}
                        {l.scanned_at
                          ? ` · ${formatDateTime(l.scanned_at)}`
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <SelectField
          label="Lịch diễn"
          value={scheduleId}
          onChange={setScheduleId}
          options={schedules.map((s) => ({ value: s.id, label: s.title }))}
        />
        <TextField
          label="Tên phiên"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="VD: Điểm danh ca sáng"
        />
        <div className="self-end">
          <Button
            variant="secondary"
            onClick={() => void add()}
            disabled={!scheduleId || title.trim().length < 2}
            icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
          >
            Tạo phiên
          </Button>
        </div>
      </div>
    </section>
  );
}
