import { useState, type ReactElement } from "react";
import { useParams } from "react-router-dom";
import {
  FiCheckCircle,
  FiExternalLink,
  FiPlayCircle,
  FiXCircle,
} from "react-icons/fi";
import { BentoCard } from "../core/components/BentoCard.tsx";
import { Button } from "../core/components/Button.tsx";
import {
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import {
  useActivityDetail,
  useAddAnnouncement,
  useAddSchedule,
  useCategories,
  useDeleteSchedule,
  useSetStaff,
  useTransitionActivity,
  useUpdateActivity,
} from "./hooks.ts";
import { StatusChip } from "./components/ActivityCard.tsx";
import { formatDateTime } from "./dates.tsx";
import { ActivityForm } from "./components/ActivityForm.tsx";
import { AnnouncementPanel } from "./components/AnnouncementPanel.tsx";
import { SchedulePanel, StaffPanel } from "./components/DetailPanels.tsx";
import { AttendancePanel } from "../registrations/components/AttendancePanel.tsx";
import { RosterPanel } from "../registrations/components/RosterPanel.tsx";
import { HoursPanel } from "../hours/components/HoursPanel.tsx";

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

export function ManageEventDetailPage(): ReactElement {
  const { orgId, activityId } = useParams<{
    orgId: string;
    activityId: string;
  }>();
  const detail = useActivityDetail(orgId, activityId);
  const categories = useCategories(orgId);
  const update = useUpdateActivity(orgId ?? "");
  const transition = useTransitionActivity(orgId ?? "");
  const addSchedule = useAddSchedule(orgId ?? "", activityId ?? "");
  const deleteSchedule = useDeleteSchedule(orgId ?? "", activityId ?? "");
  const setStaff = useSetStaff(orgId ?? "", activityId ?? "");
  const addAnnouncement = useAddAnnouncement(orgId ?? "", activityId ?? "");
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");

  if (detail.isPending) {
    return (
      <BentoCard className="md:col-span-6 lg:col-span-12">
        <LoadingState label="Đang tải hoạt động…" />
      </BentoCard>
    );
  }
  if (detail.isError || !detail.data) {
    return (
      <BentoCard className="md:col-span-6 lg:col-span-12">
        <ErrorState
          title="Không tải được"
          message={detail.error?.message ?? "Hoạt động không tồn tại."}
        />
      </BentoCard>
    );
  }

  const view = detail.data;
  const a = view.activity;
  const actions = NEXT_ACTIONS[a.status] ?? [];
  const editable = a.status === "draft" || a.status === "published";

  const runTransition = async (target: string): Promise<void> => {
    await transition.mutateAsync({ activityId: a.id, status: target });
    setNotice("Đã cập nhật trạng thái.");
  };

  return (
    <>
      <BentoCard className="md:col-span-6 lg:col-span-12">
        <div data-rise className="flex flex-wrap items-center justify-between gap-2">
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
                onClick={() => setEditing((v) => !v)}
              >
                {editing ? "Đóng chỉnh sửa" : "Chỉnh sửa"}
              </Button>
            )}
            {actions.map(({ target, label, Icon }) => (
              <Button
                key={target}
                variant={target === "cancelled" ? "ghost" : "primary"}
                disabled={transition.isPending}
                onClick={() => void runTransition(target)}
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
      </BentoCard>

      {editing && (
        <BentoCard className="md:col-span-6 lg:col-span-12">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Chỉnh sửa thông tin
          </h2>
          <div className="mt-3">
            <ActivityForm
              categories={categories.data ?? []}
              initial={a}
              submitLabel="Lưu thay đổi"
              onSubmit={(input) =>
                update.mutateAsync({ activityId: a.id, input })
              }
              onDone={() => {
                setEditing(false);
                setNotice("Đã lưu thay đổi.");
              }}
            />
          </div>
        </BentoCard>
      )}

      <BentoCard className="md:col-span-6 lg:col-span-6">
        <SchedulePanel
          schedules={view.schedules}
          canManage={editable}
          onAdd={(input) => addSchedule.mutateAsync(input)}
          onDelete={(id) => deleteSchedule.mutateAsync(id)}
        />
      </BentoCard>
      <BentoCard className="md:col-span-6 lg:col-span-6">
        <StaffPanel
          view={view}
          canManage={editable}
          onSave={(staff) => setStaff.mutateAsync(staff)}
        />
      </BentoCard>
      <BentoCard className="md:col-span-6 lg:col-span-6">
        <RosterPanel activityId={a.id} />
      </BentoCard>
      <BentoCard className="md:col-span-6 lg:col-span-6">
        <AttendancePanel activityId={a.id} />
      </BentoCard>
      <BentoCard className="md:col-span-6 lg:col-span-12">
        <HoursPanel orgId={a.org_id} activityId={a.id} />
      </BentoCard>
      <BentoCard className="md:col-span-6 lg:col-span-12">
        <AnnouncementPanel
          announcements={view.announcements}
          canManage
          onAdd={(input) => addAnnouncement.mutateAsync(input)}
        />
      </BentoCard>
    </>
  );
}
