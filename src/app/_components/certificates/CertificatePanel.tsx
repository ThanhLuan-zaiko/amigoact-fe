import Link from "next/link";
import {
  FiAward,
  FiCalendar,
  FiClock,
  FiExternalLink,
  FiRotateCcw,
  FiUserPlus,
} from "react-icons/fi";
import { reinstateCertificate } from "@/app/_actions/certificates";
import { hoursText } from "@/lib/attendance";
import { getActivityCertificates, getTemplates } from "@/lib/certificateApi";
import { CERTIFICATE_STATUS_LABELS } from "@/lib/certificates";
import { formatDate } from "@/lib/organizations";
import IconStat from "../IconStat";
import ActionButton from "../organizations/ActionButton";
import { iconButton, mutedText, panel, sectionTitle, tagChip } from "../ui";
import IssueForm from "./IssueForm";
import RevokeButton from "./RevokeButton";

type CertificatePanelProps = {
  activityId: string;
  organizationSlug: string;
};

// For managers of a completed activity: issue certificates to everyone who attended,
// then revoke or reinstate one. Render it behind a Suspense boundary.
export default async function CertificatePanel({
  activityId,
  organizationSlug,
}: CertificatePanelProps) {
  const [data, templates] = await Promise.all([
    getActivityCertificates(activityId),
    getTemplates(organizationSlug),
  ]);
  if (!data) {
    return null;
  }
  const active = (templates ?? []).filter((template) => template.is_active);

  return (
    <section className={`${panel} flex flex-col gap-4 p-4 sm:p-6`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 className={`${sectionTitle} flex flex-1 items-center gap-2`}>
          <FiAward aria-hidden="true" />
          Chứng nhận
        </h2>
        <IconStat icon={FiAward} label="Đã cấp">
          {data.items.length}
        </IconStat>
        <IconStat icon={FiUserPlus} label="Chưa có chứng nhận">
          {data.missing_count}
        </IconStat>
      </div>
      {data.missing_count > 0 ? (
        <IssueForm activityId={activityId} templates={active} />
      ) : (
        <p className={mutedText}>
          Mọi người đã tham gia đều có chứng nhận. Người được chấp nhận khiếu
          nại sẽ hiện ở đây để cấp tiếp.
        </p>
      )}
      {active.length === 0 && data.missing_count > 0 ? (
        <p className={mutedText}>
          Chưa có mẫu đang dùng.{" "}
          <Link
            href={`/org/${organizationSlug}/certificates/new`}
            className="font-semibold text-teal-700 hover:underline dark:text-teal-400"
          >
            Tạo mẫu chứng nhận
          </Link>
        </p>
      ) : null}
      {data.items.length > 0 ? (
        <ul className="flex max-h-[32rem] flex-col divide-y divide-slate-200 overflow-y-auto dark:divide-slate-800">
          {data.items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-start gap-x-3 gap-y-2 py-3"
            >
              <div className="flex min-w-0 flex-1 basis-48 flex-col gap-1">
                <p className="text-sm font-semibold break-words">
                  {item.full_name}
                </p>
                <p className="font-mono text-xs break-all text-slate-600 dark:text-slate-400">
                  {item.serial_no}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <IconStat icon={FiClock} label="Số giờ">
                    {hoursText(item.hours)}
                  </IconStat>
                  <IconStat icon={FiCalendar} label="Ngày cấp">
                    {formatDate(item.issued_at)}
                  </IconStat>
                </div>
              </div>
              <span className={tagChip}>
                {CERTIFICATE_STATUS_LABELS[item.status]}
              </span>
              <div className="flex flex-wrap items-start gap-2">
                <Link
                  href={`/certificates/verify/${encodeURIComponent(item.serial_no)}`}
                  aria-label="Xem trang xác minh"
                  title="Xem trang xác minh"
                  className={iconButton}
                >
                  <FiExternalLink aria-hidden="true" />
                </Link>
                {item.status === "issued" ? (
                  <RevokeButton id={item.id} />
                ) : (
                  <ActionButton
                    action={reinstateCertificate.bind(null, item.id)}
                    label="Hoàn tác thu hồi"
                    confirmLabel="Cho chứng nhận có hiệu lực lại?"
                  >
                    <FiRotateCcw aria-hidden="true" />
                  </ActionButton>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
