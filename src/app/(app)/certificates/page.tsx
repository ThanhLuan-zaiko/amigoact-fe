import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FiCalendar, FiClock, FiExternalLink, FiUsers } from "react-icons/fi";
import { hoursText } from "@/lib/attendance";
import { requireUser } from "@/lib/auth";
import { getMyCertificates } from "@/lib/certificateApi";
import { CERTIFICATE_STATUS_LABELS } from "@/lib/certificates";
import { formatDate } from "@/lib/organizations";
import EmptyState from "../../_components/EmptyState";
import IconStat from "../../_components/IconStat";
import {
  iconButton,
  mutedText,
  panel,
  splitList,
  splitRow,
  tagChip,
} from "../../_components/ui";

export const metadata: Metadata = { title: "Chứng nhận của tôi | AmigoACT" };

async function MyCertificatesContent() {
  await requireUser("/certificates");
  const certificates = await getMyCertificates();
  if (!certificates) {
    return (
      <p className={mutedText}>Không tải được dữ liệu. Vui lòng thử lại.</p>
    );
  }
  if (certificates.length === 0) {
    return (
      <EmptyState
        title="Chưa có chứng nhận nào"
        description="Chứng nhận được cấp sau khi hoạt động bạn đã điểm danh kết thúc."
      />
    );
  }
  return (
    <ul className={`${panel} ${splitList} px-4`}>
      {certificates.map((certificate) => (
        <li
          key={certificate.id}
          className={`flex items-start gap-3 py-3 ${splitRow}`}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Link
              href={`/activities/${certificate.activity_id}`}
              className="font-semibold break-words transition-colors hover:text-teal-700 dark:hover:text-teal-400"
            >
              {certificate.activity_title}
            </Link>
            <p className="font-mono text-xs break-all text-slate-600 dark:text-slate-400">
              {certificate.serial_no}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <IconStat icon={FiUsers} label="Tổ chức">
                {certificate.organization_name}
              </IconStat>
              <IconStat icon={FiClock} label="Số giờ">
                {hoursText(certificate.hours)}
              </IconStat>
              <IconStat icon={FiCalendar} label="Ngày cấp">
                {formatDate(certificate.issued_at)}
              </IconStat>
            </div>
          </div>
          <span className={`${tagChip} shrink-0`}>
            {CERTIFICATE_STATUS_LABELS[certificate.status]}
          </span>
          <Link
            href={`/certificates/verify/${encodeURIComponent(certificate.serial_no)}`}
            aria-label="Xem và in"
            title="Xem và in"
            className={iconButton}
          >
            <FiExternalLink aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function MyCertificatesPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <h1 className="text-2xl font-extrabold tracking-tight">
        Chứng nhận của tôi
      </h1>
      <p className={mutedText}>
        Mỗi chứng nhận có số serial riêng. Ai có số serial cũng xác minh được
        tại trang xác minh công khai.
      </p>
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <MyCertificatesContent />
      </Suspense>
    </div>
  );
}
