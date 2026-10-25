import type { ReactElement } from "react";
import { FiCheckCircle, FiCircle, FiClock, FiEye } from "react-icons/fi";
import { useSession } from "../../auth/hooks.ts";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { RailCard } from "../../core/components/RailCard.tsx";
import type { VolunteerProfile } from "../api.ts";
import { useMyProfile } from "../hooks.ts";
import { profileStatusLabel } from "../messages.tsx";
import { MAX_CONTACTS } from "../draft.ts";
import { AvatarCard } from "./AvatarCard.tsx";

interface Check {
  label: string;
  done: boolean;
}

function checksOf(profile: VolunteerProfile): Check[] {
  return [
    { label: "Thông tin học vấn", done: Boolean(profile.school_name) },
    { label: "Giới thiệu bản thân", done: Boolean(profile.bio) },
    { label: "Sở thích", done: profile.interests.length > 0 },
    { label: "Kỹ năng", done: profile.skills.length > 0 },
    { label: "Liên hệ khẩn cấp", done: profile.contacts.length > 0 },
    { label: "Ảnh đại diện", done: profile.avatar_url !== null },
  ];
}

// Right rail of /manage/volunteer. It reads the same cache as the form, so
// it shows the last saved state, never unsaved draft edits.
export function VolunteerRail(): ReactElement {
  const session = useSession();
  const profile = useMyProfile(session.data != null);

  if (profile.isError) {
    return (
      <ErrorState
        title="Không tải được hồ sơ"
        message="Vui lòng thử lại sau ít phút."
      />
    );
  }
  if (!profile.data || !session.data) {
    return <LoadingState label="Đang tải hồ sơ…" />;
  }

  const data = profile.data;
  const checks = checksOf(data);
  const done = checks.filter((check) => check.done).length;

  return (
    <div className="flex flex-col gap-4">
      <RailCard title="Tổng quan">
        <div className="px-4 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
              {profileStatusLabel(data.status)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              <FiClock className="h-3.5 w-3.5" aria-hidden="true" />
              {`${data.total_hours.toFixed(1)} giờ`}
            </span>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <dt className="text-[13px] text-zinc-500 dark:text-zinc-400">Kỹ năng</dt>
              <dd className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                {data.skills.length}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-zinc-500 dark:text-zinc-400">Liên hệ khẩn cấp</dt>
              <dd className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                {`${data.contacts.length}/${MAX_CONTACTS}`}
              </dd>
            </div>
          </dl>
          <p className="mt-5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {`Hoàn thiện ${done}/${checks.length}`}
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            {checks.map((check) => (
              <li
                key={check.label}
                className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                {check.done ? (
                  <FiCheckCircle
                    className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                ) : (
                  <FiCircle
                    className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500"
                    aria-hidden="true"
                  />
                )}
                <span>
                  {check.label}
                  <span className="sr-only">{check.done ? " — đã có" : " — chưa có"}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Tính theo dữ liệu đã lưu.
          </p>
        </div>
      </RailCard>
      <RailCard title="Ảnh đại diện">
        <AvatarCard avatarUrl={data.avatar_url} fullName={session.data.full_name} />
      </RailCard>
      <RailCard title="Hồ sơ công khai">
        <div className="px-4 pb-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Nhà tổ chức xem hồ sơ này khi ghép hoạt động. Liên hệ khẩn cấp không
            hiển thị công khai.
          </p>
          <div className="mt-3">
            <Button
              to={`/volunteers/${session.data.id}`}
              variant="secondary"
              icon={<FiEye className="h-4 w-4" aria-hidden="true" />}
            >
              Xem hồ sơ công khai
            </Button>
          </div>
        </div>
      </RailCard>
    </div>
  );
}
