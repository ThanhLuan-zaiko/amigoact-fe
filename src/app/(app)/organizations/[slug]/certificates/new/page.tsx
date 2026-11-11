import type { Metadata } from "next";
import { Suspense } from "react";
import { createTemplate } from "@/app/_actions/certificates";
import { requireUser } from "@/lib/auth";
import { getOrganization } from "@/lib/organizationApi";
import TemplateForm from "../../../../../_components/certificates/TemplateForm";
import { mutedText, sectionTitle } from "../../../../../_components/ui";

export const metadata: Metadata = { title: "Tạo mẫu chứng nhận | AmigoACT" };

async function NewTemplateContent({
  params,
}: {
  params: PageProps<"/organizations/[slug]/certificates/new">["params"];
}) {
  const { slug } = await params;
  await requireUser(`/organizations/${slug}/certificates/new`);
  const organization = await getOrganization(slug);
  if (!organization) {
    return null;
  }
  if (!organization.viewer.can_manage) {
    return (
      <p className={mutedText}>Chỉ ban quản trị mới tạo được mẫu chứng nhận.</p>
    );
  }
  return (
    <>
      <h2 className={sectionTitle}>Tạo mẫu chứng nhận</h2>
      <TemplateForm
        action={createTemplate.bind(null, slug)}
        cancelHref={`/organizations/${slug}/certificates`}
      />
    </>
  );
}

export default function NewTemplatePage({
  params,
}: PageProps<"/organizations/[slug]/certificates/new">) {
  return (
    <div className="flex w-full flex-col gap-4">
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <NewTemplateContent params={params} />
      </Suspense>
    </div>
  );
}
