import type { ReactElement } from "react";
import { FiClock } from "react-icons/fi";
import { ApiError } from "../core/api.ts";
import { Section } from "../core/components/Section.tsx";
import {
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { useSession } from "../auth/hooks.ts";
import { useMyProfile } from "./hooks.ts";
import { profileMessage, profileStatusLabel } from "./messages.tsx";
import { AvatarCard } from "./components/AvatarCard.tsx";
import { ContactsCard } from "./components/ContactsCard.tsx";
import { SkillPickerCard } from "./components/SkillPickerCard.tsx";
import { VolunteerProfileCard } from "./components/VolunteerProfileCard.tsx";

export function VolunteerProfilePage(): ReactElement {
  const session = useSession();
  const profile = useMyProfile(session.data != null);

  if (profile.isPending) {
    return (
      <Section>
        <LoadingState label="Đang tải hồ sơ tình nguyện…" />
      </Section>
    );
  }
  if (profile.isError) {
    const code =
      profile.error instanceof ApiError
        ? profile.error.code
        : "REQUEST_FAILED";
    return (
      <Section>
        <ErrorState
          title="Không tải được hồ sơ"
          message={profileMessage(code)}
        />
      </Section>
    );
  }

  const data = profile.data;
  return (
    <>
      <Section>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 sm:text-xl dark:text-zinc-100">
              Hồ sơ tình nguyện viên
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Hoàn thiện hồ sơ để nhà tổ chức hiểu bạn và ghép đúng hoạt động.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
              {profileStatusLabel(data.status)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
              <FiClock className="h-3.5 w-3.5" aria-hidden="true" />
              {data.total_hours.toFixed(1)} giờ
            </span>
          </div>
        </div>
      </Section>
      <VolunteerProfileCard key={data.updated_at ?? "new"} profile={data} />
      <AvatarCard
        avatarUrl={data.avatar_url}
        fullName={session.data?.full_name ?? "bạn"}
      />
      <ContactsCard profile={data} />
      <SkillPickerCard
        key={data.skills.map((s) => `${s.id}:${s.level}`).join(",")}
        profile={data}
      />
    </>
  );
}
