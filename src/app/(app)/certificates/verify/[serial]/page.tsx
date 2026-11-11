import type { Metadata } from "next";
import { Suspense } from "react";
import {
  FiAlertTriangle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiUsers,
} from "react-icons/fi";
import { formatDateTime } from "@/lib/activities";
import { hoursText } from "@/lib/attendance";
import { verifyCertificate } from "@/lib/certificateApi";
import {
  CERTIFICATE_STATUS_LABELS,
  certificateTexts,
  isSerialShape,
  normalizeSerial,
  printableDesign,
} from "@/lib/certificates";
import { formatDate } from "@/lib/organizations";
import CertificatePreview from "../../../../_components/certificates/CertificatePreview";
import PrintButton from "../../../../_components/certificates/PrintButton";
import VerifyForm from "../../../../_components/certificates/VerifyForm";
import IconStat from "../../../../_components/IconStat";
import {
  iconButton,
  mutedText,
  panel,
  sectionTitle,
} from "../../../../_components/ui";

export const metadata: Metadata = { title: "Xác minh chứng nhận | AmigoACT" };

const statusBadge = {
  issued: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  revoked:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
};

async function VerifyResult({
  params,
}: {
  params: PageProps<"/certificates/verify/[serial]">["params"];
}) {
  const { serial } = await params;
  const typed = normalizeSerial(serial);
  const result = isSerialShape(typed)
    ? await verifyCertificate(typed)
    : { certificate: null, rateLimited: false };
  const certificate = result.certificate;
  if (!certificate) {
    const rateLimited = "rateLimited" in result && result.rateLimited;
    return (
      <section
        className={`${panel} flex w-full max-w-2xl flex-col gap-3 p-4 sm:p-6`}
      >
        <h2 className={sectionTitle}>
          {rateLimited ? "Tra cứu quá nhiều lần" : "Không tìm thấy chứng nhận"}
        </h2>
        {rateLimited ? (
          <p className={mutedText}>
            Bạn đã tra cứu quá nhiều lần trong một phút. Vui lòng đợi một lúc
            rồi thử lại.
          </p>
        ) : (
          <p className={mutedText}>
            Không có chứng nhận nào với số serial{" "}
            <span className="font-mono break-all">{typed}</span>. Hãy kiểm tra
            lại từng ký tự.
          </p>
        )}
        <VerifyForm defaultValue={typed} />
      </section>
    );
  }
  const issued = certificate.status === "issued";
  const StatusIcon = issued ? FiCheckCircle : FiAlertTriangle;
  const design = printableDesign(certificate);

  // With a template, the drawn certificate sits on the right from xl and is all that
  // gets printed. Without one, the details themselves are the printout.
  return (
    <div
      className={
        design
          ? "grid w-full grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]"
          : "w-full max-w-2xl"
      }
    >
      <article
        className={`${panel} flex flex-col gap-5 p-4 sm:p-8 ${design ? "print:hidden" : ""}`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold ${statusBadge[certificate.status]}`}
          >
            <StatusIcon aria-hidden="true" />
            {CERTIFICATE_STATUS_LABELS[certificate.status]}
          </span>
          <span className="font-mono text-sm break-all text-slate-600 dark:text-slate-400">
            {certificate.serial_no}
          </span>
          <div className="ml-auto flex items-center gap-2 print:hidden">
            {issued ? (
              <a
                href={`/certificates/verify/${encodeURIComponent(certificate.serial_no)}/pdf`}
                aria-label="Tải PDF"
                title="Tải PDF"
                className={iconButton}
              >
                <FiDownload aria-hidden="true" />
              </a>
            ) : null}
            <PrintButton />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className={mutedText}>Chứng nhận</p>
          <h2 className="text-2xl font-extrabold tracking-tight break-words sm:text-3xl">
            {certificate.full_name}
          </h2>
          <p className={mutedText}>đã tham gia hoạt động</p>
          <p className="text-lg font-bold break-words">
            {certificate.activity_title}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <IconStat icon={FiUsers} label="Tổ chức">
            {certificate.organization_name}
          </IconStat>
          <IconStat icon={FiClock} label="Số giờ">
            {hoursText(certificate.hours)}
          </IconStat>
          {certificate.activity_start_at ? (
            <IconStat icon={FiCalendar} label="Thời gian hoạt động">
              {formatDateTime(certificate.activity_start_at)}
            </IconStat>
          ) : null}
          <IconStat icon={FiCalendar} label="Ngày cấp">
            {formatDate(certificate.issued_at)}
          </IconStat>
        </div>
        {certificate.revoked_at ? (
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
            Chứng nhận đã bị thu hồi ngày {formatDate(certificate.revoked_at)}.
          </p>
        ) : null}
      </article>
      {design ? (
        <section className="flex flex-col gap-2">
          <h2 className={`${sectionTitle} print:hidden`}>Bản in</h2>
          <CertificatePreview
            layout={design.layout}
            backgroundUrl={design.background_url}
            label={`Chứng nhận của ${certificate.full_name}`}
            texts={certificateTexts(certificate)}
          />
        </section>
      ) : null}
    </div>
  );
}

// Public: it shows only what proves the certificate, never contact details.
export default function VerifyCertificatePage({
  params,
}: PageProps<"/certificates/verify/[serial]">) {
  return (
    <div className="flex w-full flex-col gap-4">
      <h1 className="text-2xl font-extrabold tracking-tight print:hidden">
        Xác minh chứng nhận
      </h1>
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <VerifyResult params={params} />
      </Suspense>
    </div>
  );
}
