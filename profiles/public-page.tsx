import type { ReactElement } from "react";
import { useParams } from "react-router-dom";
import { FiAward, FiClock, FiHeart, FiMapPin, FiUser } from "react-icons/fi";
import { ApiError, apiBaseUrl } from "../core/api.ts";
import { Section } from "../core/components/Section.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { usePublicProfile } from "./hooks.ts";
import { LEVEL_LABELS, profileMessage } from "./messages.tsx";

export function PublicVolunteerPage(): ReactElement {
  const { userId } = useParams<{ userId: string }>();
  const card = usePublicProfile(userId);

  if (card.isPending) {
    return (
      <Section>
        <LoadingState label="Đang tải hồ sơ…" />
      </Section>
    );
  }
  if (card.isError) {
    const code =
      card.error instanceof ApiError ? card.error.code : "REQUEST_FAILED";
    if (code === "NOT_FOUND") {
      return (
        <Section>
          <EmptyState
            title="Không tìm thấy tình nguyện viên"
            message="Hồ sơ này không tồn tại hoặc tài khoản đã ngừng hoạt động."
          />
        </Section>
      );
    }
    return (
      <Section>
        <ErrorState title="Không tải được hồ sơ" message={profileMessage(code)} />
      </Section>
    );
  }

  const data = card.data;
  const avatar = data.avatar_url ? `${apiBaseUrl()}${data.avatar_url}` : null;
  return (
    <>
      <Section>
        <div className="flex flex-col items-center text-center">
          {avatar ? (
            <img
              src={avatar}
              alt={`Ảnh đại diện của ${data.full_name}`}
              className="h-24 w-24 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-24 w-24 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <FiUser className="h-10 w-10" />
            </span>
          )}
          <h1 className="mt-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {data.full_name}
          </h1>
          {data.school_name && (
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
              <FiMapPin className="h-4 w-4" aria-hidden="true" />
              {data.school_name}
              {data.class_name ? ` · ${data.class_name}` : ""}
            </p>
          )}
          <p className="mt-3 inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
            <FiClock className="h-4 w-4" aria-hidden="true" />
            {data.total_hours.toFixed(1)} giờ tình nguyện
          </p>
          {data.member_since && (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Tham gia từ{" "}
              {new Date(data.member_since).toLocaleDateString("vi-VN")}
            </p>
          )}
        </div>
      </Section>
      <Section>
        {data.bio && (
          <>
            <h2 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
              Giới thiệu
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm text-zinc-600 dark:text-zinc-400">
              {data.bio}
            </p>
          </>
        )}
        {data.interests.length > 0 && (
          <div className="mt-4">
            <h2 className="inline-flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
              <FiHeart className="h-4 w-4 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
              Sở thích
            </h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {data.interests.map((interest) => (
                <li
                  key={interest}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
                >
                  {interest}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4">
          <h2 className="inline-flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            <FiAward className="h-4 w-4 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
            Kỹ năng
          </h2>
          {data.skills.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Chưa cập nhật kỹ năng.
            </p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {data.skills.map((skill) => (
                <li
                  key={skill.id}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
                >
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {skill.name}
                  </span>
                  <span className="ml-auto flex items-center gap-1" aria-label={`Mức ${skill.level}/5 — ${LEVEL_LABELS[skill.level]}`}>
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <span
                        key={dot}
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-full ${
                          dot <= skill.level
                            ? "bg-zinc-900 dark:bg-zinc-100"
                            : "bg-zinc-200 dark:bg-zinc-700"
                        }`}
                      />
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>
    </>
  );
}
