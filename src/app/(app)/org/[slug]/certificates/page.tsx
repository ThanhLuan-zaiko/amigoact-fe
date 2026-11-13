import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FiCalendar, FiEdit2, FiEye, FiEyeOff, FiPlus } from "react-icons/fi";
import { setTemplateActive } from "@/app/_actions/certificates";
import { requireUser } from "@/lib/auth";
import { getTemplates } from "@/lib/certificateApi";
import { getOrganization } from "@/lib/organizationApi";
import { formatDate } from "@/lib/organizations";
import { hasPermission } from "@/lib/roles";
import CertificatePreview from "../../../../_components/certificates/CertificatePreview";
import EmptyState from "../../../../_components/EmptyState";
import IconStat from "../../../../_components/IconStat";
import ActionButton from "../../../../_components/organizations/ActionButton";
import {
  iconButton,
  mutedText,
  panel,
  primaryButton,
  sectionTitle,
  tagChip,
} from "../../../../_components/ui";

export const metadata: Metadata = { title: "Mẫu chứng nhận | AmigoACT" };

async function TemplatesContent({
  params,
}: {
  params: PageProps<"/org/[slug]/certificates">["params"];
}) {
  const { slug } = await params;
  await requireUser(`/org/${slug}/certificates`);
  const organization = await getOrganization(slug);
  if (!organization) {
    return null;
  }
  const templates = hasPermission(organization.viewer, "certificates.templates")
    ? await getTemplates(slug)
    : null;
  if (!templates) {
    return (
      <p className={mutedText}>Chỉ ban quản trị mới quản lý được chứng nhận.</p>
    );
  }
  const base = `/org/${slug}/certificates`;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className={`${sectionTitle} flex-1`}>Mẫu chứng nhận</h2>
        <Link href={`${base}/new`} className={primaryButton}>
          <FiPlus aria-hidden="true" />
          Tạo mẫu
        </Link>
      </div>
      <p className={mutedText}>
        Chọn mẫu khi cấp chứng nhận ở trang của hoạt động đã kết thúc. Mẫu không
        xóa được, chỉ tắt để ẩn khỏi việc cấp.
      </p>
      {templates.length === 0 ? (
        <EmptyState
          title="Chưa có mẫu nào"
          description="Tạo một mẫu với ảnh nền và vị trí các nội dung để in chứng nhận."
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {templates.map((template) => (
            <li
              key={template.id}
              className={`${panel} flex min-w-0 flex-col gap-3 p-4`}
            >
              <CertificatePreview
                layout={template.layout}
                backgroundUrl={template.background_url}
                label={`Mẫu ${template.name}`}
              />
              <div className="flex flex-wrap items-center gap-2">
                <p className="min-w-0 flex-1 basis-32 font-semibold break-words">
                  {template.name}
                </p>
                <span className={tagChip}>
                  {template.is_active ? "Đang dùng" : "Đã tắt"}
                </span>
              </div>
              <div className="flex flex-wrap items-start gap-2">
                <IconStat icon={FiCalendar} label="Ngày tạo">
                  {formatDate(template.created_at)}
                </IconStat>
                <div className="ml-auto flex items-start gap-2">
                  <Link
                    href={`${base}/${template.id}`}
                    aria-label="Sửa mẫu"
                    title="Sửa mẫu"
                    className={iconButton}
                  >
                    <FiEdit2 aria-hidden="true" />
                  </Link>
                  <ActionButton
                    action={setTemplateActive.bind(
                      null,
                      template.id,
                      !template.is_active,
                    )}
                    label={template.is_active ? "Tắt mẫu" : "Bật lại mẫu"}
                  >
                    {template.is_active ? (
                      <FiEyeOff aria-hidden="true" />
                    ) : (
                      <FiEye aria-hidden="true" />
                    )}
                  </ActionButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function CertificateTemplatesPage({
  params,
}: PageProps<"/org/[slug]/certificates">) {
  return (
    <div className="flex w-full flex-col gap-4">
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <TemplatesContent params={params} />
      </Suspense>
    </div>
  );
}
