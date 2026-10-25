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
import { VolunteerForm } from "./components/VolunteerForm.tsx";

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
        <h1 className="text-lg font-semibold text-zinc-900 sm:text-xl dark:text-zinc-100">
          Hồ sơ tình nguyện viên
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Hoàn thiện hồ sơ để nhà tổ chức hiểu bạn và ghép đúng hoạt động.
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <FiClock className="h-4 w-4" aria-hidden="true" />
          {`${profileStatusLabel(data.status)} · ${data.total_hours.toFixed(1)} giờ tình nguyện`}
        </p>
      </Section>
      <VolunteerForm profile={data} />
    </>
  );
}
