import { FiMessageSquare, FiSend, FiUserPlus, FiUsers } from "react-icons/fi";
import type { Organization } from "./types";
import { mutedText, primaryButton, secondaryButton, tagChip } from "./ui";

type OrgHeaderProps = {
  organization?: Organization;
};

export default function OrgHeader({ organization }: OrgHeaderProps) {
  const isOpen = organization?.joinPolicy !== "invite";

  return (
    <section className="flex flex-col gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
      <div
        className="h-48 border border-slate-200 dark:border-slate-800"
        aria-hidden="true"
      />

      <div className="flex flex-wrap items-end gap-5">
        <div className="-mt-12 flex h-24 w-24 shrink-0 items-center justify-center border-2 border-teal-700 bg-white text-3xl font-extrabold text-teal-700 dark:border-teal-400 dark:bg-slate-950 dark:text-teal-400">
          {organization ? (
            organization.initials
          ) : (
            <FiUsers aria-hidden="true" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              {organization?.name ?? "Tên tổ chức"}
            </h1>
            {organization && (
              <span className={tagChip}>{organization.typeLabel}</span>
            )}
            <span
              className={`border px-2 py-0.5 text-xs font-bold ${
                isOpen
                  ? "border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400"
                  : "border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-300"
              }`}
            >
              {isOpen ? "Mở tham gia" : "Cần duyệt"}
            </span>
          </div>
          {organization && (
            <p className={mutedText}>{organization.description}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {isOpen ? (
            <button type="button" className={primaryButton}>
              <FiUserPlus aria-hidden="true" />
              Tham gia
            </button>
          ) : (
            <button type="button" className={primaryButton}>
              <FiSend aria-hidden="true" />
              Gửi yêu cầu
            </button>
          )}
          <button type="button" className={secondaryButton}>
            <FiMessageSquare aria-hidden="true" />
            Nhắn tin
          </button>
        </div>
      </div>

      <dl className="flex flex-wrap gap-8 text-sm text-slate-700 dark:text-slate-300">
        <div className="flex gap-2">
          <dt className={mutedText}>Thành viên</dt>
          <dd className="font-bold">{organization?.memberCount ?? "—"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className={mutedText}>Hoạt động</dt>
          <dd className="font-bold">{organization?.activityCount ?? "—"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className={mutedText}>Giờ tình nguyện</dt>
          <dd className="font-bold">{organization?.volunteerHours ?? "—"}</dd>
        </div>
      </dl>
    </section>
  );
}
