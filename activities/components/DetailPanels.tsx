import { useState, type ReactElement } from "react";
import {
  FiCalendar,
  FiPlus,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState, ErrorState } from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import type {
  ActivityDetailView,
  ScheduleItem,
} from "../api.ts";
import { formatDateTime } from "../dates.ts";

interface SchedulePanelProps {
  schedules: ScheduleItem[];
  canManage: boolean;
  onAdd: (input: {
    title: string;
    location: string | null;
    start_at: string | null;
    end_at: string | null;
  }) => Promise<unknown>;
  onDelete: (scheduleId: string) => Promise<unknown>;
}

export function SchedulePanel({
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
              className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
            >
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
                  onClick={() => void onDelete(s.id)}
                  icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
                >
                  <span className="sr-only">Xóa</span>
                </Button>
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

interface StaffPanelProps {
  view: ActivityDetailView;
  canManage: boolean;
  onSave: (
    staff: { user_id: string; staff_role: string }[],
  ) => Promise<unknown>;
}

export function StaffPanel({
  view,
  canManage,
  onSave,
}: StaffPanelProps): ReactElement {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("supporter");
  const [error, setError] = useState("");

  const add = async (): Promise<void> => {
    setError("");
    try {
      await onSave([
        ...view.staff.map((s) => ({
          user_id: s.user_id,
          staff_role: s.staff_role,
        })),
        { user_id: userId.trim(), staff_role: role },
      ]);
      setUserId("");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Lỗi.");
    }
  };

  const remove = async (id: string): Promise<void> => {
    await onSave(
      view.staff
        .filter((s) => s.user_id !== id)
        .map((s) => ({ user_id: s.user_id, staff_role: s.staff_role })),
    );
  };

  return (
    <section aria-label="Ban tổ chức" className="flex flex-col gap-3">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <FiUsers className="h-4 w-4" aria-hidden="true" /> Ban tổ chức
      </h4>
      {error && <ErrorState title="Lỗi" message={error} />}
      {view.staff.length === 0 ? (
        <EmptyState title="Chưa có nhân sự" message="Chưa phân công ai." />
      ) : (
        <ul className="flex flex-col gap-2">
          {view.staff.map((s) => (
            <li
              key={s.user_id}
              className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
            >
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {s.full_name}
                <span className="ml-2 text-xs text-zinc-500">{s.staff_role}</span>
              </p>
              {canManage && (
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Gỡ nhân sự"
                  onClick={() => void remove(s.user_id)}
                  icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
                >
                  <span className="sr-only">Gỡ</span>
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {canManage && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <TextField
            label="User ID thành viên"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="uuid của thành viên"
          />
          <div className="flex flex-col gap-1">
            <label
              htmlFor="staff-role"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              Vai trò
            </label>
            <select
              id="staff-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="organizer">Điều phối</option>
              <option value="supervisor">Giám sát</option>
              <option value="supporter">Hỗ trợ</option>
            </select>
          </div>
          <div className="self-end">
            <Button
              variant="secondary"
              onClick={() => void add()}
              disabled={userId.trim().length < 10}
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
