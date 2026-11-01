import {
  FiCalendar,
  FiCheck,
  FiClock,
  FiMapPin,
  FiSend,
  FiUserPlus,
} from "react-icons/fi";
import type { Activity, Organization } from "./types";
import {
  mutedText,
  primaryButton,
  secondaryButton,
  sectionTitle,
  tagChip,
} from "./ui";

type RightRailProps = {
  activities: Activity[];
  suggestedOrganizations: Organization[];
  popularTags: string[];
};

export default function RightRail({
  activities,
  suggestedOrganizations,
  popularTags,
}: RightRailProps) {
  return (
    <div className="flex flex-col">
      <section className="flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <h2 className={sectionTitle}>Hoạt động sắp diễn ra</h2>
        {activities.length === 0 ? (
          <p className={mutedText}>Chưa có hoạt động sắp diễn ra.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {activities.map((activity) => (
              <li key={activity.id} className="flex flex-col gap-1.5">
                <p className="font-semibold">{activity.title}</p>
                <p className={`${mutedText} flex items-center gap-2`}>
                  <FiCalendar aria-hidden="true" />
                  {activity.startsAt}
                </p>
                <p className={`${mutedText} flex items-center gap-2`}>
                  <FiMapPin aria-hidden="true" />
                  {activity.location}
                </p>
                <p className={`${mutedText} flex items-center gap-2`}>
                  <FiClock aria-hidden="true" />
                  {activity.hours} giờ tình nguyện
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {activity.registeredCount}/{activity.maxParticipants} chỗ
                </p>
                <button
                  type="button"
                  className={`${secondaryButton} self-start`}
                >
                  <FiCheck aria-hidden="true" />
                  Đăng ký
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3 border-b border-slate-200 py-4 dark:border-slate-800">
        <h2 className={sectionTitle}>Tổ chức gợi ý</h2>
        {suggestedOrganizations.length === 0 ? (
          <p className={mutedText}>Chưa có gợi ý.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {suggestedOrganizations.map((organization) => {
              const isOpen = organization.joinPolicy === "open";
              return (
                <li key={organization.id} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {organization.name}
                    </p>
                    <p className={mutedText}>
                      {isOpen ? "Mở tham gia" : "Cần duyệt thành viên"}
                    </p>
                  </div>
                  {isOpen ? (
                    <button type="button" className={primaryButton}>
                      <FiUserPlus aria-hidden="true" />
                      Tham gia
                    </button>
                  ) : (
                    <button type="button" className={secondaryButton}>
                      <FiSend aria-hidden="true" />
                      Gửi yêu cầu
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3 py-4">
        <h2 className={sectionTitle}>Thẻ phổ biến</h2>
        {popularTags.length === 0 ? (
          <p className={mutedText}>Chưa có thẻ nào.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <li key={tag} className={tagChip}>
                #{tag}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
