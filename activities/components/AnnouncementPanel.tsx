import { useState, type ReactElement } from "react";
import { FiBell, FiPlus } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState, ErrorState } from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import type { AnnouncementItem } from "../api.ts";
import { formatDateTime } from "../dates.ts";

interface AnnouncementPanelProps {
  announcements: AnnouncementItem[];
  canManage: boolean;
  onAdd: (input: { title: string; body: string }) => Promise<unknown>;
}

export function AnnouncementPanel({
  announcements,
  canManage,
  onAdd,
}: AnnouncementPanelProps): ReactElement {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const add = async (): Promise<void> => {
    setError("");
    try {
      await onAdd({ title, body });
      setTitle("");
      setBody("");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Lỗi.");
    }
  };

  return (
    <section aria-label="Thông báo" className="flex flex-col gap-3">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <FiBell className="h-4 w-4" aria-hidden="true" /> Bảng tin
      </h4>
      {error && <ErrorState title="Lỗi" message={error} />}
      {announcements.length === 0 ? (
        <EmptyState title="Chưa có tin" message="Chưa có thông báo nào." />
      ) : (
        <ul className="flex flex-col gap-2">
          {announcements.map((a) => (
            <li
              key={a.announcement_id}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
            >
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {a.title}
              </p>
              {a.body && (
                <p className="mt-1 text-xs text-zinc-600 sm:text-sm dark:text-zinc-400">
                  {a.body}
                </p>
              )}
              <p className="mt-1 text-xs text-zinc-400">
                {formatDateTime(a.published_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
      {canManage && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <TextField
            label="Tiêu đề"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Nội dung"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="self-end">
            <Button
              variant="secondary"
              onClick={() => void add()}
              disabled={title.trim().length < 2}
              icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
            >
              Đăng tin
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
