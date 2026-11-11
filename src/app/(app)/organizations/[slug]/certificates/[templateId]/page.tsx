import type { Metadata } from "next";
import { Suspense } from "react";
import { updateTemplate } from "@/app/_actions/certificates";
import { requireUser } from "@/lib/auth";
import { getTemplate } from "@/lib/certificateApi";
import TemplateForm from "../../../../../_components/certificates/TemplateForm";
import { mutedText, sectionTitle } from "../../../../../_components/ui";

export const metadata: Metadata = { title: "Sửa mẫu chứng nhận | AmigoACT" };

async function EditTemplateContent({
  params,
}: {
  params: PageProps<"/organizations/[slug]/certificates/[templateId]">["params"];
}) {
  const { slug, templateId } = await params;
  await requireUser(`/organizations/${slug}/certificates/${templateId}`);
  // Null for a template that does not exist or that the viewer may not manage.
  const template = await getTemplate(templateId);
  if (!template) {
    return (
      <p className={mutedText}>
        Không tìm thấy mẫu này, hoặc bạn không có quyền sửa mẫu.
      </p>
    );
  }
  return (
    <>
      <h2 className={sectionTitle}>Sửa mẫu chứng nhận</h2>
      <TemplateForm
        action={updateTemplate.bind(null, slug, template.id)}
        cancelHref={`/organizations/${slug}/certificates`}
        template={template}
      />
    </>
  );
}

export default function EditTemplatePage({
  params,
}: PageProps<"/organizations/[slug]/certificates/[templateId]">) {
  return (
    <div className="flex w-full flex-col gap-4">
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <EditTemplateContent params={params} />
      </Suspense>
    </div>
  );
}
