import { useState, type ReactElement } from "react";
import {
  FiCalendar,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState, ErrorState } from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import type { ScheduleItem } from "../api.ts";
import { formatDateTime } from "../dates.tsx";
import { SlotEditor } from "./SlotEditor.tsx";

interface SchedulePanelProps {
  orgId: string;
  activityId: string;
  schedules: ScheduleItem[];
  canManage: boolean;
  onAdd?: (input: {
    title: string;
    location: string | null;
    start_at: string | null;
    end_at: string | null;
  }) => Promise<unknown>;
  onDelete?: (scheduleId: string) => Promise<unknown>;
}

export function SchedulePanel({
  orgId,
  activityId,
  schedules,
  canManage,
  onAdd,
  onDelete,
}: SchedulePanelProps): ReactElement {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startAt, setStartAt] = useState("");
  const [error, setError] = useState("");

  const add = async (): Promise<void> => {
    if (!onAdd) return;
    setError("");
    try {
      await onAdd({
        title,
        location: location || null,
        start_at: startAt ? new Date(startAt).toISOString() : null,
        end_at: null,
      });
      setTitle("");
      setLocation("");
      setStartAt("");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Lỗi.");
    }
  };

  return (
    <section aria-label="Lịch diễn" className="flex flex-col gap-3">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <FiCalendar className="h-4 w-4" aria-hidden="true" /> Lịch diễn
      </h4>
      {error && <ErrorState title="Lỗi" message={error} />}
      {schedules.length === 0 ? (
        <EmptyState title="Chưa có lịch" message="Chưa xếp phiên nào." />
      ) : (
        <ul className="flex flex-col gap-2">
          {schedules.map((s) => (
            <li
              key={s.id}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {s.title}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {s.location ?? ""} · {formatDateTime(s.start_at)}
                  </p>
                </div>
                {canManage && (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Xóa lịch"
                    onClick={() => void onDelete?.(s.id)}
                    icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
                  >
                    <span className="sr-only">Xóa</span>
                  </Button>
                )}
              </div>
              {canManage && (
                <SlotEditor
                  orgId={orgId}
                  activityId={activityId}
                  scheduleId={s.id}
                />
              )}
            </li>
          ))}
        </ul>
      )}
      {canManage && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
          <TextField
            label="Tên phiên"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Địa điểm"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <TextField
            label="Bắt đầu"
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
          />
          <div className="self-end">
            <Button
              variant="secondary"
              onClick={() => void add()}
              disabled={title.trim().length < 2}
              icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
            >
              Thêm
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
