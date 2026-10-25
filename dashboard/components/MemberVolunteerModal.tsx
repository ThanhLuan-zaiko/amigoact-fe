import type { ReactElement } from "react";
import { FiClock, FiShield } from "react-icons/fi";
import { EmptyState, ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { Modal } from "../../core/components/Modal.tsx";
import { LEVEL_LABELS, profileStatusLabel } from "../../profiles/messages.tsx";
import { useMemberVolunteerProfile } from "../volunteer-profile-hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import type { MemberVolunteerProfile } from "../volunteer-profile-api.ts";

interface MemberVolunteerModalProps {
  orgId: string;
  userId: string;
  name: string;
  open: boolean;
  onClose: () => void;
}

// Manager read of a member's volunteer profile. The query runs only while the
// modal is open, so closing it stops nothing and opening it always refetches
// after the staleness window.
export function MemberVolunteerModal({
  orgId,
  userId,
  name,
  open,
  onClose,
}: MemberVolunteerModalProps): ReactElement {
  const profile = useMemberVolunteerProfile(orgId, userId, open);
  return (
    <Modal
      open={open}
      title={`Hồ sơ tình nguyện · ${name}`}
      onClose={onClose}
      wide
    >
      {profile.isError ? (
        <ErrorState
          title="Không tải được hồ sơ"
          message={toVietnameseDashboardMessage(profile.error.code)}
        />
      ) : profile.data ? (
        <VolunteerDetails data={profile.data} />
      ) : (
        <LoadingState label="Đang tải hồ sơ…" />
      )}
    </Modal>
  );
}

const DD = "text-sm font-medium text-zinc-900 dark:text-zinc-100";
const DT = "text-xs text-zinc-500 dark:text-zinc-400";
const CHIP =
  "rounded-full border border-zinc-300 bg-zinc-50 px-2.5 py-0.5 text-xs " +
  "text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300";

function VolunteerDetails({
  data,
}: {
  data: MemberVolunteerProfile;
}): ReactElement {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className={CHIP}>{profileStatusLabel(data.status)}</span>
        <span className={`${CHIP} inline-flex items-center gap-1`}>
          <FiClock className="h-3.5 w-3.5" aria-hidden="true" />
          {`${data.total_hours.toFixed(1)} giờ`}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-4">
        <div>
          <dt className={DT}>Mã sinh viên</dt>
          <dd className={DD}>{data.student_code ?? "Chưa cập nhật"}</dd>
        </div>
        <div>
          <dt className={DT}>Lớp</dt>
          <dd className={DD}>{data.class_name ?? "Chưa cập nhật"}</dd>
        </div>
        <div>
          <dt className={DT}>Trường</dt>
          <dd className={DD}>{data.school_name ?? "Chưa cập nhật"}</dd>
        </div>
        <div>
          <dt className={DT}>Năm nhập học</dt>
          <dd className={DD}>{data.enrollment_year ?? "Chưa cập nhật"}</dd>
        </div>
      </dl>

      <section>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Giới thiệu</h3>
        <p className="mt-1 whitespace-pre-line text-sm text-zinc-600 dark:text-zinc-400">
          {data.bio ?? "Chưa có giới thiệu."}
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Sở thích</h3>
        {data.interests.length === 0 ? (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Chưa có sở thích.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {data.interests.map((item) => (
              <li key={item} className={CHIP}>
                {item}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Kỹ năng</h3>
        {data.skills.length === 0 ? (
          <div className="mt-2">
            <EmptyState title="Chưa khai báo kỹ năng" message="Thành viên chưa chọn kỹ năng nào." />
          </div>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {data.skills.map((skill) => (
              <li
                key={skill.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800"
              >
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{skill.name}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {`${LEVEL_LABELS[skill.level] ?? ""} · ${skill.level}/5`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Liên hệ khẩn cấp</h3>
        {data.contacts.length === 0 ? (
          <div className="mt-2">
            <EmptyState title="Chưa có liên hệ" message="Thành viên chưa thêm người liên hệ khẩn cấp." />
          </div>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {data.contacts.map((contact) => (
              <li
                key={`${contact.phone}-${contact.name}`}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800"
              >
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {contact.name}
                  {contact.is_primary && <span className={`${CHIP} ml-2`}>Ưu tiên</span>}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {contact.relation ? `${contact.relation} · ` : ""}
                  <a href={`tel:${contact.phone}`} className="underline underline-offset-2">
                    {contact.phone}
                  </a>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <FiShield className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Chỉ người quản lý tổ chức mới xem được hồ sơ này. Mỗi lần xem đều được ghi nhật ký.
      </p>
    </div>
  );
}
