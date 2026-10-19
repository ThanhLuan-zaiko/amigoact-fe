import { useState, type ReactElement } from "react";
import { useParams } from "react-router-dom";
import { Section } from "../core/components/Section.tsx";
import {
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import {
  useActivityDetail,
  useAddAnnouncement,
  useAddSchedule,
  useCategories,
  useCreateCategory,
  useDeleteSchedule,
  useLiveActivities,
  useSetPartners,
  useSetSkills,
  useSetStaff,
  useTransitionActivity,
  useUpdateActivity,
} from "./hooks.ts";
import { ManageHeader } from "./components/ManageHeader.tsx";
import { ActivityForm } from "./components/ActivityForm.tsx";
import { AnnouncementPanel } from "./components/AnnouncementPanel.tsx";
import { SchedulePanel } from "./components/DetailPanels.tsx";
import { StaffPanel } from "./components/StaffPanel.tsx";
import { CategoryCreator } from "./components/CategoryCreator.tsx";
import { FormBuilder } from "./components/FormBuilder.tsx";
import { PartnersPanel } from "./components/PartnersPanel.tsx";
import { SkillsPanel } from "./components/SkillsPanel.tsx";
import { AppealPanel } from "../registrations/components/AppealPanel.tsx";
import { AttendancePanel } from "../registrations/components/AttendancePanel.tsx";
import { SessionPanel } from "../registrations/components/SessionPanel.tsx";
import { RosterPanel } from "../registrations/components/RosterPanel.tsx";
import { HoursPanel } from "../hours/components/HoursPanel.tsx";
import { RulePanel } from "../hours/components/RulePanel.tsx";
import { TemplatePanel } from "../certificates/components/TemplatePanel.tsx";
import { MediaPanel } from "./components/MediaPanel.tsx";
import { DailyStatsCard } from "../stats/components/DailyStatsCard.tsx";

export function ManageEventDetailPage(): ReactElement {
  const { orgId, activityId } = useParams<{
    orgId: string;
    activityId: string;
  }>();
  useLiveActivities(orgId);
  const detail = useActivityDetail(orgId, activityId);
  const categories = useCategories(orgId);
  const update = useUpdateActivity(orgId ?? "");
  const transition = useTransitionActivity(orgId ?? "");
  const addSchedule = useAddSchedule(orgId ?? "", activityId ?? "");
  const deleteSchedule = useDeleteSchedule(orgId ?? "", activityId ?? "");
  const setStaff = useSetStaff(orgId ?? "", activityId ?? "");
  const setPartners = useSetPartners(orgId ?? "", activityId ?? "");
  const setSkills = useSetSkills(orgId ?? "", activityId ?? "");
  const createCategory = useCreateCategory(orgId ?? "");
  const addAnnouncement = useAddAnnouncement(orgId ?? "", activityId ?? "");
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");

  if (detail.isPending) {
    return (
      <Section>
        <LoadingState label="Đang tải hoạt động…" />
      </Section>
    );
  }
  if (detail.isError || !detail.data) {
    return (
      <Section>
        <ErrorState
          title="Không tải được"
          message={detail.error?.message ?? "Hoạt động không tồn tại."}
        />
      </Section>
    );
  }

  const view = detail.data;
  const a = view.activity;
  const editable = a.status === "draft" || a.status === "published";

  const runTransition = async (target: string): Promise<void> => {
    await transition.mutateAsync({ activityId: a.id, status: target });
    setNotice("Đã cập nhật trạng thái.");
  };

  return (
    <>
      <Section>
        <ManageHeader
          activity={a}
          editing={editing}
          pending={transition.isPending}
          notice={notice}
          onToggleEdit={() => setEditing((v) => !v)}
          onTransition={(target) => void runTransition(target)}
        />
      </Section>

      {editing && (
        <Section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Chỉnh sửa thông tin
          </h2>
          <div className="mt-3">
            <ActivityForm
              orgId={a.org_id}
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
            <div className="mt-3">
              <CategoryCreator
                onCreate={(input) => createCategory.mutateAsync(input)}
              />
            </div>
          </div>
        </Section>
      )}

      <Section>
        <SchedulePanel
          orgId={orgId ?? ""}
          activityId={activityId ?? ""}
          schedules={view.schedules}
          canManage={editable}
          onAdd={(input) => addSchedule.mutateAsync(input)}
          onDelete={(id) => deleteSchedule.mutateAsync(id)}
        />
      </Section>
      <Section>
        <StaffPanel
          view={view}
          canManage={editable}
          onSave={(staff) => setStaff.mutateAsync(staff)}
        />
      </Section>
      <Section>
        <PartnersPanel
          partners={view.partners}
          canManage={editable}
          onSave={(partners) => setPartners.mutateAsync(partners)}
        />
      </Section>
      <Section>
        <SkillsPanel
          skills={view.skills}
          canManage={editable}
          onSave={(skills) => setSkills.mutateAsync(skills)}
        />
      </Section>
      <Section>
        <FormBuilder orgId={a.org_id} activityId={a.id} />
      </Section>
      <Section>
        <RosterPanel activityId={a.id} orgId={a.org_id} />
      </Section>
      <Section>
        <AttendancePanel activityId={a.id} />
      </Section>
      <Section>
        <SessionPanel activityId={a.id} schedules={view.schedules} />
      </Section>
      <Section>
        <AppealPanel activityId={a.id} />
      </Section>
      <Section>
        <HoursPanel orgId={a.org_id} activityId={a.id} />
      </Section>
      <Section>
        <RulePanel orgId={a.org_id} />
      </Section>
      <Section>
        <TemplatePanel orgId={a.org_id} />
      </Section>
      <Section>
        <MediaPanel activityId={a.id} />
      </Section>
      <Section>
        <DailyStatsCard activityId={a.id} />
      </Section>
      <Section>
        <AnnouncementPanel
          announcements={view.announcements}
          canManage
          onAdd={(input) => addAnnouncement.mutateAsync(input)}
        />
      </Section>
    </>
  );
}
