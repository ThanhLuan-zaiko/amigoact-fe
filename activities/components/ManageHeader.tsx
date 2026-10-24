import type { ReactElement } from "react";
import {
  FiCheckCircle,
  FiExternalLink,
  FiPlayCircle,
  FiXCircle,
} from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { StatusChip } from "./ActivityCard.tsx";
import { formatDateTime } from "../dates.tsx";
import type { ActivityDetail } from "../api.ts";

const NEXT_ACTIONS: Record<
  string,
  { target: string; label: string; Icon: typeof FiPlayCircle }[]
> = {
  draft: [
    { target: "published", label: "Công bố", Icon: FiPlayCircle },
    { target: "cancelled", label: "Hủy", Icon: FiXCircle },
  ],
  published: [
    { target: "ongoing", label: "Bắt đầu", Icon: FiPlayCircle },
    { target: "completed", label: "Kết thúc", Icon: FiCheckCircle },
    { target: "cancelled", label: "Hủy", Icon: FiXCircle },
  ],
  ongoing: [
    { target: "completed", label: "Kết thúc", Icon: FiCheckCircle },
    { target: "cancelled", label: "Hủy", Icon: FiXCircle },
  ],
};

interface ManageHeaderProps {
  activity: ActivityDetail;
  editing: boolean;
  pending: boolean;
  notice: string;
  onToggleEdit: () => void;
  onTransition: (target: string) => void;
}

export function ManageHeader({
  activity: a,
  editing,
  pending,
  notice,
  onToggleEdit,
  onTransition,
}: ManageHeaderProps): ReactElement {
  // Trashed rows are read-only until restored; restore is the delete row's job.
  const trashed = a.deleted_at !== null;
  const actions = trashed ? [] : (NEXT_ACTIONS[a.status] ?? []);
  const editable =
    !trashed && (a.status === "draft" || a.status === "published");
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            {a.title}
          </h1>
          <StatusChip status={a.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            to={`/events/${a.org_id}/${a.slug}`}
            icon={<FiExternalLink className="h-4 w-4" aria-hidden="true" />}
          >
            Trang công khai
          </Button>
          {editable && (
            <Button
              variant={editing ? "secondary" : "primary"}
              onClick={onToggleEdit}
            >
              {editing ? "Đóng chỉnh sửa" : "Chỉnh sửa"}
            </Button>
          )}
          {actions.map(({ target, label, Icon }) => (
            <Button
              key={target}
              variant={target === "cancelled" ? "ghost" : "primary"}
              disabled={pending}
              onClick={() => onTransition(target)}
              icon={<Icon className="h-4 w-4" aria-hidden="true" />}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      {notice && (
        <p role="status" className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
          {notice}
        </p>
      )}
      {trashed && (
        <p role="status" className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          Hoạt động đang ở thùng rác. Khôi phục để chỉnh sửa hoặc đổi trạng thái.
        </p>
      )}
      <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-zinc-500">Bắt đầu</dt>
          <dd className="font-medium text-zinc-900 dark:text-zinc-100">
            {formatDateTime(a.start_at)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">Kết thúc</dt>
          <dd className="font-medium text-zinc-900 dark:text-zinc-100">
            {formatDateTime(a.end_at)}
          </dd>
        </div>
      </dl>
    </>
  );
}
