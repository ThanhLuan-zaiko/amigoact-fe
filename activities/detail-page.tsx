import type { ReactElement } from "react";
import { useParams } from "react-router-dom";
import { Section } from "../core/components/Section.tsx";
import { ErrorState, LoadingState } from "../core/components/Feedback.tsx";
import { useDocumentTitle } from "../core/page-title.ts";
import {
  useActivityBySlug,
  useActivityDetail,
  useCategories,
} from "./hooks.ts";
import { useEventCard, useEventDetailRealtime } from "./detail-hooks.ts";
import { ActivityGallery } from "./components/ActivityGallery.tsx";
import { AnnouncementPanel } from "./components/AnnouncementPanel.tsx";
import { SchedulePanel } from "./components/DetailPanels.tsx";
import { EventDetailHeader } from "./components/EventDetailHeader.tsx";
import { EventMeta } from "./components/EventMeta.tsx";
import { EventPeopleSection } from "./components/EventPeopleSection.tsx";
import { toVietnameseBrowseMessage } from "./messages.tsx";
import { ApplyCard } from "../registrations/components/ApplyCard.tsx";
import { ReviewsPanel } from "../reviews/components/ReviewsPanel.tsx";

export function EventDetailPage(): ReactElement {
  const { orgId, slug } = useParams<{ orgId: string; slug: string }>();
  const activity = useActivityBySlug(orgId, slug);
  const detail = useActivityDetail(orgId, activity.data?.id);
  const categories = useCategories(orgId);
  const card = useEventCard(activity.data?.id);
  useEventDetailRealtime(orgId, activity.data?.id, slug);
  useDocumentTitle(activity.data?.title ?? "Sự kiện");

  if (activity.isPending) {
    return (
      <Section>
        <LoadingState label="Đang tải hoạt động…" />
      </Section>
    );
  }
  // Only a missing activity reads as "not found"; network and server
  // failures get a retry instead.
  if (activity.isError && activity.error.status !== 404) {
    return (
      <Section>
        <ErrorState
          title="Không tải được hoạt động"
          message={toVietnameseBrowseMessage(activity.error.code)}
          actionLabel="Thử lại"
          onAction={() => void activity.refetch()}
        />
      </Section>
    );
  }
  if (activity.isError || !activity.data) {
    return (
      <Section>
        <ErrorState
          title="Không tìm thấy hoạt động"
          message="Hoạt động không tồn tại hoặc chưa được công bố."
        />
      </Section>
    );
  }

  const a = activity.data;
  const category = (categories.data ?? []).find(
    (c) => c.id === a.category_id,
  );
  const view = detail.data;
  const cardView = card.data;

  return (
    <>
      <Section>
        {cardView?.cover_url && (
          <img
            src={cardView.cover_url}
            alt={a.title}
            className="mb-4 aspect-video w-full rounded-xl border border-zinc-200 object-cover dark:border-zinc-800"
          />
        )}
        <EventDetailHeader
          activity={a}
          categoryName={category?.name}
          org={cardView?.org}
        />
        <EventMeta activity={a} seatsLeft={cardView?.seats_left ?? null} />
        {a.description && (
          <p className="mt-4 text-sm whitespace-pre-wrap text-zinc-700 sm:text-base dark:text-zinc-300">
            {a.description}
          </p>
        )}
        {view && view.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {view.skills.map((s) => (
              <span
                key={s.skill_id}
                className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
              >
                {s.name}
                {s.is_required ? " · bắt buộc" : ""}
              </span>
            ))}
          </div>
        )}
      </Section>
      <EventPeopleSection
        view={view}
        error={detail.error}
        onRetry={() => void detail.refetch()}
      />
      <Section>
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Tham gia
        </h3>
        <div className="mt-3">
          <ApplyCard
            orgId={a.org_id}
            activityId={a.id}
            activityStatus={a.status}
            registrationOpen={cardView?.registration_open}
          />
        </div>
      </Section>
      {view && view.schedules.length > 0 && (
        <Section>
          <SchedulePanel
            orgId={a.org_id}
            activityId={a.id}
            schedules={view.schedules}
            canManage={false}
          />
        </Section>
      )}
      {view && view.announcements.length > 0 && (
        <Section>
          <AnnouncementPanel
            announcements={view.announcements}
            canManage={false}
          />
        </Section>
      )}
      <Section>
        <ActivityGallery activityId={a.id} />
      </Section>
      <Section>
        <ReviewsPanel activityId={a.id} />
      </Section>
    </>
  );
}
