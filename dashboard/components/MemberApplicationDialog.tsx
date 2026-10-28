import { useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  FiAward,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiDownload,
  FiExternalLink,
  FiHeart,
  FiMail,
  FiMessageSquare,
  FiPaperclip,
  FiUser,
} from "react-icons/fi";
import { apiBaseUrl } from "../../core/api.ts";
import { downloadApplicationFile } from "../../orgs/api.ts";
import { usePublicProfile } from "../../profiles/hooks.ts";
import { LEVEL_LABELS } from "../../profiles/messages.tsx";
import { ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { Modal } from "../../core/components/Modal.tsx";
import { useMemberApplication } from "../application-hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import type { ApplicationFile, DashboardMember } from "../members-api.ts";

function Block({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}): ReactElement {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function Stat({ icon, label }: { icon: ReactNode; label: string }): ReactElement {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
      {icon}
      {label}
    </span>
  );
}

function saveBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// One evidence file on a submission; downloads go through the authenticated route.
function EvidenceDownload({
  orgId,
  userId,
  file,
}: {
  orgId: string;
  userId: string;
  file: ApplicationFile;
}): ReactElement {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function download(): Promise<void> {
    setBusy(true);
    setFailed(false);
    try {
      const result = await downloadApplicationFile(orgId, userId, file.media_id);
      saveBlob(result.filename ?? file.name, result.blob);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-900">
      <FiPaperclip className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate text-sm text-zinc-900 dark:text-zinc-100">
        {file.name}
      </span>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{formatSize(file.size_bytes)}</span>
      <button
        type="button"
        onClick={() => void download()}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-900 hover:bg-white disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-950"
      >
        <FiDownload className="h-3.5 w-3.5" aria-hidden="true" />
        {busy ? "Đang tải…" : "Tải xuống"}
      </button>
      {failed && <span className="w-full text-xs text-red-700 dark:text-red-300">Không tải được file.</span>}
    </div>
  );
}

// Applicant's public volunteer card, so a form-less submission still says who applied.
function VolunteerSummary({
  member,
  submitted,
}: {
  member: DashboardMember;
  submitted: string;
}): ReactElement {
  const profile = usePublicProfile(member.user_id);
  const p = profile.data;
  const rawAvatar = p?.avatar_url ?? member.avatar_url;
  const avatar = rawAvatar ? `${apiBaseUrl()}${rawAvatar}` : null;
  const name = p?.full_name || member.full_name || "Người nộp";
  const school = p ? [p.school_name, p.class_name].filter(Boolean).join(" · ") : "";

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="h-16 w-16 shrink-0 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <FiUser className="h-7 w-7" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {name}
          </p>
          {school && (
            <p className="mt-0.5 flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
              <FiBookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{school}</span>
            </p>
          )}
          {member.email && (
            <p className="mt-0.5 flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
              <FiMail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <a href={`mailto:${member.email}`} className="truncate hover:underline">
                {member.email}
              </a>
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {p && (
              <Stat
                icon={<FiClock className="h-3.5 w-3.5" aria-hidden="true" />}
                label={`${p.total_hours.toFixed(1)} giờ tình nguyện`}
              />
            )}
            {p?.member_since && (
              <Stat
                icon={<FiCalendar className="h-3.5 w-3.5" aria-hidden="true" />}
                label={`Tham gia từ ${new Date(p.member_since).toLocaleDateString("vi-VN")}`}
              />
            )}
            <Stat
              icon={<FiCalendar className="h-3.5 w-3.5" aria-hidden="true" />}
              label={`Nộp lúc ${submitted}`}
            />
          </div>
        </div>
      </header>

      {profile.isPending && <LoadingState label="Đang tải hồ sơ tình nguyện…" />}
      {profile.isError && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Người nộp chưa có hồ sơ tình nguyện công khai.
        </p>
      )}
      {p && (
        <>
          <Block
            icon={<FiUser className="h-3.5 w-3.5" aria-hidden="true" />}
            title="Giới thiệu"
          >
            <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
              {p.bio || "Chưa viết giới thiệu."}
            </p>
          </Block>
          <Block
            icon={<FiAward className="h-3.5 w-3.5" aria-hidden="true" />}
            title="Kỹ năng"
          >
            {p.skills.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Chưa cập nhật kỹ năng.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {p.skills.map((skill) => (
                  <li
                    key={skill.id}
                    className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm text-zinc-900 dark:text-zinc-100">
                      {skill.name}
                    </span>
                    <span
                      className="flex items-center gap-1"
                      aria-label={`Mức ${skill.level}/5 — ${LEVEL_LABELS[skill.level]}`}
                      title={LEVEL_LABELS[skill.level]}
                    >
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <span
                          key={dot}
                          aria-hidden="true"
                          className={`h-1.5 w-1.5 rounded-full ${
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
          </Block>
          {p.interests.length > 0 && (
            <Block
              icon={<FiHeart className="h-3.5 w-3.5" aria-hidden="true" />}
              title="Sở thích"
            >
              <ul className="flex flex-wrap gap-1.5">
                {p.interests.map((interest) => (
                  <li
                    key={interest}
                    className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {interest}
                  </li>
                ))}
              </ul>
            </Block>
          )}
        </>
      )}
      <Link
        to={`/volunteers/${member.user_id}`}
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-zinc-900 underline underline-offset-2 dark:text-zinc-100"
      >
        <FiExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        Xem trang hồ sơ đầy đủ
      </Link>
    </div>
  );
}

interface MemberApplicationDialogProps {
  orgId: string;
  member: DashboardMember;
  onClose: () => void;
}

// Reviewer view of one submission: volunteer profile, then answers in form order.
export function MemberApplicationDialog({
  orgId,
  member,
  onClose,
}: MemberApplicationDialogProps): ReactElement {
  const application = useMemberApplication(orgId, member.user_id, true);
  const data = application.data;
  const submitted = data
    ? new Date(data.submitted_at).toLocaleString("vi-VN")
    : "";
  return (
    <Modal
      open
      wide
      title={`Hồ sơ của ${member.full_name || "người nộp"}`}
      onClose={onClose}
    >
      {application.isPending && <LoadingState label="Đang tải hồ sơ…" />}
      {application.isError && (
        <ErrorState
          title="Không tải được hồ sơ"
          message={toVietnameseDashboardMessage(
            application.error?.code ?? "REQUEST_FAILED",
          )}
        />
      )}
      {data && (
        <div className="flex flex-col gap-6">
          <VolunteerSummary member={member} submitted={submitted} />
          <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">
            <Block
              icon={<FiMessageSquare className="h-3.5 w-3.5" aria-hidden="true" />}
              title="Câu trả lời biểu mẫu"
            >
              {data.answers.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Tổ chức chưa đặt câu hỏi nào cho hồ sơ.
                </p>
              ) : (
                <dl className="flex flex-col gap-2">
                  {data.answers.map((item) => (
                    <div
                      key={item.question_id}
                      className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                    >
                      <dt className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.label}
                      </dt>
                      <dd className="mt-1">
                        {item.file ? (
                          <EvidenceDownload
                            orgId={orgId}
                            userId={member.user_id}
                            file={item.file}
                          />
                        ) : (
                          <span
                            className={`whitespace-pre-wrap text-sm ${
                              item.answer
                                ? "text-zinc-700 dark:text-zinc-300"
                                : "italic text-zinc-400 dark:text-zinc-500"
                            }`}
                          >
                            {item.answer
                              ? item.is_other
                                ? `Khác: ${item.answer}`
                                : item.answer
                              : "Chưa trả lời"}
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </Block>
          </div>
        </div>
      )}
    </Modal>
  );
}
