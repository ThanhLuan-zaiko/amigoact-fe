import type { ReactElement } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiAward,
  FiClock,
  FiGlobe,
  FiHash,
  FiMapPin,
  FiUsers,
} from "react-icons/fi";
import { Section } from "../core/components/Section.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import {
  useActivityBySlug,
  useActivityDetail,
  useCategories,
} from "./hooks.ts";
import { StatusChip } from "./components/ActivityCard.tsx";
import { formatDateTime } from "./dates.tsx";
import { ActivityGallery } from "./components/ActivityGallery.tsx";
import { AnnouncementPanel } from "./components/AnnouncementPanel.tsx";
import { SchedulePanel } from "./components/DetailPanels.tsx";
import { ApplyCard } from "../registrations/components/ApplyCard.tsx";
import { ReviewsPanel } from "../reviews/components/ReviewsPanel.tsx";
import { PARTNER_ROLE_LABELS } from "./messages.tsx";

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: ReactElement;
  label: string;
  value: string;
}): ReactElement {
  return (
    <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
      {icon}
      <span className="text-xs text-zinc-500 sm:text-sm">{label}:</span>
      <span className="font-medium text-zinc-900 dark:text-zinc-100">
        {value}
      </span>
    </li>
  );
}

export function EventDetailPage(): ReactElement {
  const { orgId, slug } = useParams<{ orgId: string; slug: string }>();
  const activity = useActivityBySlug(orgId, slug);
  const detail = useActivityDetail(orgId, activity.data?.id);
  const categories = useCategories(orgId);

  if (activity.isPending) {
    return (
      <Section>
        <LoadingState label="Đang tải hoạt động…" />
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

  return (
    <>
      <Section>
        <div data-rise className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold text-zinc-900 sm:text-xl dark:text-zinc-100">
            {a.title}
          </h1>
          <StatusChip status={a.status} />
          {category && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {category.name}
            </span>
          )}
          {a.tags.map((tag) => (
            <Link
              key={tag.slug}
              to={`/events?tag=${tag.slug}`}
              className="inline-flex items-center gap-0.5 rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400"
            >
              <FiHash className="h-3 w-3" aria-hidden="true" />
              {tag.name}
            </Link>
          ))}
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          <MetaRow
            icon={<FiClock className="h-4 w-4 text-zinc-600 dark:text-zinc-300" aria-hidden="true" />}
            label="Bắt đầu"
            value={formatDateTime(a.start_at)}
          />
          <MetaRow
            icon={<FiClock className="h-4 w-4 text-zinc-600 dark:text-zinc-300" aria-hidden="true" />}
            label="Kết thúc"
            value={formatDateTime(a.end_at)}
          />
          <MetaRow
            icon={
              a.is_remote ? (
                <FiGlobe className="h-4 w-4 text-zinc-600 dark:text-zinc-300" aria-hidden="true" />
              ) : (
                <FiMapPin className="h-4 w-4 text-zinc-600 dark:text-zinc-300" aria-hidden="true" />
              )
            }
            label="Địa điểm"
            value={
              a.is_remote
                ? "Trực tuyến"
                : [a.location, a.address, a.city]
                    .filter(Boolean)
                    .join(", ") || "Đang cập nhật"
            }
          />
          <MetaRow
            icon={<FiAward className="h-4 w-4 text-zinc-600 dark:text-zinc-300" aria-hidden="true" />}
            label="Giờ tình nguyện"
            value={`${a.hours_awarded} giờ`}
          />
          {a.max_participants && (
            <MetaRow
              icon={<FiUsers className="h-4 w-4 text-zinc-600 dark:text-zinc-300" aria-hidden="true" />}
              label="Số lượng"
              value={`Tối đa ${a.max_participants} người`}
            />
          )}
          {a.registration_deadline && (
            <MetaRow
              icon={<FiClock className="h-4 w-4 text-zinc-600 dark:text-zinc-300" aria-hidden="true" />}
              label="Hạn đăng ký"
              value={formatDateTime(a.registration_deadline)}
            />
          )}
        </ul>
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
      <Section>
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Đối tác & nhân sự
        </h3>
        {!view ? (
          <EmptyState
            title="Chỉ thành viên"
            message="Đăng nhập và tham gia tổ chức để xem chi tiết."
          />
        ) : (
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {view.partners.map((p) => (
              <li
                key={p.org_id}
                className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800"
              >
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {p.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {PARTNER_ROLE_LABELS[p.role] ?? p.role}
                  {p.note ? ` · ${p.note}` : ""}
                </p>
              </li>
            ))}
            {view.partners.length === 0 && view.staff.length === 0 && (
              <EmptyState
                title="Chưa công bố"
                message="Đối tác và nhân sự sẽ hiện khi được phân công."
              />
            )}
          </ul>
        )}
      </Section>
      <Section>
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Tham gia
        </h3>
        <div className="mt-3">
          <ApplyCard orgId={a.org_id} activityId={a.id} activityStatus={a.status} />
        </div>
      </Section>
      {view && view.schedules.length > 0 && (
        <Section>
          <SchedulePanel
            orgId={a.org_id}
            activityId={a.id}
            schedules={view.schedules}
            canManage={false}
            onAdd={async () => undefined}
            onDelete={async () => undefined}
          />
        </Section>
      )}
      {view && view.announcements.length > 0 && (
        <Section>
          <AnnouncementPanel
            announcements={view.announcements}
            canManage={false}
            onAdd={async () => undefined}
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
